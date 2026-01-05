"""
Fix agent TTS provider configuration
Updates agent 'Abhi' TTS provider from 'deepgram' to 'cartesia'
"""

import os
import sys
from dotenv import load_dotenv

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
load_dotenv()

from app.database.firestore import get_firestore_client

def fix_tts_provider():
    db = get_firestore_client()
    
    print("\n" + "=" * 80)
    print("🔧 FIXING TTS PROVIDER CONFIGURATION")
    print("=" * 80 + "\n")
    
    # Find all agents with invalid TTS provider
    agents_ref = db.collection('custom_agents')
    agents = agents_ref.stream()
    
    fixed_count = 0
    
    for agent_doc in agents:
        agent_data = agent_doc.to_dict()
        agent_id = agent_doc.id
        agent_name = agent_data.get('name', 'Unknown')
        current_tts = agent_data.get('tts_provider', 'N/A')
        
        print(f"Agent: {agent_name} (ID: {agent_id})")
        print(f"  Current TTS provider: {current_tts}")
        
        # Fix if set to 'deepgram' (which doesn't exist)
        if current_tts == 'deepgram':
            print(f"  ⚠️  Invalid TTS provider detected!")
            print(f"  🔧 Updating to 'cartesia'...")
            
            agents_ref.document(agent_id).update({
                'tts_provider': 'cartesia'
            })
            
            print(f"  ✅ Updated successfully!")
            fixed_count += 1
        else:
            print(f"  ✅ TTS provider is valid")
        
        print()
    
    print("=" * 80)
    print(f"📊 SUMMARY: Fixed {fixed_count} agent(s)")
    print("=" * 80 + "\n")
    
    if fixed_count > 0:
        print("✅ All agents now have valid TTS providers!")
        print("🔄 Restart the backend to apply changes: python -u main.py\n")
    else:
        print("ℹ️  No agents needed fixing.\n")

if __name__ == "__main__":
    fix_tts_provider()
