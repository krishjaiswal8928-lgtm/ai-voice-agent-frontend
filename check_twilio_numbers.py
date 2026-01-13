
import os
from twilio.rest import Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def check_twilio_numbers():
    account_sid = os.getenv('TWILIO_ACCOUNT_SID')
    auth_token = os.getenv('TWILIO_AUTH_TOKEN')

    if not account_sid or not auth_token:
        print("[X] Error: TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN not found in environment.")
        return

    try:
        client = Client(account_sid, auth_token)
        print(f"[OK] Authenticated with Twilio Account: {account_sid}")

        print("\n[+] Your Purchased Twilio Numbers (IncomingPhoneNumbers):")
        print("-" * 50)
        incoming = client.incoming_phone_numbers.list(limit=20)
        if incoming:
            for number in incoming:
                print(f"  - {number.phone_number} ({number.friendly_name})")
        else:
            print("  (No purchased numbers found)")

        print("\n[+] Verified Caller IDs (OutgoingCallerIds):")
        print("-" * 50)
        verified = client.outgoing_caller_ids.list(limit=20)
        if verified:
            for number in verified:
                print(f"  - {number.phone_number} ({number.friendly_name})")
        else:
            print("  (No verified caller IDs found)")

        print("\n" + "=" * 50)
        print("NOTE: You MUST use one of the numbers listed above as the Agent's phone number.")
        print("Using any other number will cause error 21210 ('not verified').")
        print("=" * 50 + "\n")

    except Exception as e:
        print(f"[X] Error connecting to Twilio: {e}")

if __name__ == "__main__":
    check_twilio_numbers()
