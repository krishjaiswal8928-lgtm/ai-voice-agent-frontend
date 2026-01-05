"""
Goal Parser Module
Extracts objectives and success criteria from user-defined goals
"""

from typing import Dict, Tuple, Optional
from app.services.llm_service import generate_response

class GoalParser:
    """Extract objective and success criteria from user-defined goal"""
    
    def __init__(self):
        self.system_prompt = """
        You are an AI assistant that parses user-defined goals for voice agents.
        Extract the main objective and measurable success criteria from the goal.
        
        Return ONLY a JSON object with this format:
        {
            "objective": "Clear statement of what the agent should accomplish",
            "success_criteria": "Specific, measurable conditions that define success"
        }
        
        Example:
        Input: "Book a demo appointment by collecting name, email, and preferred date"
        Output: {
            "objective": "Schedule a demo appointment",
            "success_criteria": "Successfully collect prospect's name, email address, and preferred date for demo"
        }
        """
    
    async def parse_goal(self, user_goal: str) -> Dict[str, str]:
        """
        Parse a user-defined goal into structured components
        
        Args:
            user_goal: Natural language description of the goal
            
        Returns:
            Dictionary with 'objective' and 'success_criteria' keys
        """
        if not user_goal or not user_goal.strip():
            return {
                "objective": "General customer service",
                "success_criteria": "Provide helpful responses to customer inquiries"
            }
        
        prompt = f"""
        Parse this goal into structured components:
        
        Goal: "{user_goal}"
        
        Respond ONLY with the required JSON format.
        """
        
        try:
            response = generate_response(
                prompt, 
                self.system_prompt,
                history=[]
            )
            
            # Simple parsing - in production, use proper JSON parsing
            if "objective" in response and "success_criteria" in response:
                # Extract content between quotes
                import re
                objective_match = re.search(r'"objective":\s*"([^"]*)"', response)
                criteria_match = re.search(r'"success_criteria":\s*"([^"]*)"', response)
                
                if objective_match and criteria_match:
                    return {
                        "objective": objective_match.group(1),
                        "success_criteria": criteria_match.group(1)
                    }
            
            # Fallback if parsing fails
            return {
                "objective": user_goal,
                "success_criteria": f"Successfully complete the goal: {user_goal}"
            }
            
        except Exception as e:
            print(f"Error parsing goal: {e}")
            return {
                "objective": user_goal,
                "success_criteria": f"Successfully complete the goal: {user_goal}"
            }