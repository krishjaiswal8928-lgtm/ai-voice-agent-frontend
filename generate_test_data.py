"""
Generate Test Data for Analytics and Scheduled Calls
This script creates sample data to test the Analytics dashboard and Scheduled Calls page.
"""

import asyncio
import sys
from datetime import datetime, timedelta
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

from app.database.firestore import get_firestore_client
from google.cloud.firestore_v1 import SERVER_TIMESTAMP
import random


async def generate_test_callbacks():
    """Generate test scheduled callbacks"""
    db = get_firestore_client()
    
    print(" Generating test scheduled callbacks...")
    
    # Sample data
    customers = [
        {"name": "John Smith", "phone": "+17087263069"},
        {"name": "Sarah Johnson", "phone": "+14155551234"},
        {"name": "Michael Brown", "phone": "+13105555678"},
        {"name": "Emily Davis", "phone": "+16505559012"},
        {"name": "David Wilson", "phone": "+19175553456"},
    ]
    
    agents = [
        {"id": "agent_001", "name": "AI Sales Agent"},
        {"id": "agent_002", "name": "AI Support Agent"},
    ]
    
    priorities = ["high", "medium", "low"]
    
    reasons = [
        "Customer showed strong interest in premium package",
        "Wants to discuss pricing and payment options",
        "Requested callback to speak with decision maker",
        "Interested but needs to check with team first",
        "Asked for more information about enterprise features",
    ]
    
    summaries = [
        "Customer is very interested in our product. They asked detailed questions about features and pricing. They want to discuss implementation timeline with their team before making a decision.",
        "Lead expressed strong buying intent. They're currently using a competitor but unhappy with service. Budget approved, just needs final approval from CEO.",
        "Potential high-value customer. They run a large operation and need our solution for 50+ users. Wants to schedule a demo with their technical team.",
        "Customer is in research phase. They're comparing multiple vendors and want to discuss our unique value proposition in detail.",
        "Warm lead. They attended our webinar last week and want to learn more about integration capabilities with their existing systems.",
    ]
    
    # Generate 5 scheduled callbacks
    scheduled_count = 0
    for i in range(5):
        customer = random.choice(customers)
        agent = random.choice(agents)
        priority = random.choice(priorities)
        reason = random.choice(reasons)
        summary = random.choice(summaries)
        
        # Schedule between tomorrow and 7 days from now
        days_ahead = random.randint(1, 7)
        hour = random.randint(9, 17)  # 9 AM to 5 PM
        scheduled_time = datetime.utcnow() + timedelta(days=days_ahead, hours=hour)
        
        callback_data = {
            "lead_id": f"test_lead_{i+1}",
            "lead_name": customer["name"],
            "lead_phone": customer["phone"],
            "campaign_id": "test_campaign_001",
            "scheduled_datetime": scheduled_time.isoformat() + "Z",
            "status": "scheduled",
            "priority": priority,
            "callback_reason": reason,
            "conversation_summary": summary,
            "assigned_to_agent_id": agent["id"],
            "assigned_to_agent_name": agent["name"],
            "created_at": datetime.utcnow().isoformat() + "Z",
            "created_by": "test_script",
        }
        
        # Add to Firestore
        doc_ref = db.collection("callbacks").document()
        doc_ref.set(callback_data)
        scheduled_count += 1
        print(f"   Created scheduled callback for {customer['name']} on {scheduled_time.strftime('%Y-%m-%d %H:%M')}")
    
    # Generate 3 completed callbacks
    completed_count = 0
    for i in range(3):
        customer = random.choice(customers)
        agent = random.choice(agents)
        
        # Completed in the past
        days_ago = random.randint(1, 7)
        completed_time = datetime.utcnow() - timedelta(days=days_ago)
        
        callback_data = {
            "lead_id": f"test_lead_completed_{i+1}",
            "lead_name": customer["name"],
            "lead_phone": customer["phone"],
            "campaign_id": "test_campaign_001",
            "scheduled_datetime": completed_time.isoformat() + "Z",
            "status": "completed",
            "priority": random.choice(priorities),
            "callback_reason": random.choice(reasons),
            "conversation_summary": random.choice(summaries),
            "assigned_to_agent_id": agent["id"],
            "assigned_to_agent_name": agent["name"],
            "completed_at": completed_time.isoformat() + "Z",
            "outcome": "successful",
            "notes": "Callback completed successfully",
            "created_at": (completed_time - timedelta(days=1)).isoformat() + "Z",
            "created_by": "test_script",
        }
        
        doc_ref = db.collection("callbacks").document()
        doc_ref.set(callback_data)
        completed_count += 1
        print(f"   Created completed callback for {customer['name']}")
    
    print(f"\n Generated {scheduled_count} scheduled callbacks and {completed_count} completed callbacks")
    return scheduled_count, completed_count


