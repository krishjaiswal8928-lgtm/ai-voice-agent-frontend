import sys
import os

# Ensure we can import from app
sys.path.append(os.getcwd())

from app.database.firestore import db

def diagnose_setup():
    """Diagnose the current setup to understand why calls go to default agent"""
    if db is None:
        print("CRITICAL: Firestore DB client is None. Check app/database/firestore.py initialization.")
        return
    
    print("=== DIAGNOSING CURRENT SETUP ===\n")
    
    # Check users
    print("1. CHECKING USERS:")
    try:
        users_ref = db.collection('users')
        user_docs = list(users_ref.stream())
        print(f"   Total users: {len(user_docs)}")
        for doc in user_docs:
            user_data = doc.to_dict()
            print(f"   - User ID: {doc.id}, Username: {user_data.get('username')}, Email: {user_data.get('email')}")
    except Exception as e:
        print(f"   Error checking users: {e}")
    
    print("\n2. CHECKING CAMPAIGNS:")
    try:
        campaigns_ref = db.collection('campaigns')
        campaign_docs = list(campaigns_ref.stream())
        print(f"   Total campaigns: {len(campaign_docs)}")
        for doc in campaign_docs:
            campaign_data = doc.to_dict()
            print(f"   - Campaign ID: {doc.id}")
            print(f"     Name: {campaign_data.get('name')}")
            print(f"     Type: {campaign_data.get('type')}")
            print(f"     Status: {campaign_data.get('status')}")
            print(f"     User ID: {campaign_data.get('user_id')}")
            print(f"     Assigned Agent ID: {campaign_data.get('custom_agent_id')}")
            print(f"     Goal: {campaign_data.get('goal')}")
    except Exception as e:
        print(f"   Error checking campaigns: {e}")
    
    print("\n3. CHECKING CUSTOM AGENTS:")
    try:
        agents_ref = db.collection('custom_agents')
        agent_docs = list(agents_ref.stream())
        print(f"   Total agents: {len(agent_docs)}")
        for doc in agent_docs:
            agent_data = doc.to_dict()
            print(f"   - Agent ID: {doc.id}")
            print(f"     Name: {agent_data.get('name')}")
            print(f"     User ID: {agent_data.get('user_id')}")
            print(f"     Personality: {agent_data.get('personality')}")
            print(f"     Role: {agent_data.get('role')}")
    except Exception as e:
        print(f"   Error checking agents: {e}")
    
    print("\n4. CHECKING PHONE NUMBERS:")
    try:
        phones_ref = db.collection('phone_numbers')
        phone_docs = list(phones_ref.stream())
        print(f"   Total phone numbers: {len(phone_docs)}")
        for doc in phone_docs:
            phone_data = doc.to_dict()
            print(f"   - Phone ID: {doc.id}")
            print(f"     Number: {phone_data.get('phone_number')}")
            print(f"     Provider: {phone_data.get('provider')}")
            print(f"     User ID: {phone_data.get('user_id')}")
            print(f"     Status: {'Active' if phone_data.get('is_active') else 'Inactive'}")
            print(f"     Assigned Agents: {phone_data.get('assigned_agents', [])}")
    except Exception as e:
        print(f"   Error checking phone numbers: {e}")
    
    print("\n5. CHECKING RAG DOCUMENTS:")
    try:
        rag_ref = db.collection('rag_documents')
        rag_docs = list(rag_ref.stream())
        print(f"   Total RAG documents: {len(rag_docs)}")
        for doc in rag_docs:
            rag_data = doc.to_dict()
            print(f"   - Document ID: {doc.id}")
            print(f"     Filename: {rag_data.get('filename')}")
            print(f"     User ID: {rag_data.get('user_id')}")
            print(f"     Campaign ID: {rag_data.get('campaign_id')}")
            print(f"     Agent ID: {rag_data.get('agent_id')}")
    except Exception as e:
        print(f"   Error checking RAG documents: {e}")
    
    print("\n=== DIAGNOSIS COMPLETE ===")

if __name__ == "__main__":
    diagnose_setup()