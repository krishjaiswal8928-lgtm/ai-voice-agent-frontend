from fastapi import APIRouter, Depends, HTTPException, status
from app.database.firestore import db, firestore
from app.core.security import get_current_user
from datetime import datetime, timedelta
from typing import Optional

router = APIRouter(prefix="/pricing", tags=["Pricing"])

# Tier Configuration
TIER_CONFIG = {
    "free": {
        "name": "Free Trial",
        "price": 0,
        "trial_days": 14,
        "limits": {
            "voice_minutes": 60,
            "ai_agents": 2,
            "phone_numbers": 1,
            "documents": 1,
            "websites": 1,
            "outbound_calls": 0,
            "recording_enabled": False,
            "analytics_tier": "basic"
        }
    },
    "starter": {
        "name": "Starter",
        "price": 1700,
        "limits": {
            "voice_minutes": 500,
            "ai_agents": 4,
            "phone_numbers": 1,
            "documents": 10,
            "websites": 3,
            "outbound_calls": 0,
            "recording_enabled": True,
            "analytics_tier": "basic"
        }
    },
    "growth": {
        "name": "Growth",
        "price": 7500,
        "limits": {
            "voice_minutes": 2500,
            "ai_agents": 7,
            "phone_numbers": 3,
            "documents": 50,
            "websites": 10,
            "outbound_calls": 10,  # per hour
            "recording_enabled": True,
            "analytics_tier": "advanced"
        }
    },
    "pro": {
        "name": "Pro",
        "price": 30000,
        "limits": {
            "voice_minutes": 10000,
            "ai_agents": 15,
            "phone_numbers": 10,
            "documents": 200,
            "websites": 30,
            "outbound_calls": 100,
            "recording_enabled": True,
            "analytics_tier": "premium"
        }
    },
    "enterprise": {
        "name": "Enterprise",
        "price": "custom",
        "limits": {
            "voice_minutes": -1,  # unlimited
            "ai_agents": -1,
            "phone_numbers": -1,
            "documents": -1,
            "websites": -1,
            "outbound_calls": -1,
            "recording_enabled": True,
            "analytics_tier": "enterprise"
        }
    }
}

@router.get("/plans")
async def get_pricing_plans():
    """Get all available pricing plans"""
    return {
        "plans": TIER_CONFIG,
        "currency": "INR"
    }

@router.get("/current")
async def get_current_subscription(user = Depends(get_current_user)):
    """Get user's current subscription and usage"""
    user_id = user['user_id']
    
    subscription_ref = db.collection('subscriptions').document(user_id)
    subscription_doc = subscription_ref.get()
    
    if not subscription_doc.exists:
        # Create free trial for new users
        subscription = await create_free_trial(user_id)
        return subscription
    
    subscription_data = subscription_doc.to_dict()
    
    # Check if trial expired
    if subscription_data['plan'] == 'free':
        trial_end = subscription_data.get('trial_end')
        if trial_end and trial_end.timestamp() < datetime.now().timestamp():
            subscription_data['trial_expired'] = True
            subscription_data['status'] = 'expired'
    
    return subscription_data

@router.post("/select-plan")
async def select_plan(
    plan: str,
    user = Depends(get_current_user)
):
    """Select a pricing plan"""
    if plan not in TIER_CONFIG:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    if plan == "enterprise":
        return {"message": "Please contact sales for enterprise plan"}
    
    user_id = user['user_id']
    subscription_ref = db.collection('subscriptions').document(user_id)
    
    # Update subscription
    subscription_ref.set({
        'plan': plan,
        'status': 'active',
        'limits': TIER_CONFIG[plan]['limits'],
        'subscription_start': firestore.SERVER_TIMESTAMP,
        'updated_at': firestore.SERVER_TIMESTAMP
    }, merge=True)
    
    # Reset usage for new billing cycle
    subscription_ref.set({
        'usage': {
            'voice_minutes_used': 0,
            'ai_agents_used': 0,
            'phone_numbers_used': 0,
            'documents_used': 0,
            'websites_used': 0,
            'last_reset': firestore.SERVER_TIMESTAMP
        }
    }, merge=True)
    
    return {"message": f"Successfully upgraded to {TIER_CONFIG[plan]['name']} plan"}

@router.get("/usage")
async def get_usage_stats(user = Depends(get_current_user)):
    """Get current usage statistics"""
    user_id = user['user_id']
    
    subscription_ref = db.collection('subscriptions').document(user_id)
    subscription_doc = subscription_ref.get()
    
    if not subscription_doc.exists:
        return {
            "usage": {},
            "limits": {},
            "warnings": []
        }
    
    data = subscription_doc.to_dict()
    usage = data.get('usage', {})
    limits = data.get('limits', {})
    
    # Calculate warnings
    warnings = []
    for key in ['voice_minutes', 'ai_agents', 'phone_numbers', 'documents']:
        used_key = f'{key}_used'
        limit_value = limits.get(key, 0)
        
        if limit_value > 0:  # Skip unlimited (-1)
            used_value = usage.get(used_key, 0)
            percentage = (used_value / limit_value) * 100
            
            if percentage >= 100:
                warnings.append({
                    "type": "limit_reached",
                    "resource": key,
                    "message": f"You've reached your {key.replace('_', ' ')} limit"
                })
            elif percentage >= 80:
                warnings.append({
                    "type": "approaching_limit",
                    "resource": key,
                    "message": f"You've used {percentage:.0f}% of your {key.replace('_', ' ')}"
                })
    
    return {
        "usage": usage,
        "limits": limits,
        "warnings": warnings,
        "plan": data.get('plan', 'free')
    }

async def create_free_trial(user_id: str):
    """Create a 14-day free trial subscription"""
    trial_start = datetime.now()
    trial_end = trial_start + timedelta(days=14)
    
    subscription = {
        'plan': 'free',
        'status': 'trial',
        'trial_start': trial_start,
        'trial_end': trial_end,
        'limits': TIER_CONFIG['free']['limits'],
        'usage': {
            'voice_minutes_used': 0,
            'ai_agents_used': 0,
            'phone_numbers_used': 0,
            'documents_used': 0,
            'websites_used': 0
        },
        'created_at': firestore.SERVER_TIMESTAMP
    }
    
    db.collection('subscriptions').document(user_id).set(subscription)
    
    # Convert datetime to dict for JSON
    subscription['trial_start'] = trial_start.isoformat()
    subscription['trial_end'] = trial_end.isoformat()
    
    return subscription
