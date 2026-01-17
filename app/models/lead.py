from datetime import datetime
from typing import Optional, List, Dict, Any

class Lead:
    """
    Lead model for Firestore.
    """
    def __init__(
        self,
        campaign_id: str,
        phone: str,
        name: Optional[str] = None,
        email: Optional[str] = None,
        purpose: Optional[str] = None,
        status: str = "new",
        created_at: Optional[datetime] = None,
        id: Optional[str] = None,
        
        # Call Tracking Fields
        call_status: str = "not_called",
        call_attempts: int = 0,
        last_call_attempt: Optional[datetime] = None,
        call_sid: Optional[str] = None,
        call_duration_seconds: int = 0,
        call_recording_url: Optional[str] = None,
        
        # Qualification & Disposition Fields
        disposition: Optional[str] = None,
        disposition_reason: Optional[str] = None,
        lead_score: int = 0,
        qualification_notes: Optional[str] = None,
        buying_signals: Optional[List[str]] = None,
        objections: Optional[List[str]] = None,
        
        # Transfer Tracking Fields
        transferred: bool = False,
        transferred_to_agent_id: Optional[str] = None,
        transferred_to_agent_name: Optional[str] = None,
        transferred_at: Optional[datetime] = None,
        transfer_type: Optional[str] = None,
        transfer_status: Optional[str] = None,
        transfer_call_sid: Optional[str] = None,
        
        # Callback Scheduling Fields
        callback_scheduled: bool = False,
        callback_datetime: Optional[datetime] = None,
        callback_reason: Optional[str] = None,
        callback_summary: Optional[str] = None,
        callback_status: Optional[str] = None,
        callback_completed_at: Optional[datetime] = None,
        callback_assigned_to: Optional[str] = None,
        
        # Conversation Data Fields
        conversation_transcript: Optional[str] = None,
        conversation_summary: Optional[str] = None,
        key_conversation_points: Optional[List[str]] = None,
        sentiment_analysis: Optional[str] = None,
        
        # Retry Logic Fields
        next_retry_at: Optional[datetime] = None,
        retry_count: int = 0,
        max_retries_reached: bool = False
    ):
        self.id = id
        self.campaign_id = campaign_id
        self.name = name
        self.phone = phone
        self.email = email
        self.purpose = purpose
        self.status = status
        self.created_at = created_at or datetime.now()
        
        # Call Tracking
        self.call_status = call_status
        self.call_attempts = call_attempts
        self.last_call_attempt = last_call_attempt
        self.call_sid = call_sid
        self.call_duration_seconds = call_duration_seconds
        self.call_recording_url = call_recording_url
        
        # Qualification & Disposition
        self.disposition = disposition
        self.disposition_reason = disposition_reason
        self.lead_score = lead_score
        self.qualification_notes = qualification_notes
        self.buying_signals = buying_signals or []
        self.objections = objections or []
        
        # Transfer Tracking
        self.transferred = transferred
        self.transferred_to_agent_id = transferred_to_agent_id
        self.transferred_to_agent_name = transferred_to_agent_name
        self.transferred_at = transferred_at
        self.transfer_type = transfer_type
        self.transfer_status = transfer_status
        self.transfer_call_sid = transfer_call_sid
        
        # Callback Scheduling
        self.callback_scheduled = callback_scheduled
        self.callback_datetime = callback_datetime
        self.callback_reason = callback_reason
        self.callback_summary = callback_summary
        self.callback_status = callback_status
        self.callback_completed_at = callback_completed_at
        self.callback_assigned_to = callback_assigned_to
        
        # Conversation Data
        self.conversation_transcript = conversation_transcript
        self.conversation_summary = conversation_summary
        self.key_conversation_points = key_conversation_points or []
        self.sentiment_analysis = sentiment_analysis
        
        # Retry Logic
        self.next_retry_at = next_retry_at
        self.retry_count = retry_count
        self.max_retries_reached = max_retries_reached

    def to_dict(self):
        return {
            "campaign_id": self.campaign_id,
            "name": self.name,
            "phone": self.phone,
            "email": self.email,
            "purpose": self.purpose,
            "status": self.status,
            "created_at": self.created_at,
            
            # Call Tracking
            "call_status": self.call_status,
            "call_attempts": self.call_attempts,
            "last_call_attempt": self.last_call_attempt,
            "call_sid": self.call_sid,
            "call_duration_seconds": self.call_duration_seconds,
            "call_recording_url": self.call_recording_url,
            
            # Qualification & Disposition
            "disposition": self.disposition,
            "disposition_reason": self.disposition_reason,
            "lead_score": self.lead_score,
            "qualification_notes": self.qualification_notes,
            "buying_signals": self.buying_signals,
            "objections": self.objections,
            
            # Transfer Tracking
            "transferred": self.transferred,
            "transferred_to_agent_id": self.transferred_to_agent_id,
            "transferred_to_agent_name": self.transferred_to_agent_name,
            "transferred_at": self.transferred_at,
            "transfer_type": self.transfer_type,
            "transfer_status": self.transfer_status,
            "transfer_call_sid": self.transfer_call_sid,
            
            # Callback Scheduling
            "callback_scheduled": self.callback_scheduled,
            "callback_datetime": self.callback_datetime,
            "callback_reason": self.callback_reason,
            "callback_summary": self.callback_summary,
            "callback_status": self.callback_status,
            "callback_completed_at": self.callback_completed_at,
            "callback_assigned_to": self.callback_assigned_to,
            
            # Conversation Data
            "conversation_transcript": self.conversation_transcript,
            "conversation_summary": self.conversation_summary,
            "key_conversation_points": self.key_conversation_points,
            "sentiment_analysis": self.sentiment_analysis,
            
            # Retry Logic
            "next_retry_at": self.next_retry_at,
            "retry_count": self.retry_count,
            "max_retries_reached": self.max_retries_reached
        }

    @staticmethod
    def from_dict(source: dict, id: str):
        return Lead(
            id=id,
            campaign_id=source.get("campaign_id"),
            name=source.get("name"),
            phone=source.get("phone"),
            email=source.get("email"),
            purpose=source.get("purpose"),
            status=source.get("status", "new"),
            created_at=source.get("created_at"),
            
            # Call Tracking
            call_status=source.get("call_status", "not_called"),
            call_attempts=source.get("call_attempts", 0),
            last_call_attempt=source.get("last_call_attempt"),
            call_sid=source.get("call_sid"),
            call_duration_seconds=source.get("call_duration_seconds", 0),
            call_recording_url=source.get("call_recording_url"),
            
            # Qualification & Disposition
            disposition=source.get("disposition"),
            disposition_reason=source.get("disposition_reason"),
            lead_score=source.get("lead_score", 0),
            qualification_notes=source.get("qualification_notes"),
            buying_signals=source.get("buying_signals"),
            objections=source.get("objections"),
            
            # Transfer Tracking
            transferred=source.get("transferred", False),
            transferred_to_agent_id=source.get("transferred_to_agent_id"),
            transferred_to_agent_name=source.get("transferred_to_agent_name"),
            transferred_at=source.get("transferred_at"),
            transfer_type=source.get("transfer_type"),
            transfer_status=source.get("transfer_status"),
            transfer_call_sid=source.get("transfer_call_sid"),
            
            # Callback Scheduling
            callback_scheduled=source.get("callback_scheduled", False),
            callback_datetime=source.get("callback_datetime"),
            callback_reason=source.get("callback_reason"),
            callback_summary=source.get("callback_summary"),
            callback_status=source.get("callback_status"),
            callback_completed_at=source.get("callback_completed_at"),
            callback_assigned_to=source.get("callback_assigned_to"),
            
            # Conversation Data
            conversation_transcript=source.get("conversation_transcript"),
            conversation_summary=source.get("conversation_summary"),
            key_conversation_points=source.get("key_conversation_points"),
            sentiment_analysis=source.get("sentiment_analysis"),
            
            # Retry Logic
            next_retry_at=source.get("next_retry_at"),
            retry_count=source.get("retry_count", 0),
            max_retries_reached=source.get("max_retries_reached", False)
        )