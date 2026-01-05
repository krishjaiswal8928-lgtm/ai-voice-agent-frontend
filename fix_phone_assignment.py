import sys
import os
from datetime import datetime

# Ensure we can import from app
sys.path.append(os.getcwd())

from app.database.firestore import db

def fix_phone_assignment():
    """Fix the phone number assignment to point to the correct agent"""
    if db is None:
        print("CRITICAL: Firestore DB client is None. Check app/database/firestore.py initialization.")
        return
    
    print("=== FIXING PHONE NUMBER ASSIGNMENT ===\n")
    
    # First, let's find the Aditi agent to get her ID
    try:
        agents_ref = db.collection('custom_agents')
        agent_docs = list(agents_ref.stream())
        
        aditi_agent = None
        aditi_agent_id = None
        
        for doc in agent_docs:
            agent_data = doc.to_dict()
            if agent_data.get('name') == 'Aditi':
                aditi_agent = agent_data
                aditi_agent_id = doc.id
                break
                
        if not aditi_agent:
            print("ERROR: Could not find agent named 'Aditi'")
            return
            
        print(f"Found Agent 'Aditi' with ID: {aditi_agent_id}")
        
    except Exception as e:
        print(f"Error finding agent: {e}")
        return
    
    # Now, let's find the phone number with the Twilio number and fix its assignment
    try:
        # Look in the virtual_phone_numbers collection as shown in your database
        phones_ref = db.collection('virtual_phone_numbers')
        phone_docs = list(phones_ref.stream())
        
        target_phone = None
        target_phone_id = None
        target_phone_data = None
        
        # Look for the phone number +16692313371
        for doc in phone_docs:
            phone_data = doc.to_dict()
            if phone_data.get('phone_number') == '+16692313371':
                target_phone = doc
                target_phone_id = doc.id
                target_phone_data = phone_data
                break
                
        if not target_phone:
            print("ERROR: Could not find phone number +16692313371")
            return
            
        print(f"Found phone number: {target_phone_data.get('phone_number')} (ID: {target_phone_id})")
        print(f"Currently assigned to agents: {target_phone_data.get('assigned_agents', [])}")
        
        # Check if it's assigned to the old Rahul agent
        old_agent_id = "7pcQ52j2zbSaP1ENuuEM"
        current_assigned_agents = target_phone_data.get('assigned_agents', [])
        
        if old_agent_id in current_assigned_agents:
            print("Phone number is currently assigned to OLD agent (Rahul)")
            
            # Update the assignment to point to Aditi instead
            updated_assigned_agents = [aditi_agent_id]  # Replace with just Aditi
            
            update_data = {
                'assigned_agents': updated_assigned_agents,
                'updated_at': datetime.now()
            }
            
            phones_ref.document(target_phone_id).update(update_data)
            
            print(f"Updated phone number assignment from Rahul ({old_agent_id}) to Aditi ({aditi_agent_id})")
            
            # Verify the update
            updated_doc = phones_ref.document(target_phone_id).get()
            updated_data = updated_doc.to_dict()
            print(f"Verification - Now assigned to agents: {updated_data.get('assigned_agents', [])}")
            
        elif aditi_agent_id in current_assigned_agents:
            print("Phone number is already correctly assigned to Aditi")
        else:
            print("Phone number has no agent assignments - assigning to Aditi")
            update_data = {
                'assigned_agents': [aditi_agent_id],
                'updated_at': datetime.now()
            }
            
            phones_ref.document(target_phone_id).update(update_data)
            print(f"Assigned phone number to Aditi ({aditi_agent_id})")
            
    except Exception as e:
        print(f"Error updating phone assignment: {e}")
        return
    
    print("\n=== VERIFICATION COMPLETE ===")
    print("Phone number +16692313371 should now route calls to agent 'Aditi'")

if __name__ == "__main__":
    fix_phone_assignment()