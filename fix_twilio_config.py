import os
from dotenv import load_dotenv
from twilio.rest import Client

# Load environment variables
load_dotenv()

# Get Twilio credentials
account_sid = os.getenv("TWILIO_ACCOUNT_SID")
auth_token = os.getenv("TWILIO_AUTH_TOKEN")
twilio_number = os.getenv("TWILIO_NUMBER")

if not account_sid or not auth_token:
    print("❌ Twilio credentials not found in environment variables")
    exit(1)

# Initialize Twilio client
client = Client(account_sid, auth_token)

try:
    # Fetch the phone number configuration
    incoming_phone_numbers = client.incoming_phone_numbers.list(phone_number=twilio_number)
    
    if not incoming_phone_numbers:
        print(f"❌ Phone number {twilio_number} not found in your Twilio account")
        exit(1)
    
    phone_number = incoming_phone_numbers[0]
    print(f"📞 Phone Number: {phone_number.phone_number}")
    
    # Expected webhook URL
    ngrok_domain = os.getenv("NGROK_DOMAIN")
    expected_webhook = f"https://{ngrok_domain}/twilio/voice/webhook"
    expected_status_callback = f"https://{ngrok_domain}/twilio/status"
    
    print(f"🔧 Setting Voice URL to: {expected_webhook}")
    print(f"🔧 Setting Status Callback URL to: {expected_status_callback}")
    
    # Update the phone number configuration
    phone_number.update(
        voice_url=expected_webhook,
        voice_method="POST",
        status_callback=expected_status_callback,
        status_callback_method="POST"
    )
    
    print("✅ Twilio phone number configuration updated successfully!")
    
except Exception as e:
    print(f"❌ Error updating Twilio configuration: {e}")
    import traceback
    traceback.print_exc()