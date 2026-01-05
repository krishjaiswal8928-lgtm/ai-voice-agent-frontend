"""
Script to check campaign and lead status for debugging outbound calls
"""
import os
import sys
from dotenv import load_dotenv

# Add the app directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

from app.database.firestore import db

def check_campaigns():
    """Check all campaigns and their leads"""
    print("=" * 80)
    print("CAMPAIGN STATUS CHECK")
    print("=" * 80)
    
    # Get all campaigns
    campaigns_ref = db.collection('campaigns')
    campaigns = campaigns_ref.stream()
    
    campaign_count = 0
    for campaign_doc in campaigns:
        campaign_count += 1
        campaign_data = campaign_doc.to_dict()
        campaign_id = campaign_doc.id
        
        print(f"\n📋 Campaign: {campaign_data.get('name', 'Unnamed')}")
        print(f"   ID: {campaign_id}")
        print(f"   Type: {campaign_data.get('type', 'N/A')}")
        print(f"   Status: {campaign_data.get('status', 'N/A')}")
        print(f"   Goal: {campaign_data.get('goal', 'N/A')}")
        print(f"   Created: {campaign_data.get('created_at', 'N/A')}")
        
        # Get leads for this campaign
        leads_ref = db.collection('leads')
        all_leads = leads_ref.where('campaign_id', '==', campaign_id).stream()
        
        lead_stats = {
            'new': 0,
            'in_progress': 0,
            'completed': 0,
            'failed': 0,
            'other': 0
        }
        
        total_leads = 0
        print(f"\n   📞 Leads:")
        for lead_doc in all_leads:
            total_leads += 1
            lead_data = lead_doc.to_dict()
            status = lead_data.get('status', 'unknown')
            
            if status in lead_stats:
                lead_stats[status] += 1
            else:
                lead_stats['other'] += 1
            
            # Print first 5 leads for debugging
            if total_leads <= 5:
                print(f"      - {lead_data.get('name', 'Unknown')}: {lead_data.get('phone', 'N/A')} (Status: {status})")
        
        if total_leads > 5:
            print(f"      ... and {total_leads - 5} more leads")
        
        print(f"\n   📊 Lead Statistics:")
        print(f"      Total: {total_leads}")
        print(f"      New: {lead_stats['new']}")
        print(f"      In Progress: {lead_stats['in_progress']}")
        print(f"      Completed: {lead_stats['completed']}")
        print(f"      Failed: {lead_stats['failed']}")
        if lead_stats['other'] > 0:
            print(f"      Other: {lead_stats['other']}")
        
        print("\n" + "-" * 80)
    
    if campaign_count == 0:
        print("\n❌ No campaigns found in database")
    else:
        print(f"\n✅ Total campaigns found: {campaign_count}")
    
    print("\n" + "=" * 80)
    print("TWILIO CONFIGURATION CHECK")
    print("=" * 80)
    
    twilio_sid = os.getenv("TWILIO_ACCOUNT_SID")
    twilio_token = os.getenv("TWILIO_AUTH_TOKEN")
    twilio_number = os.getenv("TWILIO_NUMBER")
    ngrok_domain = os.getenv("NGROK_DOMAIN")
    
    print(f"TWILIO_ACCOUNT_SID: {'✅ Set' if twilio_sid else '❌ Not set'}")
    print(f"TWILIO_AUTH_TOKEN: {'✅ Set' if twilio_token else '❌ Not set'}")
    print(f"TWILIO_NUMBER: {twilio_number if twilio_number else '❌ Not set'}")
    print(f"NGROK_DOMAIN: {ngrok_domain if ngrok_domain else '❌ Not set'}")
    
    if ngrok_domain:
        print(f"\n📡 Webhook URL: https://{ngrok_domain}/twilio/voice/webhook")
    
    print("=" * 80)

if __name__ == "__main__":
    try:
        check_campaigns()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
