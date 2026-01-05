from app.services.llm_service import generate_response

# --- Define goal templates ----
GOAL_PROMPTS = {
    "sales" : "You are a friendly sales assistant. Help the user explore product options and guide toward purchase.",
    "feedback" : "You are a polite feedback collector. Ask short, specific questions to collect customer feedback ",
    "filtering" : "You are a smart lead filter. Ask questions to check if user qualifies for service or product",
}

class GoalAgent:
    def __init__(self, goal_type : str):
        self.goal_type = goal_type
        self.context = [] # stores past conversation

    def add_message(self, role :str,content : str):
        """Stores messages between user and AI."""
        self.context.append({"role" : role, "content" : content})

    def get_context(self):
        """Returns conversation context."""
        return self.context[-5:]

    def decide_next_action(self, user_input:str):
        """Core logic : decides AI response based on goal."""
        self.add_message("user", user_input)

        # Add goal prompt for LLM:
        prompt = f"{GOAL_PROMPTS[self.goal_type]}\n\nConversation :\n{self.get_context()}\nUser: {user_input}\n Assistant :"

        ai_response = generate_response(prompt, self.goal_type)
        self.add_message("assistant", ai_response)
        return ai_response


