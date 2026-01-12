from typing import List, Optional, Union
from google.cloud import firestore
from app.models.campaign import CallSession
from app.models.lead import Lead
from app.models.rag_document import RAGDocument
from app.schemas.campaign_schema import CallSessionCreate, CallSessionUpdate
from app.core.utils import sanitize_input
import csv
import logging
from datetime import datetime

# Set up logging
logger = logging.getLogger(__name__)

def get_campaigns(db: firestore.Client, user_id: Union[int, str], skip: int = 0, limit: int = 100, campaign_type: str = None) -> List[CallSession]:
    """Get all campaigns for a user."""
    # Note: user_id is int in legacy, but Firestore might prefer string. 
    # Assuming user_id is stored as int in Firestore for consistency with old ID scheme, 
    # or we might need to cast. Let's assume int for now as per model.
    
    collection_ref = db.collection('campaigns')
    query = collection_ref.where('user_id', '==', user_id)
    
    # Apply CallSession type filter if provided and not 'all'
    if campaign_type and campaign_type != 'all':
        query = query.where('type', '==', campaign_type.lower())
        
    # Firestore doesn't support offset/skip efficiently without cursors.
    # For now, we'll fetch limit + skip and slice, or just limit.
    # A true pagination requires last_doc snapshot.
    # We will just use limit for simplicity in this migration.
    
    docs = query.limit(limit + skip).stream()
    
    results = []
    for i, doc in enumerate(docs):
        if i < skip:
            continue
        call_session = CallSession.from_dict(doc.to_dict(), doc.id)
        # Normalize call session types
        if call_session.type:
            call_session.type = call_session.type.lower()
        results.append(call_session)
        
    return results

def get_campaign(db: firestore.Client, campaign_id: str) -> Optional[CallSession]:
    """Get a CallSession by ID."""
    # campaign_id is passed as int in some parts of the app, but Firestore IDs are strings.
    # We should convert to string if it's an int.
    doc_ref = db.collection('campaigns').document(str(campaign_id))
    doc = doc_ref.get()
    
    if doc.exists:
        call_session = CallSession.from_dict(doc.to_dict(), doc.id)
        if call_session.type:
            call_session.type = call_session.type.lower()
        return call_session
    return None

def create_campaign(db: firestore.Client, call_session_data: CallSessionCreate, user_id: Union[int, str]) -> CallSession:
    """Create a new CallSession."""
    try:
        logger.info(f"Creating CallSession with data: {call_session_data}")
        
        # Handle enum conversion
        campaign_type = call_session_data.type
        if hasattr(campaign_type, 'value'):
            campaign_type = campaign_type.value
        elif not isinstance(campaign_type, str):
            campaign_type = str(campaign_type)
        
        campaign_type = campaign_type.lower()
        
        new_campaign = CallSession(
            user_id=user_id,
            name=sanitize_input(call_session_data.name),
            type=campaign_type,
            goal=sanitize_input(call_session_data.goal) if call_session_data.goal else None,
            custom_agent_id=call_session_data.custom_agent_id,
            phone_number_id=call_session_data.phone_number_id
        )
        
        # Add to Firestore
        update_time, doc_ref = db.collection('campaigns').add(new_campaign.to_dict())
        
        # Update ID in object
        new_campaign.id = doc_ref.id
        
        logger.info(f"Successfully created CallSession with ID: {new_campaign.id}")
        return new_campaign
    except Exception as e:
        logger.error(f"Error creating CallSession: {e}", exc_info=True)
        raise

