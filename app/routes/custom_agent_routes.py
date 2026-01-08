from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from google.cloud import firestore

from app.dependencies import get_db
from app.schemas.custom_agent import CustomAgentCreate, CustomAgentUpdate, CustomAgentResponse
from app.services.custom_agent_service import get_custom_agent_service
from app.core.security import get_current_user

router = APIRouter(prefix="/agents", tags=["Custom Agents"])

@router.post("", response_model=CustomAgentResponse)
async def create_custom_agent(
    agent_data: CustomAgentCreate,
    db = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new custom agent"""
    # Extract user_id from the current_user dictionary
    user_id = current_user.get("user_id")
    
    # Handle both Firebase Client and None (for SQLite fallback)
    agent_service = get_custom_agent_service(db if isinstance(db, firestore.Client) else None)
    agent = agent_service.create_agent(user_id, agent_data.dict())
    
    return CustomAgentResponse.from_orm(agent)

@router.get("", response_model=List[CustomAgentResponse])
async def list_custom_agents(
    db = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    """List all custom agents for the current user"""
    agent_service = get_custom_agent_service(db if isinstance(db, firestore.Client) else None)
    # Extract user_id from the current_user dictionary
    user_id = current_user.get("user_id")
    agents = agent_service.get_user_agents(user_id)
    return [CustomAgentResponse.from_orm(agent) for agent in agents]

@router.get("/{agent_id}", response_model=CustomAgentResponse)
async def get_custom_agent(
    agent_id: str,
    db = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get a specific custom agent"""
    agent_service = get_custom_agent_service(db if isinstance(db, firestore.Client) else None)
    # Extract user_id from the current_user dictionary
    user_id = current_user.get("user_id")
    agent = agent_service.get_agent_by_id(agent_id, user_id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    return CustomAgentResponse.from_orm(agent)

@router.put("/{agent_id}", response_model=CustomAgentResponse)
async def update_custom_agent(
    agent_id: str,
    agent_data: CustomAgentUpdate,
    db = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update a custom agent"""
    agent_service = get_custom_agent_service(db if isinstance(db, firestore.Client) else None)
    # Extract user_id from the current_user dictionary
    user_id = current_user.get("user_id")
    agent = agent_service.update_agent(agent_id, user_id, agent_data.dict(exclude_unset=True))
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    return CustomAgentResponse.from_orm(agent)

@router.delete("/{agent_id}")
async def delete_custom_agent(
    agent_id: str,
    db = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a custom agent"""
    agent_service = get_custom_agent_service(db if isinstance(db, firestore.Client) else None)
    # Extract user_id from the current_user dictionary
    user_id = current_user.get("user_id")
    success = agent_service.delete_agent(agent_id, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    
    return {"message": "Agent deleted successfully"}

