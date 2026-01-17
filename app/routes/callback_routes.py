"""
Callback API Routes
Endpoints for managing scheduled callbacks.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from google.cloud import firestore

from app.services.callback_scheduler import get_callback_scheduler
from app.dependencies import get_db
from app.core.security import get_current_user

router = APIRouter(prefix="/api/callbacks", tags=["Callbacks"])


# ===== REQUEST/RESPONSE MODELS =====

class ScheduleCallbackRequest(BaseModel):
    """Request model for scheduling callback."""
    lead_id: str
    campaign_id: str
    scheduled_datetime: datetime
    callback_reason: str
    lead_context: dict
    auto_assign: bool = True
    priority: str = "medium"  # 'low', 'medium', 'high'


class AssignCallbackRequest(BaseModel):
    """Request model for assigning callback to agent."""
    agent_id: str


class RescheduleCallbackRequest(BaseModel):
    """Request model for rescheduling callback."""
    new_datetime: datetime
    reason: str


class CompleteCallbackRequest(BaseModel):
    """Request model for completing callback."""
    outcome: str  # 'successful', 'no_answer', 'rescheduled', 'not_interested'
    notes: str


class CallbackResponse(BaseModel):
    """Response model for callback."""
    id: str
    lead_id: str
    campaign_id: str
    scheduled_datetime: datetime
    status: str
    priority: str
    lead_name: Optional[str]
    lead_phone: str
    lead_score: int
    assigned_to_agent_id: Optional[str]
    assigned_to_agent_name: Optional[str]
    callback_reason: Optional[str]
    conversation_summary: Optional[str]
    recommended_talking_points: List[str]
    created_at: datetime


# ===== API ENDPOINTS =====

@router.post("/schedule", response_model=CallbackResponse, status_code=status.HTTP_201_CREATED)
async def schedule_callback(
    request: ScheduleCallbackRequest,
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_db)
):
    """
    Schedule a qualified callback.
    
    This endpoint:
    1. Creates callback with lead context
    2. Auto-assigns to available agent (if enabled)
    3. Prepares talking points for agent
    4. Updates lead record
    """
    try:
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
        
        service = get_callback_scheduler(db)
        
        callback = service.schedule_qualified_callback(
            lead_id=request.lead_id,
            campaign_id=request.campaign_id,
            scheduled_datetime=request.scheduled_datetime,
            callback_reason=request.callback_reason,
            lead_context=request.lead_context,
            auto_assign=request.auto_assign,
            priority=request.priority
        )
        
        return CallbackResponse(
            id=callback.id,
            lead_id=callback.lead_id,
            campaign_id=callback.campaign_id,
            scheduled_datetime=callback.scheduled_datetime,
            status=callback.status,
            priority=callback.priority,
            lead_name=callback.lead_name,
            lead_phone=callback.lead_phone,
            lead_score=callback.lead_score,
            assigned_to_agent_id=callback.assigned_to_agent_id,
            assigned_to_agent_name=callback.assigned_to_agent_name,
            callback_reason=callback.callback_reason,
            conversation_summary=callback.conversation_summary,
            recommended_talking_points=callback.recommended_talking_points,
            created_at=callback.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to schedule callback: {str(e)}"
        )


@router.get("/campaign/{campaign_id}", response_model=List[CallbackResponse])
async def get_campaign_callbacks(
    campaign_id: str,
    status_filter: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_db)
):
    """
    Get all callbacks for a campaign.
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
        
        service = get_callback_scheduler(db)
        callbacks = service.get_callbacks_for_campaign(campaign_id, status_filter)
        
        return [
            CallbackResponse(
                id=cb.id,
                lead_id=cb.lead_id,
                campaign_id=cb.campaign_id,
                scheduled_datetime=cb.scheduled_datetime,
                status=cb.status,
                priority=cb.priority,
                lead_name=cb.lead_name,
                lead_phone=cb.lead_phone,
                lead_score=cb.lead_score,
                assigned_to_agent_id=cb.assigned_to_agent_id,
                assigned_to_agent_name=cb.assigned_to_agent_name,
                callback_reason=cb.callback_reason,
                conversation_summary=cb.conversation_summary,
                recommended_talking_points=cb.recommended_talking_points,
                created_at=cb.created_at
            )
            for cb in callbacks
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get callbacks: {str(e)}"
        )


@router.get("/agent/{agent_id}", response_model=List[CallbackResponse])
async def get_agent_callbacks(
    agent_id: str,
    status_filter: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_db)
):
    """
    Get callbacks assigned to specific agent.
    """
    try:
        service = get_callback_scheduler(db)
        callbacks = service.get_callbacks_for_agent(agent_id, status_filter)
        
        # Verify user has access to these callbacks
        if callbacks:
            campaign_id = callbacks[0].campaign_id
            campaign_ref = db.collection('campaigns').document(campaign_id).get()
            if campaign_ref.exists:
                campaign_data = campaign_ref.to_dict()
                if campaign_data.get('user_id') != current_user['user_id']:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Access denied"
                    )
        
        return [
            CallbackResponse(
                id=cb.id,
                lead_id=cb.lead_id,
                campaign_id=cb.campaign_id,
                scheduled_datetime=cb.scheduled_datetime,
                status=cb.status,
                priority=cb.priority,
                lead_name=cb.lead_name,
                lead_phone=cb.lead_phone,
                lead_score=cb.lead_score,
                assigned_to_agent_id=cb.assigned_to_agent_id,
                assigned_to_agent_name=cb.assigned_to_agent_name,
                callback_reason=cb.callback_reason,
                conversation_summary=cb.conversation_summary,
                recommended_talking_points=cb.recommended_talking_points,
                created_at=cb.created_at
            )
            for cb in callbacks
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get agent callbacks: {str(e)}"
        )


