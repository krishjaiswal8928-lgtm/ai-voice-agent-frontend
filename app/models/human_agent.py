from datetime import datetime
from typing import Optional, Dict, Any

class HumanAgent:
    """
    Human Agent model for Firestore.
    Manages human sales agents for call transfers and callbacks.
    """
    def __init__(
        self,
        user_id: str,
        name: str,
        email: str,
        created_at: Optional[datetime] = None,
        id: Optional[str] = None,
        
        # Contact Information
        phone: Optional[str] = None,
        extension: Optional[str] = None,
        
        # Availability Tracking
        status: str = "offline",
        last_status_change: Optional[datetime] = None,
        max_concurrent_calls: int = 1,
        current_active_calls: int = 0,
        
        # Scheduling
        working_hours: Optional[Dict[str, Any]] = None,
        timezone: str = "UTC",
        accepts_transfers: bool = True,
        accepts_callbacks: bool = True,
        
        # Performance Metrics
        total_transfers_received: int = 0,
        total_callbacks_completed: int = 0,
        average_call_duration: float = 0.0,
        conversion_rate: float = 0.0,
        
        # Contact Preferences
        transfer_notification_method: str = "call",
        callback_notification_method: str = "email",
        notification_email: Optional[str] = None,
        notification_phone: Optional[str] = None
    ):
        self.id = id
        self.user_id = user_id
        self.name = name
        self.email = email
        self.created_at = created_at or datetime.now()
        
        # Contact Information
        self.phone = phone
        self.extension = extension
        
        # Availability Tracking
        self.status = status
        self.last_status_change = last_status_change
        self.max_concurrent_calls = max_concurrent_calls
        self.current_active_calls = current_active_calls
        
        # Scheduling
        self.working_hours = working_hours or {}
        self.timezone = timezone
        self.accepts_transfers = accepts_transfers
        self.accepts_callbacks = accepts_callbacks
        
        # Performance Metrics
        self.total_transfers_received = total_transfers_received
        self.total_callbacks_completed = total_callbacks_completed
        self.average_call_duration = average_call_duration
        self.conversion_rate = conversion_rate
        
        # Contact Preferences
        self.transfer_notification_method = transfer_notification_method
        self.callback_notification_method = callback_notification_method
        self.notification_email = notification_email or email
        self.notification_phone = notification_phone or phone

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "name": self.name,
            "email": self.email,
            "created_at": self.created_at,
            
            # Contact Information
            "phone": self.phone,
            "extension": self.extension,
            
            # Availability Tracking
            "status": self.status,
            "last_status_change": self.last_status_change,
            "max_concurrent_calls": self.max_concurrent_calls,
            "current_active_calls": self.current_active_calls,
            
            # Scheduling
            "working_hours": self.working_hours,
            "timezone": self.timezone,
            "accepts_transfers": self.accepts_transfers,
            "accepts_callbacks": self.accepts_callbacks,
            
            # Performance Metrics
            "total_transfers_received": self.total_transfers_received,
            "total_callbacks_completed": self.total_callbacks_completed,
            "average_call_duration": self.average_call_duration,
            "conversion_rate": self.conversion_rate,
            
            # Contact Preferences
            "transfer_notification_method": self.transfer_notification_method,
            "callback_notification_method": self.callback_notification_method,
            "notification_email": self.notification_email,
            "notification_phone": self.notification_phone
        }

    @staticmethod
    def from_dict(source: dict, id: str):
        return HumanAgent(
            id=id,
            user_id=source.get("user_id"),
            name=source.get("name"),
            email=source.get("email"),
            created_at=source.get("created_at"),
            
            # Contact Information
            phone=source.get("phone"),
            extension=source.get("extension"),
            
            # Availability Tracking
            status=source.get("status", "offline"),
            last_status_change=source.get("last_status_change"),
            max_concurrent_calls=source.get("max_concurrent_calls", 1),
            current_active_calls=source.get("current_active_calls", 0),
            
            # Scheduling
            working_hours=source.get("working_hours"),
            timezone=source.get("timezone", "UTC"),
            accepts_transfers=source.get("accepts_transfers", True),
            accepts_callbacks=source.get("accepts_callbacks", True),
            
            # Performance Metrics
            total_transfers_received=source.get("total_transfers_received", 0),
            total_callbacks_completed=source.get("total_callbacks_completed", 0),
            average_call_duration=source.get("average_call_duration", 0.0),
            conversion_rate=source.get("conversion_rate", 0.0),
            
            # Contact Preferences
            transfer_notification_method=source.get("transfer_notification_method", "call"),
            callback_notification_method=source.get("callback_notification_method", "email"),
            notification_email=source.get("notification_email"),
            notification_phone=source.get("notification_phone")
        )
