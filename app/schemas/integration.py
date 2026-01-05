from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

# Request Schemas
class IntegrationCreate(BaseModel):
    """Schema for creating a new integration"""
    provider: str = Field(..., description="Provider name: twilio, exotel, plivo")
    credentials: Dict[str, str] = Field(..., description="Provider-specific credentials")
    
    class Config:
        json_schema_extra = {
            "example": {
                "provider": "twilio",
                "credentials": {
                    "account_sid": "AC1234567890abcdef",
                    "auth_token": "your_auth_token_here"
                }
            }
        }

class IntegrationUpdate(BaseModel):
    """Schema for updating integration"""
    credentials: Optional[Dict[str, str]] = None
    status: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

# Response Schemas
class IntegrationResponse(BaseModel):
    """Schema for integration response (without sensitive data)"""
    id: str
    provider: str
    status: str
    connected_at: Optional[datetime]
    last_synced: Optional[datetime]
    metadata: Dict[str, Any] = {}
    created_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "int-123abc",
                "provider": "twilio",
                "status": "connected",
                "connected_at": "2025-12-28T10:00:00Z",
                "metadata": {
                    "account_name": "My Business Account",
                    "phone_numbers_count": 5
                }
            }
        }

class ProviderPhoneNumber(BaseModel):
    """Schema for phone number from provider"""
    sid: str = Field(..., description="Provider's phone number SID/ID")
    phone_number: str = Field(..., description="Phone number in E.164 format")
    friendly_name: Optional[str] = Field(None, description="User-friendly name")
    capabilities: Dict[str, bool] = Field(default_factory=dict, description="Voice, SMS capabilities")
    imported: bool = Field(False, description="Whether already imported to our system")
    assigned_agent_id: Optional[str] = Field(None, description="ID of assigned agent if imported")
    
    class Config:
        json_schema_extra = {
            "example": {
                "sid": "PN1234567890abcdef",
                "phone_number": "+16692313371",
                "friendly_name": "My Business Line",
                "capabilities": {
                    "voice": True,
                    "sms": True
                },
                "imported": False
            }
        }

class PhoneNumberImportRequest(BaseModel):
    """Schema for importing a phone number from integration"""
    phone_number_sid: str = Field(..., description="Provider's phone number SID")
    agent_id: Optional[str] = Field(None, description="Agent to assign to this number")
    display_name: Optional[str] = Field(None, description="Custom display name")
    
class PhoneNumberImportResponse(BaseModel):
    """Schema for phone number import response"""
    phone_number_id: str
    phone_number: str
    webhook_configured: bool
    assigned_agent_id: Optional[str]
    message: str
