"""
Evaluator Module
Measures progress toward goal completion
"""

from typing import Dict, List, Any, Tuple
from app.services.llm_service import generate_response

class Evaluator:
    """Evaluates progress toward goal completion"""

    def __init__(self):
        self.system_prompt = """
        You are an AI evaluator for voice agents. Assess conversation progress toward goals.
        
        Given:
        1. The original objective
        2. Success criteria
        3. Conversation history
        
        Determine:
        1. Progress percentage (0-100)
        2. Whether the goal is achieved
        3. Next steps needed
        
        Respond ONLY with JSON:
        {
            "progress": 0-100,
            "achieved": true/false,
            "next_steps": "brief description of what to do next"
        }
        """

    async def evaluate_progress(
        self,
        objective: str,
        success_criteria: str,
        history: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        """
        Evaluate progress toward goal completion

        Args:
            objective: The main objective
            success_criteria: Criteria for success
            history: Conversation history

        Returns:
            Evaluation results
        """
        # Build conversation history string
        conversation_history = ""
        for msg in history[-5:]:  # Last 5 exchanges
            role = "User" if msg.get("role") == "user" else "Assistant"
            conversation_history += f"{role}: {msg.get('content', '')}\n"

        prompt = f"""
        Objective: {objective}
        Success Criteria: {success_criteria}
        
        Recent Conversation:
        {conversation_history or 'No conversation yet'}
        
        Evaluate progress toward the objective.
        """

        try:
            response = generate_response(
                prompt,
                self.system_prompt,
                history=[]
            )

            # Simple parsing - in production, use proper JSON parsing
            progress = 0
            achieved = False
            next_steps = "Continue conversation"

            # Extract progress percentage
            import re
            progress_match = re.search(r'"progress"\s*:\s*(\d+)', response)
            if progress_match:
                progress = min(100, max(0, int(progress_match.group(1))))

            # Check if achieved
            achieved_match = re.search(r'"achieved"\s*:\s*(true|false)', response, re.IGNORECASE)
            if achieved_match:
                achieved = achieved_match.group(1).lower() == "true"

            # Extract next steps
            next_steps_match = re.search(r'"next_steps"\s*:\s*"([^"]*)"', response)
            if next_steps_match:
                next_steps = next_steps_match.group(1)

            return {
                "progress": progress,
                "achieved": achieved,
                "next_steps": next_steps
            }

        except Exception as e:
            print(f"Error in evaluation: {e}")
            # Conservative fallback
            return {
                "progress": 25 if len(history) > 0 else 0,
                "achieved": False,
                "next_steps": "Continue conversation"
            }

    def is_goal_achieved(self, evaluation: Dict[str, Any]) -> bool:
        """
        Check if goal is achieved based on evaluation

        Args:
            evaluation: Evaluation results

        Returns:
            True if goal is achieved
        """
        return evaluation.get("achieved", False)

    def get_progress_percentage(self, evaluation: Dict[str, Any]) -> int:
        """
        Get progress percentage from evaluation

        Args:
            evaluation: Evaluation results

        Returns:
            Progress percentage (0-100)
        """
        return evaluation.get("progress", 0)