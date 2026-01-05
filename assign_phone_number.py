import sys
import os
from datetime import datetime

# Ensure we can import from app
sys.path.append(os.getcwd())

from app.database.firestore import db

def assign_phone_number():
    """Assign a phone number to the Aditi agent"""
    if db is None:
        print("CRITICAL: Firestore DB client is None. Check app/database/firestore.py initialization.")
        return
    
    print("=== ASSIGNING PHONE NUMBER TO AGENT ===\n")
    
    # First, let's find the Aditi agent
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
        print(f"Agent User ID: {aditi_agent.get('user_id')}")
        
    except Exception as e:
        print(f"Error finding agent: {e}")
        return
    
    # Now let's check if there are any phone numbers
    try:
        phones_ref = db.collection('phone_numbers')
        phone_docs = list(phones_ref.stream())
        print(f"\nCurrent phone numbers in system: {len(phone_docs)}")
        
        # If there are no phone numbers, we need to create one
        if len(phone_docs) == 0:
            print("\nNo phone numbers found. Creating a new phone number entry...")
            
            # Get user ID from the agent
            user_id = aditi_agent.get('user_id')
            
            # Create a new phone number document
            new_phone_data = {
                'user_id': user_id,
                'phone_number': '+1234567890',  # Placeholder - you'll need to update this
                'provider': 'twilio',  # Assuming Twilio
                'display_name': 'Main Business Line',
                'is_active': True,
                'assigned_agents': [aditi_agent_id],  # Assign to Aditi
                'credentials': {},  # Empty credentials - you'll need to fill these
                'created_at': datetime.now(),
                'updated_at': datetime.now()
            }
            
            # Add the new phone number to the database
            phone_ref = phones_ref.document()
            phone_ref.set(new_phone_data)
            
            print(f"Created new phone number with ID: {phone_ref.id}")
            print("Phone number has been assigned to agent 'Aditi'")
            
        else:
            # If there are phone numbers, let's assign the first one to Aditi
            first_phone = phone_docs[0]
            phone_data = first_phone.to_dict()
            phone_id = first_phone.id
            
            print(f"\nFound existing phone number: {phone_data.get('phone_number')} (ID: {phone_id})")
            
            # Update the phone number to assign it to Aditi
            assigned_agents = phone_data.get('assigned_agents', [])
            if aditi_agent_id not in assigned_agents:
                assigned_agents.append(aditi_agent_id)
                phones_ref.document(phone_id).update({'assigned_agents': assigned_agents})
                print(f"Assigned phone number to agent 'Aditi'")
            else:
                print(f"Phone number is already assigned to agent 'Aditi'")
                
    except Exception as e:
        print(f"Error with phone numbers: {e}")
        return
    
    # Verify the assignment
    print("\n=== VERIFICATION ===")
    try:
        phones_ref = db.collection('phone_numbers')
        phone_docs = list(phones_ref.stream())
        
        for doc in phone_docs:
            phone_data = doc.to_dict()
            assigned_agents = phone_data.get('assigned_agents', [])
            print(f"Phone: {phone_data.get('phone_number')} (ID: {doc.id})")
            print(f"  Assigned Agents: {assigned_agents}")
            if aditi_agent_id in assigned_agents:
                print(f"  ✓ Correctly assigned to Aditi (ID: {aditi_agent_id})")
            else:
                print(f"  ✗ Not assigned to Aditi")
                
    except Exception as e:
        print(f"Error verifying assignment: {e}")

if __name__ == "__main__":
    assign_phone_number()