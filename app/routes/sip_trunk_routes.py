from fastapi import APIRouter, Depends, HTTPException, status
from google.cloud import firestore
from typing import List

from app.dependencies import get_db
from app.core.security import get_current_user
from app.schemas.sip_trunk import (
    SIPTrunkResponse,
    SIPTrunkCreate,
    SIPTrunkUpdate
)
from app.services.sip_trunk_service import sip_trunk_service

router = APIRouter(prefix="/sip-trunks", tags=["SIP Trunks"])

@router.get("", response_model=List[SIPTrunkResponse])
async def get_sip_trunks(
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all SIP trunks for the current user."""
    trunks = sip_trunk_service.get_sip_trunks(db, current_user["user_id"])
    return [SIPTrunkResponse(**trunk.to_dict()) for trunk in trunks]

@router.post("", response_model=SIPTrunkResponse, status_code=status.HTTP_201_CREATED)
async def create_sip_trunk(
    trunk_data: SIPTrunkCreate,
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new SIP trunk."""
    try:
        trunk = sip_trunk_service.create_sip_trunk(db, trunk_data, current_user["user_id"])
        return SIPTrunkResponse(**trunk.to_dict())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create SIP trunk: {str(e)}")

@router.get("/{trunk_id}", response_model=SIPTrunkResponse)
async def get_sip_trunk(
    trunk_id: str,
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get a specific SIP trunk."""
    trunk = sip_trunk_service.get_sip_trunk(db, trunk_id)
    
    if not trunk:
        raise HTTPException(status_code=404, detail="SIP trunk not found")
    
    if trunk.user_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized to access this SIP trunk")
    
    return SIPTrunkResponse(**trunk.to_dict())

@router.put("/{trunk_id}", response_model=SIPTrunkResponse)
async def update_sip_trunk(
    trunk_id: str,
    update_data: SIPTrunkUpdate,
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update a SIP trunk."""
    trunk = sip_trunk_service.get_sip_trunk(db, trunk_id)
    
    if not trunk:
        raise HTTPException(status_code=404, detail="SIP trunk not found")
    
    if trunk.user_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized to modify this SIP trunk")
    
    try:
        updated_trunk = sip_trunk_service.update_sip_trunk(db, trunk_id, update_data)
        return SIPTrunkResponse(**updated_trunk.to_dict())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{trunk_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_sip_trunk(
    trunk_id: str,
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a SIP trunk."""
    trunk = sip_trunk_service.get_sip_trunk(db, trunk_id)
    
    if not trunk:
        raise HTTPException(status_code=404, detail="SIP trunk not found")
    
    if trunk.user_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this SIP trunk")
    
    sip_trunk_service.delete_sip_trunk(db, trunk_id)
    return None

@router.post("/{trunk_id}/check-connection")
async def check_connection(
    trunk_id: str,
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Manually check SIP trunk connection status."""
    trunk = sip_trunk_service.get_sip_trunk(db, trunk_id)
    
    if not trunk:
        raise HTTPException(status_code=404, detail="SIP trunk not found")
    
    if trunk.user_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        # Run connection check immediately
        from app.tasks.background_jobs import check_sip_trunk_status
        import asyncio
        
        await check_sip_trunk_status(db, trunk_id)
        
        # Get updated trunk
        updated_trunk = sip_trunk_service.get_sip_trunk(db, trunk_id)
        
        return {
            "success": True,
            "connection_status": updated_trunk.connection_status,
            "last_checked_at": updated_trunk.last_checked_at,
            "error_message": updated_trunk.error_message
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Check failed: {str(e)}")

