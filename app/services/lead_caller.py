"""
Lead Caller Service
Auto-dial next lead when current call completes
"""

import asyncio
from typing import Optional, List
import os
from google.cloud import firestore
from app.models.lead import Lead
from app.models.campaign import CallSession
from app.services.outbound_service import make_outbound_call, outbound_manager
from app.database.firestore import db as global_db # Import the global db instance

class LeadCallerService:
    """Service for auto-dialing leads in a campaign"""
    
    def __init__(self):
        self.active_campaigns = set()
        self.call_contexts = {}  # Store context for each campaign
    
    async def start_campaign_dialing(self, campaign_id: str, db_client: firestore.Client):
        """Start auto-dialing leads for a campaign"""
        campaign_id = str(campaign_id)
        self.active_campaigns.add(campaign_id)
        
        print(f"Starting dialing for campaign {campaign_id}")
        
        # Use the passed db client or fall back to global
        db = db_client or global_db
        
        # Initialize calls_made counter
        calls_made = 0
        
        try:
            # Get campaign details
            doc_ref = db.collection('campaigns').document(campaign_id)
            doc = doc_ref.get()
            
            if not doc.exists:
                print(f"Campaign {campaign_id} not found")
                return
            
            call_session = CallSession.from_dict(doc.to_dict(), doc.id)
                
            # Check if this is an outbound call session
            if call_session.type != "outbound":
                print(f"Call session {campaign_id} is not an outbound session, skipping auto-dialing")
                return
                
            # Store call session context
            self.call_contexts[campaign_id] = {
                "campaign_id": campaign_id,
                "campaign_name": call_session.name,
                "goal": call_session.goal,
                "rag_document_id": call_session.rag_document_id
            }
            
            # Initialize Twilio client if not already initialized
            if not outbound_manager.client:
                account_sid = os.getenv("TWILIO_ACCOUNT_SID")
                auth_token = os.getenv("TWILIO_AUTH_TOKEN")
                from_number = os.getenv("TWILIO_NUMBER")
                ngrok_domain = os.getenv("NGROK_DOMAIN")
                
                if account_sid and auth_token and from_number and ngrok_domain:
                    webhook_base = f"https://{ngrok_domain}"
                    outbound_manager.initialize(account_sid, auth_token, from_number, webhook_base)
                    print("✅ Twilio outbound service initialized in lead caller service")
            
            # Count total leads for this campaign
            # Note: Count queries in Firestore can be expensive/slow if many documents.
            # Using aggregation queries if available, or just simple count for now.
            leads_ref = db.collection('leads')
            total_leads = len(leads_ref.where('campaign_id', '==', campaign_id).get())
            new_leads = len(leads_ref.where('campaign_id', '==', campaign_id).where('status', '==', 'new').get())
            
            print(f"📊 Campaign {campaign_id} has {total_leads} total leads, {new_leads} new leads")
            
            while campaign_id in self.active_campaigns:
                # Get next lead to call
                lead = self._get_next_lead(campaign_id, db)
                if not lead:
                    # No more leads, wait and check again
                    print(f"📭 No more new leads for campaign {campaign_id}, waiting...")
                    await asyncio.sleep(30)
                    continue
                
                try:
                    print(f"📞 Attempting to call lead {lead.id}: {lead.phone} ({lead.name or 'Unknown'})")
                    
                    # Prepare call context
                    call_context = {
                        "campaign_id": str(campaign_id),
                        "lead_id": str(lead.id),
                        "lead_name": lead.name or "Unknown",
                        "goal": call_session.goal or "",
                        "rag_document_id": str(call_session.rag_document_id) if call_session.rag_document_id else ""
                    }
                    
                    # Initiate call using the autonomous agent
                    result = await make_outbound_call(lead.phone, call_context)
                    
                    lead_ref = db.collection('leads').document(lead.id)
                    
                    if result.get("success"):
                        call_sid = result.get("call_sid")
                        # Update lead status
                        lead_ref.update({
                            "status": "in_progress",
                            "call_sid": call_sid
                        })
                        calls_made += 1
                        print(f"✅ Initiated call to {lead.phone} for lead {lead.id}, call SID: {call_sid}")
                        print(f"📈 Total calls made: {calls_made}/{new_leads}")
                    else:
                        # Mark as failed
                        error = result.get("error", "Unknown error")
                        lead_ref.update({
                            "status": "failed",
                            "notes": error
                        })
                        print(f"❌ Failed to call {lead.phone}: {error}")
                        
                except Exception as e:
                    print(f"Error initiating call to {lead.phone}: {e}")
                    lead_ref = db.collection('leads').document(lead.id)
                    lead_ref.update({
                        "status": "failed",
                        "notes": str(e)
                    })
                
                # Wait before next call to avoid rate limiting
                await asyncio.sleep(5)
        finally:
            print(f"🏁 Lead caller service stopped for campaign {campaign_id}. Total calls made: {calls_made}")
    
    def stop_campaign_dialing(self, campaign_id: str):
        """Stop auto-dialing for a campaign"""
        campaign_id = str(campaign_id)
        self.active_campaigns.discard(campaign_id)
        if campaign_id in self.call_contexts:
            del self.call_contexts[campaign_id]
        print(f"Stopped dialing for campaign {campaign_id}")
    
    def _get_next_lead(self, campaign_id: str, db: firestore.Client) -> Optional[Lead]:
        """Get the next lead to call"""
        campaign_id = str(campaign_id)
        docs = db.collection('leads').where('campaign_id', '==', campaign_id).where('status', '==', 'new').limit(1).stream()
        
        for doc in docs:
            return Lead.from_dict(doc.to_dict(), doc.id)
        return None
    
    async def handle_call_completed(self, lead_id: str, db: firestore.Client):
        """Handle completion of a call to a lead"""
        lead_id = str(lead_id)
        doc_ref = db.collection('leads').document(lead_id)
        doc = doc_ref.get()
        
        if doc.exists:
            lead = Lead.from_dict(doc.to_dict(), doc.id)
            # Update lead status based on call outcome
            doc_ref.update({"status": "completed"})
            print(f"✅ Call completed for lead {lead_id} ({lead.phone})")
            
            # Get campaign info for logging
            campaign_ref = db.collection('campaigns').document(lead.campaign_id)
            campaign_doc = campaign_ref.get()
            
            if campaign_doc.exists:
                # Count remaining leads
                leads_ref = db.collection('leads')
                remaining_leads = len(leads_ref.where('campaign_id', '==', lead.campaign_id).where('status', '==', 'new').get())
                print(f"📊 Campaign {lead.campaign_id} has {remaining_leads} leads remaining")

# Global instance
lead_caller_service = LeadCallerService()