from datetime import datetime
from typing import Optional, List, Union, Dict, Any

class CallSession:
    """
    Call Session model for Firestore.
    Represents an organized calling initiative with AI agents.
    """
    def __init__(
        self,
        user_id: Union[int, str],
        name: str,
        type: str,
        status: str = "draft",
        goal: Optional[str] = None,
        custom_agent_id: Optional[Union[int, str]] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
        id: Optional[str] = None,
        
        # Campaign Statistics
        total_leads: int = 0,
        leads_called: int = 0,
        leads_connected: int = 0,
        leads_not_connected: int = 0,
        leads_qualified: int = 0,
        leads_not_qualified: int = 0,
        leads_transferred: int = 0,
        callbacks_scheduled: int = 0,
        do_not_call_count: int = 0,
        
        # Performance Metrics
        connection_rate: float = 0.0,
        qualification_rate: float = 0.0,
        transfer_rate: float = 0.0,
        callback_completion_rate: float = 0.0,
        average_call_duration: float = 0.0,
        average_lead_score: float = 0.0,
        
        # Disposition Breakdown
        disposition_counts: Optional[Dict[str, int]] = None,
        call_status_counts: Optional[Dict[str, int]] = None,
        disposition_reasons: Optional[Dict[str, int]] = None,
        
        # Campaign Settings
        enable_auto_transfer: bool = False,
        auto_transfer_threshold: int = 8,
        enable_callbacks: bool = True,
        enable_call_recording: bool = False,
        max_call_attempts: int = 3,
        retry_interval_minutes: int = 60,
        retry_on_statuses: Optional[List[str]] = None,
        working_hours_only: bool = False,
        working_hours: Optional[Dict[str, Any]] = None,
        
        # Transfer Settings
        transfer_type_preference: str = "warm",
        transfer_routing_method: str = "round_robin",
        default_transfer_agent_id: Optional[str] = None,
        transfer_timeout_seconds: int = 30,
        
        # Real-time Tracking
        currently_calling: bool = False,
        current_lead_index: int = 0,
        calls_in_progress: int = 0,
        last_call_at: Optional[datetime] = None
    ):
        self.id = id
        self.user_id = user_id
        self.name = name
        self.type = type
        self.status = status
        self.goal = goal
        self.custom_agent_id = custom_agent_id
        self.created_at = created_at or datetime.now()
        self.updated_at = updated_at or datetime.now()
        
        # Campaign Statistics
        self.total_leads = total_leads
        self.leads_called = leads_called
        self.leads_connected = leads_connected
        self.leads_not_connected = leads_not_connected
        self.leads_qualified = leads_qualified
        self.leads_not_qualified = leads_not_qualified
        self.leads_transferred = leads_transferred
        self.callbacks_scheduled = callbacks_scheduled
        self.do_not_call_count = do_not_call_count
        
        # Performance Metrics
        self.connection_rate = connection_rate
        self.qualification_rate = qualification_rate
        self.transfer_rate = transfer_rate
        self.callback_completion_rate = callback_completion_rate
        self.average_call_duration = average_call_duration
        self.average_lead_score = average_lead_score
        
        # Disposition Breakdown
        self.disposition_counts = disposition_counts or {}
        self.call_status_counts = call_status_counts or {}
        self.disposition_reasons = disposition_reasons or {}
        
        # Campaign Settings
        self.enable_auto_transfer = enable_auto_transfer
        self.auto_transfer_threshold = auto_transfer_threshold
        self.enable_callbacks = enable_callbacks
        self.enable_call_recording = enable_call_recording
        self.max_call_attempts = max_call_attempts
        self.retry_interval_minutes = retry_interval_minutes
        self.retry_on_statuses = retry_on_statuses or ["no_answer", "busy", "switched_off"]
        self.working_hours_only = working_hours_only
        self.working_hours = working_hours or {}
        
        # Transfer Settings
        self.transfer_type_preference = transfer_type_preference
        self.transfer_routing_method = transfer_routing_method
        self.default_transfer_agent_id = default_transfer_agent_id
        self.transfer_timeout_seconds = transfer_timeout_seconds
        
        # Real-time Tracking
        self.currently_calling = currently_calling
        self.current_lead_index = current_lead_index
        self.calls_in_progress = calls_in_progress
        self.last_call_at = last_call_at

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "name": self.name,
            "type": self.type,
            "status": self.status,
            "goal": self.goal,
            "custom_agent_id": self.custom_agent_id,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            
            # Campaign Statistics
            "total_leads": self.total_leads,
            "leads_called": self.leads_called,
            "leads_connected": self.leads_connected,
            "leads_not_connected": self.leads_not_connected,
            "leads_qualified": self.leads_qualified,
            "leads_not_qualified": self.leads_not_qualified,
            "leads_transferred": self.leads_transferred,
            "callbacks_scheduled": self.callbacks_scheduled,
            "do_not_call_count": self.do_not_call_count,
            
            # Performance Metrics
            "connection_rate": self.connection_rate,
            "qualification_rate": self.qualification_rate,
            "transfer_rate": self.transfer_rate,
            "callback_completion_rate": self.callback_completion_rate,
            "average_call_duration": self.average_call_duration,
            "average_lead_score": self.average_lead_score,
            
            # Disposition Breakdown
            "disposition_counts": self.disposition_counts,
            "call_status_counts": self.call_status_counts,
            "disposition_reasons": self.disposition_reasons,
            
            # Campaign Settings
            "enable_auto_transfer": self.enable_auto_transfer,
            "auto_transfer_threshold": self.auto_transfer_threshold,
            "enable_callbacks": self.enable_callbacks,
            "enable_call_recording": self.enable_call_recording,
            "max_call_attempts": self.max_call_attempts,
            "retry_interval_minutes": self.retry_interval_minutes,
            "retry_on_statuses": self.retry_on_statuses,
            "working_hours_only": self.working_hours_only,
            "working_hours": self.working_hours,
            
            # Transfer Settings
            "transfer_type_preference": self.transfer_type_preference,
            "transfer_routing_method": self.transfer_routing_method,
            "default_transfer_agent_id": self.default_transfer_agent_id,
            "transfer_timeout_seconds": self.transfer_timeout_seconds,
            
            # Real-time Tracking
            "currently_calling": self.currently_calling,
            "current_lead_index": self.current_lead_index,
            "calls_in_progress": self.calls_in_progress,
            "last_call_at": self.last_call_at
        }

    @staticmethod
    def from_dict(source: dict, id: str):
        return CallSession(
            id=id,
            user_id=source.get("user_id"),
            name=source.get("name"),
            type=source.get("type"),
            status=source.get("status", "draft"),
            goal=source.get("goal"),
            custom_agent_id=source.get("custom_agent_id"),
            created_at=source.get("created_at"),
            updated_at=source.get("updated_at"),
            
            # Campaign Statistics
            total_leads=source.get("total_leads", 0),
            leads_called=source.get("leads_called", 0),
            leads_connected=source.get("leads_connected", 0),
            leads_not_connected=source.get("leads_not_connected", 0),
            leads_qualified=source.get("leads_qualified", 0),
            leads_not_qualified=source.get("leads_not_qualified", 0),
            leads_transferred=source.get("leads_transferred", 0),
            callbacks_scheduled=source.get("callbacks_scheduled", 0),
            do_not_call_count=source.get("do_not_call_count", 0),
            
            # Performance Metrics
            connection_rate=source.get("connection_rate", 0.0),
            qualification_rate=source.get("qualification_rate", 0.0),
            transfer_rate=source.get("transfer_rate", 0.0),
            callback_completion_rate=source.get("callback_completion_rate", 0.0),
            average_call_duration=source.get("average_call_duration", 0.0),
            average_lead_score=source.get("average_lead_score", 0.0),
            
            # Disposition Breakdown
            disposition_counts=source.get("disposition_counts"),
            call_status_counts=source.get("call_status_counts"),
            disposition_reasons=source.get("disposition_reasons"),
            
            # Campaign Settings
            enable_auto_transfer=source.get("enable_auto_transfer", False),
            auto_transfer_threshold=source.get("auto_transfer_threshold", 8),
            enable_callbacks=source.get("enable_callbacks", True),
            enable_call_recording=source.get("enable_call_recording", False),
            max_call_attempts=source.get("max_call_attempts", 3),
            retry_interval_minutes=source.get("retry_interval_minutes", 60),
            retry_on_statuses=source.get("retry_on_statuses"),
            working_hours_only=source.get("working_hours_only", False),
            working_hours=source.get("working_hours"),
            
            # Transfer Settings
            transfer_type_preference=source.get("transfer_type_preference", "warm"),
            transfer_routing_method=source.get("transfer_routing_method", "round_robin"),
            default_transfer_agent_id=source.get("default_transfer_agent_id"),
            transfer_timeout_seconds=source.get("transfer_timeout_seconds", 30),
            
            # Real-time Tracking
            currently_calling=source.get("currently_calling", False),
            current_lead_index=source.get("current_lead_index", 0),
            calls_in_progress=source.get("calls_in_progress", 0),
            last_call_at=source.get("last_call_at")
        )