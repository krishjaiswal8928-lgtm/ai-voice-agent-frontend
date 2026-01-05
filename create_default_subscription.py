"""
Create a default subscription for a user to bypass usage limits during development
"""

from app.database.firestore import db
import sys

def create_default_subscription(user_id: str):
    """Create a default subscription with generous limits for development"""
    
    subscription_data = {
        "user_id": user_id,
        "tier": "ai_starter",  # Free tier
        "status": "active",
        "limits": {
            "ai_agents": 5,  # Allow 5 custom agents
            "rag_documents": 10,  # Allow 10 documents
            "phone_numbers": 2,  # Allow 2 phone numbers
            "voice_minutes": 100  # Allow 100 minutes of voice calls
        },
        "usage": {
            "ai_agents_used": 0,
            "rag_documents_used": 0,
            "phone_numbers_used": 0,
            "voice_minutes_used": 0
        }
    }
    
    # Create or update the subscription
    subscription_ref = db.collection('subscriptions').document(user_id)
    subscription_ref.set(subscription_data)
    
    print(f"✅ Created default subscription for user: {user_id}")
    print(f"   Tier: {subscription_data['tier']}")
    print(f"   Limits: {subscription_data['limits']}")
    print(f"   Usage: {subscription_data['usage']}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python create_default_subscription.py <user_id>")
        print("\nTo find your user_id:")
        print("1. Check the 'users' collection in Firestore")
        print("2. Or check your JWT token in browser localStorage")
        sys.exit(1)
    
    user_id = sys.argv[1]
    create_default_subscription(user_id)
