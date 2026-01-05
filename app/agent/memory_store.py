import datetime

class MemoryStore:
    """
    Simple in memory store for short-term and long term recall.
    Future : Can be replaced with Redis or Langchain's VectorStore.
    """
    def __init__(self):
        self.store = {}

    def add_message(self, caller_id :str, text :str, role :str):
        """Add ek message memory me (user ya ai ka)"""
        if caller_id not in self.store:
            self.store[caller_id] = []
        self.store[caller_id].append({
            "text" : text,
            "role" : role,
            "timestamp" : datetime.datetime.utcnow().isoformat()
        })

    def get_history(self, caller_id:str):
        """ Pura conversation history return karta hai."""
        return self.store.get(caller_id, [])

    def get_recent_context(self, caller_id:str, limit :int = 3):
        """ Recent few message return karta hai - LLM ke liye"""
        if caller_id not in self.store:
            return []
        return self.store[caller_id][-limit:]

    def clear_memory(self, caller_id :str):
        """ Sessions aur hone par memory clean karta hai"""
        if caller_id in self.store:
            del self.store[caller_id]
            
    def clear_history(self, caller_id :str):
        """ Clear conversation history for a caller """
        if caller_id in self.store:
            del self.store[caller_id]