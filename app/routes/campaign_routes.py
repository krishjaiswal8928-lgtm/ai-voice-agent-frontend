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
from app.core.security import get_current_user
from app.models.campaign import CallSession as CallSessionModel
from app.models.lead import Lead as LeadModel
from app.models.custom_agent import CustomAgent # Import CustomAgent
from google.cloud.firestore import FieldFilter # Import FieldFilter
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

@router.get("", response_model=List[CallSession])
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

@router.post("", response_model=CallSession)
def create_call_session(
    call_session: CallSessionCreate, 
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new call session."""
    try:
        # VALIDATE
        if call_session.custom_agent_id:
             validate_agent_constraints(db, call_session.custom_agent_id)

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
    
    # VALIDATE if agent is changing or just verify current assignment if sticking with same?
    # Ideally should verify current too, in case prerequisites were removed since creation.
    # If the user updates the campaign (even name), we re-validate the agent just in case.
    new_agent_id = call_session.custom_agent_id or db_call_session.custom_agent_id
    if new_agent_id:
         validate_agent_constraints(db, new_agent_id, exclude_campaign_id=campaign_id)

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


def validate_agent_constraints(db: firestore.Client, agent_id: str, exclude_campaign_id: Optional[str] = None):
    """
    Validate agent assignment:
    1. Agent must exist
    2. Agent must have phone number
    3. Agent must have knowledge base (trained_documents)
    4. Agent must not be active in another campaign
    """
    if not agent_id:
        return

    # 1. Fetch Agent
    agent_ref = db.collection('custom_agents').document(agent_id)
    agent_doc = agent_ref.get()
    
    if not agent_doc.exists:
        raise HTTPException(status_code=400, detail=f"Agent configured for this campaign not found.")
    
    agent = CustomAgent.from_dict(agent_doc.to_dict(), agent_doc.id)
    
    # 2. Check Phone Number
    if not agent.phone_number_id:
        raise HTTPException(
            status_code=400, 
            detail=f"Agent '{agent.name}' has no phone number assigned. Please assign a phone number in Agent Settings before using in a campaign."
        )
        
    # 3. Check Knowledge Base (Trained Documents)
    # Using 'trained_documents' as proxy for KB. User said "Train".
    if not agent.trained_documents or len(agent.trained_documents) == 0:
        raise HTTPException(
            status_code=400,
            detail=f"Agent '{agent.name}' has no Knowledge Base training. Please train the agent with documents/URLs before using in a campaign."
        )

    # 4. Check Uniqueness in ACTIVE campaigns
    # Query for ANY campaign that is 'active' AND uses this agent
    campaigns_ref = db.collection('campaigns')
    query = campaigns_ref.where(filter=FieldFilter('status', '==', 'active')).where(filter=FieldFilter('custom_agent_id', '==', agent_id))
    
    active_campaigns = list(query.stream())
    
    for camp_doc in active_campaigns:
        # If updating/starting a campaign, ignore self
        if exclude_campaign_id and camp_doc.id == exclude_campaign_id:
            continue
            
        # If we found another active campaign with this agent -> ERROR
        camp_data = camp_doc.to_dict()
        camp_name = camp_data.get('name', 'Unknown')
        camp_type = camp_data.get('type', 'Unknown')
        
        raise HTTPException(
            status_code=400,
            detail=f"This agent is active in Call Session '{camp_name}' for {camp_type}. Select another agent or create a new one."
        )


@router.post("/{campaign_id}/start", response_model=CallSession)
async def start_call_session(
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
    
    # VALIDATE: Check constraints before starting (Agent Uniqueness is critical here)
    if db_call_session.custom_agent_id:
        validate_agent_constraints(db, db_call_session.custom_agent_id, exclude_campaign_id=campaign_id)

    started_call_session = campaign_service.start_campaign(db, campaign_id)
    if not started_call_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Call session not found"
        )
    
    if started_call_session.type == "outbound": # Check string value directly
        # Start lead dialing in background
        try:
            # Create background task properly
            asyncio.create_task(lead_caller_service.start_campaign_dialing(campaign_id, db))
            logger.info(f"✅ Started lead dialing service for campaign {campaign_id}")
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