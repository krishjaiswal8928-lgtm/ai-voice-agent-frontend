"""
Quick Script to Assign Phone Number to Agent
Run this script to automatically assign your Twilio phone number to your agent
"""

import os
import sys
from google.cloud import firestore

# Initialize Firestore
db = firestore.Client()

def assign_phone_to_agent():
    """Assign phone number to agent"""
    
    print("🔍 Finding your phone numbers...")
    
    # Get all phone numbers
    phone_numbers = list(db.collection('virtual_phone_numbers').stream())
    
    if not phone_numbers:
        print("❌ No phone numbers found!")
        print("   Please import a phone number from Twilio first.")
        return
    
    print(f"\n📱 Found {len(phone_numbers)} phone number(s):\n")
    for idx, phone_doc in enumerate(phone_numbers, 1):
        phone_data = phone_doc.to_dict()
        print(f"{idx}. {phone_data.get('phone_number')} (ID: {phone_doc.id})")
    
    # Select phone number
    if len(phone_numbers) == 1:
        selected_phone = phone_numbers[0]
        print(f"\n✅ Auto-selected: {selected_phone.to_dict().get('phone_number')}")
    else:
        choice = input(f"\nSelect phone number (1-{len(phone_numbers)}): ")
        try:
            selected_phone = phone_numbers[int(choice) - 1]
        except (ValueError, IndexError):
            print("❌ Invalid selection!")
            return
    
    phone_id = selected_phone.id
    phone_number = selected_phone.to_dict().get('phone_number')
    
    print(f"\n🔍 Finding your agents...")
    
    # Get all agents
    agents = list(db.collection('custom_agents').stream())
    
    if not agents:
        print("❌ No agents found!")
        print("   Please create an agent first.")
        return
    
    print(f"\n🤖 Found {len(agents)} agent(s):\n")
    for idx, agent_doc in enumerate(agents, 1):
        agent_data = agent_doc.to_dict()
        current_phone = agent_data.get('phone_number_id', 'None')
        print(f"{idx}. {agent_data.get('name')} (Phone: {current_phone})")
    
    # Select agent
    if len(agents) == 1:
        selected_agent = agents[0]
        print(f"\n✅ Auto-selected: {selected_agent.to_dict().get('name')}")
    else:
        choice = input(f"\nSelect agent (1-{len(agents)}): ")
        try:
            selected_agent = agents[int(choice) - 1]
        except (ValueError, IndexError):
            print("❌ Invalid selection!")
            return
    
    agent_id = selected_agent.id
    agent_name = selected_agent.to_dict().get('name')
    
    # Confirm
    print(f"\n📋 Assignment Summary:")
    print(f"   Agent: {agent_name}")
    print(f"   Phone: {phone_number}")
    print(f"   Phone ID: {phone_id}")
    
    confirm = input("\n✅ Proceed with assignment? (y/n): ")
    if confirm.lower() != 'y':
        print("❌ Cancelled!")
        return
    
    # Update agent
    try:
        db.collection('custom_agents').document(agent_id).update({
            'phone_number_id': phone_id
        })
        print(f"\n🎉 SUCCESS!")
        print(f"   Phone {phone_number} assigned to agent {agent_name}")
        print(f"\n✅ You can now start your outbound campaign!")
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    print("=" * 60)
    print("  📞 Phone Number Assignment Tool")
    print("=" * 60)
    print()
    
    try:
        assign_phone_to_agent()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nMake sure:")
        print("1. GOOGLE_APPLICATION_CREDENTIALS is set")
        print("2. Firebase credentials are valid")
    
    print("\n" + "=" * 60)
