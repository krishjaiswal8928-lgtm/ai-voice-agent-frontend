"""
Lead Caller Job
Background task for auto-dialing leads in campaigns
"""

import asyncio
from celery import Celery
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.lead_caller import lead_caller_service
from app.models.campaign import CallSession

# Initialize Celery
celery_app = Celery("lead_caller")
celery_app.config_from_object("app.config")

@celery_app.task
def start_campaign_dialing(campaign_id: int):
    """Start auto-dialing leads for a campaign"""
    db: Session = next(get_db())
    try:
        call_session = db.query(CallSession).filter(CallSession.id == campaign_id).first()
        if not call_session:
            print(f"Call session {campaign_id} not found")
            return
        
        if call_session.status != "active":
            print(f"Campaign {campaign_id} is not active")
            return
        
        # Run the dialing process
        asyncio.run(lead_caller_service.start_campaign_dialing(campaign_id, db))
        
    except Exception as e:
        print(f"Error in lead caller job: {e}")
    finally:
        db.close()

@celery_app.task
def stop_campaign_dialing(campaign_id: int):
    """Stop auto-dialing leads for a campaign"""
    lead_caller_service.stop_campaign_dialing(campaign_id)
    print(f"Stopped dialing for campaign {campaign_id}")
