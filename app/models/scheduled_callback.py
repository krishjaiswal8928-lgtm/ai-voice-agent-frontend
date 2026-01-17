from datetime import datetime
from typing import Optional, List

class ScheduledCallback:
    """
    Scheduled Callback model for Firestore.
    Manages callback scheduling and tracking for qualified leads.
    """
    def __init__(
        self,
        lead_id: str,
        campaign_id: str,
        scheduled_datetime: datetime,
        created_at: Optional[datetime] = None,
        id: Optional[str] = None,
        
        # Scheduling Details
        timezone: Optional[str] = None,
        status: str = "pending",
        priority: str = "medium",
        
        # Assignment
        assigned_to_agent_id: Optional[str] = None,
        assigned_to_agent_name: Optional[str] = None,
        assigned_at: Optional[datetime] = None,
        auto_assigned: bool = False,
        
        # Context for Human Agent
        lead_name: Optional[str] = None,
        lead_phone: Optional[str] = None,
        lead_score: int = 0,
        conversation_summary: Optional[str] = None,
        qualification_notes: Optional[str] = None,
        recommended_talking_points: Optional[List[str]] = None,
        buying_signals: Optional[List[str]] = None,
        objections_to_address: Optional[List[str]] = None,
        callback_reason: Optional[str] = None,
        
        # Completion Tracking
        completed_at: Optional[datetime] = None,
        completion_notes: Optional[str] = None,
        outcome: Optional[str] = None,
        rescheduled_to: Optional[datetime] = None,
        missed_reason: Optional[str] = None,
        
        # Reminder System
        reminder_sent: bool = False,
        reminder_sent_at: Optional[datetime] = None,
        reminder_method: Optional[str] = None
    ):
        self.id = id
        self.lead_id = lead_id
        self.campaign_id = campaign_id
        self.created_at = created_at or datetime.now()
        
        # Scheduling Details
        self.scheduled_datetime = scheduled_datetime
        self.timezone = timezone
        self.status = status
        self.priority = priority
        
        # Assignment
        self.assigned_to_agent_id = assigned_to_agent_id
        self.assigned_to_agent_name = assigned_to_agent_name
        self.assigned_at = assigned_at
        self.auto_assigned = auto_assigned
        
        # Context for Human Agent
        self.lead_name = lead_name
        self.lead_phone = lead_phone
        self.lead_score = lead_score
        self.conversation_summary = conversation_summary
        self.qualification_notes = qualification_notes
        self.recommended_talking_points = recommended_talking_points or []
        self.buying_signals = buying_signals or []
        self.objections_to_address = objections_to_address or []
        self.callback_reason = callback_reason
        
        # Completion Tracking
        self.completed_at = completed_at
        self.completion_notes = completion_notes
        self.outcome = outcome
        self.rescheduled_to = rescheduled_to
        self.missed_reason = missed_reason
        
        # Reminder System
        self.reminder_sent = reminder_sent
        self.reminder_sent_at = reminder_sent_at
        self.reminder_method = reminder_method

    def to_dict(self):
        return {
            "lead_id": self.lead_id,
            "campaign_id": self.campaign_id,
            "created_at": self.created_at,
            
            # Scheduling Details
            "scheduled_datetime": self.scheduled_datetime,
            "timezone": self.timezone,
            "status": self.status,
            "priority": self.priority,
            
            # Assignment
            "assigned_to_agent_id": self.assigned_to_agent_id,
            "assigned_to_agent_name": self.assigned_to_agent_name,
            "assigned_at": self.assigned_at,
            "auto_assigned": self.auto_assigned,
            
            # Context for Human Agent
            "lead_name": self.lead_name,
            "lead_phone": self.lead_phone,
            "lead_score": self.lead_score,
            "conversation_summary": self.conversation_summary,
            "qualification_notes": self.qualification_notes,
            "recommended_talking_points": self.recommended_talking_points,
            "buying_signals": self.buying_signals,
            "objections_to_address": self.objections_to_address,
            "callback_reason": self.callback_reason,
            
            # Completion Tracking
            "completed_at": self.completed_at,
            "completion_notes": self.completion_notes,
            "outcome": self.outcome,
            "rescheduled_to": self.rescheduled_to,
            "missed_reason": self.missed_reason,
            
            # Reminder System
            "reminder_sent": self.reminder_sent,
            "reminder_sent_at": self.reminder_sent_at,
            "reminder_method": self.reminder_method
        }

    @staticmethod
    def from_dict(source: dict, id: str):
        return ScheduledCallback(
            id=id,
            lead_id=source.get("lead_id"),
            campaign_id=source.get("campaign_id"),
            created_at=source.get("created_at"),
            
            # Scheduling Details
            scheduled_datetime=source.get("scheduled_datetime"),
            timezone=source.get("timezone"),
            status=source.get("status", "pending"),
            priority=source.get("priority", "medium"),
            
            # Assignment
            assigned_to_agent_id=source.get("assigned_to_agent_id"),
            assigned_to_agent_name=source.get("assigned_to_agent_name"),
            assigned_at=source.get("assigned_at"),
            auto_assigned=source.get("auto_assigned", False),
            
            # Context for Human Agent
            lead_name=source.get("lead_name"),
            lead_phone=source.get("lead_phone"),
            lead_score=source.get("lead_score", 0),
            conversation_summary=source.get("conversation_summary"),
            qualification_notes=source.get("qualification_notes"),
            recommended_talking_points=source.get("recommended_talking_points"),
            buying_signals=source.get("buying_signals"),
            objections_to_address=source.get("objections_to_address"),
            callback_reason=source.get("callback_reason"),
            
            # Completion Tracking
            completed_at=source.get("completed_at"),
            completion_notes=source.get("completion_notes"),
            outcome=source.get("outcome"),
            rescheduled_to=source.get("rescheduled_to"),
            missed_reason=source.get("missed_reason"),
            
            # Reminder System
            reminder_sent=source.get("reminder_sent", False),
            reminder_sent_at=source.get("reminder_sent_at"),
            reminder_method=source.get("reminder_method")
        )
