"""
SIP Call Management Routes

Handles outbound call initiation and call management for SIP trunks.
"""

from fastapi import APIRouter, HTTPException, Depends
from google.cloud import firestore
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import os

from app.services.sip_provider import get_sip_provider
from app.services.sip_trunk_service import SIPTrunkService
from app.models.call_session import CallSession
from app.core.security import get_current_user

router = APIRouter(prefix="/api/sip/calls", tags=["SIP Calls"])

# Initialize services
sip_provider = get_sip_provider()
sip_trunk_service = SIPTrunkService()


class OutboundCallRequest(BaseModel):
    """Request to initiate outbound call"""
    sip_trunk_id: str
    to_number: str  # E.164 format
    agent_id: Optional[str] = None  # If not provided, use trunk's assigned agent


@router.post("/outbound")
async def initiate_outbound_call(
    request: OutboundCallRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Initiate outbound call through SIP trunk
    
    Process:
    1. Get SIP trunk configuration
    2. Decrypt auth credentials
    3. Call provider API to initiate call
    4. Store call session
    5. Return call ID
    """
    try:
        db = firestore.Client()
        
        # Get SIP trunk
        sip_trunk = sip_trunk_service.get_sip_trunk(db, request.sip_trunk_id)
        if not sip_trunk:
            raise HTTPException(status_code=404, detail="SIP trunk not found")
        
        # Verify ownership
        if sip_trunk.user_id != current_user['uid']:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        # Determine agent ID
        agent_id = request.agent_id or sip_trunk.assigned_agent_id
        if not agent_id:
            raise HTTPException(status_code=400, detail="No agent assigned")
        
        # Decrypt credentials
        credentials = sip_trunk_service.get_decrypted_credentials(sip_trunk)
        
        # Construct SIP address
        # Format: sip:+19998887777@pbx.company.com
        to_sip_address = f"sip:{request.to_number}@{sip_trunk.outbound_address}"
        
        # Prepare call settings
        backend_url = os.getenv('BACKEND_BASE_URL', 'https://your-backend.com')
        
        call_settings = {
            'auth_username': credentials.get('username'),
            'auth_password': credentials.get('password'),
            'twiml_url': f"{backend_url}/api/sip/webhook/outbound-twiml",
            'status_callback_url': f"{backend_url}/api/sip/webhook/status"
        }
        
        # Initiate call through provider
        call_result = sip_provider.initiate_outbound_call(
            from_number=sip_trunk.phone_number,
            to_sip_address=to_sip_address,
            settings=call_settings
        )
        
        # Create call session
        call_session = CallSession(
            id=call_result['call_id'],
            sip_trunk_id=sip_trunk.id,
            agent_id=agent_id,
            phone_number=sip_trunk.phone_number,
            direction='outbound',
            status=call_result['status'],
            provider_call_id=call_result['provider_call_id'],
            from_address=sip_trunk.phone_number,
            to_address=request.to_number,
            started_at=datetime.utcnow(),
            metadata={
                'sip_address': to_sip_address,
                'provider': call_result.get('provider', 'twilio')
            }
        )
        
        # Store call session
        db.collection('call_sessions').document(call_session.id).set(call_session.to_dict())
        
        return {
            'success': True,
            'call_id': call_result['call_id'],
            'status': call_result['status'],
            'to_number': request.to_number,
            'from_number': sip_trunk.phone_number
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Outbound call failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to initiate call: {str(e)}")


@router.get("/{call_id}/status")
async def get_call_status(
    call_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get status of a call
    """
    try:
        db = firestore.Client()
        
        # Get call session from database
        call_doc = db.collection('call_sessions').document(call_id).get()
        
        if not call_doc.exists:
            raise HTTPException(status_code=404, detail="Call not found")
        
        call_data = call_doc.to_dict()
        
        # Verify ownership (check SIP trunk ownership)
        sip_trunk = sip_trunk_service.get_sip_trunk(db, call_data['sip_trunk_id'])
        if sip_trunk and sip_trunk.user_id != current_user['uid']:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        # Get live status from provider
        try:
            provider_status = sip_provider.get_call_status(call_id)
            
            # Update database if status changed
            if provider_status['status'] != call_data.get('status'):
                db.collection('call_sessions').document(call_id).update({
                    'status': provider_status['status'],
                    'updated_at': datetime.utcnow()
                })
                call_data['status'] = provider_status['status']
        except Exception as e:
            print(f"[WARN] Could not get live status: {str(e)}")
        
        return {
            'call_id': call_id,
            'status': call_data.get('status'),
            'direction': call_data.get('direction'),
            'from': call_data.get('from_address'),
            'to': call_data.get('to_address'),
            'started_at': call_data.get('started_at'),
            'ended_at': call_data.get('ended_at'),
            'duration_seconds': call_data.get('duration_seconds')
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webhook/outbound-twiml")
async def outbound_twiml():
    """
    Generate TwiML for outbound calls
    
    This is called by Twilio when outbound call connects
    """
    # For now, just connect to WebSocket
    # In future, this could be more sophisticated
    
    websocket_base = os.getenv('WEBSOCKET_BASE_URL', 'wss://your-backend.com')
    
    # Generate a session ID (in production, this should be linked to call_sid)
    import uuid
    session_id = str(uuid.uuid4())
    
    websocket_url = f"{websocket_base}/ws/voice/{session_id}"
    
    twiml = sip_provider.generate_call_instructions(
        agent_id="outbound",  # Will be determined by call session
        call_data={'direction': 'outbound'},
        websocket_url=websocket_url
    )
    
    from fastapi.responses import Response
    return Response(content=twiml, media_type="application/xml")