@router.get("/upcoming", response_model=List[CallbackResponse])
async def get_upcoming_callbacks(
    hours_ahead: int = 24,
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_db)
):
    """
    Get callbacks scheduled in the next N hours.
    """
    try:
        service = get_callback_scheduler(db)
        callbacks = service.get_upcoming_callbacks(hours_ahead)
        
        # Filter by user's campaigns
        user_callbacks = []
        for cb in callbacks:
            campaign_ref = db.collection('campaigns').document(cb.campaign_id).get()
            if campaign_ref.exists:
                campaign_data = campaign_ref.to_dict()
                if campaign_data.get('user_id') == current_user['user_id']:
                    user_callbacks.append(cb)
        
        return [
            CallbackResponse(
                id=cb.id,
                lead_id=cb.lead_id,
                campaign_id=cb.campaign_id,
                scheduled_datetime=cb.scheduled_datetime,
                status=cb.status,
                priority=cb.priority,
                lead_name=cb.lead_name,
                lead_phone=cb.lead_phone,
                lead_score=cb.lead_score,
                assigned_to_agent_id=cb.assigned_to_agent_id,
                assigned_to_agent_name=cb.assigned_to_agent_name,
                callback_reason=cb.callback_reason,
                conversation_summary=cb.conversation_summary,
                recommended_talking_points=cb.recommended_talking_points,
                created_at=cb.created_at
            )
            for cb in user_callbacks
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get upcoming callbacks: {str(e)}"
        )


@router.get("/{callback_id}", response_model=CallbackResponse)
async def get_callback(
    callback_id: str,
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_db)
):
    """
    Get specific callback by ID.
    """
    try:
        service = get_callback_scheduler(db)
        callback = service.get_callback(callback_id)
        
        if not callback:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Callback not found"
            )
        
        # Verify ownership
        campaign_ref = db.collection('campaigns').document(callback.campaign_id).get()
        if campaign_ref.exists:
            campaign_data = campaign_ref.to_dict()
            if campaign_data.get('user_id') != current_user['user_id']:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied"
                )
        
        return CallbackResponse(
            id=callback.id,
            lead_id=callback.lead_id,
            campaign_id=callback.campaign_id,
            scheduled_datetime=callback.scheduled_datetime,
            status=callback.status,
            priority=callback.priority,
            lead_name=callback.lead_name,
            lead_phone=callback.lead_phone,
            lead_score=callback.lead_score,
            assigned_to_agent_id=callback.assigned_to_agent_id,
            assigned_to_agent_name=callback.assigned_to_agent_name,
            callback_reason=callback.callback_reason,
            conversation_summary=callback.conversation_summary,
            recommended_talking_points=callback.recommended_talking_points,
            created_at=callback.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get callback: {str(e)}"
        )


@router.patch("/{callback_id}/assign", response_model=dict)
async def assign_callback(
    callback_id: str,
    request: AssignCallbackRequest,
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_db)
):
    """
    Assign callback to specific agent.
    """
    try:
        service = get_callback_scheduler(db)
        
        # Verify callback exists and ownership
        callback = service.get_callback(callback_id)
        if not callback:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Callback not found"
            )
        
        campaign_ref = db.collection('campaigns').document(callback.campaign_id).get()
        if campaign_ref.exists:
            campaign_data = campaign_ref.to_dict()
            if campaign_data.get('user_id') != current_user['user_id']:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied"
                )
        
        success = service.assign_callback_to_agent(callback_id, request.agent_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to assign callback"
            )
        
        return {
            "success": True,
            "callback_id": callback_id,
            "agent_id": request.agent_id,
            "message": "Callback assigned successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to assign callback: {str(e)}"
        )


@router.patch("/{callback_id}/reschedule", response_model=dict)
async def reschedule_callback(
    callback_id: str,
    request: RescheduleCallbackRequest,
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_db)
):
    """
    Reschedule callback to new time.
    """
    try:
        service = get_callback_scheduler(db)
        
        # Verify callback exists and ownership
        callback = service.get_callback(callback_id)
        if not callback:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Callback not found"
            )
        
        campaign_ref = db.collection('campaigns').document(callback.campaign_id).get()
        if campaign_ref.exists:
            campaign_data = campaign_ref.to_dict()
            if campaign_data.get('user_id') != current_user['user_id']:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied"
                )
        
        success = service.reschedule_callback(callback_id, request.new_datetime, request.reason)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to reschedule callback"
            )
        
        return {
            "success": True,
            "callback_id": callback_id,
            "new_datetime": request.new_datetime,
            "message": "Callback rescheduled successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reschedule callback: {str(e)}"
        )


@router.patch("/{callback_id}/complete", response_model=dict)
async def complete_callback(
    callback_id: str,
    request: CompleteCallbackRequest,
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_db)
):
    """
    Mark callback as completed.
    """
    try:
        service = get_callback_scheduler(db)
        
        # Verify callback exists and ownership
        callback = service.get_callback(callback_id)
        if not callback:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Callback not found"
            )
        
        campaign_ref = db.collection('campaigns').document(callback.campaign_id).get()
        if campaign_ref.exists:
            campaign_data = campaign_ref.to_dict()
            if campaign_data.get('user_id') != current_user['user_id']:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied"
                )
        
        success = service.complete_callback(callback_id, request.outcome, request.notes)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to complete callback"
            )
        
        return {
            "success": True,
            "callback_id": callback_id,
            "outcome": request.outcome,
            "message": "Callback completed successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete callback: {str(e)}"
        )
