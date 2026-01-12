import os
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from dotenv import load_dotenv

load_dotenv()

# Initialize Firebase
if not firebase_admin._apps:
    cred = credentials.ApplicationDefault()
    firebase_admin.initialize_app(cred, {
        'projectId': os.getenv('GOOGLE_CLOUD_PROJECT'),
    })

db = firestore.client()

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