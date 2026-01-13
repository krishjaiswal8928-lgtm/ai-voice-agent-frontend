
import os
import sys

# Add current directory to path
sys.path.append(os.getcwd())

from app.database.firestore import get_firestore_client
from dotenv import load_dotenv

load_dotenv()

import os
import sys

sys.path.append(os.getcwd())

from app.database.firestore import get_firestore_client
from dotenv import load_dotenv

load_dotenv()

db = get_firestore_client()

print("Checking last 20 documents in rag_documents collection...")

# Get all docs (streaming is safest if we can't sort easily without index)
# We'll just take the first 20 from stream since default order is usually ID or creation
docs = db.collection('rag_documents').limit(20).stream()

count = 0
for doc in docs:
    count += 1
    data = doc.to_dict()
    agent_id = data.get('agent_id')
    campaign_id = data.get('campaign_id')
    title = data.get('title', 'No Title')
    
    # Safe print
    try:
        print(f"Doc ID: {doc.id}")
        print(f"  Agent ID: {agent_id} (Type: {type(agent_id)})")
        print(f"  Campaign ID: {campaign_id}")
        print(f"  Title: {title.encode('ascii', 'replace').decode()}")
        print("-" * 30)
    except Exception as e:
        print(f"  Error printing doc: {e}")

print(f"Total inspected: {count}")
