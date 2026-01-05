"""
Check phone number configuration in Firestore
"""
import os
from dotenv import load_dotenv
from app.database.firestore import db
from google.cloud.firestore_v1.base_query import FieldFilter

load_dotenv()

def check_phone_config():
    print("=" * 80)
    print("PHONE NUMBER CONFIGURATION CHECK")
    print("=" * 80)
    
    # Check the phone number from .env
    twilio_number = os.getenv("TWILIO_NUMBER")
    print(f"\n📞 Twilio Number from .env: {twilio_number}")
    
    # Check virtual_phone_numbers collection
    print("\n🔍 Checking virtual_phone_numbers collection...")
    phone_ref = db.collection('virtual_phone_numbers')
    all_phones = list(phone_ref.stream())
    
    print(f"Found {len(all_phones)} phone numbers in database:")
    for doc in all_phones:
        data = doc.to_dict()
        print(f"\n  ID: {doc.id}")
        print(f"  Phone: {data.get('phone_number')}")
        print(f"  Active: {data.get('is_active')}")
        print(f"  Assigned Agents: {data.get('assigned_agents')}")
        print(f"  Provider: {data.get('provider')}")
    
    # Check for matching phone number
    print(f"\n🔎 Searching for {twilio_number}...")
    matching_docs = list(phone_ref.where(filter=FieldFilter('phone_number', '==', twilio_number)).stream())
    
    if matching_docs:
        print(f"✅ Found matching phone number!")
        for doc in matching_docs:
            data = doc.to_dict()
            print(f"\n  Configuration:")
            print(f"  - ID: {doc.id}")
            print(f"  - Active: {data.get('is_active')}")
            print(f"  - Assigned Agents: {data.get('assigned_agents')}")
    else:
        print(f"❌ No matching phone number found in database!")
        print(f"   This could be why calls are failing.")
    
    # Check campaigns
    print("\n📋 Checking campaigns...")
    campaigns_ref = db.collection('campaigns')
    inbound_campaigns = list(campaigns_ref.where(filter=FieldFilter('type', '==', 'inbound')).stream())
    active_inbound = [c for c in inbound_campaigns if c.to_dict().get('status') == 'active']
    
    print(f"Found {len(inbound_campaigns)} inbound campaigns ({len(active_inbound)} active)")
    for doc in active_inbound:
        data = doc.to_dict()
        print(f"\n  Campaign ID: {doc.id}")
        print(f"  Name: {data.get('name')}")
        print(f"  Status: {data.get('status')}")
        print(f"  Agent ID: {data.get('custom_agent_id')}")
        print(f"  Goal: {data.get('goal', '')[:100]}...")

if __name__ == "__main__":
    try:
        check_phone_config()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
