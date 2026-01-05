"""
Fix/Verify Webhooks for All Users
==================================
This script checks and fixes webhook configuration for all imported phone numbers
using each user's own Twilio credentials from their integrations.
"""

import os
import sys
from dotenv import load_dotenv

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
load_dotenv()

from app.database.firestore import get_firestore_client
from app.services.integration_service import integration_service
from twilio.rest import Client

def fix_all_webhooks():
    print("\n" + "=" * 80)
    print("🔧 WEBHOOK VERIFICATION & FIX FOR ALL USERS")
    print("=" * 80 + "\n")
    
    db = get_firestore_client()
    ngrok_domain = os.getenv("NGROK_DOMAIN")
    
    if not ngrok_domain:
        print("❌ NGROK_DOMAIN not set in .env\n")
        return
    
    webhook_url = f"https://{ngrok_domain}/twilio/voice/webhook"
    status_callback_url = f"https://{ngrok_domain}/twilio/status"
    
    print(f"🎯 Target Webhook URL: {webhook_url}\n")
    
    # Get all integrations
    integrations_ref = db.collection('integrations')
    integrations = list(integrations_ref.stream())
    
    if not integrations:
        print("ℹ️  No integrations found. Users need to connect their Twilio accounts first.\n")
        return
    
    total_numbers = 0
    fixed_numbers = 0
    errors = 0
    
    for int_doc in integrations:
        int_data = int_doc.to_dict()
        integration_id = int_doc.id
        user_id = int_data.get('user_id')
        provider = int_data.get('provider')
        
        if provider != 'twilio':
            continue
        
        print(f"\n{'─' * 80}")
        print(f"👤 User ID: {user_id}")
        print(f"🔗 Integration ID: {integration_id}")
        
        # Get integration with decrypted credentials
        try:
            integration = integration_service.get_integration(db, integration_id)
        except Exception as e:
            print(f"   ❌ Error getting integration: {str(e)}")
            import traceback
            traceback.print_exc()
            continue
        
        if not integration:
            print(f"   ⚠️  Integration not found")
            continue
            
        if not integration.credentials:
            print(f"   ⚠️  No credentials in integration")
            print(f"   Debug: credentials type = {type(integration.credentials)}")
            print(f"   Debug: credentials value = {integration.credentials}")
            continue
        
        try:
            # Create Twilio client with user's credentials
            account_sid = integration.credentials.get('account_sid')
            auth_token = integration.credentials.get('auth_token')
            
            if not account_sid or not auth_token:
                print(f"   ❌ Missing Twilio credentials")
                continue
            
            client = Client(account_sid, auth_token)
            
            # Get phone numbers for this user
            phone_numbers_ref = db.collection('virtual_phone_numbers') \
                .where('user_id', '==', user_id) \
                .where('integration_id', '==', integration_id)
            
            user_numbers = list(phone_numbers_ref.stream())
            
            if not user_numbers:
                print(f"   ℹ️  No phone numbers imported via this integration")
                continue
            
            for phone_doc in user_numbers:
                phone_data = phone_doc.to_dict()
                phone_number = phone_data.get('phone_number')
                total_numbers += 1
                
                print(f"\n   📱 {phone_number}")
                
                try:
                    # Find the phone number in Twilio
                    twilio_numbers = client.incoming_phone_numbers.list(phone_number=phone_number)
                    
                    if not twilio_numbers:
                        print(f"      ❌ Number not found in Twilio account")
                        errors += 1
                        continue
                    
                    twilio_number = twilio_numbers[0]
                    current_webhook = twilio_number.voice_url
                    
                    print(f"      Current Webhook: {current_webhook or '(not set)'}")
                    
                    # Check if webhook needs updating
                    if current_webhook == webhook_url:
                        print(f"      ✅ Webhook already correct")
                    else:
                        # Update webhook
                        print(f"      🔧 Updating webhook...")
                        twilio_number.update(
                            voice_url=webhook_url,
                            voice_method='POST',
                            status_callback=status_callback_url,
                            status_callback_method='POST'
                        )
                        print(f"      ✅ Webhook updated successfully!")
                        fixed_numbers += 1
                    
                except Exception as e:
                    print(f"      ❌ Error: {str(e)}")
                    errors += 1
                    
        except Exception as e:
            print(f"   ❌ Error with integration: {str(e)}")
            errors += 1
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 SUMMARY")
    print("=" * 80)
    print(f"Total phone numbers checked: {total_numbers}")
    print(f"Webhooks fixed: {fixed_numbers}")
    print(f"Errors encountered: {errors}")
    print(f"Already correct: {total_numbers - fixed_numbers - errors}")
    print("\n" + "=" * 80 + "\n")

if __name__ == "__main__":
    fix_all_webhooks()
