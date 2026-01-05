import sys
import os
from datetime import datetime

# Ensure we can import from app
sys.path.append(os.getcwd())

from app.database.firestore import db

def update_phone_config():
    """Update phone number with real Twilio configuration"""
    if db is None:
        print("CRITICAL: Firestore DB client is None. Check app/database/firestore.py initialization.")
        return
    
    print("=== UPDATING PHONE CONFIGURATION ===\n")
    
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
        
        print(f"Found phone number: {phone_data.get('phone_number')} (ID: {phone_id})")
        print(f"Currently assigned to agents: {phone_data.get('assigned_agents', [])}")
        
        # You need to update these values with your actual Twilio information
        print("\nPlease provide your Twilio configuration:")
        
        # In a real scenario, you would input these values
        # For now, I'll show what needs to be updated
        
        print("\nUPDATE INSTRUCTIONS:")
        print("1. Replace the placeholder phone number with your actual Twilio number")
        print("2. Add your Twilio Account SID and Auth Token")
        print("3. Make sure your Twilio number is configured to point to your webhook URL")
        
        print("\nExample of what your phone number configuration should look like:")
        print("""
{
    'user_id': 'dfAPmBRXXJYAgI9SFZf2',
    'phone_number': '+1_your_actual_twilio_number',  # UPDATE THIS
    'provider': 'twilio',
    'display_name': 'Main Business Line',
    'is_active': True,
    'assigned_agents': ['SPH5LutOqgiGQDEndx9x'],
    'credentials': {
        'account_sid': 'your_twilio_account_sid',     # UPDATE THIS
        'auth_token': 'your_twilio_auth_token',       # UPDATE THIS
        'twilio_number': '+1_your_actual_twilio_number'  # UPDATE THIS
    },
    'created_at': datetime_object,
    'updated_at': current_datetime
}
        """)
        
        print("\nTo update through the UI:")
        print("1. Go to the Phone Numbers section")
        print("2. Edit the phone number entry")
        print("3. Enter your actual Twilio phone number")
        print("4. Enter your Twilio credentials")
        print("5. Save the changes")
        
    except Exception as e:
        print(f"Error updating phone configuration: {e}")

if __name__ == "__main__":
    update_phone_config()