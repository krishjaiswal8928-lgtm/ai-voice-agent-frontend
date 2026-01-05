"""
Agent Action Models
Defines different action types that an autonomous agent can execute
"""

from enum import Enum
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from datetime import datetime


class ActionType(str, Enum):
    """Types of actions an agent can perform"""
    SPEAK = "speak"
    LISTEN = "listen"
    RETRIEVE_INFO = "retrieve_info"
    REMEMBER = "remember"
    SCHEDULE_CALLBACK = "schedule_callback"
    ASK_CLARIFICATION = "ask_clarification"
    END_CONVERSATION = "end_conversation"
    LEARN = "learn"


class Action(BaseModel):
    """Base action model"""
    type: ActionType
    content: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    priority: int = 1
    created_at: datetime = Field(default_factory=datetime.now)


class SpeakAction(Action):
    """Action to speak something to the user"""
    type: ActionType = ActionType.SPEAK
    content: str
    # TTS provider can be specified per action
    tts_provider: Optional[str] = None
    

class ListenAction(Action):
    """Action to listen for user input"""
    type: ActionType = ActionType.LISTEN
    expected_input: Optional[str] = None  # What we expect user to say
    timeout: int = 30  # Timeout in seconds


class RetrieveInfoAction(Action):
    """Action to retrieve information from knowledge base (RAG)"""
    type: ActionType = ActionType.RETRIEVE_INFO
    query: str
    namespace: Optional[str] = None  # Vector DB namespace
    limit: int = 5  # Number of documents to retrieve


class RememberAction(Action):
    """Action to store something in agent memory"""
    type: ActionType = ActionType.REMEMBER
    content: str
    importance: float = 0.5  # 0.0 to 1.0
    memory_type: str = "fact"  # fact, preference, context


class ScheduleCallbackAction(Action):
    """Action to schedule a callback"""
    type: ActionType = ActionType.SCHEDULE_CALLBACK
    delay_minutes: int
    phone_number: Optional[str] = None
    context: Optional[str] = None


class AskClarificationAction(Action):
    """Action to ask for clarification"""
    type: ActionType = ActionType.ASK_CLARIFICATION
    question: str
    expected_info: str  # What information we're trying to get


class EndConversationAction(Action):
    """Action to end the conversation"""
    type: ActionType = ActionType.END_CONVERSATION
    reason: str = "goal_achieved"
    final_message: Optional[str] = None


class LearnAction(Action):
    """Action to record a learning insight"""
    type: ActionType = ActionType.LEARN
    pattern: str
    outcome: str
    success: bool


class ActionResult(BaseModel):
    """Result of executing an action"""
    action: Action
    success: bool
    output: Optional[Any] = None
    error: Optional[str] = None
    requires_user_input: bool = False
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ConversationPlan(BaseModel):
    """A plan for achieving a conversation goal"""
    goal: str
    success_criteria: List[str]
    actions: List[Action] = Field(default_factory=list)
    current_step: int = 0
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    status: str = "active"  # active, completed, failed
    progress: float = 0.0  # 0.0 to 1.0
    
    def get_current_action(self) -> Optional[Action]:
        """Get the current action to execute"""
        if self.current_step < len(self.actions):
            return self.actions[self.current_step]
        return None
    
    def advance_step(self):
        """Move to the next step"""
        self.current_step += 1
        self.progress = self.current_step / len(self.actions) if self.actions else 0.0
        self.updated_at = datetime.now()
    
    def is_complete(self) -> bool:
        """Check if the plan is complete"""
        return self.current_step >= len(self.actions)
    
    def add_action(self, action: Action):
        """Add a new action to the plan"""
        self.actions.append(action)
        self.updated_at = datetime.now()
