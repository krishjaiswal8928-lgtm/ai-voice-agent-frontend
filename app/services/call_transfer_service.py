"""
Call Transfer Service
Manages the complete call transfer process including agent selection, 
transfer execution, monitoring, and fallback mechanisms.
"""

import logging
from typing import Dict, Any, Optional
from datetime import datetime
from google.cloud import firestore

from app.services.human_agent_service import get_human_agent_service
from app.services.call_control_service import CallControlService
from app.models.lead import Lead

logger = logging.getLogger(__name__)


class CallTransferService:
    """Service for managing call transfers to human agents."""
    
    def __init__(self, db: firestore.Client):
        self.db = db
        self.human_agent_service = get_human_agent_service(db)
        self.call_control = CallControlService()
    
    # ===== TRANSFER INITIATION =====
    
    def initiate_transfer(
        self,
        lead_id: str,
        campaign_id: str,
        call_sid: str,
        transfer_type: str = "cold",
        reason: str = "Lead qualified and interested",
        provider_type: str = "twilio",
        provider_config: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Initiate call transfer to human agent.
        
        Args:
            lead_id: Lead ID
            campaign_id: Campaign ID
            call_sid: Current call SID
            transfer_type: 'cold' or 'warm'
            reason: Reason for transfer
            provider_type: Phone provider type
            provider_config: Provider configuration
            
        Returns:
            dict: Transfer result with status and details
        """
        try:
            logger.info(f"Initiating {transfer_type} transfer for lead {lead_id}")
            
            # Step 1: Get campaign settings
            campaign = self._get_campaign(campaign_id)
            if not campaign:
                return self._transfer_failed("Campaign not found", lead_id, campaign_id)
            
            routing_method = campaign.get('transfer_routing_method', 'round_robin')
            transfer_timeout = campaign.get('transfer_timeout_seconds', 30)
            
            # Step 2: Select best available agent
            agent = self.human_agent_service.assign_transfer(campaign_id, lead_id, routing_method)
            
            if not agent:
                logger.warning(f"No available agents for transfer - lead {lead_id}")
                return self._handle_no_agent_available(lead_id, campaign_id, reason)
            
            logger.info(f"Selected agent {agent.name} ({agent.id}) for transfer")
            
            # Step 3: Get lead information
            lead = self._get_lead(lead_id)
            if not lead:
                return self._transfer_failed("Lead not found", lead_id, campaign_id)
            
            # Step 4: Execute transfer based on type
            if transfer_type == "cold":
                transfer_result = self._execute_cold_transfer(
                    call_sid, agent, lead, provider_type, provider_config
                )
            elif transfer_type == "warm":
                transfer_result = self._execute_warm_transfer(
                    call_sid, agent, lead, campaign, provider_type, provider_config
                )
            else:
                return self._transfer_failed(f"Unknown transfer type: {transfer_type}", lead_id, campaign_id)
            
            # Step 5: Update lead and agent records
            if transfer_result['success']:
                self._update_lead_after_transfer(lead_id, agent.id, agent.name, transfer_type, transfer_result)
                self.human_agent_service.track_transfer_received(agent.id, lead_id)
                self._update_campaign_stats(campaign_id, 'transfer_success')
                
                # Send notification to agent
                self._notify_agent(agent, lead, transfer_type, reason)
            else:
                self._update_campaign_stats(campaign_id, 'transfer_failed')
            
            return transfer_result
            
        except Exception as e:
            logger.error(f"Transfer initiation failed: {str(e)}")
            return self._transfer_failed(str(e), lead_id, campaign_id)
    
    def _execute_cold_transfer(
        self,
        call_sid: str,
        agent: Any,
        lead: Lead,
        provider_type: str,
        provider_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute cold transfer (direct transfer)."""
        try:
            logger.info(f"Executing cold transfer to {agent.phone}")
            
            # Use call control service to perform transfer
            result = self.call_control.transfer_call(
                call_id=call_sid,
                target=agent.phone,
                provider_type=provider_type,
                provider_config=provider_config,
                transfer_type="cold"
            )
            
            if result['success']:
                return {
                    'success': True,
                    'transfer_type': 'cold',
                    'agent_id': agent.id,
                    'agent_name': agent.name,
                    'agent_phone': agent.phone,
                    'transfer_call_sid': result.get('transfer_call_sid'),
                    'message': 'Cold transfer successful',
                    'timestamp': datetime.now()
                }
            else:
                return {
                    'success': False,
                    'transfer_type': 'cold',
                    'agent_id': agent.id,
                    'message': result.get('message', 'Cold transfer failed'),
                    'timestamp': datetime.now()
                }
                
        except Exception as e:
            logger.error(f"Cold transfer execution failed: {str(e)}")
            return {
                'success': False,
                'transfer_type': 'cold',
                'message': f'Error: {str(e)}',
                'timestamp': datetime.now()
            }
    
    def _execute_warm_transfer(
        self,
        call_sid: str,
        agent: Any,
        lead: Lead,
        campaign: Dict[str, Any],
        provider_type: str,
        provider_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute warm transfer (with introduction)."""
        try:
            logger.info(f"Executing warm transfer to {agent.phone}")
            
            # Get campaign phone number for caller ID
            from_number = self._get_campaign_phone_number(campaign)
            
            # Create introduction message
            introduction = self._create_introduction_message(lead, agent)
            
            # Use call control service to perform warm transfer
            result = self.call_control.warm_transfer(
                lead_call_sid=call_sid,
                agent_phone=agent.phone,
                from_number=from_number,
                provider_type=provider_type,
                provider_config=provider_config,
                introduction_message=introduction
            )
            
            if result['success']:
                return {
                    'success': True,
                    'transfer_type': 'warm',
                    'agent_id': agent.id,
                    'agent_name': agent.name,
                    'agent_phone': agent.phone,
                    'conference_name': result.get('conference_name'),
                    'agent_call_sid': result.get('agent_call_sid'),
                    'message': 'Warm transfer successful',
                    'timestamp': datetime.now()
                }
            else:
                return {
                    'success': False,
                    'transfer_type': 'warm',
                    'agent_id': agent.id,
                    'message': result.get('message', 'Warm transfer failed'),
                    'timestamp': datetime.now()
                }
                
        except Exception as e:
            logger.error(f"Warm transfer execution failed: {str(e)}")
            return {
                'success': False,
                'transfer_type': 'warm',
                'message': f'Error: {str(e)}',
                'timestamp': datetime.now()
            }
    
    # ===== FALLBACK MECHANISMS =====
    
    def _handle_no_agent_available(
        self,
        lead_id: str,
        campaign_id: str,
        reason: str
    ) -> Dict[str, Any]:
        """
        Handle scenario when no agents are available.
        Fallback: Schedule callback instead.
        """
        try:
            logger.info(f"No agents available - scheduling callback for lead {lead_id}")
            
            # Import callback service
            from app.services.callback_scheduler import CallbackScheduler
            
            # Schedule callback for next available time
            callback_service = CallbackScheduler(self.db)
            
            # Get lead info
            lead = self._get_lead(lead_id)
            
            # Schedule callback (will be handled in Phase 5)
            callback_result = {
                'success': False,
                'fallback_action': 'schedule_callback',
                'message': 'No agents available - callback will be scheduled',
                'lead_id': lead_id,
                'campaign_id': campaign_id,
                'reason': reason
            }
            
            # Update lead status
            self._update_lead_disposition(
                lead_id,
                disposition='callback_scheduled',
                reason='No agents available for immediate transfer'
            )
            
            return callback_result
            
        except Exception as e:
            logger.error(f"Fallback handling failed: {str(e)}")
            return {
                'success': False,
                'fallback_action': 'failed',
                'message': f'Fallback error: {str(e)}'
            }
    
    def retry_transfer_with_different_agent(
        self,
        lead_id: str,
        campaign_id: str,
        call_sid: str,
        failed_agent_id: str,
        provider_type: str,
        provider_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Retry transfer with a different agent after failure.
        """
        try:
            logger.info(f"Retrying transfer for lead {lead_id} with different agent")
            
            # Get available agents excluding the failed one
            campaign = self._get_campaign(campaign_id)
            user_id = campaign.get('user_id')
            
            available_agents = self.human_agent_service.get_available_agents(user_id, campaign_id)
            
            # Filter out failed agent
            available_agents = [a for a in available_agents if a.id != failed_agent_id]
            
            if not available_agents:
                return self._handle_no_agent_available(lead_id, campaign_id, "Retry failed - no other agents")
            
            # Select next best agent
            agent = available_agents[0]
            
            # Execute cold transfer to new agent
            return self._execute_cold_transfer(
                call_sid, agent, self._get_lead(lead_id), provider_type, provider_config
            )
            
        except Exception as e:
            logger.error(f"Transfer retry failed: {str(e)}")
            return self._transfer_failed(str(e), lead_id, campaign_id)
    
    # ===== MONITORING & TRACKING =====
    
    def monitor_transfer_status(
        self,
        transfer_id: str,
        call_sid: str,
        provider_type: str,
        provider_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Monitor ongoing transfer status.
        """
        try:
            # Get call status from provider
            call_status = self.call_control.get_call_status(
                call_sid, provider_type, provider_config
            )
            
            return {
                'transfer_id': transfer_id,
                'call_sid': call_sid,
                'status': call_status.get('status'),
                'duration': call_status.get('duration', 0),
                'success': call_status.get('success', False)
            }
            
        except Exception as e:
            logger.error(f"Transfer monitoring failed: {str(e)}")
            return {
                'transfer_id': transfer_id,
                'status': 'unknown',
                'error': str(e)
            }
    
    def get_transfer_history(self, campaign_id: str) -> list:
        """
        Get transfer history for a campaign.
        """
        try:
            # Query leads with transfers
            leads_ref = self.db.collection('leads')
            query = leads_ref.where('campaign_id', '==', campaign_id).where('transferred', '==', True)
            
            transfers = []
            for doc in query.stream():
                lead_data = doc.to_dict()
                transfers.append({
                    'lead_id': doc.id,
                    'lead_name': lead_data.get('name'),
                    'lead_phone': lead_data.get('phone'),
                    'agent_id': lead_data.get('transferred_to_agent_id'),
                    'agent_name': lead_data.get('transferred_to_agent_name'),
                    'transfer_type': lead_data.get('transfer_type'),
                    'transferred_at': lead_data.get('transferred_at'),
                    'transfer_status': lead_data.get('transfer_status')
                })
            
            return transfers
            
        except Exception as e:
            logger.error(f"Failed to get transfer history: {str(e)}")
            return []
    
    # ===== HELPER METHODS =====
    
    def _get_campaign(self, campaign_id: str) -> Optional[Dict[str, Any]]:
        """Get campaign data."""
        try:
            doc = self.db.collection('campaigns').document(campaign_id).get()
            return doc.to_dict() if doc.exists else None
        except Exception as e:
            logger.error(f"Failed to get campaign: {str(e)}")
            return None
    
    def _get_lead(self, lead_id: str) -> Optional[Lead]:
        """Get lead data."""
        try:
            doc = self.db.collection('leads').document(lead_id).get()
            if doc.exists:
                return Lead.from_dict(doc.to_dict(), doc.id)
            return None
        except Exception as e:
            logger.error(f"Failed to get lead: {str(e)}")
            return None
    
    def _get_campaign_phone_number(self, campaign: Dict[str, Any]) -> str:
        """Get campaign's phone number for caller ID."""
        # Get agent's phone number
        agent_id = campaign.get('custom_agent_id')
        if agent_id:
            agent_doc = self.db.collection('custom_agents').document(agent_id).get()
            if agent_doc.exists:
                agent_data = agent_doc.to_dict()
                phone_number_id = agent_data.get('phone_number_id')
                if phone_number_id:
                    phone_doc = self.db.collection('phone_numbers').document(phone_number_id).get()
                    if phone_doc.exists:
                        return phone_doc.to_dict().get('phone_number', '+1234567890')
        
        return '+1234567890'  # Fallback
    
    def _create_introduction_message(self, lead: Lead, agent: Any) -> str:
        """Create introduction message for warm transfer."""
        lead_name = lead.name or "the customer"
        return f"Hello {agent.name}, I have {lead_name} on the line who is interested in our services. They've been qualified and are ready to speak with you."
    
    def _update_lead_after_transfer(
        self,
        lead_id: str,
        agent_id: str,
        agent_name: str,
        transfer_type: str,
        transfer_result: Dict[str, Any]
    ):
        """Update lead record after successful transfer."""
        try:
            updates = {
                'transferred': True,
                'transferred_to_agent_id': agent_id,
                'transferred_to_agent_name': agent_name,
                'transferred_at': datetime.now(),
                'transfer_type': transfer_type,
                'transfer_status': 'completed',
                'transfer_call_sid': transfer_result.get('transfer_call_sid') or transfer_result.get('agent_call_sid'),
                'disposition': 'transferred'
            }
            
            self.db.collection('leads').document(lead_id).update(updates)
            logger.info(f"Updated lead {lead_id} after transfer")
            
        except Exception as e:
            logger.error(f"Failed to update lead after transfer: {str(e)}")
    
    def _update_lead_disposition(self, lead_id: str, disposition: str, reason: str):
        """Update lead disposition."""
        try:
            updates = {
                'disposition': disposition,
                'disposition_reason': reason
            }
            self.db.collection('leads').document(lead_id).update(updates)
        except Exception as e:
            logger.error(f"Failed to update lead disposition: {str(e)}")
    
    def _update_campaign_stats(self, campaign_id: str, stat_type: str):
        """Update campaign statistics."""
        try:
            campaign_ref = self.db.collection('campaigns').document(campaign_id)
            campaign = campaign_ref.get()
            
            if campaign.exists:
                data = campaign.to_dict()
                
                if stat_type == 'transfer_success':
                    leads_transferred = data.get('leads_transferred', 0) + 1
                    campaign_ref.update({'leads_transferred': leads_transferred})
                
        except Exception as e:
            logger.error(f"Failed to update campaign stats: {str(e)}")
    
    def _notify_agent(self, agent: Any, lead: Lead, transfer_type: str, reason: str):
        """Send notification to agent about incoming transfer."""
        try:
            # Notification logic would go here
            # Could send email, SMS, or in-app notification
            logger.info(f"Notification sent to agent {agent.name} about {transfer_type} transfer")
            
            # For now, just log
            notification_message = f"Incoming {transfer_type} transfer: {lead.name or lead.phone} - {reason}"
            logger.info(notification_message)
            
        except Exception as e:
            logger.error(f"Failed to notify agent: {str(e)}")
    
    def _transfer_failed(self, error_message: str, lead_id: str, campaign_id: str) -> Dict[str, Any]:
        """Return transfer failure result."""
        logger.error(f"Transfer failed for lead {lead_id}: {error_message}")
        
        # Update lead disposition
        self._update_lead_disposition(lead_id, 'transfer_failed', error_message)
        
        return {
            'success': False,
            'message': error_message,
            'lead_id': lead_id,
            'campaign_id': campaign_id,
            'timestamp': datetime.now()
        }


# Singleton instance
def get_call_transfer_service(db: firestore.Client) -> CallTransferService:
    """Get call transfer service instance."""
    return CallTransferService(db)
