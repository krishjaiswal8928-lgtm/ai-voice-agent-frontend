"""
Transfer API Routes
Endpoints for managing call transfers.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from google.cloud import firestore

from app.services.call_transfer_service import get_call_transfer_service
from app.dependencies import get_db
from app.core.security import get_current_user

router = APIRouter(prefix="/api/transfers", tags=["Transfers"])


# ===== REQUEST/RESPONSE MODELS =====

class InitiateTransferRequest(BaseModel):
    """Request model for initiating transfer."""
    lead_id: str
    campaign_id: str
    call_sid: str
    transfer_type: str = "cold"  # 'cold' or 'warm'
    reason: str = "Lead qualified and interested"
    provider_type: str = "twilio"
    provider_config: dict


class RetryTransferRequest(BaseModel):
    """Request model for retrying transfer."""
    lead_id: str
    campaign_id: str
    call_sid: str
    failed_agent_id: str
    provider_type: str = "twilio"
    provider_config: dict


class TransferResponse(BaseModel):
    """Response model for transfer."""
    success: bool
    transfer_type: Optional[str] = None
    agent_id: Optional[str] = None
    agent_name: Optional[str] = None
    agent_phone: Optional[str] = None
    transfer_call_sid: Optional[str] = None
    conference_name: Optional[str] = None
    message: str
    timestamp: datetime
    fallback_action: Optional[str] = None


class TransferHistoryItem(BaseModel):
    """Transfer history item."""
    lead_id: str
    lead_name: Optional[str]
    lead_phone: str
    agent_id: Optional[str]
    agent_name: Optional[str]
    transfer_type: Optional[str]
    transferred_at: Optional[datetime]
    transfer_status: Optional[str]


# ===== API ENDPOINTS =====

@router.post("/initiate", response_model=TransferResponse)
async def initiate_transfer(
    request: InitiateTransferRequest,
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_db)
):
    """
    Initiate call transfer to human agent.
    
    This endpoint:
    1. Selects best available agent based on routing method
    2. Executes cold or warm transfer
    3. Updates lead and agent records
    4. Falls back to callback scheduling if no agents available
    """
    try:
        service = get_call_transfer_service(db)
        
        # Verify campaign ownership
        campaign_ref = db.collection('campaigns').document(request.campaign_id).get()
        if not campaign_ref.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )
        
        campaign_data = campaign_ref.to_dict()
        if campaign_data.get('user_id') != current_user['user_id']:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Initiate transfer
        result = service.initiate_transfer(
            lead_id=request.lead_id,
            campaign_id=request.campaign_id,
            call_sid=request.call_sid,
            transfer_type=request.transfer_type,
            reason=request.reason,
            provider_type=request.provider_type,
            provider_config=request.provider_config
        )
        
        return TransferResponse(
            success=result.get('success', False),
            transfer_type=result.get('transfer_type'),
            agent_id=result.get('agent_id'),
            agent_name=result.get('agent_name'),
            agent_phone=result.get('agent_phone'),
            transfer_call_sid=result.get('transfer_call_sid'),
            conference_name=result.get('conference_name'),
            message=result.get('message', 'Transfer processed'),
            timestamp=result.get('timestamp', datetime.now()),
            fallback_action=result.get('fallback_action')
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transfer initiation failed: {str(e)}"
        )


@router.post("/retry", response_model=TransferResponse)
async def retry_transfer(
    request: RetryTransferRequest,
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_db)
):
    """
    Retry transfer with a different agent after failure.
    """
    try:
        service = get_call_transfer_service(db)
        
        # Verify campaign ownership
        campaign_ref = db.collection('campaigns').document(request.campaign_id).get()
        if not campaign_ref.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )
        
        campaign_data = campaign_ref.to_dict()
        if campaign_data.get('user_id') != current_user['user_id']:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Retry transfer
        result = service.retry_transfer_with_different_agent(
            lead_id=request.lead_id,
            campaign_id=request.campaign_id,
            call_sid=request.call_sid,
            failed_agent_id=request.failed_agent_id,
            provider_type=request.provider_type,
            provider_config=request.provider_config
        )
        
        return TransferResponse(
            success=result.get('success', False),
            transfer_type=result.get('transfer_type'),
            agent_id=result.get('agent_id'),
            agent_name=result.get('agent_name'),
            agent_phone=result.get('agent_phone'),
            transfer_call_sid=result.get('transfer_call_sid'),
            message=result.get('message', 'Transfer retry processed'),
            timestamp=result.get('timestamp', datetime.now()),
            fallback_action=result.get('fallback_action')
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transfer retry failed: {str(e)}"
        )


@router.get("/status/{transfer_id}")
async def get_transfer_status(
    transfer_id: str,
    call_sid: str,
    provider_type: str = "twilio",
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_db)
):
    """
    Monitor transfer status.
    
    Note: Requires provider_config to be passed as query params or in request body.
    """
    try:
        service = get_call_transfer_service(db)
        
        # Get provider config from user's settings
        # This is simplified - in production, retrieve from database
        provider_config = {}
        
        status_info = service.monitor_transfer_status(
            transfer_id=transfer_id,
            call_sid=call_sid,
            provider_type=provider_type,
            provider_config=provider_config
        )
        
        return status_info
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get transfer status: {str(e)}"
        )


@router.get("/history/{campaign_id}", response_model=List[TransferHistoryItem])
async def get_transfer_history(
    campaign_id: str,
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_db)
):
    """
    Get transfer history for a campaign.
    """
    try:
        # Verify campaign ownership
        campaign_ref = db.collection('campaigns').document(campaign_id).get()
        if not campaign_ref.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )
        
        campaign_data = campaign_ref.to_dict()
        if campaign_data.get('user_id') != current_user['user_id']:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        service = get_call_transfer_service(db)
        history = service.get_transfer_history(campaign_id)
        
        return [
            TransferHistoryItem(
                lead_id=item['lead_id'],
                lead_name=item.get('lead_name'),
                lead_phone=item['lead_phone'],
                agent_id=item.get('agent_id'),
                agent_name=item.get('agent_name'),
                transfer_type=item.get('transfer_type'),
                transferred_at=item.get('transferred_at'),
                transfer_status=item.get('transfer_status')
            )
            for item in history
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get transfer history: {str(e)}"
        )


@router.get("/stats/{campaign_id}")
async def get_transfer_stats(
    campaign_id: str,
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_db)
):
    """
    Get transfer statistics for a campaign.
    """
    try:
        # Verify campaign ownership
        campaign_ref = db.collection('campaigns').document(campaign_id).get()
        if not campaign_ref.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )
        
        campaign_data = campaign_ref.to_dict()
        if campaign_data.get('user_id') != current_user['user_id']:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Get transfer statistics
        service = get_call_transfer_service(db)
        history = service.get_transfer_history(campaign_id)
        
        total_transfers = len(history)
        successful_transfers = len([t for t in history if t.get('transfer_status') == 'completed'])
        failed_transfers = total_transfers - successful_transfers
        
        # Count by transfer type
        cold_transfers = len([t for t in history if t.get('transfer_type') == 'cold'])
        warm_transfers = len([t for t in history if t.get('transfer_type') == 'warm'])
        
        return {
            'campaign_id': campaign_id,
            'total_transfers': total_transfers,
            'successful_transfers': successful_transfers,
            'failed_transfers': failed_transfers,
            'success_rate': (successful_transfers / total_transfers * 100) if total_transfers > 0 else 0,
            'cold_transfers': cold_transfers,
            'warm_transfers': warm_transfers
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get transfer stats: {str(e)}"
        )
