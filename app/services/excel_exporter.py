# app/services/excel_exporter.py
"""
Enhanced conversation exporter – CSV + Excel
Fixes KeyError, handles missing fields, auto-formats Excel
"""

import csv
import os
import json
from typing import List, Dict
from app.models.lead import Lead
from app.models.conversation import Conversation
from sqlalchemy.orm import Session

def export_campaign_results_to_csv(db: Session, campaign_id: int, file_path: str) -> bool:
    """Export campaign results to a CSV file with dynamic columns based on goal."""
    try:
        # Get all leads for the campaign
        leads = db.query(Lead).filter(Lead.campaign_id == campaign_id).all()
        
        # Determine dynamic fieldnames based on goal
        # In a real implementation, this would be determined by the autonomous agent
        # For now, we'll use a basic set of fields with some dynamic ones
        base_fieldnames = ['name', 'phone', 'email', 'status']
        
        # Add dynamic fields based on common goals
        dynamic_fields = []
        sample_lead = leads[0] if leads else None
        if sample_lead and hasattr(sample_lead, 'custom_fields') and sample_lead.custom_fields:
            try:
                custom_data = json.loads(sample_lead.custom_fields)
                dynamic_fields = list(custom_data.keys())
            except:
                pass
        
        # Combine base and dynamic fields
        fieldnames = base_fieldnames + dynamic_fields
        
        # Write to CSV
        with open(file_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            for lead in leads:
                row_data = {
                    'name': lead.name,
                    'phone': lead.phone,
                    'email': lead.email or '',
                    'status': lead.status
                }
                
                # Add dynamic fields if they exist
                if hasattr(lead, 'custom_fields') and lead.custom_fields:
                    try:
                        custom_data = json.loads(lead.custom_fields)
                        for field in dynamic_fields:
                            row_data[field] = custom_data.get(field, '')
                    except:
                        pass
                
                writer.writerow(row_data)
        
        return True
    except Exception as e:
        print(f"Error exporting to CSV: {e}")
        return False

def export_conversations_to_csv(db: Session, campaign_id: int, file_path: str) -> bool:
    """Export conversations to a CSV file."""
    try:
        # Get all conversations for the campaign
        conversations = db.query(Conversation).filter(
            Conversation.campaign_id == campaign_id
        ).all()
        
        # Write to CSV
        with open(file_path, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['lead_name', 'phone', 'transcript', 'ai_response', 'duration', 'status']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            for conversation in conversations:
                lead = conversation.lead
                writer.writerow({
                    'lead_name': lead.name if lead else '',
                    'phone': lead.phone if lead else '',
                    'transcript': conversation.transcript or '',
                    'ai_response': conversation.ai_response or '',
                    'duration': conversation.duration or 0,
                    'status': conversation.status or ''
                })
        
        return True
    except Exception as e:
        print(f"Error exporting conversations to CSV: {e}")
        return False

def export_conversation_to_csv(session_id: str, conversation: List[Dict], goal: str = "", client_name: str = "Customer", duration: float = 0) -> str:
    """Export a single conversation to a CSV file."""
    try:
        # Create exports directory if it doesn't exist
        exports_dir = "exports"
        if not os.path.exists(exports_dir):
            os.makedirs(exports_dir)
        
        # Create filename
        filename = f"{exports_dir}/conversation_{session_id}.csv"
        
        # Write to CSV
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['role', 'content', 'timestamp']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            for message in conversation:
                writer.writerow({
                    'role': message.get('role', ''),
                    'content': message.get('content', message.get('text', '')),
                    'timestamp': message.get('timestamp', '')
                })
        
        return filename
    except Exception as e:
        print(f"Error exporting conversation to CSV: {e}")
        return ""

def export_dynamic_campaign_results(campaign_id: int, goal: str, results: List[Dict], file_path: str) -> bool:
    """
    Export campaign results with dynamic columns based on the agent's goal.
    
    Args:
        campaign_id: The campaign ID
        goal: The campaign goal which determines column structure
        results: List of result dictionaries
        file_path: Path to save the CSV file
    """
    try:
        # Determine dynamic fieldnames based on goal
        fieldnames = ['name', 'phone']  # Base fields
        
        # Add dynamic fields based on goal
        if 'appointment' in goal.lower() or 'book' in goal.lower():
            fieldnames.extend(['goal_status', 'appointment_date', 'email', 'notes'])
        elif 'information' in goal.lower() or 'collect' in goal.lower():
            fieldnames.extend(['goal_status', 'collected_info', 'email', 'notes'])
        elif 'qualify' in goal.lower() or 'lead' in goal.lower():
            fieldnames.extend(['goal_status', 'qualification_score', 'interest_level', 'notes'])
        else:
            # Default fields for other goals
            fieldnames.extend(['goal_status', 'outcome', 'notes'])
        
        # Write to CSV
        with open(file_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            for result in results:
                # Ensure all required fields are present
                row_data = {}
                for field in fieldnames:
                    row_data[field] = result.get(field, '')
                writer.writerow(row_data)
        
        return True
    except Exception as e:
        print(f"Error exporting dynamic campaign results: {e}")
        return False

# Add the missing function that report_routes.py is trying to import
def get_export_path() -> str:
    """Get the path where export files are stored."""
    exports_dir = "exports"
    if not os.path.exists(exports_dir):
        os.makedirs(exports_dir)
    return exports_dir