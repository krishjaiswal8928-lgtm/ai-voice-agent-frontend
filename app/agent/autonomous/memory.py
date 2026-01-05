"""
Memory Module
Manages goal state and conversation history for the autonomous agent
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
import json

class AutonomousMemory:
    """Manages goal state and conversation history"""
    
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.created_at = datetime.utcnow()
        self.objective = ""
        self.success_criteria = ""
        self.conversation_history: List[Dict[str, str]] = []
        self.plan: List[Dict[str, Any]] = []
        self.current_step_index = 0
        self.progress = 0
        self.achieved = False
        self.context = ""
        
    def set_goal(self, objective: str, success_criteria: str):
        """Set the current goal"""
        self.objective = objective
        self.success_criteria = success_criteria
    
    def set_context(self, context: str):
        """Set additional context (RAG data)"""
        self.context = context
    
    def add_to_history(self, role: str, content: str):
        """Add a message to conversation history"""
        self.conversation_history.append({
            "role": role,
            "content": content,
            "timestamp": datetime.utcnow().isoformat()
        })
    
    def get_recent_history(self, limit: int = 5) -> List[Dict[str, str]]:
        """Get recent conversation history"""
        return self.conversation_history[-limit:]
    
    def set_plan(self, plan: List[Dict[str, Any]]):
        """Set the current plan"""
        self.plan = plan
        self.current_step_index = 0
    
    def get_current_step(self) -> Optional[Dict[str, Any]]:
        """Get the current step in the plan"""
        if 0 <= self.current_step_index < len(self.plan):
            return self.plan[self.current_step_index]
        return None
    
    def advance_step(self):
        """Move to the next step in the plan"""
        if self.current_step_index < len(self.plan) - 1:
            self.current_step_index += 1
    
    def update_progress(self, progress: int, achieved: bool):
        """Update progress tracking"""
        self.progress = max(0, min(100, progress))
        self.achieved = achieved
    
    def is_completed(self) -> bool:
        """Check if the goal is completed"""
        return self.achieved or self.progress >= 100
    
    def get_state_summary(self) -> Dict[str, Any]:
        """Get a summary of the current state"""
        return {
            "session_id": self.session_id,
            "objective": self.objective,
            "progress": self.progress,
            "achieved": self.achieved,
            "steps_completed": self.current_step_index,
            "total_steps": len(self.plan),
            "history_length": len(self.conversation_history),
            "created_at": self.created_at.isoformat()
        }
    
    def serialize(self) -> str:
        """Serialize memory state to JSON string"""
        state = {
            "session_id": self.session_id,
            "created_at": self.created_at.isoformat(),
            "objective": self.objective,
            "success_criteria": self.success_criteria,
            "conversation_history": self.conversation_history,
            "plan": self.plan,
            "current_step_index": self.current_step_index,
            "progress": self.progress,
            "achieved": self.achieved,
            "context": self.context
        }
        return json.dumps(state)
    
    @classmethod
    def deserialize(cls, serialized: str) -> 'AutonomousMemory':
        """Deserialize memory state from JSON string"""
        data = json.loads(serialized)
        memory = cls(data["session_id"])
        memory.created_at = datetime.fromisoformat(data["created_at"])
        memory.objective = data["objective"]
        memory.success_criteria = data["success_criteria"]
        memory.conversation_history = data["conversation_history"]
        memory.plan = data["plan"]
        memory.current_step_index = data["current_step_index"]
        memory.progress = data["progress"]
        memory.achieved = data["achieved"]
        memory.context = data["context"]
        return memory