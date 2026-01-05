"""
LangGraph-based Autonomous Agent
Enhanced version of the autonomous agent with LangGraph capabilities
"""

from typing import Annotated, Sequence, TypedDict
import operator
from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
import uuid
from datetime import datetime, timedelta
import asyncio
import re
# Use the existing LLM service instead of creating a new one
from app.services.llm_service import generate_response
from app.services.outbound_service import make_outbound_call
# Import the callback scheduler
from app.services.callback_scheduler import callback_scheduler

# Define the agent state
class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    goal: str
    context: str
    next_action: str
    scheduled_callbacks: list
    is_completed: bool
    phone_number: str  # Add phone number to state

# Define node functions
def planner_node(state: AgentState) -> AgentState:
    """Plan the next steps based on conversation history"""
    # Get the last few messages for context
    recent_messages = state["messages"][-3:] if len(state["messages"]) > 3 else state["messages"]
    
    # Simple rule-based planner instead of LLM-based
    last_message = state["messages"][-1].content.lower() if state["messages"] else ""
    
    if "call me back" in last_message or "callback" in last_message or "remind me" in last_message:
        next_action = "schedule_callback"
    elif "goodbye" in last_message or "thank you" in last_message or "that's all" in last_message:
        next_action = "end_conversation"
    else:
        next_action = "continue_conversation"
    
    return {"next_action": next_action}

def conversation_node(state: AgentState) -> AgentState:
    """Continue the conversation"""
    # Get the last user message
    user_message = ""
    for msg in reversed(state["messages"]):
        if isinstance(msg, HumanMessage):
            user_message = msg.content
            break
    
    # Generate a response using the existing LLM service
    history = [{"role": msg.type, "content": msg.content} for msg in state["messages"]]
    try:
        response = generate_response(user_message, state["goal"], history, state["context"])
    except Exception as e:
        # Fallback response if LLM fails
        response = "I understand. How can I help you further?"
    
    return {"messages": [AIMessage(content=response)]}

async def callback_scheduler_node(state: AgentState) -> AgentState:
    """Schedule a callback"""
    # Extract scheduling information from the conversation
    last_message = state["messages"][-1].content if state["messages"] else ""
    
    # Extract callback time using regex patterns
    delay_minutes = 60  # Default to 1 hour
    
    # Look for time expressions in the message
    time_patterns = [
        (r"(\d+)\s*hour", 60),  # X hours
        (r"(\d+)\s*hr", 60),    # X hr
        (r"(\d+)\s*minute", 1), # X minutes
        (r"(\d+)\s*min", 1),    # X min
    ]
    
    for pattern, multiplier in time_patterns:
        match = re.search(pattern, last_message, re.IGNORECASE)
        if match:
            try:
                delay_minutes = int(match.group(1)) * multiplier
                break
            except:
                pass
    
    # Schedule the callback
    phone_number = state.get("phone_number", "+1234567890")  # Default placeholder
    
    callback_id = await callback_scheduler.schedule_callback(
        phone_number=phone_number,
        delay_minutes=delay_minutes,
        context=state["context"],
        campaign_id=None  # Would be extracted from context in real implementation
    )
    
    # Add the callback to the scheduled callbacks list
    scheduled_callback = {
        "callback_id": callback_id,
        "time": f"{delay_minutes} minutes",
        "scheduled_at": datetime.now().isoformat(),
        "status": "scheduled"
    }
    
    return {
        "scheduled_callbacks": state["scheduled_callbacks"] + [scheduled_callback],
        "messages": [AIMessage(content=f"I'll call you back in {delay_minutes} minutes.")]
    }

def end_node(state: AgentState) -> AgentState:
    """End the conversation"""
    return {"is_completed": True, "messages": [AIMessage(content="Thank you for your time. Have a great day!")]}

# Define edges
def route_after_planning(state: AgentState) -> str:
    """Route based on the planner's decision"""
    if state["next_action"] == "schedule_callback":
        return "schedule_callback"
    elif state["next_action"] == "end_conversation":
        return "end_conversation"
    else:
        return "continue_conversation"

# Create the graph
def create_langgraph_agent():
    """Create the LangGraph agent"""
    # Initialize the graph
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("planner", planner_node)
    workflow.add_node("conversation", conversation_node)
    workflow.add_node("schedule_callback", callback_scheduler_node)
    workflow.add_node("end_conversation", end_node)
    
    # Add edges
    workflow.add_edge("conversation", END)  # Changed from planner to END to avoid recursion
    workflow.add_edge("schedule_callback", END)  # Changed from planner to END to avoid recursion
    
    # Add conditional edges from planner
    workflow.add_conditional_edges(
        "planner",
        route_after_planning,
        {
            "continue_conversation": "conversation",
            "schedule_callback": "schedule_callback",
            "end_conversation": "end_conversation"
        }
    )
    
    # Set entry point
    workflow.set_entry_point("planner")
    
    # Add edge from end node to finish
    workflow.add_edge("end_conversation", END)
    
    # Compile the graph
    app = workflow.compile()
    
    return app

# Agent class that uses the LangGraph
class LangGraphAgent:
    """LangGraph-based autonomous agent"""
    
    def __init__(self, session_id: str = None, phone_number: str = None):
        self.session_id = session_id or str(uuid.uuid4())
        self.phone_number = phone_number
        self.graph = create_langgraph_agent()
        self.state = {
            "messages": [],
            "goal": "",
            "context": "",
            "next_action": "continue_conversation",
            "scheduled_callbacks": [],
            "is_completed": False,
            "phone_number": phone_number or "+1234567890"
        }
    
    async def initialize(self, goal: str, context: str = ""):
        """Initialize the agent with a goal and context"""
        self.state["goal"] = goal
        self.state["context"] = context
    
    async def process_message(self, user_message: str) -> str:
        """Process a user message and return the agent's response"""
        # Add the user message to the state
        self.state["messages"].append(HumanMessage(content=user_message))
        
        # Run the graph with a recursion limit
        config = {"recursion_limit": 10}
        final_state = await self.graph.ainvoke(self.state, config)
        
        # Update the internal state
        self.state = final_state
        
        # Return the last AI message
        for msg in reversed(final_state["messages"]):
            if isinstance(msg, AIMessage):
                return msg.content
        
        return "I'm not sure how to respond to that."
    
    def is_conversation_complete(self) -> bool:
        """Check if the conversation is complete"""
        return self.state["is_completed"]
    
    def get_scheduled_callbacks(self) -> list:
        """Get the list of scheduled callbacks"""
        return self.state["scheduled_callbacks"]
    
    async def process_user_input(self, user_input: str) -> str:
        """Process user input and return AI response - compatible with orchestrator"""
        return await self.process_message(user_input)

# Example usage
if __name__ == "__main__":
    # This is just for demonstration purposes
    async def main():
        agent = LangGraphAgent()
        await agent.initialize("Schedule a product demo", "We are selling AI-powered communication systems")
        
        response = await agent.process_message("Hello, I'm interested in your product but I'm busy now. Can you call me back in 30 minutes?")
        print(f"Agent: {response}")
        
        print(f"Scheduled callbacks: {agent.get_scheduled_callbacks()}")
        print(f"Conversation complete: {agent.is_conversation_complete()}")
    
    asyncio.run(main())