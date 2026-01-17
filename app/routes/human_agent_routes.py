"""
Human Agent API Routes
Endpoints for managing human sales agents.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime
from google.cloud import firestore

from app.services.human_agent_service import get_human_agent_service
from app.dependencies import get_db
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/human-agents", tags=["Human Agents"])


# ===== REQUEST/RESPONSE MODELS =====

class WorkingHoursDay(BaseModel):
    """Working hours for a specific day."""
    start: str = "09:00"
    end: str = "17:00"
    off: bool = False


class WorkingHours(BaseModel):
    """Weekly working hours."""
    monday: Optional[WorkingHoursDay] = None
    tuesday: Optional[WorkingHoursDay] = None
    wednesday: Optional[WorkingHoursDay] = None
    thursday: Optional[WorkingHoursDay] = None
    friday: Optional[WorkingHoursDay] = None
    saturday: Optional[WorkingHoursDay] = None
    sunday: Optional[WorkingHoursDay] = None


class CreateAgentRequest(BaseModel):
    """Request model for creating an agent."""
    name: str
    email: EmailStr
    phone: Optional[str] = None
    extension: Optional[str] = None
    timezone: str = "UTC"
    working_hours: Optional[dict] = None
    accepts_transfers: bool = True
    accepts_callbacks: bool = True
    max_concurrent_calls: int = 1
    transfer_notification_method: str = "call"
    callback_notification_method: str = "email"


class UpdateAgentRequest(BaseModel):
    """Request model for updating an agent."""
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    extension: Optional[str] = None
    timezone: Optional[str] = None
    working_hours: Optional[dict] = None
    accepts_transfers: Optional[bool] = None
    accepts_callbacks: Optional[bool] = None
    max_concurrent_calls: Optional[int] = None
    transfer_notification_method: Optional[str] = None
    callback_notification_method: Optional[str] = None


class UpdateStatusRequest(BaseModel):
    """Request model for updating agent status."""
    status: str  # 'available', 'busy', 'offline', 'on_call', 'break'


class AgentResponse(BaseModel):
    """Response model for agent."""
    id: str
    user_id: str
    name: str
    email: str
    phone: Optional[str]
    extension: Optional[str]
    status: str
    timezone: str
    working_hours: dict
    accepts_transfers: bool
    accepts_callbacks: bool
    max_concurrent_calls: int
    current_active_calls: int
    total_transfers_received: int
    total_callbacks_completed: int
    average_call_duration: float
    conversion_rate: float
    created_at: datetime


# ===== API ENDPOINTS =====

@router.post("/", response_model=AgentResponse, status_code=status.HTTP_201_CREATED)
async def create_agent(
    request: CreateAgentRequest,
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_db)
):
    """
    Create a new human agent.
    """
    try:
        service = get_human_agent_service(db)
        
        agent_data = request.dict()
        agent = service.create_agent(current_user['user_id'], agent_data)
        
        return AgentResponse(
            id=agent.id,
            user_id=agent.user_id,
            name=agent.name,
            email=agent.email,
            phone=agent.phone,
            extension=agent.extension,
            status=agent.status,
            timezone=agent.timezone,
            working_hours=agent.working_hours,
            accepts_transfers=agent.accepts_transfers,
            accepts_callbacks=agent.accepts_callbacks,
            max_concurrent_calls=agent.max_concurrent_calls,
            current_active_calls=agent.current_active_calls,
            total_transfers_received=agent.total_transfers_received,
            total_callbacks_completed=agent.total_callbacks_completed,
            average_call_duration=agent.average_call_duration,
            conversion_rate=agent.conversion_rate,
            created_at=agent.created_at
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create agent: {str(e)}"
        )


@router.get("/", response_model=List[AgentResponse])
async def list_agents(
    status_filter: Optional[str] = None,
    accepts_transfers: Optional[bool] = None,
    accepts_callbacks: Optional[bool] = None,
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_db)
):
    """
    List all human agents for the organization.
    """
    try:
        service = get_human_agent_service(db)
        
        filters = {}
        if status_filter:
            filters['status'] = status_filter
        if accepts_transfers is not None:
            filters['accepts_transfers'] = accepts_transfers
        if accepts_callbacks is not None:
            filters['accepts_callbacks'] = accepts_callbacks
        
        agents = service.list_agents(current_user['user_id'], filters)
        
        return [
            AgentResponse(
                id=agent.id,
                user_id=agent.user_id,
                name=agent.name,
                email=agent.email,
                phone=agent.phone,
                extension=agent.extension,
                status=agent.status,
                timezone=agent.timezone,
                working_hours=agent.working_hours,
                accepts_transfers=agent.accepts_transfers,
                accepts_callbacks=agent.accepts_callbacks,
                max_concurrent_calls=agent.max_concurrent_calls,
                current_active_calls=agent.current_active_calls,
                total_transfers_received=agent.total_transfers_received,
                total_callbacks_completed=agent.total_callbacks_completed,
                average_call_duration=agent.average_call_duration,
                conversion_rate=agent.conversion_rate,
                created_at=agent.created_at
            )
            for agent in agents
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list agents: {str(e)}"
        )


@router.get("/available", response_model=List[AgentResponse])
async def get_available_agents(
    campaign_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_db)
):
    """
    Get all currently available agents.
    """
    try:
        service = get_human_agent_service(db)
        agents = service.get_available_agents(current_user['user_id'], campaign_id)
        
        return [
            AgentResponse(
                id=agent.id,
                user_id=agent.user_id,
                name=agent.name,
                email=agent.email,
                phone=agent.phone,
                extension=agent.extension,
                status=agent.status,
                timezone=agent.timezone,
                working_hours=agent.working_hours,
                accepts_transfers=agent.accepts_transfers,
                accepts_callbacks=agent.accepts_callbacks,
                max_concurrent_calls=agent.max_concurrent_calls,
                current_active_calls=agent.current_active_calls,
                total_transfers_received=agent.total_transfers_received,
                total_callbacks_completed=agent.total_callbacks_completed,
                average_call_duration=agent.average_call_duration,
                conversion_rate=agent.conversion_rate,
                created_at=agent.created_at
            )
            for agent in agents
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get available agents: {str(e)}"
        )


@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(
    agent_id: str,
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_db)
):
    """
    Get specific agent by ID.
    """
    try:
        service = get_human_agent_service(db)
        agent = service.get_agent(agent_id)
        
        if not agent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Agent {agent_id} not found"
            )
        
        # Verify ownership
        if agent.user_id != current_user['user_id']:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        return AgentResponse(
            id=agent.id,
            user_id=agent.user_id,
            name=agent.name,
            email=agent.email,
            phone=agent.phone,
            extension=agent.extension,
            status=agent.status,
            timezone=agent.timezone,
            working_hours=agent.working_hours,
            accepts_transfers=agent.accepts_transfers,
            accepts_callbacks=agent.accepts_callbacks,
            max_concurrent_calls=agent.max_concurrent_calls,
            current_active_calls=agent.current_active_calls,
            total_transfers_received=agent.total_transfers_received,
            total_callbacks_completed=agent.total_callbacks_completed,
            average_call_duration=agent.average_call_duration,
            conversion_rate=agent.conversion_rate,
            created_at=agent.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get agent: {str(e)}"
        )


@router.put("/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: str,
    request: UpdateAgentRequest,
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_db)
):
    """
    Update agent information.
    """
    try:
        service = get_human_agent_service(db)
        
        # Verify agent exists and ownership
        agent = service.get_agent(agent_id)
        if not agent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Agent {agent_id} not found"
            )
        
        if agent.user_id != current_user['user_id']:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Update agent
        updates = {k: v for k, v in request.dict().items() if v is not None}
        updated_agent = service.update_agent(agent_id, updates)
        
        if not updated_agent:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update agent"
            )
        
        return AgentResponse(
            id=updated_agent.id,
            user_id=updated_agent.user_id,
            name=updated_agent.name,
            email=updated_agent.email,
            phone=updated_agent.phone,
            extension=updated_agent.extension,
            status=updated_agent.status,
            timezone=updated_agent.timezone,
            working_hours=updated_agent.working_hours,
            accepts_transfers=updated_agent.accepts_transfers,
            accepts_callbacks=updated_agent.accepts_callbacks,
            max_concurrent_calls=updated_agent.max_concurrent_calls,
            current_active_calls=updated_agent.current_active_calls,
            total_transfers_received=updated_agent.total_transfers_received,
            total_callbacks_completed=updated_agent.total_callbacks_completed,
            average_call_duration=updated_agent.average_call_duration,
            conversion_rate=updated_agent.conversion_rate,
            created_at=updated_agent.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update agent: {str(e)}"
        )


@router.patch("/{agent_id}/status", response_model=dict)
async def update_agent_status(
    agent_id: str,
    request: UpdateStatusRequest,
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_db)
):
    """
    Update agent status (available, busy, offline, etc.).
    """
    try:
        service = get_human_agent_service(db)
        
        # Verify agent exists and ownership
        agent = service.get_agent(agent_id)
        if not agent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Agent {agent_id} not found"
            )
        
        if agent.user_id != current_user['user_id']:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Validate status
        valid_statuses = ['available', 'busy', 'offline', 'on_call', 'break']
        if request.status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        
        success = service.update_agent_status(agent_id, request.status)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update status"
            )
        
        return {
            "success": True,
            "agent_id": agent_id,
            "new_status": request.status,
            "message": f"Agent status updated to {request.status}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update status: {str(e)}"
        )


@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent(
    agent_id: str,
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_db)
):
    """
    Delete agent.
    """
    try:
        service = get_human_agent_service(db)
        
        # Verify agent exists and ownership
        agent = service.get_agent(agent_id)
        if not agent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Agent {agent_id} not found"
            )
        
        if agent.user_id != current_user['user_id']:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        success = service.delete_agent(agent_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete agent"
            )
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete agent: {str(e)}"
        )


@router.get("/{agent_id}/metrics", response_model=dict)
async def get_agent_metrics(
    agent_id: str,
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_db)
):
    """
    Get agent performance metrics.
    """
    try:
        service = get_human_agent_service(db)
        
        # Verify agent exists and ownership
        agent = service.get_agent(agent_id)
        if not agent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Agent {agent_id} not found"
            )
        
        if agent.user_id != current_user['user_id']:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        metrics = service.get_agent_metrics(agent_id)
        
        return metrics
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get metrics: {str(e)}"
        )


@router.get("/{agent_id}/capacity", response_model=dict)
async def get_agent_capacity(
    agent_id: str,
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_db)
):
    """
    Check agent's current capacity.
    """
    try:
        service = get_human_agent_service(db)
        
        # Verify agent exists and ownership
        agent = service.get_agent(agent_id)
        if not agent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Agent {agent_id} not found"
            )
        
        if agent.user_id != current_user['user_id']:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        capacity = service.get_agent_capacity(agent_id)
        
        return capacity
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get capacity: {str(e)}"
        )
