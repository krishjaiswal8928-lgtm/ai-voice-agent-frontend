import asyncio
import sys
import os

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.lead_caller import lead_caller_service
from app.database.session import SessionLocal

async def start_lead_caller():
    """Start the lead caller service for campaign 2"""
    print("Starting lead caller service for campaign 2...")
    
    # Create a database session
    db = SessionLocal()
    try:
        # Start the lead caller service for campaign 2
        await lead_caller_service.start_campaign_dialing(2, db)
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(start_lead_caller())