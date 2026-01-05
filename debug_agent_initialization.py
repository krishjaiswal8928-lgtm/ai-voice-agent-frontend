import asyncio
import logging
from app.agent.orchestrator import _fetch_custom_agent, active_conversations
from app.models.custom_agent import CustomAgent

# Set up logging to see detailed output
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_agent_fetch():
    """Test fetching the custom agent that should be used for calls"""
    print("Testing agent fetch for ID: SPH5LutOqgiGQDEndx9x")
    
    # Test fetching the agent
    agent = await _fetch_custom_agent("SPH5LutOqgiGQDEndx9x")
    
    if agent:
        print(f"✅ Successfully fetched agent: {agent.name}")
        print(f"   ID: {agent.id}")
        print(f"   Personality: {agent.personality}")
        print(f"   Primary Goal: {agent.primary_goal}")
        print(f"   Enable Planning: {agent.enable_planning}")
        print(f"   Enable Learning: {agent.enable_learning}")
        print(f"   Enable Memory: {agent.enable_memory}")
    else:
        print("❌ Failed to fetch agent")
        
    # Test creating a conversation state
    print("\nTesting conversation state creation...")
    try:
        from app.agent.orchestrator import get_conversation_state_with_params
        state = get_conversation_state_with_params(
            call_sid="TEST_CALL_123",
            params={
                "campaign_id": "NnNVRlyGutorgtii7Yru",
                "custom_agent_id": "SPH5LutOqgiGQDEndx9x",
                "goal": "Try to sell our Marketing Services.",
                "phone_number": "+16692313371"
            }
        )
        print(f"✅ Created conversation state for call: {state.call_sid}")
        print(f"   Campaign ID: {state.campaign_id}")
        print(f"   Agent ID: {state.custom_agent_id}")
        print(f"   Goal: {state.goal}")
        print(f"   Phone Number: {state.phone_number}")
        
        # Try to initialize the autonomous agent
        if not state.autonomous_agent:
            print("\nTesting autonomous agent initialization...")
            custom_agent = await _fetch_custom_agent(state.custom_agent_id)
            if custom_agent:
                from app.agent.autonomous.agent import create_agent
                state.autonomous_agent = create_agent(custom_agent)
                print(f"✅ Initialized autonomous agent: {state.autonomous_agent.config.name}")
            else:
                print("❌ Failed to initialize autonomous agent - could not fetch custom agent")
        else:
            print(f"✅ Autonomous agent already initialized: {state.autonomous_agent.config.name}")
            
    except Exception as e:
        print(f"❌ Error creating conversation state: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_agent_fetch())