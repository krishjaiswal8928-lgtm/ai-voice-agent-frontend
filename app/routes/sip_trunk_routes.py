from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import logging
import uuid
from datetime import datetime

from app.database.firestore import db
from app.services.telnyx_service import telnyx_sip_service
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/sip-trunks", tags=["sip_trunks"])
logger = logging.getLogger(__name__)

# Pydantic Models
class SIPTrunkCreate(BaseModel):
    name: str
    
class SIPTrunkResponse(BaseModel):
    id: str
    name: str
    sip_domain: str
    username: str
    password: Optional[str] = None  # Only returned on creation
    status: str
    webhook_url: str
    created_at: str
    
class SIPTrunkListResponse(BaseModel):
    id: str
    name: str
    sip_domain: str
    username: str
    status: str
    created_at: str

@router.post("", response_model=SIPTrunkResponse)
async def create_sip_trunk(
    trunk_data: SIPTrunkCreate,
    current_user = Depends(get_current_user)
):
    """
    Create new SIP trunk for client
    
    This generates Telnyx SIP credentials that the client can use
    to connect their phone system (3CX, Ziwo, etc.)
    """
    try:
        client_id = current_user["uid"]
        
        logger.info(f"Creating SIP trunk for client: {client_id}")
        
        # Create SIP connection in Telnyx
        telnyx_data = telnyx_sip_service.create_sip_connection(
            client_id=client_id,
            connection_name=trunk_data.name
        )
        
        # Encrypt password for storage
        encrypted_password = telnyx_sip_service.encrypt_password(
            telnyx_data["password"]
        )
        
        # Save to database
        sip_trunk = {
            "id": str(uuid.uuid4()),
            "client_id": client_id,
            "name": trunk_data.name,
            "telnyx_connection_id": telnyx_data["connection_id"],
            "sip_domain": telnyx_data["sip_domain"],
            "username": telnyx_data["username"],
            "password_encrypted": encrypted_password,
            "status": "active",
            "webhook_url": f"https://{telnyx_sip_service.webhook_base}/telnyx/sip/webhook",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        db.collection("sip_trunks").document(sip_trunk["id"]).set(sip_trunk)
        
        logger.info(f"✅ SIP trunk created: {sip_trunk['id']}")
        
        # Return with plain password (only time it's shown)
        return {
            **sip_trunk,
            "password": telnyx_data["password"]  # Plain password for client
        }
        
    except Exception as e:
        logger.error(f"❌ Error creating SIP trunk: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("", response_model=List[SIPTrunkListResponse])
async def list_sip_trunks(current_user = Depends(get_current_user)):
    """
    List all SIP trunks for current user
    """
    try:
        client_id = current_user["uid"]
        
        trunks = db.collection("sip_trunks")\
            .where("client_id", "==", client_id)\
            .stream()
        
        result = []
        for trunk in trunks:
            trunk_data = trunk.to_dict()
            trunk_data["id"] = trunk.id
            # Don't return password in list
            trunk_data.pop("password_encrypted", None)
            trunk_data.pop("telnyx_connection_id", None)
            result.append(trunk_data)
        
        logger.info(f"Listed {len(result)} SIP trunks for client: {client_id}")
        return result
        
    except Exception as e:
        logger.error(f"❌ Error listing SIP trunks: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{trunk_id}", response_model=SIPTrunkListResponse)
async def get_sip_trunk(
    trunk_id: str,
    current_user = Depends(get_current_user)
):
    """
    Get specific SIP trunk details
    """
    try:
        client_id = current_user["uid"]
        
        trunk_ref = db.collection("sip_trunks").document(trunk_id)
        trunk = trunk_ref.get()
        
        if not trunk.exists:
            raise HTTPException(status_code=404, detail="SIP trunk not found")
        
        trunk_data = trunk.to_dict()
        
        # Verify ownership
        if trunk_data["client_id"] != client_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        trunk_data["id"] = trunk.id
        trunk_data.pop("password_encrypted", None)
        trunk_data.pop("telnyx_connection_id", None)
        
        return trunk_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting SIP trunk: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{trunk_id}")
async def delete_sip_trunk(
    trunk_id: str,
    current_user = Depends(get_current_user)
):
    """
    Delete SIP trunk
    """
    try:
        client_id = current_user["uid"]
        
        # Get trunk
        trunk_ref = db.collection("sip_trunks").document(trunk_id)
        trunk = trunk_ref.get()
        
        if not trunk.exists:
            raise HTTPException(status_code=404, detail="SIP trunk not found")
        
        trunk_data = trunk.to_dict()
        
        # Verify ownership
        if trunk_data["client_id"] != client_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        # Delete from Telnyx
        try:
            telnyx_sip_service.delete_sip_connection(
                trunk_data["telnyx_connection_id"]
            )
        except Exception as e:
            logger.warning(f"⚠️ Could not delete from Telnyx: {e}")
        
        # Delete from database
        trunk_ref.delete()
        
        logger.info(f"✅ SIP trunk deleted: {trunk_id}")
        
        return {"message": "SIP trunk deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error deleting SIP trunk: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{trunk_id}/test")
async def test_sip_connection(
    trunk_id: str,
    current_user = Depends(get_current_user)
):
    """
    Test SIP trunk connection status
    """
    try:
        client_id = current_user["uid"]
        
        # Get trunk
        trunk = db.collection("sip_trunks").document(trunk_id).get()
        
        if not trunk.exists:
            raise HTTPException(status_code=404, detail="SIP trunk not found")
        
        trunk_data = trunk.to_dict()
        
        # Verify ownership
        if trunk_data["client_id"] != client_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        # Test connection with Telnyx
        status = telnyx_sip_service.get_connection_status(
            trunk_data["telnyx_connection_id"]
        )
        
        return {
            "trunk_id": trunk_id,
            "status": "connected" if status.get("active") else "error",
            "telnyx_status": status
        }
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error testing SIP connection: {e}")
        raise HTTPException(status_code=500, detail=str(e))
