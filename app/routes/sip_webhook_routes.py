"""
SIP Webhook Routes

Handles incoming webhooks from SIP providers (Twilio, Telnyx, etc.)
for inbound calls and call status updates.
"""

from fastapi import APIRouter, Request, HTTPException, Response
from fastapi.responses import PlainTextResponse
from google.cloud import firestore
from datetime import datetime
import os

from app.services.sip_provider import get_sip_provider
from app.services.sip_trunk_service import SIPTrunkService
from app.models.call_session import CallSession

router = APIRouter(prefix="/api/sip/webhook", tags=["SIP Webhooks"])

# Initialize services
sip_provider = get_sip_provider()
sip_trunk_service = SIPTrunkService()


@router.post("/voice")
async def handle_inbound_call(request: Request):
    """
    Handle inbound SIP call webhook from provider
    
    This endpoint receives calls from the SIP provider (Twilio)
    when a call arrives at the SIP domain.
    
    Returns TwiML/TeXML instructions for routing the call.
    """
    try:
        # Get request data
        form_data = await request.form()
        request_data = dict(form_data)
        
        # Add webhook URL for signature validation
        request_data['_webhook_url'] = str(request.url)
        
        # Validate webhook (optional but recommended for production)
        signature = request.headers.get('X-Twilio-Signature', '')
        if signature and not sip_provider.validate_webhook(request_data, signature):
            raise HTTPException(status_code=403, detail="Invalid webhook signature")
        
        # Parse call data using provider
        call_data = sip_provider.handle_inbound_call(request_data)
        
        # Extract phone number
        phone_number = call_data.get('phone_number')
        if not phone_number:
            error_msg = "Could not extract phone number from call"
            print(f"[ERROR] {error_msg}. To: {call_data.get('to')}")
            twiml = sip_provider.generate_error_instructions(error_msg)
            return Response(content=twiml, media_type="application/xml")
        
        # Look up SIP trunk
        db = firestore.Client()
        sip_trunk = sip_trunk_service.get_by_phone_number(db, phone_number)
        
        if not sip_trunk:
            error_msg = f"Phone number {phone_number} is not configured"
            print(f"[ERROR] {error_msg}")
            twiml = sip_provider.generate_error_instructions(error_msg)
            return Response(content=twiml, media_type="application/xml")
        
        # Check if agent is assigned
        if not sip_trunk.assigned_agent_id:
            error_msg = "No agent assigned to this number"
            print(f"[ERROR] {error_msg} for {phone_number}")
            twiml = sip_provider.generate_error_instructions(error_msg)
            return Response(content=twiml, media_type="application/xml")
        
        # Update SIP trunk last connected time
        db.collection('sip_trunks').document(sip_trunk.id).update({
            'last_connected_at': datetime.utcnow(),
            'connection_status': 'connected'
        })
        
        # Create call session
        call_session = CallSession(
            id=call_data['call_id'],
            sip_trunk_id=sip_trunk.id,
            agent_id=sip_trunk.assigned_agent_id,
            phone_number=phone_number,
            direction='inbound',
            status='ringing',
            provider_call_id=call_data['call_id'],
            from_address=call_data.get('from', ''),
            to_address=call_data.get('to', ''),
            started_at=datetime.utcnow()
        )
        
        # Store call session
        db.collection('call_sessions').document(call_session.id).set(call_session.to_dict())
        
        # Generate WebSocket URL
        websocket_base = os.getenv('WEBSOCKET_BASE_URL', 'wss://your-backend.com')
        websocket_url = f"{websocket_base}/ws/voice/{call_session.id}"
        
        # Generate call routing instructions (TwiML)
        twiml = sip_provider.generate_call_instructions(
            agent_id=sip_trunk.assigned_agent_id,
            call_data=call_data,
            websocket_url=websocket_url
        )
        
        print(f"[SUCCESS] Inbound call routed: {phone_number} → Agent {sip_trunk.assigned_agent_id}")
        
        return Response(content=twiml, media_type="application/xml")
    
    except Exception as e:
        print(f"[ERROR] Webhook error: {str(e)}")
        error_twiml = sip_provider.generate_error_instructions("An error occurred")
        return Response(content=error_twiml, media_type="application/xml")


@router.post("/voice-fallback")
async def handle_voice_fallback(request: Request):
    """
    Fallback webhook if primary webhook fails
    """
    error_twiml = sip_provider.generate_error_instructions(
        "Service temporarily unavailable"
    )
    return Response(content=error_twiml, media_type="application/xml")


@router.post("/status")
async def handle_call_status(request: Request):
    """
    Handle call status updates from provider
    
    Receives status updates like: initiated, ringing, in-progress, completed, failed
    """
    try:
        form_data = await request.form()
        request_data = dict(form_data)
        
        call_sid = request_data.get('CallSid')
        call_status = request_data.get('CallStatus')
        
        if not call_sid:
            return {"status": "ignored", "reason": "no call_sid"}
        
        # Update call session in database
        db = firestore.Client()
        call_ref = db.collection('call_sessions').document(call_sid)
        call_doc = call_ref.get()
        
        if call_doc.exists:
            update_data = {
                'status': call_status,
                'updated_at': datetime.utcnow()
            }
            
            # Add end time if call completed
            if call_status in ['completed', 'failed', 'busy', 'no-answer', 'canceled']:
                update_data['ended_at'] = datetime.utcnow()
                
                # Calculate duration if we have start time
                call_data = call_doc.to_dict()
                if call_data.get('started_at'):
                    duration = (datetime.utcnow() - call_data['started_at']).total_seconds()
                    update_data['duration_seconds'] = int(duration)
            
            call_ref.update(update_data)
            
            print(f"[INFO] Call status updated: {call_sid} → {call_status}")
        
        return {"status": "ok"}
    
    except Exception as e:
        print(f"[ERROR] Status webhook error: {str(e)}")
        return {"status": "error", "message": str(e)}
