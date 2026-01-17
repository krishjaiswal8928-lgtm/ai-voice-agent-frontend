from datetime import datetime
from typing import Optional, List

class CallDisposition:
    """
    Call Disposition model for Firestore.
    Tracks detailed call outcomes and qualification decisions.
    """
    def __init__(
        self,
        lead_id: str,
        campaign_id: str,
        call_sid: str,
        created_at: Optional[datetime] = None,
        id: Optional[str] = None,
        
        # Call Outcome Data
        call_status: str = "connected",
        disposition: str = "not_qualified",
        disposition_reason: Optional[str] = None,
        call_duration_seconds: int = 0,
        call_recording_url: Optional[str] = None,
        
        # Qualification Analysis
        lead_score: int = 0,
        buying_signals: Optional[List[str]] = None,
        objections: Optional[List[str]] = None,
        budget_mentioned: bool = False,
        timeline_mentioned: Optional[str] = None,
        decision_maker_confirmed: bool = False,
        pain_points_identified: Optional[List[str]] = None,
        
        # Actions Taken
        action_taken: Optional[str] = None,
        transferred: bool = False,
        transfer_timestamp: Optional[datetime] = None,
        callback_scheduled: bool = False,
        callback_datetime: Optional[datetime] = None,
        
        # AI Decision Context
        ai_reasoning: Optional[str] = None,
        confidence_score: float = 0.0,
        conversation_summary: Optional[str] = None
    ):
        self.id = id
        self.lead_id = lead_id
        self.campaign_id = campaign_id
        self.call_sid = call_sid
        self.created_at = created_at or datetime.now()
        
        # Call Outcome
        self.call_status = call_status
        self.disposition = disposition
        self.disposition_reason = disposition_reason
        self.call_duration_seconds = call_duration_seconds
        self.call_recording_url = call_recording_url
        
        # Qualification Analysis
        self.lead_score = lead_score
        self.buying_signals = buying_signals or []
        self.objections = objections or []
        self.budget_mentioned = budget_mentioned
        self.timeline_mentioned = timeline_mentioned
        self.decision_maker_confirmed = decision_maker_confirmed
        self.pain_points_identified = pain_points_identified or []
        
        # Actions Taken
        self.action_taken = action_taken
        self.transferred = transferred
        self.transfer_timestamp = transfer_timestamp
        self.callback_scheduled = callback_scheduled
        self.callback_datetime = callback_datetime
        
        # AI Decision Context
        self.ai_reasoning = ai_reasoning
        self.confidence_score = confidence_score
        self.conversation_summary = conversation_summary

    def to_dict(self):
        return {
            "lead_id": self.lead_id,
            "campaign_id": self.campaign_id,
            "call_sid": self.call_sid,
            "created_at": self.created_at,
            
            # Call Outcome
            "call_status": self.call_status,
            "disposition": self.disposition,
            "disposition_reason": self.disposition_reason,
            "call_duration_seconds": self.call_duration_seconds,
            "call_recording_url": self.call_recording_url,
            
            # Qualification Analysis
            "lead_score": self.lead_score,
            "buying_signals": self.buying_signals,
            "objections": self.objections,
            "budget_mentioned": self.budget_mentioned,
            "timeline_mentioned": self.timeline_mentioned,
            "decision_maker_confirmed": self.decision_maker_confirmed,
            "pain_points_identified": self.pain_points_identified,
            
            # Actions Taken
            "action_taken": self.action_taken,
            "transferred": self.transferred,
            "transfer_timestamp": self.transfer_timestamp,
            "callback_scheduled": self.callback_scheduled,
            "callback_datetime": self.callback_datetime,
            
            # AI Decision Context
            "ai_reasoning": self.ai_reasoning,
            "confidence_score": self.confidence_score,
            "conversation_summary": self.conversation_summary
        }

    @staticmethod
    def from_dict(source: dict, id: str):
        return CallDisposition(
            id=id,
            lead_id=source.get("lead_id"),
            campaign_id=source.get("campaign_id"),
            call_sid=source.get("call_sid"),
            created_at=source.get("created_at"),
            
            # Call Outcome
            call_status=source.get("call_status", "connected"),
            disposition=source.get("disposition", "not_qualified"),
            disposition_reason=source.get("disposition_reason"),
            call_duration_seconds=source.get("call_duration_seconds", 0),
            call_recording_url=source.get("call_recording_url"),
            
            # Qualification Analysis
            lead_score=source.get("lead_score", 0),
            buying_signals=source.get("buying_signals"),
            objections=source.get("objections"),
            budget_mentioned=source.get("budget_mentioned", False),
            timeline_mentioned=source.get("timeline_mentioned"),
            decision_maker_confirmed=source.get("decision_maker_confirmed", False),
            pain_points_identified=source.get("pain_points_identified"),
            
            # Actions Taken
            action_taken=source.get("action_taken"),
            transferred=source.get("transferred", False),
            transfer_timestamp=source.get("transfer_timestamp"),
            callback_scheduled=source.get("callback_scheduled", False),
            callback_datetime=source.get("callback_datetime"),
            
            # AI Decision Context
            ai_reasoning=source.get("ai_reasoning"),
            confidence_score=source.get("confidence_score", 0.0),
            conversation_summary=source.get("conversation_summary")
        )
