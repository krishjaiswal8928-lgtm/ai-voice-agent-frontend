import sys
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Ensure we can import from app
sys.path.append(os.getcwd())

from app.database.firestore import db

def update_actual_phone_number():
    """Update with the actual Twilio phone number from env file"""
    if db is None:
        print("CRITICAL: Firestore DB client is None. Check app/database/firestore.py initialization.")
        return
    
    print("=== UPDATING WITH ACTUAL TWILIO PHONE NUMBER ===\n")
    
    # Find the phone number we created
    try:
        phones_ref = db.collection('phone_numbers')
        phone_docs = list(phones_ref.stream())
        
        if len(phone_docs) == 0:
            print("No phone numbers found in the system.")
            return
            
        # Get the first (and likely only) phone number
        phone_doc = phone_docs[0]
        phone_id = phone_doc.id
        phone_data = phone_doc.to_dict()
        
        print(f"Current phone number: {phone_data.get('phone_number')} (ID: {phone_id})")
        
        # Update with the actual Twilio number from your env file
        actual_twilio_number = os.getenv("TWILIO_PHONE_NUMBER")
        account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        
        # Update the phone number document
        update_data = {
            'phone_number': actual_twilio_number,
            'provider': 'twilio',
            'updated_at': datetime.now(),
            'credentials': {
                'account_sid': account_sid,
                'auth_token': auth_token,
                'twilio_number': actual_twilio_number
            }
        }
        
        phones_ref.document(phone_id).update(update_data)
        
        print(f"Updated phone number to: {actual_twilio_number}")
        print("Added Twilio credentials from environment file")
        print("Phone number is still assigned to agent 'Aditi'")
        
        # Verify the update
        updated_doc = phones_ref.document(phone_id).get()
        updated_data = updated_doc.to_dict()
        print(f"\nVerification:")
        print(f"  Phone Number: {updated_data.get('phone_number')}")
        print(f"  Provider: {updated_data.get('provider')}")
        print(f"  Assigned Agents: {updated_data.get('assigned_agents', [])}")
        print(f"  Credentials Added: {'Yes' if updated_data.get('credentials') else 'No'}")
        
    except Exception as e:
        print(f"Error updating phone number: {e}")

if __name__ == "__main__":
    update_actual_phone_number()