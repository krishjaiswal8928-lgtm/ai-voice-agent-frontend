
import os
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

load_dotenv()

def inspect_credentials():
    # Initialize Firestore (if not already)
    if not firebase_admin._apps:
        cred = credentials.Certificate("serviceAccountKey.json")
        firebase_admin.initialize_app(cred)
    
    db = firestore.client()
    
    target_number = "+18578474565" # The failing number
    print(f"\n[?] Inspecting Phone Number: {target_number}")
    print("-" * 50)
    
    docs = db.collection('virtual_phone_numbers').where('phone_number', '==', target_number).stream()
    found = False
    
    env_sid = os.getenv("TWILIO_ACCOUNT_SID")
    print(f"[E] Default ENV Account SID: {env_sid}")
    
    for doc in docs:
        found = True
        data = doc.to_dict()
        print(f"[OK] Found Document ID: {doc.id}")
        print(f"   Provider: {data.get('provider')}")
        
        creds = data.get('credentials', {})
        if creds:
            print(f"   [+] Credentials Found: YES")
            stored_sid = creds.get('account_sid')
            print(f"   [ID] Stored Account SID: {stored_sid}")
            
            if stored_sid == env_sid:
                print("   [!]  WARNING: Stored SID matches Default ENV SID (Might be importing default creds?)")
            else:
                print("   [OK] Stored SID is DIFFERENT from Default (Multi-account setup looks correct data-wise)")
        else:
            print("   [X] Credentials Found: NO (Empty or None)")
            
    if not found:
        print("[X] Phone number not found in database.")
        
    print("-" * 50 + "\n")

if __name__ == "__main__":
    inspect_credentials()
