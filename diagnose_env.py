import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore

load_dotenv()

print("-" * 20)
print("DIAGNOSTICS")
print("-" * 20)

# Check Envs
ngrok = os.getenv("NGROK_DOMAIN")
webhook_domain = os.getenv("WEBHOOK_BASE_DOMAIN")
print(f"WEBHOOK_BASE_DOMAIN: {'SET' if webhook_domain else 'MISSING'} ({webhook_domain})")
print(f"NGROK_DOMAIN (legacy): {'SET' if ngrok else 'MISSING'} ({ngrok})")

creds = os.getenv("FIREBASE_CREDENTIALS", "serviceAccountKey.json")
print(f"FIREBASE_CREDENTIALS path: {creds}")
print(f"File exists: {os.path.exists(creds)}")

# Check Firestore
try:
    if not firebase_admin._apps:
        cred = credentials.Certificate(creds)
        firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Firestore: CONNECTED")
except Exception as e:
    print(f"Firestore: FAILED - {e}")

print("-" * 20)
