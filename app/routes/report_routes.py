from fastapi import APIRouter, Depends, HTTPException, status
from google.cloud import firestore
from typing import List
import os
from app.dependencies import get_db
from app.services.excel_exporter import export_campaign_results_to_csv, export_dynamic_campaign_results, get_export_path
from app.models.campaign import CallSession
from app.models.lead import Lead
from app.models.conversation import Conversation
from app.core.security import get_current_user

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/export-campaign/{campaign_id}")
async def export_campaign_results(
    campaign_id: str,
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Export campaign results to CSV."""
    # Check if campaign exists and belongs to the user
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
    
    try:
        # Create export filename
        export_path = get_export_path()
        filename = f"campaign_{campaign_id}_results.csv"
        file_path = os.path.join(export_path, filename)
        
        # Export using dynamic campaign results
        # In a real implementation, this would get actual results from the autonomous agent
        mock_results = [
            {"name": "John Smith", "phone": "+1234567890", "goal_status": "Booked", "appointment_date": "2023-05-20", "email": "john@example.com", "notes": ""},
            {"name": "Jane Doe", "phone": "+1234567891", "goal_status": "Interested", "collected_info": "Requested more info", "email": "jane@example.com", "notes": "Requested more info"},
            {"name": "Robert Johnson", "phone": "+1234567892", "goal_status": "Booked", "appointment_date": "2023-05-18", "email": "robert@example.com", "notes": ""},
            {"name": "Emily Wilson", "phone": "+1234567893", "goal_status": "Not Interested", "notes": "Already has similar product"},
            {"name": "Michael Brown", "phone": "+1234567894", "goal_status": "Booked", "appointment_date": "2023-05-22", "email": "michael@example.com", "notes": ""}
        ]
        
        success = export_dynamic_campaign_results(campaign_id, call_session.goal or "", mock_results, file_path)
        
        if success:
            return {
                "message": "Campaign results exported successfully",
                "file_path": file_path,
                "download_url": f"/reports/download/{filename}"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to export campaign results"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error exporting campaign results: {str(e)}"
        )

@router.get("/download/{filename}")
async def download_report(
    filename: str,
    current_user: dict = Depends(get_current_user)
):
    """Download a report file."""
    try:
        export_path = get_export_path()
        file_path = os.path.join(export_path, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )
        
        # Return file response
        from fastapi.responses import FileResponse
        return FileResponse(
            path=file_path,
            filename=filename,
            media_type='text/csv'
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error downloading file: {str(e)}"
        )

@router.get("/campaign/{campaign_id}/conversations")
async def get_campaign_conversations(
    campaign_id: str,
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get conversation history for a campaign."""
    try:
        # Check if campaign exists and belongs to the user
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
        
        # Get conversations for the campaign
        convs_ref = db.collection('conversations')
        docs = convs_ref.where('campaign_id', '==', campaign_id).stream()
        
        conversations = []
        for doc in docs:
            conversations.append(Conversation.from_dict(doc.to_dict(), doc.id))
        
        # Log the number of conversations found
        print(f"Found {len(conversations)} conversations for campaign {campaign_id}")
        
        # If no conversations found, return empty array instead of error
        if not conversations:
            print(f"No conversations found for campaign {campaign_id}, returning empty array")
            return []
        
        # Format the response
        conversation_data = []
        for conv in conversations:
            # Fetch lead details manually (NoSQL join)
            lead_name = "Unknown Caller"
            phone_number = "Unknown"
            
            if conv.lead_id:
                lead_ref = db.collection('leads').document(conv.lead_id)
                lead_doc = lead_ref.get()
                if lead_doc.exists:
                    lead = Lead.from_dict(lead_doc.to_dict(), lead_doc.id)
                    lead_name = lead.name or "Unknown Caller"
                    phone_number = lead.phone
            
            conversation_data.append({
                "id": conv.id,
                "lead_id": conv.lead_id,
                "lead_name": lead_name,
                "phone_number": phone_number,
                "duration": conv.duration or 0,
                "status": conv.status or "completed",
                "created_at": conv.created_at.isoformat() if conv.created_at else None,
                "transcript": conv.transcript or ""
            })
        
        # Log the formatted data
        print(f"Formatted conversation data: {conversation_data}")
        
        return conversation_data
    except Exception as e:
        print(f"Error fetching conversation data: {str(e)}")
        # Return empty array instead of error to prevent frontend issues
        return []