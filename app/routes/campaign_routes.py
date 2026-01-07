import logging
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from google.cloud import firestore
from typing import List, Optional
import tempfile
import os
import asyncio
from dotenv import load_dotenv

from app import schemas
from app.dependencies import get_db
from app.core.security import get_current_user
from app.models.campaign import CallSession as CallSessionModel
from app.models.lead import Lead as LeadModel
from app.schemas.campaign_schema import CallSession, CallSessionCreate, CallSessionUpdate, CallSessionType
from app.schemas.lead import Lead as LeadSchema
from app.services import campaign_service
from app.services.rag_service import get_rag_service
from app.services.outbound_service import outbound_manager
from app.services.lead_caller import lead_caller_service
from app.services.callback_scheduler import callback_scheduler

load_dotenv()

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/campaigns", tags=["Call Sessions"])

@router.get("/", response_model=List[CallSession])
def read_call_sessions(
    skip: int = 0, 
    limit: int = 100, 
    campaign_type: Optional[str] = None,
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all call sessions for the current user."""
    logger.info(f"Reading call sessions for user {current_user['user_id']} with type filter: {campaign_type}")
    if campaign_type == 'all':
        campaign_type = None
    
    call_sessions = campaign_service.get_campaigns(db, current_user["user_id"], skip=skip, limit=limit, campaign_type=campaign_type)
    return call_sessions

@router.get("/{campaign_id}", response_model=CallSession)
def read_call_session(
    campaign_id: str, 
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get a specific call session."""
    call_session = campaign_service.get_campaign(db, campaign_id)
    if not call_session or call_session.user_id != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Call session not found"
        )
    return call_session

@router.post("/", response_model=CallSession)
def create_call_session(
    call_session: CallSessionCreate, 
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new call session."""
    try:
        result = campaign_service.create_campaign(db, call_session, current_user["user_id"])
        return result
    except Exception as e:
        logger.error(f"Error creating call session: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating call session: {str(e)}"
        )

@router.put("/{campaign_id}", response_model=CallSession)
def update_call_session(
    campaign_id: str,
    call_session: CallSessionUpdate, 
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update a call session."""
    db_call_session = campaign_service.get_campaign(db, campaign_id)
    if not db_call_session or db_call_session.user_id != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Call session not found"
        )
    
    updated_call_session = campaign_service.update_campaign(db, campaign_id, call_session)
    if not updated_call_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Call session not found"
        )
    return updated_call_session

@router.delete("/{campaign_id}", response_model=dict)
def delete_call_session(
    campaign_id: str, 
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a call session."""
    db_call_session = campaign_service.get_campaign(db, campaign_id)
    if not db_call_session or db_call_session.user_id != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Call session not found"
        )
    
    if campaign_service.delete_campaign(db, campaign_id):
        return {"message": "Call session deleted successfully"}
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Call session not found"
        )

@router.post("/{campaign_id}/start", response_model=CallSession)
def start_call_session(
    campaign_id: str, 
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Start a call session."""
    db_call_session = campaign_service.get_campaign(db, campaign_id)
    if not db_call_session or db_call_session.user_id != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Call session not found"
        )
    
    started_call_session = campaign_service.start_campaign(db, campaign_id)
    if not started_call_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Call session not found"
        )
    
    if started_call_session.type == "outbound": # Check string value directly
        if not outbound_manager.client:
            account_sid = os.getenv("TWILIO_ACCOUNT_SID")
            auth_token = os.getenv("TWILIO_AUTH_TOKEN")
            from_number = os.getenv("TWILIO_NUMBER")
            ngrok_domain = os.getenv("NGROK_DOMAIN")
            
            if account_sid and auth_token and from_number and ngrok_domain:
                webhook_base = f"https://{ngrok_domain}"
                outbound_manager.initialize(account_sid, auth_token, from_number, webhook_base)
        
        try:
            asyncio.create_task(lead_caller_service.start_campaign_dialing(campaign_id, db))
        except Exception as e:
            logger.error(f"Failed to start lead dialing for call session {campaign_id}: {e}")
    
    return started_call_session

@router.post("/{campaign_id}/stop", response_model=CallSession)
def stop_call_session(
    campaign_id: str, 
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Stop a call session."""
    db_call_session = campaign_service.get_campaign(db, campaign_id)
    if not db_call_session or db_call_session.user_id != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Call session not found"
        )
    
    stopped_call_session = campaign_service.stop_campaign(db, campaign_id)
    if not stopped_call_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Call session not found"
        )
    return stopped_call_session

@router.post("/{campaign_id}/upload-leads", response_model=List[LeadSchema])
async def upload_leads(
    campaign_id: str,
    file: UploadFile = File(...),
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Upload leads for the call session."""
    try:
        call_session = campaign_service.get_campaign(db, campaign_id)
        if not call_session or call_session.user_id != current_user["user_id"]:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Call session not found"
            )
        
        if not file.filename or not file.filename.endswith('.csv'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only CSV files are allowed"
            )
        
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix='.csv') as tmp_file:
                content = await file.read()
                tmp_file.write(content)
                tmp_file_path = tmp_file.name
            
            lead_count = await campaign_service.process_lead_csv(tmp_file_path, campaign_id, db)
            
            if os.path.exists(tmp_file_path):
                os.unlink(tmp_file_path)
            
            if lead_count == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No valid leads found in CSV."
                )
            
            # Fetch leads from Firestore
            leads_ref = db.collection('leads')
            docs = leads_ref.where('campaign_id', '==', campaign_id).stream()
            leads = []
            for doc in docs:
                leads.append(LeadModel.from_dict(doc.to_dict(), doc.id))
                
            return leads
        except Exception as e:
            if 'tmp_file_path' in locals() and os.path.exists(tmp_file_path):
                os.unlink(tmp_file_path)
            raise
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error uploading leads for call session {campaign_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing leads: {str(e)}"
        )

@router.get("/callbacks", tags=["Callbacks"])
async def get_scheduled_callbacks():
    """Get all scheduled callbacks"""
    try:
        callbacks = callback_scheduler.get_scheduled_callbacks()
        return {
            "status": "success",
            "callbacks": callbacks
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))