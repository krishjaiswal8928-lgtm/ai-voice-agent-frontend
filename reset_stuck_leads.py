from app.database.firestore import db
from google.cloud import firestore

def reset_stuck_leads(campaign_id):
    print(f"Resetting stuck leads for campaign: {campaign_id}")
    leads_ref = db.collection('leads')
    docs = leads_ref.where('campaign_id', '==', campaign_id).stream()
    
    reset_count = 0
    for doc in docs:
        data = doc.to_dict()
        status = data.get('status')
        
        if status in ['ringing', 'in_progress', 'queued']:
            print(f"Resetting lead {doc.id} from '{status}' to 'new'")
            doc.reference.update({
                'status': 'new',
                'call_sid': firestore.DELETE_FIELD, # Clear old call SID
                'notes': 'Reset from stuck state via script'
            })
            reset_count += 1
            
    print(f"\nReset {reset_count} leads to 'new'.")

if __name__ == "__main__":
    campaign_id = 'aPQt5Zmy5PLqBJgPfjP8'
    reset_stuck_leads(campaign_id)
