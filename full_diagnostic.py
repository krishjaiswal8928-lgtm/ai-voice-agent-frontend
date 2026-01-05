"""
Complete diagnostic: Check all user data for krishjaiswal919833@gmail.com
"""

import os
import sys
from dotenv import load_dotenv

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
load_dotenv()

from app.database.firestore import get_firestore_client
from google.cloud.firestore_v1.base_query import FieldFilter

def full_diagnostic():
    print("\n" + "=" * 80)
    print("🔍 COMPLETE DIAGNOSTIC FOR krishjaiswal919833@gmail.com")
    print("=" * 80 + "\n")
    
    db = get_firestore_client()
    user_email = "krishjaiswal919833@gmail.com"
    
    # Find user
    users = list(db.collection('users').where(filter=FieldFilter('email', '==', user_email)).stream())
    if not users:
        print(f"❌ User not found")
        return
    
    user_id = users[0].id
    print(f"✅ User ID: {user_id}\n")
    
    # Check integrations
    print("📡 INTEGRATIONS:")
    integrations = list(db.collection('integrations').where(filter=FieldFilter('user_id', '==', user_id)).stream())
    for int_doc in integrations:
        data = int_doc.to_dict()
        print(f"  ID: {int_doc.id}")
        print(f"  Provider: {data.get('provider')}")
        print(f"  Status: {data.get('status')}")
        print(f"  Connected: {data.get('connected_at')}")
        print(f"  Credentials (encrypted): {str(data.get('credentials'))[:50]}...")
        print()
    
    if not integrations:
        print("  ❌ NO INTEGRATIONS FOUND!")
        print("  → User needs to connect via /integrations page\n")
        return
    
    # Check phone numbers
    print("📱 PHONE NUMBERS:")
    phones = list(db.collection('virtual_phone_numbers').where(filter=FieldFilter('user_id', '==', user_id)).stream())
    for phone_doc in phones:
        data = phone_doc.to_dict()
        print(f"  Number: {data.get('phone_number')}")
        print(f"  Active: {data.get('is_active')}")
        print(f"  Agents: {data.get('assigned_agents', [])}")
        print(f"  Integration ID: {data.get('integration_id', 'N/A')}")
        print()
    
    if not phones:
        print("  ❌ NO PHONE NUMBERS IMPORTED!")
        print("  → User needs to import via /integrations/twilio\n")
    
    # Check campaigns
    print("📋 CAMPAIGNS:")
    campaigns = list(db.collection('campaigns').where(filter=FieldFilter('user_id', '==', user_id)).stream())
    active_inbound = []
    for camp_doc in campaigns:
        data = camp_doc.to_dict()
        is_active_inbound = data.get('type') == 'inbound' and data.get('status') == 'active'
        if is_active_inbound:
            active_inbound.append(camp_doc)
        
        print(f"  Name: {data.get('name')}")
        print(f"  Type: {data.get('type')}")
        print(f"  Status: {data.get('status')}")
        print(f"  Agent: {data.get('custom_agent_id', 'None')}")
        if is_active_inbound:
            print(f"  ✅ ACTIVE INBOUND")
        print()
    
    if not active_inbound:
        print("  ❌ NO ACTIVE INBOUND CAMPAIGNS!")
        print("  → Create/activate an inbound campaign\n")
    
    # Summary
    print("=" * 80)
    print("📊 SUMMARY:")
    print(f"  Integrations: {len(integrations)}")
    print(f"  Phone Numbers: {len(phones)}")
    print(f"  Active Inbound Campaigns: {len(active_inbound)}")
    
    if integrations and phones and active_inbound:
        print("\n  ✅ ALL REQUIREMENTS MET - Should work!")
        print("\n  🔧 NEXT: Run webhook fix script")
    else:
        print("\n  ❌ MISSING REQUIREMENTS")
        if not integrations:
            print("     1. Connect Twilio integration")
        if not phones:
            print("     2. Import phone number")
        if not active_inbound:
            print("     3. Create/activate inbound campaign")
    
    print("=" * 80 + "\n")

if __name__ == "__main__":
    full_diagnostic()
