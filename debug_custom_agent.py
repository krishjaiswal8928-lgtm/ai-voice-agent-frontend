
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

TARGET_ID = "qw6ISLFaSsiKDvbZyDMl"

print(f"Checking for Custom Agent ID: {TARGET_ID}")
print("-" * 30)

# Check specific doc
doc_ref = db.collection("custom_agents").document(TARGET_ID)
doc = doc_ref.get()

if doc.exists:
    print(f"✅ FOUND: Agent '{doc.to_dict().get('name')}' exists.")
    print(f"Data: {doc.to_dict()}")
else:
    print(f"❌ NOT FOUND: Agent with ID {TARGET_ID} does not exist in 'custom_agents'.")

print("-" * 30)
print("Listing ALL Custom Agents:")
docs = db.collection("custom_agents").stream()
found_any = False
for d in docs:
    found_any = True
    print(f" - ID: {d.id} | Name: {d.to_dict().get('name')}")

if not found_any:
    print("No agents found in collection 'custom_agents'.")
