import sys
import os

# Ensure we can import from app
sys.path.append(os.getcwd())

from app.database.firestore import db

def final_verification():
    """Final verification that everything is set up correctly"""
    if db is None:
        print("CRITICAL: Firestore DB client is None. Check app/database/firestore.py initialization.")
        return
    
    print("=== FINAL VERIFICATION ===\n")
    
    # Check user
    try:
        users_ref = db.collection('users')
        user_docs = list(users_ref.stream())
        print(f"Users: {len(user_docs)}")
        for doc in user_docs:
            user_data = doc.to_dict()
            print(f"  - {user_data.get('username')} ({doc.id})")
    except Exception as e:
        print(f"Error checking users: {e}")
    
    # Check campaigns
    try:
        campaigns_ref = db.collection('campaigns')
        campaign_docs = list(campaigns_ref.stream())
        print(f"\nCampaigns: {len(campaign_docs)}")
        for doc in campaign_docs:
            campaign_data = doc.to_dict()
            print(f"  - {campaign_data.get('name')} ({doc.id})")
            print(f"    Status: {campaign_data.get('status')}")
            print(f"    Type: {campaign_data.get('type')}")
            print(f"    Assigned Agent: {campaign_data.get('custom_agent_id')}")
    except Exception as e:
        print(f"Error checking campaigns: {e}")
    
    # Check agents
    try:
        agents_ref = db.collection('custom_agents')
        agent_docs = list(agents_ref.stream())
        print(f"\nAgents: {len(agent_docs)}")
        for doc in agent_docs:
            agent_data = doc.to_dict()
            print(f"  - {agent_data.get('name')} ({doc.id})")
    except Exception as e:
        print(f"Error checking agents: {e}")
    
    # Check phone numbers
    try:
        phones_ref = db.collection('phone_numbers')
        phone_docs = list(phones_ref.stream())
        print(f"\nPhone Numbers: {len(phone_docs)}")
        for doc in phone_docs:
            phone_data = doc.to_dict()
            print(f"  - {phone_data.get('phone_number')} ({doc.id})")
            print(f"    Provider: {phone_data.get('provider')}")
            print(f"    Status: {'Active' if phone_data.get('is_active') else 'Inactive'}")
            print(f"    Assigned Agents: {phone_data.get('assigned_agents', [])}")
    except Exception as e:
        print(f"Error checking phone numbers: {e}")
    
    # Check RAG documents
    try:
        rag_ref = db.collection('rag_documents')
        rag_docs = list(rag_ref.stream())
        print(f"\nRAG Documents: {len(rag_docs)}")
    except Exception as e:
        print(f"Error checking RAG documents: {e}")
    
    print("\n=== SETUP STATUS ===")
    
    # Verify that we have everything needed for call routing
    if len(user_docs) > 0 and len(campaign_docs) > 0 and len(agent_docs) > 0 and len(phone_docs) > 0:
        campaign = campaign_docs[0].to_dict()
        phone = phone_docs[0].to_dict()
        agent_id = campaign.get('custom_agent_id')
        assigned_agents = phone.get('assigned_agents', [])
        
        if agent_id and agent_id in assigned_agents:
            print("✓ All required components are present")
            print("✓ Campaign has an assigned agent")
            print("✓ Phone number has the campaign's agent assigned")
            print("✓ Call routing should work correctly")
            print("\nWhen someone calls your Twilio number, the call should be routed to agent 'Aditi'")
        else:
            print("⚠ Setup incomplete:")
            if not agent_id:
                print("  - Campaign does not have an assigned agent")
            if agent_id not in assigned_agents:
                print("  - Phone number is not assigned to the campaign's agent")
    else:
        print("✗ Missing required components for call routing")
        if len(user_docs) == 0:
            print("  - No users found")
        if len(campaign_docs) == 0:
            print("  - No campaigns found")
        if len(agent_docs) == 0:
            print("  - No agents found")
        if len(phone_docs) == 0:
            print("  - No phone numbers found")

if __name__ == "__main__":
    final_verification()