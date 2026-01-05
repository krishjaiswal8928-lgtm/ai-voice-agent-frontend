import sqlite3
import asyncio
import os
import sys
import time

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import only what we need without triggering ORM relationships
from app.services.outbound_service import outbound_manager
from dotenv import load_dotenv

load_dotenv()

async def simple_lead_test():
    """Simple test to check lead calling functionality"""
    print("Testing lead calling functionality...")
    
    # Connect to the database directly
    conn = sqlite3.connect('ai_voice_agent.db')
    cursor = conn.cursor()
    
    # Find an active campaign
    cursor.execute("SELECT id, name FROM campaigns WHERE status='active'")
    campaign = cursor.fetchone()
    
    if not campaign:
        print("No active campaign found")
        conn.close()
        return
        
    campaign_id, campaign_name = campaign
    print(f"Found active campaign: {campaign_id} - {campaign_name}")
    
    # Check leads for this campaign
    cursor.execute("SELECT id, phone, name FROM leads WHERE campaign_id=? AND status='new'", (campaign_id,))
    leads = cursor.fetchall()
    
    print(f"Found {len(leads)} new leads for campaign {campaign_id}:")
    for lead in leads:
        print(f"  - Lead {lead[0]}: {lead[1]} ({lead[2] or 'Unknown'})")
        
    if not leads:
        print("No new leads found for the campaign")
        conn.close()
        return
    
    # Initialize Twilio client if not already initialized
    if not outbound_manager.client:
        account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        from_number = os.getenv("TWILIO_NUMBER")
        ngrok_domain = os.getenv("NGROK_DOMAIN")
        
        if account_sid and auth_token and from_number and ngrok_domain:
            webhook_base = f"https://{ngrok_domain}"
            outbound_manager.initialize(account_sid, auth_token, from_number, webhook_base)
            print("✅ Twilio outbound service initialized")
    
    # Try to call each lead
    calls_made = 0
    for lead in leads:
        lead_id, phone, name = lead
        print(f"📞 Attempting to call lead {lead_id}: {phone} ({name or 'Unknown'})")
        
        # Prepare call context
        call_context = {
            "campaign_id": str(campaign_id),
            "lead_id": str(lead_id),
            "lead_name": name or "Unknown",
            "goal": "Demo call for testing lead sequence",
            "rag_document_id": ""
        }
        
        try:
            # Initiate call
            result = await outbound_manager.make_call(phone, call_context)
            
            if result.get("success"):
                call_sid = result.get("call_sid")
                # Update lead status in database
                cursor.execute("UPDATE leads SET status='in_progress', call_sid=? WHERE id=?", (call_sid, lead_id))
                conn.commit()
                calls_made += 1
                print(f"✅ Initiated call to {phone} for lead {lead_id}, call SID: {call_sid}")
            else:
                # Mark as failed
                error = result.get("error", "Unknown error")
                cursor.execute("UPDATE leads SET status='failed' WHERE id=?", (lead_id,))
                conn.commit()
                print(f"❌ Failed to call {phone}: {error}")
                
        except Exception as e:
            print(f"Error initiating call to {phone}: {e}")
            cursor.execute("UPDATE leads SET status='failed' WHERE id=?", (lead_id,))
            conn.commit()
        
        # Wait before next call to avoid rate limiting
        await asyncio.sleep(2)
    
    conn.close()
    print(f"🏁 Test completed. Total calls made: {calls_made}/{len(leads)}")

if __name__ == "__main__":
    asyncio.run(simple_lead_test())