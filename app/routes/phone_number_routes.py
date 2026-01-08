from fastapi import APIRouter, Depends, HTTPException, status
from google.cloud import firestore
from typing import List

from app.dependencies import get_db
from app.core.security import get_current_user
from app.schemas.phone_number import (
    VirtualPhoneNumberResponse, 
    VirtualPhoneNumberCreate, 
    VirtualPhoneNumberUpdate
)
from app.services.phone_number_service import phone_number_service

router = APIRouter(prefix="/phone-numbers", tags=["Phone Numbers"])

@router.get("", response_model=List[VirtualPhoneNumberResponse])
async def get_phone_numbers(
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all phone numbers for the current user."""
    return phone_number_service.get_phone_numbers(db, current_user["user_id"])

@router.post("", response_model=VirtualPhoneNumberResponse)
async def create_phone_number(
    phone_data: VirtualPhoneNumberCreate,
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Add a new virtual phone number."""
    try:
        return phone_number_service.create_phone_number(db, phone_data, current_user["user_id"])
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{phone_id}", response_model=VirtualPhoneNumberResponse)
async def get_phone_number(
    phone_id: str,
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get a specific phone number."""
    phone = phone_number_service.get_phone_number(db, phone_id)
    if not phone or phone.user_id != current_user["user_id"]:
        raise HTTPException(status_code=404, detail="Phone number not found")
    return phone

@router.put("/{phone_id}", response_model=VirtualPhoneNumberResponse)
async def update_phone_number(
    phone_id: str,
    update_data: VirtualPhoneNumberUpdate,
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update a phone number."""
    phone = phone_number_service.get_phone_number(db, phone_id)
    if not phone or phone.user_id != current_user["user_id"]:
        raise HTTPException(status_code=404, detail="Phone number not found")
        
    try:
        updated = phone_number_service.update_phone_number(db, phone_id, update_data)
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{phone_id}")
async def delete_phone_number(
    phone_id: str,
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a phone number."""
    phone = phone_number_service.get_phone_number(db, phone_id)
    if not phone or phone.user_id != current_user["user_id"]:
        raise HTTPException(status_code=404, detail="Phone number not found")
        
    phone_number_service.delete_phone_number(db, phone_id)
    return {"message": "Phone number deleted successfully"}

@router.post("/{phone_id}/assign/{agent_id}")
async def assign_agent(
    phone_id: str,
    agent_id: str,
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Assign a phone number to an agent."""
    phone = phone_number_service.get_phone_number(db, phone_id)
    if not phone or phone.user_id != current_user["user_id"]:
        raise HTTPException(status_code=404, detail="Phone number not found")
        
    if phone_number_service.assign_agent(db, phone_id, agent_id):
        return {"message": "Agent assigned successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to assign agent")

@router.delete("/{phone_id}/assign/{agent_id}")
async def unassign_agent(
    phone_id: str,
    agent_id: str,
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Unassign a phone number from an agent."""
    phone = phone_number_service.get_phone_number(db, phone_id)
    if not phone or phone.user_id != current_user["user_id"]:
        raise HTTPException(status_code=404, detail="Phone number not found")
        
    if phone_number_service.unassign_agent(db, phone_id, agent_id):
        return {"message": "Agent unassigned successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to unassign agent")
