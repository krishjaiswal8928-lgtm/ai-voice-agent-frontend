
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

PHONE_NUMBER = "+918928795173"

print(f"Inspecting Phone Number: {PHONE_NUMBER}")
phones = db.collection("phone_numbers").where("phone_number", "==", PHONE_NUMBER).stream()

found = False
for p in phones:
    found = True
    data = p.to_dict()
    print(f"ID: {p.id}")
    print(f"Assigned Agents: {data.get('assigned_agents')}")
    print(f"Is Active: {data.get('is_active')}")

if not found:
    print("Phone number not found in DB.")
