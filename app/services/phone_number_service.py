from typing import List, Optional, Dict, Any
from google.cloud import firestore
from app.models.phone_number import VirtualPhoneNumber
from app.schemas.phone_number import VirtualPhoneNumberCreate, VirtualPhoneNumberUpdate
from app.services.phone_providers.factory import PhoneProviderFactory
from cryptography.fernet import Fernet
import os
import json
import uuid

from app.core.security import EncryptionManager

class PhoneNumberService:
    def __init__(self):
        self.collection_name = "virtual_phone_numbers"

    def _encrypt_credentials(self, credentials: Dict[str, Any], db: firestore.Client) -> str:
        json_str = json.dumps(credentials)
        cipher = EncryptionManager.get_cipher(db)
        return cipher.encrypt(json_str.encode()).decode()

    def _decrypt_credentials(self, encrypted_data: str, db: firestore.Client) -> Dict[str, Any]:
        if isinstance(encrypted_data, dict):
            return encrypted_data # Already decrypted or not encrypted
        try:
            cipher = EncryptionManager.get_cipher(db)
            json_str = cipher.decrypt(encrypted_data.encode()).decode()
            return json.loads(json_str)
        except Exception as e:
            # print(f"Decryption failed: {e}")
            return {}

    def get_phone_numbers(self, db: firestore.Client, user_id: str) -> List[VirtualPhoneNumber]:
        docs = db.collection(self.collection_name).where("user_id", "==", user_id).stream()
        phone_numbers = []
        for doc in docs:
            data = doc.to_dict()
            # We don't return full credentials in list view for security
            if 'credentials' in data:
                data['credentials'] = {} 
            phone_numbers.append(VirtualPhoneNumber.from_dict(data))
        return phone_numbers

    def get_phone_number(self, db: firestore.Client, phone_id: str) -> Optional[VirtualPhoneNumber]:
        doc = db.collection(self.collection_name).document(phone_id).get()
        if not doc.exists:
            return None
        data = doc.to_dict()
        # Decrypt credentials for internal use, but be careful when returning to API
        if 'credentials' in data and isinstance(data['credentials'], str):
             data['credentials'] = self._decrypt_credentials(data['credentials'], db)
        return VirtualPhoneNumber.from_dict(data)

    def create_phone_number(self, db: firestore.Client, phone_data: VirtualPhoneNumberCreate, user_id: str, webhook_base_url: str = None) -> VirtualPhoneNumber:
        # 1. Validate credentials with provider
        provider = PhoneProviderFactory.get_provider(phone_data.provider, phone_data.credentials)
        if not provider.validate_credentials():
            raise ValueError("Invalid provider credentials")

        # 2. Configure webhook URLs for the phone number (Twilio only for now)
        if phone_data.provider.lower() == 'twilio':
            # Determine the domain: argument -> env var -> logging warning
            webhook_domain = None
            
            # Helper to clean domain
            from urllib.parse import urlparse
            def clean_domain(d):
                if not d: return None
                if not d.startswith(('http://', 'https://')):
                    d = f"https://{d}"
                return urlparse(d).netloc

            if webhook_base_url:
                webhook_domain = clean_domain(webhook_base_url)
            
            if not webhook_domain:
                webhook_domain = os.getenv("WEBHOOK_BASE_DOMAIN") or os.getenv("NGROK_DOMAIN")
                if webhook_domain:
                    webhook_domain = clean_domain(webhook_domain)

            if not webhook_domain:
                # Instead of failing, log a warning specifically about webhooks
                print("WARNING: WEBHOOK_BASE_DOMAIN not configured. Twilio webhook will NOT be auto-configured.")
            else:
                webhook_url = f"https://{webhook_domain}/twilio/voice/webhook"
                status_callback_url = f"https://{webhook_domain}/twilio/status"
                
                print(f"Configuring Twilio Webhook to: {webhook_url}")
                
                # Configure the webhook on Twilio's side
                webhook_configured = provider.configure_phone_number_webhook(
                    phone_data.phone_number, 
                    webhook_url, 
                    status_callback_url
                )
                
                if not webhook_configured:
                    print(f"WARNING: Failed to configure Twilio webhook for {phone_data.phone_number}")
                    # We don't raise error here to allow creation to proceed, but user should be notified
                    # In a real app, maybe add a 'configuration_status' field to the model
        
        # 3. Encrypt credentials
        encrypted_creds = self._encrypt_credentials(phone_data.credentials, db)
        
        # 4. Create model
        phone_id = str(uuid.uuid4())
        phone_number = VirtualPhoneNumber(
            id=phone_id,
            user_id=user_id,
            phone_number=phone_data.phone_number,
            provider=phone_data.provider,
            credentials=encrypted_creds, # Store encrypted
            display_name=phone_data.display_name,
            is_active=phone_data.is_active
        )
        
        # 5. Save to DB
        db.collection(self.collection_name).document(phone_id).set(phone_number.to_dict())
        
        # Return with decrypted credentials (or empty) for response
        phone_number.credentials = phone_data.credentials
        return phone_number

    def update_phone_number(self, db: firestore.Client, phone_id: str, update_data: VirtualPhoneNumberUpdate) -> Optional[VirtualPhoneNumber]:
        doc_ref = db.collection(self.collection_name).document(phone_id)
        doc = doc_ref.get()
        if not doc.exists:
            return None
            
        current_data = doc.to_dict()
        updates = update_data.dict(exclude_unset=True)
        
        if 'credentials' in updates:
            # Re-validate if credentials changing
            provider_type = updates.get('provider', current_data.get('provider'))
            provider = PhoneProviderFactory.get_provider(provider_type, updates['credentials'])
            if not provider.validate_credentials():
                raise ValueError("Invalid provider credentials")
            updates['credentials'] = self._encrypt_credentials(updates['credentials'], db)
            
        updates['updated_at'] = datetime.utcnow()
        
        doc_ref.update(updates)
        
        # Return updated object
        return self.get_phone_number(db, phone_id)

    def delete_phone_number(self, db: firestore.Client, phone_id: str) -> bool:
        db.collection(self.collection_name).document(phone_id).delete()
        return True

    def assign_agent(self, db: firestore.Client, phone_id: str, agent_id: str) -> bool:
        doc_ref = db.collection(self.collection_name).document(phone_id)
        doc = doc_ref.get()
        if not doc.exists:
            return False
            
        data = doc.to_dict()
        agents = data.get('assigned_agents', [])
        if agent_id not in agents:
            agents.append(agent_id)
            doc_ref.update({'assigned_agents': agents})
            
        return True

    def unassign_agent(self, db: firestore.Client, phone_id: str, agent_id: str) -> bool:
        doc_ref = db.collection(self.collection_name).document(phone_id)
        doc = doc_ref.get()
        if not doc.exists:
            return False
            
        data = doc.to_dict()
        agents = data.get('assigned_agents', [])
        if agent_id in agents:
            agents.remove(agent_id)
            doc_ref.update({'assigned_agents': agents})
            
        return True

phone_number_service = PhoneNumberService()
