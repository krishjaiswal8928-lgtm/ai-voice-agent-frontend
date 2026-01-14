
import os
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv
from cryptography.fernet import Fernet
import json

load_dotenv()

def decrypt_creds(encrypted_data):
    if isinstance(encrypted_data, dict):
        return encrypted_data
    
    key = os.getenv("ENCRYPTION_KEY")
    if not key:
        print("   [!] NO ENCRYPTION_KEY found in env!")
        return {}
        
    try:
        cipher = Fernet(key.encode())
        json_str = cipher.decrypt(encrypted_data.encode()).decode()
        return json.loads(json_str)
    except Exception as e:
        print(f"   [!] Decryption Invalid: {e}")
        return {}

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
        
        raw_creds = data.get('credentials')
        
        if raw_creds:
            print(f"   [+] Raw Credentials Found (Type: {type(raw_creds).__name__})")
            
            # Decrypt if string
            creds = decrypt_creds(raw_creds) if isinstance(raw_creds, str) else raw_creds
            
            if creds:
                stored_sid = creds.get('account_sid')
                print(f"   [ID] Stored Account SID: {stored_sid}")
                
                if stored_sid == env_sid:
                    print("   [!]  WARNING: Stored SID matches Default ENV SID.") 
                    print("        This means imports used the Default Account credentials.")
                    print("        Twilio will reject the call because Default Account doesn't own this number.")
                else:
                    print("   [OK] Stored SID is DIFFERENT from Default.")
                    print("        (Multi-account setup looks correct data-wise)")
            else:
                print("   [X] Failed to decrypt or parse credentials.")
        else:
            print("   [X] Credentials Found: NO (Empty or None)")
            
    if not found:
        print("[X] Phone number not found in database.")
        
    print("-" * 50 + "\n")

if __name__ == "__main__":
    inspect_credentials()
