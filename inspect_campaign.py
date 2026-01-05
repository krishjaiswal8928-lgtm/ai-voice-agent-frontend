
import firebase_admin
from firebase_admin import credentials, firestore
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize Firebase
if not firebase_admin._apps:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()

CAMPAIGN_ID = "nMqYhvCwI5GeUmoQrIXW"

print(f"Inspecting Campaign: {CAMPAIGN_ID}")
doc_ref = db.collection("campaigns").document(CAMPAIGN_ID)
doc = doc_ref.get()

if doc.exists:
    data = doc.to_dict()
    print("Found Campaign Data:")
    print(f"custom_agent_id: '{data.get('custom_agent_id')}'")
    print(f"Name: {data.get('name')}")
else:
    print("Campaign NOT found.")
