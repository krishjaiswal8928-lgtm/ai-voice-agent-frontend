
import sys
import os

# Ensure we can import from app
sys.path.append(os.getcwd())

from app.database.firestore import db

def check_active_campaigns():
    print("--- Checking Active Inbound Campaigns ---")
    if db is None:
        print("CRITICAL: Firestore DB client is None. Check app/database/firestore.py initialization.")
        return

    campaigns_ref = db.collection('campaigns')
    try:
        # Check all active campaigns first, then filter in memory if needed
        # This avoids index issues if they exist
        docs = campaigns_ref.where(field_path='status', op_string='==', value='active').stream()
        
        found = False
        for doc in docs:
            data = doc.to_dict()
            c_type = data.get('type')
            
            if c_type == 'inbound':
                found = True
                print(f"Campaign ID: {doc.id}")
                print(f"  Name: {data.get('name')}")
                print(f"  Type: {c_type}")
                print(f"  Status: {data.get('status')}")
                print(f"  Assigned Agent ID: {data.get('custom_agent_id')}")
                print(f"  Goal: {data.get('goal')}")
                
                agent_id = data.get('custom_agent_id')
                if agent_id:
                    check_agent(agent_id)
                else:
                    print("  [!] No Agent Assigned to this Campaign")
                print("-" * 30)
            else:
                pass # Skip outbound for this check
        
        if not found:
            print("No active INBOUND campaigns found.")
            
    except Exception as e:
        print(f"Error querying campaigns: {e}")

def check_agent(agent_id):
    print(f"  --- Checking Agent {agent_id} ---")
    try:
        agent_ref = db.collection('custom_agents').document(str(agent_id))
        doc = agent_ref.get()
        if doc.exists:
            data = doc.to_dict()
            print(f"    Agent Name: {data.get('name')}")
            print(f"    Role: {data.get('role')}") 
            print(f"    System Prompt/Config: {str(data.get('config'))[:100]}...")
            print(f"    Personality: {data.get('personality')}")
        else:
            print(f"    [!] Agent document not found for ID: {agent_id}")
    except Exception as e:
        print(f"    Error querying agent: {e}")

if __name__ == "__main__":
    check_active_campaigns()
