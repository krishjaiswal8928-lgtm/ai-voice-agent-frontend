from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from google.cloud import firestore
from typing import List
import csv
import io
from app.dependencies import get_db
from app.schemas.lead_schema import Lead, LeadCreate
from app.models.campaign import CallSession
from app.models.lead import Lead as LeadModel
from app.core.security import get_current_user

router = APIRouter(prefix="/leads", tags=["Leads"])

@router.post("/upload-csv/{campaign_id}", response_model=List[Lead])
async def upload_leads_csv(
    campaign_id: str,
    file: UploadFile = File(...),
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Upload leads from a CSV file."""
    # Check if call session exists and belongs to the user
    doc_ref = db.collection('campaigns').document(campaign_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Call session not found"
        )
    
    campaign = Campaign.from_dict(doc.to_dict(), doc.id)
    if campaign.user_id != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Call session not found"
        )
    
    # Check file type
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files are allowed"
        )
    
    # Read and parse CSV
    content = await file.read()
    csv_data = io.StringIO(content.decode('utf-8'))
    csv_reader = csv.DictReader(csv_data)
    
    leads = []
    batch = db.batch()
    batch_count = 0
    
    for row in csv_reader:
        # Create lead
        lead_data = LeadCreate(
            name=row.get('name', ''),
            phone=row.get('phone', ''),
            email=row.get('email', ''),
            campaign_id=campaign_id
        )
        
        db_lead = LeadModel(
            name=lead_data.name,
            phone=lead_data.phone,
            email=lead_data.email,
            campaign_id=lead_data.campaign_id
        )
        
        doc_ref = db.collection('leads').document()
        batch.set(doc_ref, db_lead.to_dict())
        db_lead.id = doc_ref.id
        leads.append(db_lead)
        
        batch_count += 1
        if batch_count >= 400:
            batch.commit()
            batch = db.batch()
            batch_count = 0
            
    if batch_count > 0:
        batch.commit()
    
    return leads

@router.get("/{campaign_id}", response_model=List[Lead])
async def get_leads(
    campaign_id: str,
    skip: int = 0,
    limit: int = 100,
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all leads for a call session."""
    # Check if call session exists and belongs to the user
    doc_ref = db.collection('campaigns').document(campaign_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
        
    call_session = CallSession.from_dict(doc.to_dict(), doc.id)
    if call_session.user_id != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    leads_ref = db.collection('leads')
    docs = leads_ref.where('campaign_id', '==', campaign_id).limit(limit + skip).stream()
    
    leads = []
    for i, doc in enumerate(docs):
        if i < skip:
            continue
        leads.append(LeadModel.from_dict(doc.to_dict(), doc.id))
        
    return leads

@router.get("/{lead_id}", response_model=Lead)
async def get_lead(
    lead_id: str,
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get a specific lead."""
    doc_ref = db.collection('leads').document(lead_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )
    
    lead = LeadModel.from_dict(doc.to_dict(), doc.id)
    
    # Check if lead belongs to a call session owned by the user
    campaign_ref = db.collection('campaigns').document(lead.campaign_id)
    campaign_doc = campaign_ref.get()
    
    if not campaign_doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )
        
    call_session = CallSession.from_dict(campaign_doc.to_dict(), campaign_doc.id)
    if call_session.user_id != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )
    
    return lead