
import os
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv
import json
import sys

# Add current directory to path so we can import app modules
sys.path.append(os.getcwd())

# Mock imports/env if needed or just load dotenv
load_dotenv()

def inspect_credentials():
    # Initialize Firestore
    if not firebase_admin._apps:
        cred = credentials.Certificate("serviceAccountKey.json")
        firebase_admin.initialize_app(cred)
    
    db = firestore.client()
    
    # Import EncryptionManager AFTER firebase init in case it needs it? 
    # Actually EncryptionManager doesn't autodepend on init, just needs db pass
    try:
        from app.core.security import EncryptionManager
        print("[OK] Imported EncryptionManager")
    except ImportError as e:
        print(f"[X] Failed to import EncryptionManager: {e}")
        return

    print(f"\n[?] Listing ALL Phone Numbers in DB:")
    print("-" * 60)
    
    docs = db.collection('virtual_phone_numbers').stream()
    found = False
    
    env_sid = os.getenv("TWILIO_ACCOUNT_SID")
    print(f"[E] Default ENV Account SID: {env_sid}")
    
    for doc in docs:
        found = True
        data = doc.to_dict()
        p_num = data.get('phone_number')
        print(f"[OK] Found Doc ID: {doc.id} | Phone: {p_num}")
        print(f"   Provider: {data.get('provider')}")
        
        raw_creds = data.get('credentials')
        creds = {}
        
        if raw_creds:
            print(f"   [+] Raw Credentials Found (Type: {type(raw_creds).__name__})")
            if isinstance(raw_creds, str):
                try:
                    cipher = EncryptionManager.get_cipher(db)
                    json_str = cipher.decrypt(raw_creds.encode()).decode()
                    creds = json.loads(json_str)
                    print("   [+] Decryption Success!")
                except Exception as e:
                    print(f"   [X] Decryption Failed: {e}")
            elif isinstance(raw_creds, dict):
                creds = raw_creds
                print("   [+] Credentials already dict (Not Encrypted?)")
        
        if creds:
            stored_sid = creds.get('account_sid')
            print(f"   [ID] Stored Account SID: {stored_sid}")
            
            if stored_sid == env_sid:
                print("   [!]  WARNING: Stored SID MATCHES Default ENV SID.")
                print("        CONCLUSION: The number was imported using the 'Default' integration/credentials.")
            else:
                print("   [OK] Stored SID is DIFFERENT from Default.")
                print("        CONCLUSION: Data is correct. Check logic flow.")
        else:
            print("   [X] No usable credentials found after processing.")
            
    if not found:
        print("[X] Phone number not found in database.")
        
    print("-" * 60 + "\n")

if __name__ == "__main__":
    inspect_credentials()
