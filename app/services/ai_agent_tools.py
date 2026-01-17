"""
AI Agent Tools
Function tools that the AI agent can call during conversations to take actions.
These tools are exposed to the LLM for autonomous decision-making.
"""

import logging
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from google.cloud import firestore

from app.services.lead_qualification_service import lead_qualification_service
from app.services.call_transfer_service import get_call_transfer_service
from app.services.callback_scheduler import get_callback_scheduler
from app.services.call_control_service import CallControlService

logger = logging.getLogger(__name__)


class AIAgentTools:
    """
    Tools that the AI agent can use during conversations.
    Each tool is a function that can be called by the LLM.
    """
    
    def __init__(self, db: firestore.Client):
        self.db = db
        self.qualification_service = lead_qualification_service
        self.transfer_service = get_call_transfer_service(db)
        self.callback_service = get_callback_scheduler(db)
        self.call_control = CallControlService()
    
    # ===== TOOL DEFINITIONS =====
    
    @staticmethod
    def get_tool_definitions() -> list:
        """
        Get OpenAI function calling tool definitions.
        These are provided to the LLM so it knows what tools are available.
        """
        return [
            {
                "type": "function",
                "function": {
                    "name": "qualify_lead",
                    "description": "Analyze the conversation and qualify the lead based on BANT criteria, buying signals, and objections. Use this to determine if the lead is qualified, warm, or not interested.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "conversation_transcript": {
                                "type": "string",
                                "description": "The full conversation transcript so far"
                            },
                            "lead_name": {
                                "type": "string",
                                "description": "The lead's name if known"
                            }
                        },
                        "required": ["conversation_transcript"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "transfer_to_human_agent",
                    "description": "Transfer the call to a human sales agent. Use this when the lead is qualified and ready to speak with a specialist. The system will automatically select the best available agent.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "reason": {
                                "type": "string",
                                "description": "Why the lead should be transferred (e.g., 'Lead is qualified and ready to purchase')"
                            },
                            "transfer_type": {
                                "type": "string",
                                "enum": ["cold", "warm"],
                                "description": "Type of transfer: 'cold' (direct) or 'warm' (with introduction)"
                            },
                            "urgency": {
                                "type": "string",
                                "enum": ["low", "medium", "high"],
                                "description": "Urgency level of the transfer"
                            }
                        },
                        "required": ["reason"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "schedule_callback",
                    "description": "Schedule a callback for the lead at a specific time. Use this for warm leads who are interested but not ready to talk now, or when no agents are available.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "callback_reason": {
                                "type": "string",
                                "description": "Why the callback is being scheduled"
                            },
                            "preferred_time": {
                                "type": "string",
                                "description": "When the lead prefers to be called back (e.g., 'tomorrow morning', 'next week')"
                            },
                            "priority": {
                                "type": "string",
                                "enum": ["low", "medium", "high"],
                                "description": "Priority of the callback"
                            }
                        },
                        "required": ["callback_reason"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "end_call_with_reason",
                    "description": "End the call politely with a specific reason. Use this when the lead is not qualified, not interested, or the conversation has reached a natural conclusion.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "reason": {
                                "type": "string",
                                "description": "Reason for ending the call"
                            },
                            "disposition": {
                                "type": "string",
                                "enum": ["not_interested", "competitor", "no_budget", "wrong_timing", "do_not_call", "completed"],
                                "description": "Call disposition category"
                            },
                            "goodbye_message": {
                                "type": "string",
                                "description": "Polite goodbye message to say before hanging up"
                            }
                        },
                        "required": ["reason", "disposition"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "update_lead_notes",
                    "description": "Add important notes about the lead during the conversation. Use this to record key information, pain points, or special requirements.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "notes": {
                                "type": "string",
                                "description": "Notes to add about the lead"
                            },
                            "category": {
                                "type": "string",
                                "enum": ["pain_point", "requirement", "objection", "buying_signal", "general"],
                                "description": "Category of the note"
                            }
                        },
                        "required": ["notes"]
                    }
                }
            }
        ]
    
    # ===== TOOL IMPLEMENTATIONS =====
    
    def qualify_lead(
        self,
        call_context: Dict[str, Any],
        conversation_transcript: str,
        lead_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Qualify the lead based on conversation analysis.
        
        Args:
            call_context: Current call context (lead_id, campaign_id, etc.)
            conversation_transcript: Full conversation so far
            lead_name: Lead's name
            
        Returns:
            dict: Qualification results and recommended action
        """
        try:
            logger.info(f"Qualifying lead {call_context.get('lead_id')}")
            
            # Analyze conversation
            analysis = self.qualification_service.analyze_conversation(
                transcript=conversation_transcript,
                lead_name=lead_name,
                campaign_goal=call_context.get('campaign_goal')
            )
            
            # Update lead record with qualification data
            lead_id = call_context.get('lead_id')
            if lead_id:
                self._update_lead_qualification(lead_id, analysis)
            
            # Create call disposition record
            self._create_call_disposition(call_context, analysis)
            
            return {
                'success': True,
                'lead_score': analysis['lead_score'],
                'qualification_status': analysis['qualification_status'],
                'recommended_action': analysis['recommended_action'],
                'reason': analysis['qualification_reason'],
                'buying_signals': analysis['buying_signals'],
                'objections': analysis['objections'],
                'message': f"Lead qualified with score {analysis['lead_score']}/10"
            }
            
        except Exception as e:
            logger.error(f"Lead qualification failed: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Qualification failed'
            }
    
    def transfer_to_human_agent(
        self,
        call_context: Dict[str, Any],
        reason: str,
        transfer_type: str = "cold",
        urgency: str = "medium"
    ) -> Dict[str, Any]:
        """
        Transfer call to human agent.
        
        Args:
            call_context: Current call context
            reason: Reason for transfer
            transfer_type: 'cold' or 'warm'
            urgency: Priority level
            
        Returns:
            dict: Transfer result
        """
        try:
            logger.info(f"Initiating {transfer_type} transfer for lead {call_context.get('lead_id')}")
            
            # Get required context
            lead_id = call_context.get('lead_id')
            campaign_id = call_context.get('campaign_id')
            call_sid = call_context.get('call_sid')
            provider_type = call_context.get('provider_type', 'twilio')
            provider_config = call_context.get('provider_config', {})
            
            if not all([lead_id, campaign_id, call_sid]):
                return {
                    'success': False,
                    'message': 'Missing required context for transfer',
                    'fallback_action': 'schedule_callback'
                }
            
            # Initiate transfer
            result = self.transfer_service.initiate_transfer(
                lead_id=lead_id,
                campaign_id=campaign_id,
                call_sid=call_sid,
                transfer_type=transfer_type,
                reason=reason,
                provider_type=provider_type,
                provider_config=provider_config
            )
            
            if result['success']:
                return {
                    'success': True,
                    'agent_name': result.get('agent_name'),
                    'transfer_type': transfer_type,
                    'message': f"Transferring to {result.get('agent_name', 'agent')}"
                }
            else:
                # Transfer failed - fallback to callback
                return {
                    'success': False,
                    'message': result.get('message', 'Transfer failed'),
                    'fallback_action': result.get('fallback_action', 'schedule_callback'),
                    'reason': 'No agents available'
                }
                
        except Exception as e:
            logger.error(f"Transfer failed: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'fallback_action': 'schedule_callback',
                'message': 'Transfer failed - will schedule callback'
            }
    
    def schedule_callback(
        self,
        call_context: Dict[str, Any],
        callback_reason: str,
        preferred_time: Optional[str] = None,
        priority: str = "medium"
    ) -> Dict[str, Any]:
        """
        Schedule a callback for the lead.
        
        Args:
            call_context: Current call context
            callback_reason: Why callback is needed
            preferred_time: When lead prefers callback
            priority: Callback priority
            
        Returns:
            dict: Callback scheduling result
        """
        try:
            logger.info(f"Scheduling callback for lead {call_context.get('lead_id')}")
            
            lead_id = call_context.get('lead_id')
            campaign_id = call_context.get('campaign_id')
            
            if not all([lead_id, campaign_id]):
                return {
                    'success': False,
                    'message': 'Missing required context for callback'
                }
            
            # Parse preferred time
            scheduled_datetime = self._parse_preferred_time(preferred_time)
            
            # Get lead context
            lead_context = {
                'conversation_transcript': call_context.get('conversation_transcript', ''),
                'lead_score': call_context.get('lead_score', 5),
                'timezone': call_context.get('timezone', 'UTC')
            }
            
            # Schedule callback
            callback = self.callback_service.schedule_qualified_callback(
                lead_id=lead_id,
                campaign_id=campaign_id,
                scheduled_datetime=scheduled_datetime,
                callback_reason=callback_reason,
                lead_context=lead_context,
                auto_assign=True,
                priority=priority
            )
            
            return {
                'success': True,
                'callback_id': callback.id,
                'scheduled_time': scheduled_datetime.strftime('%Y-%m-%d %H:%M'),
                'assigned_agent': callback.assigned_to_agent_name,
                'message': f"Callback scheduled for {scheduled_datetime.strftime('%B %d at %I:%M %p')}"
            }
            
        except Exception as e:
            logger.error(f"Callback scheduling failed: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to schedule callback'
            }
    
    def end_call_with_reason(
        self,
        call_context: Dict[str, Any],
        reason: str,
        disposition: str,
        goodbye_message: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        End the call with a specific reason and disposition.
        
        Args:
            call_context: Current call context
            reason: Reason for ending call
            disposition: Call disposition
            goodbye_message: Optional goodbye message
            
        Returns:
            dict: Call end result
        """
        try:
            logger.info(f"Ending call for lead {call_context.get('lead_id')} - {disposition}")
            
            lead_id = call_context.get('lead_id')
            call_sid = call_context.get('call_sid')
            provider_type = call_context.get('provider_type', 'twilio')
            provider_config = call_context.get('provider_config', {})
            
            # Update lead disposition
            if lead_id:
                self._update_lead_disposition(lead_id, disposition, reason)
            
            # End call
            if call_sid:
                if goodbye_message:
                    # End with message
                    self.call_control.end_call_with_message(
                        call_sid, provider_type, provider_config, goodbye_message
                    )
                else:
                    # End immediately
                    self.call_control.end_call(
                        call_sid, provider_type, provider_config, reason
                    )
            
            return {
                'success': True,
                'disposition': disposition,
                'reason': reason,
                'message': 'Call ended successfully'
            }
            
        except Exception as e:
            logger.error(f"Failed to end call: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to end call'
            }
    
    def update_lead_notes(
        self,
        call_context: Dict[str, Any],
        notes: str,
        category: str = "general"
    ) -> Dict[str, Any]:
        """
        Update lead notes during conversation.
        
        Args:
            call_context: Current call context
            notes: Notes to add
            category: Note category
            
        Returns:
            dict: Update result
        """
        try:
            lead_id = call_context.get('lead_id')
            
            if not lead_id:
                return {
                    'success': False,
                    'message': 'No lead ID provided'
                }
            
            # Get existing notes
            lead_ref = self.db.collection('leads').document(lead_id)
            lead_doc = lead_ref.get()
            
            if not lead_doc.exists:
                return {
                    'success': False,
                    'message': 'Lead not found'
                }
            
            lead_data = lead_doc.to_dict()
            existing_notes = lead_data.get('qualification_notes', '')
            
            # Append new notes
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M')
            new_note = f"[{timestamp}] [{category.upper()}] {notes}"
            updated_notes = f"{existing_notes}\n{new_note}" if existing_notes else new_note
            
            # Update lead
            lead_ref.update({
                'qualification_notes': updated_notes
            })
            
            logger.info(f"Updated notes for lead {lead_id}")
            
            return {
                'success': True,
                'message': 'Notes updated successfully'
            }
            
        except Exception as e:
            logger.error(f"Failed to update notes: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to update notes'
            }
    
    # ===== HELPER METHODS =====
    
    def _update_lead_qualification(self, lead_id: str, analysis: Dict[str, Any]):
        """Update lead record with qualification analysis."""
        try:
            updates = {
                'lead_score': analysis['lead_score'],
                'disposition': analysis['qualification_status'],
                'disposition_reason': analysis['qualification_reason'],
                'buying_signals': analysis.get('buying_signals', []),
                'objections': analysis.get('objections', []),
                'conversation_summary': analysis.get('conversation_summary', ''),
                'qualification_notes': analysis.get('qualification_reason', ''),
                'sentiment_analysis': analysis.get('confidence_score', 0.0)
            }
            
            self.db.collection('leads').document(lead_id).update(updates)
            logger.info(f"Updated lead {lead_id} qualification data")
            
        except Exception as e:
            logger.error(f"Failed to update lead qualification: {str(e)}")
    
    def _update_lead_disposition(self, lead_id: str, disposition: str, reason: str):
        """Update lead disposition."""
        try:
            updates = {
                'disposition': disposition,
                'disposition_reason': reason
            }
            self.db.collection('leads').document(lead_id).update(updates)
        except Exception as e:
            logger.error(f"Failed to update disposition: {str(e)}")
    
    def _create_call_disposition(self, call_context: Dict[str, Any], analysis: Dict[str, Any]):
        """Create call disposition record."""
        try:
            from app.models.call_disposition import CallDisposition
            
            disposition = CallDisposition(
                lead_id=call_context.get('lead_id'),
                campaign_id=call_context.get('campaign_id'),
                call_sid=call_context.get('call_sid'),
                call_status='completed',
                disposition=analysis['qualification_status'],
                disposition_reason=analysis['qualification_reason'],
                lead_score=analysis['lead_score'],
                buying_signals=analysis.get('buying_signals', []),
                objections=analysis.get('objections', []),
                conversation_summary=analysis.get('conversation_summary', ''),
                ai_reasoning=analysis.get('qualification_reason', ''),
                confidence_score=analysis.get('confidence_score', 0.0)
            )
            
            doc_ref = self.db.collection('call_dispositions').document()
            doc_ref.set(disposition.to_dict())
            
        except Exception as e:
            logger.error(f"Failed to create call disposition: {str(e)}")
    
    def _parse_preferred_time(self, preferred_time: Optional[str]) -> datetime:
        """Parse preferred time string to datetime."""
        if not preferred_time:
            # Default: next business day at 10 AM
            return self._get_next_business_day()
        
        preferred_lower = preferred_time.lower()
        now = datetime.now()
        
        # Parse common time expressions
        if 'tomorrow' in preferred_lower:
            scheduled = now + timedelta(days=1)
            if 'morning' in preferred_lower:
                scheduled = scheduled.replace(hour=10, minute=0)
            elif 'afternoon' in preferred_lower:
                scheduled = scheduled.replace(hour=14, minute=0)
            elif 'evening' in preferred_lower:
                scheduled = scheduled.replace(hour=18, minute=0)
            else:
                scheduled = scheduled.replace(hour=10, minute=0)
            return scheduled
        
        elif 'next week' in preferred_lower:
            scheduled = now + timedelta(days=7)
            return scheduled.replace(hour=10, minute=0)
        
        elif 'later today' in preferred_lower or 'this afternoon' in preferred_lower:
            return now.replace(hour=14, minute=0)
        
        else:
            # Default: next business day
            return self._get_next_business_day()
    
    def _get_next_business_day(self) -> datetime:
        """Get next business day at 10 AM."""
        now = datetime.now()
        next_day = now + timedelta(days=1)
        
        # Skip weekends
        while next_day.weekday() >= 5:
            next_day += timedelta(days=1)
        
        return next_day.replace(hour=10, minute=0, second=0, microsecond=0)


# Factory function
def get_ai_agent_tools(db: firestore.Client) -> AIAgentTools:
    """Get AI agent tools instance."""
    return AIAgentTools(db)
