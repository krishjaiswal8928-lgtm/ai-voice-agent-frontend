"""
Lead Caller Service
Auto-dial next lead when current call completes
"""

import asyncio
from typing import Optional, List
import os
import logging
from google.cloud import firestore
from google.cloud.firestore import FieldFilter
from app.models.lead import Lead
from app.models.campaign import CallSession
from app.models.custom_agent import CustomAgent
from app.services.unified_outbound_service import unified_outbound_service
from app.database.firestore import db as global_db # Import the global db instance

logger = logging.getLogger(__name__)

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
                "custom_agent_id": call_session.custom_agent_id
            }
            
            # Note: We now fetch the phone number dynamically inside the loop
            # to handle cases where the agent's phone number changes mid-campaign.
            
            # Count total leads for this campaign
            # Note: Count queries in Firestore can be expensive/slow if many documents.
            # Using aggregation queries if available, or just simple count for now.
            leads_ref = db.collection('leads')
            total_leads = len(leads_ref.where(filter=FieldFilter('campaign_id', '==', campaign_id)).get())
            new_leads = len(leads_ref.where(filter=FieldFilter('campaign_id', '==', campaign_id)).where(filter=FieldFilter('status', '==', 'new')).get())
            
            print(f"📊 Campaign {campaign_id} has {total_leads} total leads, {new_leads} new leads")
            
            while campaign_id in self.active_campaigns:
                # 1. Check Campaign Status
                try:
                    # Re-fetch campaign doc to check for status updates (pause/stop)
                    doc = db.collection('campaigns').document(campaign_id).get()
                    if not doc.exists:
                        print(f"Campaign {campaign_id} no longer exists, stopping.")
                        break
                    
                    current_status = doc.to_dict().get('status')
                    
                    if current_status == 'paused':
                        print(f"⏸️ Campaign {campaign_id} is PAUSED. Waiting...")
                        await asyncio.sleep(10)
                        continue
                    
                    if current_status in ['completed', 'cancelled', 'archived']:
                        print(f"⏹️ Campaign {campaign_id} is {current_status.upper()}. Stopping dialing.")
                        break
                        
                except Exception as e:
                    logger.error(f"Error checking campaign status: {e}")

                # Get next lead to call
                lead = self._get_next_lead(campaign_id, db)
                if not lead:
                    # No more *new* leads. Check if we really are done (all leads processed?)
                    # If there are NO leads in 'new', 'ringing', 'in_progress', 'queued'
                    # Then the campaign is effectively complete.
                    
                    # NOTE: This check might be heavy if millions of leads. 
                    # For now assuming manageable size.
                    
                    leads_ref = db.collection('leads')
                    # Check for any active/pending leads
                    active_statuses = ['new', 'ringing', 'in_progress', 'queued']
                    # Firestore OR queries are limited, so we check counts. 
                    # If 'new' is 0 (which lead is None implies), check others.
                    
                    # Optimization: We know 'new' is 0 because _get_next_lead returned None.
                    # Just check for in-flight calls.
                    in_flight = len(leads_ref.where(filter=FieldFilter('campaign_id', '==', campaign_id)).where(filter=FieldFilter('status', 'in', ['ringing', 'in_progress', 'queued'])).get())
                    
                    if in_flight > 0:
                        print(f"⏳ Waiting for {in_flight} active calls to complete...")
                        await asyncio.sleep(10)
                        continue
                    else:
                        # No new leads, no active calls. We are DONE.
                        print(f"✅ All leads processed for campaign {campaign_id}. Marking as COMPLETED.")
                        db.collection('campaigns').document(campaign_id).update({
                            'status': 'completed',
                            'completed_at': firestore.SERVER_TIMESTAMP
                        })
                        self.stop_campaign_dialing(campaign_id)
                        break
                
                try:
                    print(f"📞 Attempting to call lead {lead.id}: {lead.phone} ({lead.name or 'Unknown'})")
                    if lead.purpose:
                        print(f"   Purpose: {lead.purpose}")
                    
                    # DYNAMIC PHONE NUMBER FETCH
                    # Fetch fresh agent data to get the current phone number
                    current_phone_source_id = None
                    if call_session.custom_agent_id:
                         try:
                             agent_doc = db.collection('custom_agents').document(call_session.custom_agent_id).get()
                             if agent_doc.exists:
                                 agent_data = agent_doc.to_dict()
                                 current_phone_source_id = agent_data.get('phone_number_id')
                         except Exception as e:
                             logger.error(f"Error fetching fresh agent data: {e}")

                    if not current_phone_source_id:
                        print(f"❌ Agent has no phone number assigned. Skipping call.")
                        # Optionally mark as failed or just skip? 
                        # Marking failed prevents infinite retry loop on this lead
                        db.collection('leads').document(lead.id).update({
                            "status": "failed", 
                            "notes": "Agent missing phone number"
                        })
                        continue

                    # Prepare call context with lead purpose
                    call_context = {
                        "campaign_id": str(campaign_id),
                        "lead_id": str(lead.id),
                        "lead_name": lead.name or "",
                        "lead_purpose": lead.purpose or "",  # NEW - Pass purpose
                        "goal": call_session.goal or "",
                        "ideal_customer_description": call_session.ideal_customer_description or "",
                        "custom_agent_id": str(call_session.custom_agent_id) if call_session.custom_agent_id else ""
                    }
                    
                    # Use unified outbound service
                    result = await unified_outbound_service.initiate_call(
                        phone_source_id=current_phone_source_id,
                        to_number=lead.phone,
                        call_context=call_context,
                        db=db
                    )
                    
                    lead_ref = db.collection('leads').document(lead.id)
                    
                    if result.get("success"):
                        call_sid = result.get("call_sid")
                        provider = result.get("provider", "unknown")
                        # Update lead status
                        lead_ref.update({
                            "status": "in_progress",
                            "call_sid": call_sid
                        })
                        calls_made += 1
                        print(f"✅ Initiated call to {lead.phone} via {provider.upper()}")
                        print(f"   Call SID: {call_sid}")
                        print(f"📈 Total calls made: {calls_made}")
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
        docs = db.collection('leads').where(filter=FieldFilter('campaign_id', '==', campaign_id)).where(filter=FieldFilter('status', '==', 'new')).limit(1).stream()
        
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