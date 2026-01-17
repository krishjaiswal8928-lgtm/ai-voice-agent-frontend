"""
Enhanced Callback Scheduler Service
Manages qualified callback scheduling with auto-assignment, reminders, and agent context.
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from google.cloud import firestore

from app.models.scheduled_callback import ScheduledCallback
from app.services.human_agent_service import get_human_agent_service

logger = logging.getLogger(__name__)


class CallbackScheduler:
    """Enhanced service for scheduling and managing callbacks with agent assignment."""
    
    def __init__(self, db: firestore.Client):
        self.db = db
        self.collection = db.collection('scheduled_callbacks')
        self.human_agent_service = get_human_agent_service(db)
    
    # ===== CALLBACK CREATION =====
    
    def schedule_qualified_callback(
        self,
        lead_id: str,
        campaign_id: str,
        scheduled_datetime: datetime,
        callback_reason: str,
        lead_context: Dict[str, Any],
        auto_assign: bool = True,
        priority: str = "medium"
    ) -> ScheduledCallback:
        """
        Schedule a callback for a qualified lead.
        
        Args:
            lead_id: Lead ID
            campaign_id: Campaign ID
            scheduled_datetime: When to call back
            callback_reason: Reason for callback
            lead_context: Lead information and conversation context
            auto_assign: Whether to auto-assign to an agent
            priority: Callback priority ('low', 'medium', 'high')
            
        Returns:
            ScheduledCallback: Created callback
        """
        try:
            # Get lead information
            lead = self._get_lead(lead_id)
            if not lead:
                raise ValueError(f"Lead {lead_id} not found")
            
            # Create callback model
            callback = ScheduledCallback(
                lead_id=lead_id,
                campaign_id=campaign_id,
                scheduled_datetime=scheduled_datetime,
                timezone=lead_context.get('timezone', 'UTC'),
                status='pending',
                priority=priority,
                
                # Lead context
                lead_name=lead.name,
                lead_phone=lead.phone,
                lead_score=lead.lead_score,
                conversation_summary=lead.conversation_summary,
                qualification_notes=lead.qualification_notes,
                buying_signals=lead.buying_signals,
                objections_to_address=lead.objections,
                callback_reason=callback_reason,
                
                # Recommended talking points from AI analysis
                recommended_talking_points=self._generate_talking_points(lead)
            )
            
            # Auto-assign to agent if enabled
            if auto_assign:
                agent = self.human_agent_service.assign_callback(
                    campaign_id, lead_id, scheduled_datetime
                )
                
                if agent:
                    callback.assigned_to_agent_id = agent.id
                    callback.assigned_to_agent_name = agent.name
                    callback.assigned_at = datetime.now()
                    callback.auto_assigned = True
                    logger.info(f"Auto-assigned callback to agent {agent.name}")
            
            # Save to Firestore
            doc_ref = self.collection.document()
            doc_ref.set(callback.to_dict())
            callback.id = doc_ref.id
            
            # Update lead record
            self._update_lead_callback_status(lead_id, callback.id, scheduled_datetime)
            
            logger.info(f"Scheduled callback {callback.id} for lead {lead_id} at {scheduled_datetime}")
            
            return callback
            
        except Exception as e:
            logger.error(f"Failed to schedule callback: {str(e)}")
            raise
    
    def schedule_callback_from_transfer_failure(
        self,
        lead_id: str,
        campaign_id: str,
        transfer_failure_reason: str,
        lead_context: Dict[str, Any]
    ) -> ScheduledCallback:
        """
        Schedule callback when transfer fails (no agents available).
        
        Args:
            lead_id: Lead ID
            campaign_id: Campaign ID
            transfer_failure_reason: Why transfer failed
            lead_context: Lead context
            
        Returns:
            ScheduledCallback: Created callback
        """
        try:
            # Schedule for next business day, 9 AM
            next_callback = self._calculate_next_business_day_time()
            
            callback_reason = f"Transfer failed: {transfer_failure_reason}. Lead was interested and qualified."
            
            return self.schedule_qualified_callback(
                lead_id=lead_id,
                campaign_id=campaign_id,
                scheduled_datetime=next_callback,
                callback_reason=callback_reason,
                lead_context=lead_context,
                auto_assign=True,
                priority='high'  # High priority since lead was ready to talk
            )
            
        except Exception as e:
            logger.error(f"Failed to schedule callback from transfer failure: {str(e)}")
            raise
    
    # ===== CALLBACK MANAGEMENT =====
    
    def get_callback(self, callback_id: str) -> Optional[ScheduledCallback]:
        """Get callback by ID."""
        try:
            doc = self.collection.document(callback_id).get()
            if doc.exists:
                return ScheduledCallback.from_dict(doc.to_dict(), doc.id)
            return None
        except Exception as e:
            logger.error(f"Failed to get callback: {str(e)}")
            return None
    
    def update_callback(self, callback_id: str, updates: Dict[str, Any]) -> Optional[ScheduledCallback]:
        """Update callback information."""
        try:
            doc_ref = self.collection.document(callback_id)
            doc = doc_ref.get()
            
            if not doc.exists:
                return None
            
            doc_ref.update(updates)
            
            updated_doc = doc_ref.get()
            return ScheduledCallback.from_dict(updated_doc.to_dict(), updated_doc.id)
            
        except Exception as e:
            logger.error(f"Failed to update callback: {str(e)}")
            return None
    
    def assign_callback_to_agent(self, callback_id: str, agent_id: str) -> bool:
        """Manually assign callback to specific agent."""
        try:
            agent = self.human_agent_service.get_agent(agent_id)
            if not agent:
                return False
            
            updates = {
                'assigned_to_agent_id': agent_id,
                'assigned_to_agent_name': agent.name,
                'assigned_at': datetime.now(),
                'auto_assigned': False
            }
            
            self.collection.document(callback_id).update(updates)
            logger.info(f"Assigned callback {callback_id} to agent {agent.name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to assign callback: {str(e)}")
            return False
    
    def reschedule_callback(self, callback_id: str, new_datetime: datetime, reason: str) -> bool:
        """Reschedule callback to new time."""
        try:
            updates = {
                'scheduled_datetime': new_datetime,
                'rescheduled_to': new_datetime,
                'status': 'rescheduled'
            }
            
            self.collection.document(callback_id).update(updates)
            logger.info(f"Rescheduled callback {callback_id} to {new_datetime}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to reschedule callback: {str(e)}")
            return False
    
    def complete_callback(self, callback_id: str, outcome: str, notes: str) -> bool:
        """Mark callback as completed."""
        try:
            updates = {
                'status': 'completed',
                'completed_at': datetime.now(),
                'outcome': outcome,
                'completion_notes': notes
            }
            
            self.collection.document(callback_id).update(updates)
            
            # Update agent metrics
            callback = self.get_callback(callback_id)
            if callback and callback.assigned_to_agent_id:
                self.human_agent_service.track_callback_completed(
                    callback.assigned_to_agent_id, callback_id, outcome
                )
            
            logger.info(f"Completed callback {callback_id} with outcome: {outcome}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to complete callback: {str(e)}")
            return False
    
    def mark_callback_missed(self, callback_id: str, reason: str) -> bool:
        """Mark callback as missed."""
        try:
            updates = {
                'status': 'missed',
                'missed_reason': reason
            }
            
            self.collection.document(callback_id).update(updates)
            logger.info(f"Marked callback {callback_id} as missed: {reason}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to mark callback as missed: {str(e)}")
            return False
    
    # ===== CALLBACK QUERIES =====
    
    def get_callbacks_for_agent(
        self,
        agent_id: str,
        status: Optional[str] = None,
        date_range: Optional[Dict[str, datetime]] = None
    ) -> List[ScheduledCallback]:
        """Get callbacks assigned to specific agent."""
        try:
            query = self.collection.where('assigned_to_agent_id', '==', agent_id)
            
            if status:
                query = query.where('status', '==', status)
            
            if date_range:
                if 'start' in date_range:
                    query = query.where('scheduled_datetime', '>=', date_range['start'])
                if 'end' in date_range:
                    query = query.where('scheduled_datetime', '<=', date_range['end'])
            
            docs = query.stream()
            return [ScheduledCallback.from_dict(doc.to_dict(), doc.id) for doc in docs]
            
        except Exception as e:
            logger.error(f"Failed to get agent callbacks: {str(e)}")
            return []
    
    def get_callbacks_for_campaign(
        self,
        campaign_id: str,
        status: Optional[str] = None
    ) -> List[ScheduledCallback]:
        """Get all callbacks for a campaign."""
        try:
            query = self.collection.where('campaign_id', '==', campaign_id)
            
            if status:
                query = query.where('status', '==', status)
            
            docs = query.stream()
            return [ScheduledCallback.from_dict(doc.to_dict(), doc.id) for doc in docs]
            
        except Exception as e:
            logger.error(f"Failed to get campaign callbacks: {str(e)}")
            return []
    
    def get_upcoming_callbacks(self, hours_ahead: int = 24) -> List[ScheduledCallback]:
        """Get callbacks scheduled in the next N hours."""
        try:
            now = datetime.now()
            future = now + timedelta(hours=hours_ahead)
            
            query = self.collection.where('status', '==', 'pending').where(
                'scheduled_datetime', '>=', now
            ).where('scheduled_datetime', '<=', future)
            
            docs = query.stream()
            return [ScheduledCallback.from_dict(doc.to_dict(), doc.id) for doc in docs]
            
        except Exception as e:
            logger.error(f"Failed to get upcoming callbacks: {str(e)}")
            return []
    
    def get_overdue_callbacks(self) -> List[ScheduledCallback]:
        """Get callbacks that are past their scheduled time."""
        try:
            now = datetime.now()
            
            query = self.collection.where('status', '==', 'pending').where(
                'scheduled_datetime', '<', now
            )
            
            docs = query.stream()
            return [ScheduledCallback.from_dict(doc.to_dict(), doc.id) for doc in docs]
            
        except Exception as e:
            logger.error(f"Failed to get overdue callbacks: {str(e)}")
            return []
    
    # ===== REMINDER SYSTEM =====
    
    def send_callback_reminder(
        self,
        callback_id: str,
        reminder_method: str = 'email',
        minutes_before: int = 30
    ) -> bool:
        """
        Send reminder to agent about upcoming callback.
        
        Args:
            callback_id: Callback ID
            reminder_method: 'email', 'sms', or 'in_app'
            minutes_before: How many minutes before callback to remind
            
        Returns:
            bool: True if reminder sent
        """
        try:
            callback = self.get_callback(callback_id)
            if not callback or not callback.assigned_to_agent_id:
                return False
            
            agent = self.human_agent_service.get_agent(callback.assigned_to_agent_id)
            if not agent:
                return False
            
            # Create reminder message
            reminder_message = self._create_reminder_message(callback, agent)
            
            # Send via appropriate method
            if reminder_method == 'email':
                success = self._send_email_reminder(agent.email, reminder_message, callback)
            elif reminder_method == 'sms':
                success = self._send_sms_reminder(agent.phone, reminder_message, callback)
            elif reminder_method == 'in_app':
                success = self._send_in_app_reminder(agent.id, reminder_message, callback)
            else:
                logger.warning(f"Unknown reminder method: {reminder_method}")
                return False
            
            if success:
                # Update callback record
                self.collection.document(callback_id).update({
                    'reminder_sent': True,
                    'reminder_sent_at': datetime.now(),
                    'reminder_method': reminder_method
                })
                logger.info(f"Sent {reminder_method} reminder for callback {callback_id}")
            
            return success
            
        except Exception as e:
            logger.error(f"Failed to send reminder: {str(e)}")
            return False
    
    def process_reminder_queue(self):
        """Process all callbacks that need reminders sent."""
        try:
            # Get callbacks scheduled in next hour that haven't had reminders sent
            upcoming = self.get_upcoming_callbacks(hours_ahead=1)
            
            for callback in upcoming:
                if not callback.reminder_sent and callback.assigned_to_agent_id:
                    # Get agent's preferred reminder method
                    agent = self.human_agent_service.get_agent(callback.assigned_to_agent_id)
                    if agent:
                        reminder_method = agent.callback_notification_method
                        self.send_callback_reminder(callback.id, reminder_method, minutes_before=30)
            
            logger.info(f"Processed reminder queue - sent {len(upcoming)} reminders")
            
        except Exception as e:
            logger.error(f"Failed to process reminder queue: {str(e)}")
    
    # ===== HELPER METHODS =====
    
    def _get_lead(self, lead_id: str):
        """Get lead from database."""
        try:
            from app.models.lead import Lead
            doc = self.db.collection('leads').document(lead_id).get()
            if doc.exists:
                return Lead.from_dict(doc.to_dict(), doc.id)
            return None
        except Exception as e:
            logger.error(f"Failed to get lead: {str(e)}")
            return None
    
    def _update_lead_callback_status(self, lead_id: str, callback_id: str, scheduled_time: datetime):
        """Update lead record with callback information."""
        try:
            updates = {
                'callback_scheduled': True,
                'callback_datetime': scheduled_time,
                'disposition': 'callback_scheduled'
            }
            self.db.collection('leads').document(lead_id).update(updates)
        except Exception as e:
            logger.error(f"Failed to update lead callback status: {str(e)}")
    
    def _generate_talking_points(self, lead) -> List[str]:
        """Generate recommended talking points based on lead conversation."""
        talking_points = []
        
        if lead.buying_signals:
            talking_points.append(f"Lead showed interest in: {', '.join(lead.buying_signals)}")
        
        if lead.objections:
            talking_points.append(f"Address objections: {', '.join(lead.objections)}")
        
        if lead.qualification_notes:
            talking_points.append(f"Context: {lead.qualification_notes}")
        
        return talking_points
    
    def _calculate_next_business_day_time(self) -> datetime:
        """Calculate next business day at 9 AM."""
        now = datetime.now()
        next_day = now + timedelta(days=1)
        
        # If weekend, move to Monday
        while next_day.weekday() >= 5:  # 5 = Saturday, 6 = Sunday
            next_day += timedelta(days=1)
        
        # Set to 9 AM
        return next_day.replace(hour=9, minute=0, second=0, microsecond=0)
    
    def _create_reminder_message(self, callback: ScheduledCallback, agent: Any) -> str:
        """Create reminder message for agent."""
        return f"""