async def generate_test_analytics():
    """Generate test analytics data"""
    db = get_firestore_client()
    
    print("\n Generating test analytics data...")
    
    # Create test campaign
    campaign_data = {
        "name": "Q1 2026 Sales Campaign",
        "status": "active",
        "created_at": SERVER_TIMESTAMP,
        "total_leads": 100,
        "leads_called": 75,
        "leads_qualified": 35,
        "leads_transferred": 15,
        "leads_callback_scheduled": 10,
        "leads_not_interested": 20,
        "leads_no_answer": 10,
    }
    
    campaign_ref = db.collection("campaigns").document("test_campaign_001")
    campaign_ref.set(campaign_data)
    print("   Created test campaign with analytics data")
    
    # Create test leads with various statuses
    statuses = [
        ("qualified", 35),
        ("transferred", 15),
        ("callback_scheduled", 10),
        ("not_interested", 20),
        ("no_answer", 10),
        ("pending", 10),
    ]
    
    lead_count = 0
    for status, count in statuses:
        for i in range(count):
            lead_data = {
                "campaign_id": "test_campaign_001",
                "name": f"Test Lead {lead_count + 1}",
                "phone": f"+1555000{lead_count:04d}",
                "status": status,
                "created_at": SERVER_TIMESTAMP,
                "last_called": datetime.utcnow().isoformat() + "Z" if status != "pending" else None,
            }
            
            doc_ref = db.collection("leads").document()
            doc_ref.set(lead_data)
            lead_count += 1
    
    print(f"   Created {lead_count} test leads with various statuses")
    
    # Create test transfer records
    for i in range(15):
        transfer_data = {
            "campaign_id": "test_campaign_001",
            "lead_id": f"test_lead_{i+1}",
            "from_agent": "AI Sales Agent",
            "to_agent": "Human Sales Agent",
            "transfer_time": (datetime.utcnow() - timedelta(days=random.randint(1, 7))).isoformat() + "Z",
            "status": "completed",
            "duration": random.randint(120, 600),
        }
        
        doc_ref = db.collection("transfers").document()
        doc_ref.set(transfer_data)
    
    print("   Created 15 test transfer records")
    
    print("\n Test analytics data generated successfully!")


async def main():
    """Main function to generate all test data"""
    print("=" * 60)
    print("GENERATING TEST DATA FOR ANALYTICS & SCHEDULED CALLS")
    print("=" * 60)
    print()
    
    try:
        # Generate callbacks
        scheduled, completed = await generate_test_callbacks()
        
        # Generate analytics
        await generate_test_analytics()
        
        print()
        print("=" * 60)
        print("ALL TEST DATA GENERATED SUCCESSFULLY!")
        print("=" * 60)
        print()
        print("Summary:")
        print(f"  - Scheduled Callbacks: {scheduled}")
        print(f"  - Completed Callbacks: {completed}")
        print(f"  - Test Campaign: 1")
        print(f"  - Test Leads: 100")
        print(f"  - Test Transfers: 15")
        print()
        print("Next Steps:")
        print("  1. Visit: https://speaksynthai.com/scheduled-calls")
        print("  2. Visit: https://speaksynthai.com/analytics")
        print("  3. Verify data appears correctly")
        print()
        
    except Exception as e:
        print(f"\nError generating test data: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
