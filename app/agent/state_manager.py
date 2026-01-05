# app/agent/state_manager.py

import uuid
from datetime import datetime


class ConversationState:
    """Ek single call/session ki state represent karta hai."""
    def __init__(self, caller_id: str, goal: str):
        self.session_id = str(uuid.uuid4())
        self.caller_id = caller_id
        self.goal = goal
        self.history = []        # [(user_text, ai_response)]
        self.created_at = datetime.utcnow()
        self.last_updated = datetime.utcnow()

    def add_turn(self, user_text: str, ai_response: str):
        """Ek naya turn add karta hai (user + AI response)."""
        self.history.append((user_text, ai_response))
        self.last_updated = datetime.utcnow()

    def get_summary(self):
        """Conversation ka short summary return karta hai."""
        summary = f"Goal: {self.goal}\nTotal turns: {len(self.history)}"
        return summary


class StateManager:
    """Multiple concurrent conversations handle karta hai."""
    def __init__(self):
        self.sessions = {}   # {caller_id: ConversationState}

    def start_session(self, caller_id: str, goal: str):
        if caller_id not in self.sessions:
            self.sessions[caller_id] = ConversationState(caller_id, goal)
        return self.sessions[caller_id]

    def update_session(self, caller_id: str, user_text: str, ai_response: str):
        if caller_id in self.sessions:
            self.sessions[caller_id].add_turn(user_text, ai_response)

    def get_session(self, caller_id: str):
        return self.sessions.get(caller_id)

    def end_session(self, caller_id: str):
        """Session complete hone par memory clean karo."""
        if caller_id in self.sessions:
            del self.sessions[caller_id]