Callback Reminder

Hi {agent.name},

You have a scheduled callback coming up:

Lead: {callback.lead_name or callback.lead_phone}
Phone: {callback.lead_phone}
Scheduled: {callback.scheduled_datetime.strftime('%Y-%m-%d %H:%M')}
Priority: {callback.priority.upper()}

Lead Score: {callback.lead_score}/10
Reason: {callback.callback_reason}

Context:
{callback.conversation_summary or 'No summary available'}

Talking Points:
{chr(10).join('- ' + point for point in callback.recommended_talking_points)}

Good luck!
"""
    
    def _send_email_reminder(self, email: str, message: str, callback: ScheduledCallback) -> bool:
        """Send email reminder (placeholder - implement with actual email service)."""
        logger.info(f"Email reminder sent to {email}")
        # TODO: Implement actual email sending
        return True
    
    def _send_sms_reminder(self, phone: str, message: str, callback: ScheduledCallback) -> bool:
        """Send SMS reminder (placeholder - implement with Twilio SMS)."""
        logger.info(f"SMS reminder sent to {phone}")
        # TODO: Implement actual SMS sending
        return True
    
    def _send_in_app_reminder(self, agent_id: str, message: str, callback: ScheduledCallback) -> bool:
        """Send in-app notification (placeholder - implement with notification system)."""
        logger.info(f"In-app reminder sent to agent {agent_id}")
        # TODO: Implement actual in-app notification
        return True


# Factory function
def get_callback_scheduler(db: firestore.Client) -> CallbackScheduler:
    """Get callback scheduler instance."""
    return CallbackScheduler(db)