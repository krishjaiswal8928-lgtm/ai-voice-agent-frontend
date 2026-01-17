from typing import List, Optional, Dict, Any
from google.cloud import firestore
from app.models.integration import Integration
from app.schemas.integration import IntegrationCreate, IntegrationUpdate
from app.services.phone_providers.factory import PhoneProviderFactory
from app.core.security import EncryptionManager
import json
import uuid
from datetime import datetime

class IntegrationService:
    def __init__(self):
        self.collection_name = "integrations"
    
    def _encrypt_credentials(self, credentials: Dict[str, Any], db: firestore.Client) -> str:
        """Encrypt provider credentials"""
        json_str = json.dumps(credentials)
        cipher = EncryptionManager.get_cipher(db)
        return cipher.encrypt(json_str.encode()).decode()
    
    def _decrypt_credentials(self, encrypted_data: str, db: firestore.Client) -> Dict[str, Any]:
        """Decrypt provider credentials"""
        if isinstance(encrypted_data, dict):
            return encrypted_data
        try:
            cipher = EncryptionManager.get_cipher(db)
            json_str = cipher.decrypt(encrypted_data.encode()).decode()
            return json.loads(json_str)
        except:
            return {}
    
    def get_integrations(self, db: firestore.Client, user_id: str) -> List[Integration]:
        """Get all integrations for a user"""
        docs = db.collection(self.collection_name).where("user_id", "==", user_id).stream()
        integrations = []
        for doc in docs:
            data = doc.to_dict()
            # Don't return credentials in list view
            data['credentials'] = {}
            integrations.append(Integration.from_dict(data))
        return integrations
    
    def get_integration(self, db: firestore.Client, integration_id: str) -> Optional[Integration]:
        """Get a specific integration"""
        doc = db.collection(self.collection_name).document(integration_id).get()
        if not doc.exists:
            return None
        data = doc.to_dict()
        # Decrypt credentials
        if 'credentials' in data and isinstance(data['credentials'], str):
            data['credentials'] = self._decrypt_credentials(data['credentials'], db)
        return Integration.from_dict(data)
    
    def create_integration(
        self, 
        db: firestore.Client, 
        integration_data: IntegrationCreate, 
        user_id: str
    ) -> Integration:
        """Create a new provider integration"""
        # 1. Validate credentials with provider
        provider = PhoneProviderFactory.get_provider(
            integration_data.provider, 
            integration_data.credentials
        )
        if not provider.validate_credentials():
            raise ValueError("Invalid provider credentials")
        
        # 2. Encrypt credentials
        encrypted_creds = self._encrypt_credentials(integration_data.credentials, db)
        
        # 3. Create integration model
        integration_id = str(uuid.uuid4())
        integration = Integration(
            id=integration_id,
            user_id=user_id,
            provider=integration_data.provider,
            credentials=encrypted_creds,
            status="connected",
            connected_at=datetime.utcnow(),
            last_synced=datetime.utcnow(),
            metadata={}
        )
        
        # 4. Save to database
        db.collection(self.collection_name).document(integration_id).set(
            integration.to_dict()
        )
        
        # Return with decrypted credentials for immediate use
        integration.credentials = integration_data.credentials
        return integration
    
    def update_integration(
        self, 
        db: firestore.Client, 
        integration_id: str, 
        update_data: IntegrationUpdate
    ) -> Optional[Integration]:
        """Update an integration"""
        doc_ref = db.collection(self.collection_name).document(integration_id)
        doc = doc_ref.get()
        if not doc.exists:
            return None
        
        updates = update_data.dict(exclude_unset=True)
        
        if 'credentials' in updates:
            # Re-validate if credentials changing
            current_data = doc.to_dict()
            provider_type = current_data.get('provider')
            provider = PhoneProviderFactory.get_provider(provider_type, updates['credentials'])
            if not provider.validate_credentials():
                raise ValueError("Invalid provider credentials")
            updates['credentials'] = self._encrypt_credentials(updates['credentials'], db)
        
        updates['updated_at'] = datetime.utcnow()
        doc_ref.update(updates)
        
        return self.get_integration(db, integration_id)
    
    def delete_integration(self, db: firestore.Client, integration_id: str) -> bool:
        """Delete an integration"""
        db.collection(self.collection_name).document(integration_id).delete()
        return True
    
    def sync_phone_numbers(
        self, 
        db: firestore.Client, 
        integration_id: str
    ) -> List[Dict[str, Any]]:
        """Fetch phone numbers from provider"""
        integration = self.get_integration(db, integration_id)
        if not integration:
            raise ValueError("Integration not found")
        
        # Get provider instance
        provider = PhoneProviderFactory.get_provider(
            integration.provider, 
            integration.credentials
        )
        
        # Fetch phone numbers from provider
        phone_numbers = provider.list_phone_numbers()
        
        # Check which are already imported
        imported_numbers = {}
        phone_docs = db.collection("virtual_phone_numbers")\
            .where("user_id", "==", integration.user_id)\
            .where("integration_id", "==", integration_id).stream()
        
        for doc in phone_docs:
            data = doc.to_dict()
            imported_numbers[data['phone_number']] = {
                'id': doc.id,
                'assigned_agents': data.get('assigned_agents', [])
            }
        
        # Enrich phone numbers with import status
        result = []
        for pn in phone_numbers:
            phone_num = pn.get('phone_number')
            imported_data = imported_numbers.get(phone_num, {})
            
            result.append({
                'sid': pn.get('sid'),
                'phone_number': phone_num,
                'friendly_name': pn.get('friendly_name'),
                'capabilities': pn.get('capabilities', {}),
                'imported': phone_num in imported_numbers,
                'phone_number_id': imported_data.get('id'),
                'assigned_agent_id': imported_data.get('assigned_agents', [None])[0]
            })
        
        # Update last synced
        db.collection(self.collection_name).document(integration_id).update({
            'last_synced': datetime.utcnow(),
            'metadata.phone_numbers_count': len(result)
        })
        
        return result

# Singleton instance
integration_service = IntegrationService()
