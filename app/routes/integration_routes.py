from fastapi import APIRouter, Depends, HTTPException, status, Request
from google.cloud import firestore
from typing import List

from app.dependencies import get_db
from app.core.security import get_current_user
from app.schemas.integration import (
    IntegrationResponse,
    IntegrationCreate,
    IntegrationUpdate,
    ProviderPhoneNumber,
    PhoneNumberImportRequest,
    PhoneNumberImportResponse
)
from app.services.integration_service import integration_service
from app.services.phone_number_service import phone_number_service
from app.schemas.phone_number import VirtualPhoneNumberCreate
import os

router = APIRouter(prefix="/integrations", tags=["Integrations"])

@router.get("", response_model=List[IntegrationResponse])
async def get_integrations(
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all integrations for the current user."""
    integrations = integration_service.get_integrations(db, current_user["user_id"])
    # Convert to response models (without credentials)
    return [
        IntegrationResponse(
            id=integration.id,
            provider=integration.provider,
            status=integration.status,
            connected_at=integration.connected_at,
            last_synced=integration.last_synced,
            metadata=integration.metadata,
            created_at=integration.created_at
        )
        for integration in integrations
    ]

@router.post("", response_model=IntegrationResponse)
async def create_integration(
    integration_data: IntegrationCreate,
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Connect a new provider integration."""
    try:
        integration = integration_service.create_integration(
            db, integration_data, current_user["user_id"]
        )
        return IntegrationResponse(
            id=integration.id,
            provider=integration.provider,
            status=integration.status,
            connected_at=integration.connected_at,
            last_synced=integration.last_synced,
            metadata=integration.metadata,
            created_at=integration.created_at
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{integration_id}", response_model=IntegrationResponse)
async def get_integration(
    integration_id: str,
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get a specific integration."""
    integration = integration_service.get_integration(db, integration_id)
    if not integration or integration.user_id != current_user["user_id"]:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    return IntegrationResponse(
        id=integration.id,
        provider=integration.provider,
        status=integration.status,
        connected_at=integration.connected_at,
        last_synced=integration.last_synced,
        metadata=integration.metadata,
        created_at=integration.created_at
    )

@router.delete("/{integration_id}")
async def delete_integration(
    integration_id: str,
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Disconnect an integration."""
    integration = integration_service.get_integration(db, integration_id)
    if not integration or integration.user_id != current_user["user_id"]:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    integration_service.delete_integration(db, integration_id)
    return {"message": "Integration disconnected successfully"}

@router.get("/{integration_id}/phone-numbers", response_model=List[ProviderPhoneNumber])
async def get_phone_numbers(
    integration_id: str,
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Fetch all phone numbers from the provider."""
    integration = integration_service.get_integration(db, integration_id)
    if not integration or integration.user_id != current_user["user_id"]:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    try:
        phone_numbers = integration_service.sync_phone_numbers(db, integration_id)
        return phone_numbers
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch phone numbers: {str(e)}")

@router.post("/{integration_id}/import", response_model=PhoneNumberImportResponse)
async def import_phone_number(
    integration_id: str,
    import_request: PhoneNumberImportRequest,
    request: Request,  # Added Request object
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Import a phone number from the integration."""
    integration = integration_service.get_integration(db, integration_id)
    if not integration or integration.user_id != current_user["user_id"]:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    try:
        # Sync phone numbers to get the details
        phone_numbers = integration_service.sync_phone_numbers(db, integration_id)
        
        # Find the requested phone number
        phone_data = next(
            (pn for pn in phone_numbers if pn['sid'] == import_request.phone_number_sid),
            None
        )
        
        if not phone_data:
            raise HTTPException(status_code=404, detail="Phone number not found in provider")
        
        if phone_data.get('imported'):
            raise HTTPException(status_code=400, detail="Phone number already imported")
        
        # Import the phone number using existing phone_number_service
        from app.services.phone_providers.factory import ProviderFactory
        
        # Create phone number with webhook configuration
        phone_number_create = VirtualPhoneNumberCreate(
            phone_number=phone_data['phone_number'],
            provider=integration.provider,
            credentials=integration.credentials,
            display_name=import_request.display_name or phone_data.get('friendly_name'),
            is_active=True
        )
        
        # Determine base URL for webhook
        # Use existing env var logic in service, but pass request.base_url as fallback/context
        webhook_base_url = str(request.base_url)
        
        # This will validate credentials and configure webhooks
        phone_number = phone_number_service.create_phone_number(
            db, phone_number_create, current_user["user_id"], webhook_base_url=webhook_base_url
        )
        
        # Update the phone number to link to integration
        db.collection("virtual_phone_numbers").document(phone_number.id).update({
            'integration_id': integration_id,
            'imported_via': 'integration'
        })
        
        # Assign agent if provided
        if import_request.agent_id:
            phone_number_service.assign_agent(db, phone_number.id, import_request.agent_id)
        
        return PhoneNumberImportResponse(
            phone_number_id=phone_number.id,
            phone_number=phone_number.phone_number,
            webhook_configured=True,
            assigned_agent_id=import_request.agent_id,
            message="Phone number imported and configured successfully"
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to import phone number: {str(e)}")