def update_campaign(db: firestore.Client, campaign_id: str, call_session_data: CallSessionUpdate) -> Optional[CallSession]:
    """Update an existing CallSession."""
    doc_ref = db.collection('campaigns').document(str(campaign_id))
    doc = doc_ref.get()
    
    if not doc.exists:
        return None
    
    updates = {}
    updates['updated_at'] = datetime.now()
    
    if call_session_data.name is not None:
        updates['name'] = sanitize_input(call_session_data.name)
    if call_session_data.type is not None:
        campaign_type = call_session_data.type
        if hasattr(campaign_type, 'value'):
            campaign_type = campaign_type.value
        elif not isinstance(campaign_type, str):
            campaign_type = str(campaign_type)
        updates['type'] = campaign_type.lower()
    if call_session_data.status is not None:
        updates['status'] = call_session_data.status
    if call_session_data.goal is not None:
        updates['goal'] = sanitize_input(call_session_data.goal)
    if call_session_data.custom_agent_id is not None:
        updates['custom_agent_id'] = call_session_data.custom_agent_id
    if call_session_data.phone_number_id is not None:
        updates['phone_number_id'] = call_session_data.phone_number_id
        
    doc_ref.update(updates)
    
    # Return updated object
    return get_campaign(db, campaign_id)

def delete_campaign(db: firestore.Client, campaign_id: str) -> bool:
    """Delete a CallSession and all related records."""
    campaign_id = str(campaign_id)
    doc_ref = db.collection('campaigns').document(campaign_id)
    
    if not doc_ref.get().exists:
        return False
    
    try:
        # Delete related leads
        leads = db.collection('leads').where('campaign_id', '==', campaign_id).stream()
        batch = db.batch()
        count = 0
        for lead in leads:
            batch.delete(lead.reference)
            count += 1
            if count >= 400: # Firestore batch limit is 500
                batch.commit()
                batch = db.batch()
                count = 0
        if count > 0:
            batch.commit()
            
        # Delete related RAG documents
        # Note: RAG docs might be shared? Assuming cascade delete based on old model
        docs = db.collection('rag_documents').where('campaign_id', '==', campaign_id).stream()
        for doc in docs:
            doc.reference.delete()
            
        # Delete the CallSession
        doc_ref.delete()
        return True
    except Exception as e:
        logger.error(f"Error deleting CallSession {campaign_id}: {e}")
        return False

def start_campaign(db: firestore.Client, campaign_id: str) -> Optional[CallSession]:
    """Start a CallSession."""
    doc_ref = db.collection('campaigns').document(str(campaign_id))
    if not doc_ref.get().exists:
        return None
    
    doc_ref.update({"status": "active"})
    return get_campaign(db, campaign_id)

def stop_campaign(db: firestore.Client, campaign_id: str) -> Optional[CallSession]:
    """Stop a CallSession."""
    doc_ref = db.collection('campaigns').document(str(campaign_id))
    if not doc_ref.get().exists:
        return None
    
    doc_ref.update({"status": "paused"})
    return get_campaign(db, campaign_id)

async def process_lead_csv(file_path: str, campaign_id: str, db: firestore.Client) -> int:
    """Process a CSV file and create leads for a CallSession."""
    lead_count = 0
    campaign_id = str(campaign_id)
    
    try:
        with open(file_path, 'r', encoding='utf-8') as csvfile:
            try:
                sample = csvfile.read(1024)
                csvfile.seek(0)
                sniffer = csv.Sniffer()
                delimiter = sniffer.sniff(sample).delimiter
            except csv.Error:
                delimiter = ','
            
            reader = csv.DictReader(csvfile, delimiter=delimiter)
            required_columns = ['phone']
            
            if not all(col in reader.fieldnames for col in required_columns):
                raise ValueError(f"CSV must contain column: {', '.join(required_columns)}")
            
            batch = db.batch()
            batch_count = 0
            
            for row in reader:
                if not row.get('phone'):
                    continue
                    
                lead = Lead(
                    campaign_id=campaign_id,
                    name=sanitize_input(row.get('name', '')) if row.get('name') else '',
                    phone=sanitize_input(row['phone']),
                    email=sanitize_input(row.get('email', '')) if row.get('email') else None,
                    purpose=sanitize_input(row.get('purpose', '')) if row.get('purpose') else None
                )
                
                doc_ref = db.collection('leads').document()
                batch.set(doc_ref, lead.to_dict())
                batch_count += 1
                lead_count += 1
                
                if batch_count >= 400:
                    batch.commit()
                    batch = db.batch()
                    batch_count = 0
            
            if batch_count > 0:
                batch.commit()
                
        return lead_count
    except FileNotFoundError:
        raise ValueError("CSV file not found")
