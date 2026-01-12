import os
import sys

# Add current directory to path so we can import app modules
sys.path.append(os.getcwd())

from app.database.firestore import db
from google.cloud import firestore

def reset_leads(campaign_id):
    print(f"Resetting failed leads for campaign {campaign_id}...")
    
    leads_ref = db.collection('leads')
    # Use simple where for now to avoid import issues if FieldFilter not avail globally here
    docs = leads_ref.where('campaign_id', '==', campaign_id).where('status', '==', 'failed').stream()
    
    count = 0
    for doc in docs:
        print(f"Resetting lead {doc.id}...")
        doc.reference.update({
            'status': 'new',
            'notes': firestore.DELETE_FIELD,
            'call_sid': firestore.DELETE_FIELD
        })
        count += 1
        
    print(f"Reset {count} leads to 'new' status.")

if __name__ == "__main__":
    campaign_id = "Piv0CGJ5KGFHlrtD3LIv"  # Hardcoded from logs
    reset_leads(campaign_id)