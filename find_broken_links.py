
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

MISSING_ID = "qw6ISLFaSsiKDvbZyDMl"
VALID_AGENT_ID = "7pcQ52j2zbSaP1ENuuEM" # Defaulting to Rahul for suggestion

print(f"Searching for references to missing ID: {MISSING_ID}")

# Check Campaigns
campaigns = db.collection("campaigns").where("custom_agent_id", "==", MISSING_ID).stream()
print("\n[Campaigns]")
c_count = 0
for c in campaigns:
    c_count += 1
    print(f" - Found in Campaign: {c.id} ({c.to_dict().get('name')})")

if c_count == 0:
    print(" - No campaigns found with this bad ID.")

# Check Phone Numbers
print("\n[Phone Numbers]")
phones = db.collection("phone_numbers").where("assigned_agents", "array_contains", MISSING_ID).stream()
p_count = 0
for p in phones:
    p_count += 1
    print(f" - Found in Phone Number: {p.id} ({p.to_dict().get('phone_number')})")
    
if p_count == 0:
    print(" - No phone numbers found with this bad ID.")
