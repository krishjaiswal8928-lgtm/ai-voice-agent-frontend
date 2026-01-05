"""
Usage tracking middleware for enforcing tier limits
"""

from fastapi import Request, HTTPException
from app.database.firestore import db, firestore
import logging

logger = logging.getLogger(__name__)

async def track_voice_minutes(user_id: str, duration_seconds: int):
    """Track voice minutes used and check against limit"""
    subscription_ref = db.collection('subscriptions').document(user_id)
    subscription_doc = subscription_ref.get()
    
    if not subscription_doc.exists:
        logger.warning(f"No subscription found for user {user_id}")
        return
    
    subscription = subscription_doc.to_dict()
    limits = subscription.get('limits', {})
    usage = subscription.get('usage', {})
    
    # Calculate new usage
    minutes_used = usage.get('voice_minutes_used', 0)
    new_minutes = minutes_used + (duration_seconds / 60)
    
    # Update usage
    subscription_ref.update({
        'usage.voice_minutes_used': new_minutes,
        'usage.last_updated': firestore.SERVER_TIMESTAMP
    })
    
    # Check if limit exceeded
    voice_limit = limits.get('voice_minutes', 0)
    if voice_limit > 0 and new_minutes >= voice_limit:
        logger.warning(f"User {user_id} exceeded voice minutes limit: {new_minutes}/{voice_limit}")
        return {
            "limit_reached": True,
            "resource": "voice_minutes",
            "used": new_minutes,
            "limit": voice_limit
        }
    
    return {
        "limit_reached": False,
        "used": new_minutes,
        "limit": voice_limit
    }

async def check_resource_limit(user_id: str, resource: str) -> dict:
    """
    Check if user can create a new resource (agent, phone number, document, etc.)
    Returns: {"allowed": bool, "reason": str}
    """
    subscription_ref = db.collection('subscriptions').document(user_id)
    subscription_doc = subscription_ref.get()
    
    if not subscription_doc.exists:
        return {"allowed": False, "reason": "No subscription found"}
    
    subscription = subscription_doc.to_dict()
    limits = subscription.get('limits', {})
    usage = subscription.get('usage', {})
    
    # Map resource to limit key
    limit_key = resource
    usage_key = f"{resource}_used"
    
    limit_value = limits.get(limit_key, 0)
    used_value = usage.get(usage_key, 0)
    
    # Check if unlimited (-1)
    if limit_value == -1:
        return {"allowed": True, "reason": "unlimited"}
    
    # Check if limit reached
    if used_value >= limit_value:
        return {
            "allowed": False,
            "reason": f"Limit reached: {used_value}/{limit_value}",
            "upgrade_required": True
        }
    
    return {
        "allowed": True,
        "used": used_value,
        "limit": limit_value,
        "remaining": limit_value - used_value
    }

async def increment_resource_usage(user_id: str, resource: str):
    """Increment usage count for a resource"""
    subscription_ref = db.collection('subscriptions').document(user_id)
    usage_key = f"usage.{resource}_used"
    
    subscription_ref.update({
        usage_key: firestore.Increment(1),
        'usage.last_updated': firestore.SERVER_TIMESTAMP
    })

async def decrement_resource_usage(user_id: str, resource: str):
    """Decrement usage count for a resource (when deleted)"""
    subscription_ref = db.collection('subscriptions').document(user_id)
    usage_key = f"usage.{resource}_used"
    
    subscription_ref.update({
        usage_key: firestore.Increment(-1),
        'usage.last_updated': firestore.SERVER_TIMESTAMP
    })

async def check_voice_minutes_before_call(user_id: str) -> bool:
    """
    Check if user has voice minutes available before accepting a call
    Returns: True if call can proceed, False if limit reached
    """
    subscription_ref = db.collection('subscriptions').document(user_id)
    subscription_doc = subscription_ref.get()
    
    if not subscription_doc.exists:
        return False
    
    subscription = subscription_doc.to_dict()
    limits = subscription.get('limits', {})
    usage = subscription.get('usage', {})
    
    voice_limit = limits.get('voice_minutes', 0)
    minutes_used = usage.get('voice_minutes_used', 0)
    
    # If unlimited, allow
    if voice_limit == -1:
        return True
    
    # If limit reached, block
    if minutes_used >= voice_limit:
        logger.warning(f"Blocking call for user {user_id}: voice minutes limit reached ({minutes_used}/{voice_limit})")
        return False
    
    return True
