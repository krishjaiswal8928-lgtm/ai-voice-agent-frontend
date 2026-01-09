"""
Agent Tools Definitions
Defines the tools available to the AI agent for intelligent decision making
"""

from typing import List, Dict, Any
from pydantic import BaseModel, Field


class EndCallTool(BaseModel):
    """Tool for ending the call proactively"""
    name: str = "end_call"
    description: str = """
    End the call immediately when the lead is unqualified or conversation should end.
    Use this when:
    - Lead is a competitor in the same industry
    - Lead already has the product and shows no interest in switching
    - Lead explicitly states they are not interested
    - Lead is hostile, rude, or abusive
    - Lead has wrong demographics (too young, no income, wrong location, etc.)
    - Lead asks to be removed from calling list
    - Any scenario where continuing the conversation is unproductive or inappropriate
    
    Be strategic: Don't waste time on unqualified leads, but don't give up too easily on potential customers.
    """


class ScheduleCallbackTool(BaseModel):
    """Tool for scheduling a callback"""
    name: str = "schedule_callback"
    description: str = """
    Schedule a callback for later when timing is bad but lead shows potential interest.
    Use this when:
    - Lead is busy, driving, or in a meeting
    - Lead asks to be called back at a specific time
    - Lead is interested but needs time to think
    - Bad timing but lead is not hostile
    
    This preserves the opportunity while respecting the lead's time.
    """


class ContinueConversationTool(BaseModel):
    """Tool for continuing the conversation"""
    name: str = "continue_conversation"
    description: str = """
    Continue the conversation normally with an appropriate response.
    Use this when:
    - Lead is engaged and asking questions
    - Lead shows interest or curiosity
    - Opportunity exists to pitch benefits or answer objections
    - Building rapport and relationship
    - Lead hasn't given clear rejection signals
    
    This is the default action when the conversation is productive.
    """


class TransferToHumanTool(BaseModel):
    """Tool for transferring to human agent"""
    name: str = "transfer_to_human"
    description: str = """
    Transfer the call to a human agent.
    Use this when:
    - Lead has complex questions beyond your knowledge
    - Lead explicitly requests to speak with a human
    - Situation requires human judgment or authority
    - Technical issues or complaints that need escalation
    
    Use sparingly - only when truly necessary.
    """


# Tool definitions for OpenAI function calling
AGENT_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "end_call",
            "description": "End the call immediately when lead is unqualified or conversation should end. Use when lead is competitor, not interested, already has product, wrong demographics, hostile, or any unproductive scenario.",
            "parameters": {
                "type": "object",
                "properties": {
                    "reason": {
                        "type": "string",
                        "enum": [
                            "competitor",
                            "not_interested", 
                            "already_has_product",
                            "wrong_demographics",
                            "hostile",
                            "do_not_call_request",
                            "other"
                        ],
                        "description": "The specific reason why the call is being ended"
                    },
                    "final_message": {
                        "type": "string",
                        "description": "A polite, professional goodbye message to say before hanging up. Should be respectful and brief."
                    },
                    "lead_classification": {
                        "type": "string",
                        "enum": [
                            "unqualified",
                            "competitor", 
                            "existing_customer",
                            "not_interested",
                            "do_not_call"
                        ],
                        "description": "Classification label for the lead database to track why this lead didn't convert"
                    }
                },
                "required": ["reason", "final_message", "lead_classification"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "schedule_callback",
            "description": "Schedule a callback for later when timing is bad but lead might be interested. Use when lead is busy, driving, or asks to be called back.",
            "parameters": {
                "type": "object",
                "properties": {
                    "delay_minutes": {
                        "type": "integer",
                        "description": "Number of minutes to wait before calling back. Common values: 60 (1 hour), 240 (4 hours), 1440 (1 day)",
                        "minimum": 30,
                        "maximum": 10080
                    },
                    "reason": {
                        "type": "string",
                        "description": "Why the callback is being scheduled (e.g., 'Lead is driving', 'Lead requested call back in evening')"
                    },
                    "confirmation_message": {
                        "type": "string",
                        "description": "Message to confirm the callback with the lead before ending current call"
                    }
                },
                "required": ["delay_minutes", "reason", "confirmation_message"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "continue_conversation",
            "description": "Continue the conversation normally with an appropriate response. Use when lead is engaged, asking questions, or conversation is productive.",
            "parameters": {
                "type": "object",
                "properties": {
                    "strategy": {
                        "type": "string",
                        "enum": [
                            "pitch_benefits",
                            "answer_questions",
                            "build_rapport",
                            "handle_objection",
                            "ask_qualifying_questions"
                        ],
                        "description": "The conversation strategy to employ in the response"
                    },
                    "response": {
                        "type": "string",
                        "description": "What to say to the lead. Should be natural, conversational, and aligned with the chosen strategy."
                    }
                },
                "required": ["strategy", "response"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "transfer_to_human",
            "description": "Transfer the call to a human agent. Use only when lead has complex questions, explicitly requests human, or situation requires human judgment.",
            "parameters": {
                "type": "object",
                "properties": {
                    "reason": {
                        "type": "string",
                        "description": "Why the transfer is needed"
                    },
                    "transfer_message": {
                        "type": "string",
                        "description": "Message to say before transferring (e.g., 'Let me connect you with a specialist who can help you better')"
                    },
                    "urgency": {
                        "type": "string",
                        "enum": ["low", "medium", "high"],
                        "description": "Priority level for the transfer"
                    }
                },
                "required": ["reason", "transfer_message", "urgency"]
            }
        }
    }
]


def get_tool_by_name(tool_name: str) -> Dict[str, Any]:
    """Get tool definition by name"""
    for tool in AGENT_TOOLS:
        if tool["function"]["name"] == tool_name:
            return tool
    return None
