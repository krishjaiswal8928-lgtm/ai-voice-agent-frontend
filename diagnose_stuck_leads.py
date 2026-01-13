from app.database.firestore import db

def check_campaign_leads(campaign_id):
    print(f"Checking leads for campaign: {campaign_id}")
    leads_ref = db.collection('leads')
    docs = leads_ref.where('campaign_id', '==', campaign_id).stream()
    
    stuck_count = 0
    for doc in docs:
        data = doc.to_dict()
        status = data.get('status')
        name = data.get('name')
        
        # Only print active/stuck leads to avoid spam
        if status in ['ringing', 'in_progress', 'queued', 'new']:
             print(f"Lead {doc.id}: {name} - Status: {status}")
        
        if status in ['ringing', 'in_progress', 'queued']:
            stuck_count += 1
            
    print(f"\nFound {stuck_count} stuck leads (ringing/in_progress/queued).")

if __name__ == "__main__":
    campaign_id = 'aPQt5Zmy5PLqBJgPfjP8'
    check_campaign_leads(campaign_id)
