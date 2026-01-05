
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

print("Listing ALL Phone Numbers:")
phones = db.collection("phone_numbers").stream()

for p in phones:
    data = p.to_dict()
    print(f"ID: {p.id} | Phone: '{data.get('phone_number')}' | AgentIDs: {data.get('assigned_agents')}")
