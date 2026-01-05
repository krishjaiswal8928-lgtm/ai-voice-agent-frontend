"""
Agent Planner Module  
Creates conversation plans to achieve specified goals
"""

import logging
from typing import List, Dict, Optional
from app.models.action import (
    Action, ConversationPlan, SpeakAction, ListenAction,
    RetrieveInfoAction, EndConversationAction, AskClarificationAction
)
from app.services.llm_service import generate_response
from app.models.custom_agent import CustomAgent

logger = logging.getLogger(__name__)


class AgentPlanner:
    """
    Creates and adapts conversation plans based on goals and context
    """
    
    def __init__(self, custom_agent: CustomAgent):
        self.config = custom_agent
        self.personality = custom_agent.personality
        self.max_steps = custom_agent.max_plan_steps
        
    async def create_plan(
        self,
        goal: str,
        context: str = "",
        history: List[Dict] = None
    ) -> ConversationPlan:
        """
        Create a conversation plan to achieve the goal
        
        Args:
            goal: The conversation goal to achieve
            context: Additional context (RAG, user info, etc.)
            history: Conversation history
            
        Returns:
            ConversationPlan with actions to achieve the goal
        """
        if history is None:
            history = []
            
        logger.info(f"Creating plan for goal: {goal}")
        
        # Build prompt for LLM to generate plan
        plan_prompt = self._build_planning_prompt(goal, context, history)
        
        try:
            # Use LLM to generate plan steps
            plan_text = generate_response(
                transcript=plan_prompt,
                goal="Create a step-by-step conversation plan",
                history=[],
                personality=self.personality
            )
            
            # Parse the plan into actions
            actions = self._parse_plan_to_actions(plan_text, goal, context)
            
            # Create conversation plan
            plan = ConversationPlan(
                goal=goal,
                success_criteria=self._extract_success_criteria(goal),
                actions=actions
            )
            
            logger.info(f"Created plan with {len(actions)} actions")
            return plan
            
        except Exception as e:
            logger.error(f"Error creating plan: {e}")
            # Fallback: create simple plan
            return self._create_fallback_plan(goal, context)
    
    async def adapt_plan(
        self,
        current_plan: ConversationPlan,
        new_context: str,
        history: List[Dict]
    ) -> ConversationPlan:
        """
        Adapt existing plan based on new context or user response
        
        Args:
            current_plan: Current conversation plan
            new_context: New context from user response
            history: Updated conversation history
            
        Returns:
            Updated ConversationPlan
        """
        logger.info(f"Adapting plan based on new context")
        
        # If plan is almost complete, don't adapt
        if current_plan.progress > 0.8:
            return current_plan
        
        # Check if we need to change course
        if self._needs_replan(current_plan, new_context, history):
            # Create new plan with updated context
            return await self.create_plan(
                goal=current_plan.goal,
                context=new_context,
                history=history
            )
        
        return current_plan
    
    def evaluate_progress(
        self,
        plan: ConversationPlan,
        history: List[Dict]
    ) -> float:
        """
        Evaluate progress towards goal
        
        Returns:
            Progress score from 0.0 to 1.0
        """
        if not history:
            return 0.0
        
        # Check if goal keywords appear in conversation
        goal_keywords = self._extract_keywords(plan.goal)
        conversation_text = " ".join([
            msg.get("content", "") for msg in history
        ]).lower()
        
        matches = sum(1 for keyword in goal_keywords if keyword in conversation_text)
        keyword_score = matches / len(goal_keywords) if goal_keywords else 0.0
        
        # Combine with plan progress
        plan_score = plan.progress
        
        # Weighted average
        return (plan_score * 0.6) + (keyword_score * 0.4)
    
    def _build_planning_prompt(
        self,
        goal: str,
        context: str,
        history: List[Dict]
    ) -> str:
        """Build prompt for LLM to generate conversation plan"""
        
        history_text = ""
        if history:
            history_text = "\\nConversation so far:\\n"
            for msg in history[-5:]:  # Last 5 messages
                role = msg.get("role", "unknown")
                content = msg.get("content", "")
                history_text += f"{role}: {content}\\n"
        
        # Enhance context presentation for better utilization
        context_text = f"\nKnowledge Base Context (USE THIS FOR ACCURATE INFORMATION):\n{context}" if context else ""
        
        prompt = f"""You are planning a conversation to achieve this goal: {goal}

{context_text}{history_text}

Create a step-by-step plan to achieve the goal. List 3-5 specific things the agent should say or do.
You must use this EXACT format:
1. SPEAK: "First sentence to say"
2. LISTEN: "Expected user response"
3. SPEAK: "Next sentence to say"

IMPORTANT:
- If the user input is a fragment (e.g., "Want to", "About you") or unclear, DO NOT end the conversation. Instead, Ask for clarification.
- Only END the conversation if the user explicitly says "bye", "thank you", "stop", or "done".

Example:
1. SPEAK: "Hello! Calling from GreenTech. Do you have a moment?"
2. LISTEN: "yes/no"
3. SPEAK: "Great, I wanted to discuss your solar panel interest."

Do NOT add any other text, descriptions, or [brackets]."""
        
        return prompt
    
    def _parse_plan_to_actions(
        self,
        plan_text: str,
        goal: str,
        context: str
    ) -> List[Action]:
        """
        Parse LLM output into Action objects
        
        Simple parser that creates SPEAK and LISTEN actions
        """
        actions = []
        lines = plan_text.strip().split("\\n")
        
        for line in lines:
            line = line.strip()
            if not line or not any(char.isdigit() for char in line[:3]):
                continue
            
            # Check for SPEAK: "content" format
            import re
            speak_match = re.search(r'SPEAK:\s*"([^"]+)"', line, re.IGNORECASE)
            listen_match = re.search(r'LISTEN:\s*"([^"]+)"', line, re.IGNORECASE)
            
            if speak_match:
                actions.append(SpeakAction(content=speak_match.group(1)))
            elif listen_match:
                actions.append(ListenAction(expected_input=listen_match.group(1)))
            else:
                # Fallback for old format or loose text
                # Remove numbering (1., 2., etc.)
                text = line.split(".", 1)[-1].strip()
                if not text:
                    continue
                
                # If it looks like a question, speak then listen
                if "?" in text:
                    actions.append(SpeakAction(content=text))
                    actions.append(ListenAction(expected_input="user answer"))
                else:
                    actions.append(SpeakAction(content=text))
        
        # Ensure we don't exceed max steps
        if len(actions) > self.max_steps:
            actions = actions[:self.max_steps]
        
        # Always end with END_CONVERSATION
        if not actions or actions[-1].type != "end_conversation":
            # If no actions or didn't end, just listen/speak, don't force end unless goal complete.
            # But the logic here was "Always end with END_CONVERSATION".
            # Changing to default to asking for clarification if the plan seems incomplete/short
            # or simply relying on the generated actions.
            
            # If absolutely no actions were parsed, we must add something.
            if not actions:
                actions.append(
                    SpeakAction(content="I didn't quite catch that. Could you please repeat?")
                )
                actions.append(ListenAction(expected_input="clarification"))
            
            # Note: We removed the forced EndConversationAction.
            # The agent should only end if the LLM explicitly plans it.
        
        return actions
    
    def _extract_success_criteria(self, goal: str) -> List[str]:
        """Extract success criteria from goal"""
        # Simple heuristic - look for key phrases
        criteria = []
        
        goal_lower = goal.lower()
        if "schedule" in goal_lower:
            criteria.append("Appointment scheduled")
        if "demo" in goal_lower:
            criteria.append("Demo booked")
        if "information" in goal_lower or "answer" in goal_lower:
            criteria.append("Information provided")
        if "qualify" in goal_lower:
            criteria.append("Lead qualified")
        
        if not criteria:
            criteria.append("Goal discussed with customer")
        
        return criteria
    
    def _create_fallback_plan(
        self,
        goal: str,
        context: str
    ) -> ConversationPlan:
        """Create simple fallback plan when LLM fails"""
        
        actions = [
            SpeakAction(
                content=f"I'd like to help you with {goal}. Can you tell me more about what you need?"
            ),
            ListenAction(expected_input="user needs"),
            SpeakAction(
                content="I understand. Let me help you with that."
            ),
            EndConversationAction(
                reason="fallback_plan",
                final_message="Thank you for your time!"
            )
        ]
        
        return ConversationPlan(
            goal=goal,
            success_criteria=self._extract_success_criteria(goal),
            actions=actions
        )
    
    def _needs_replan(
        self,
        plan: ConversationPlan,
        new_context: str,
        history: List[Dict]
    ) -> bool:
        """Determine if we need to create a new plan"""
        
        # Check for conversation derailment keywords
        derailment_keywords = [
            "not interested",
            "call back later",
            "wrong person",
            "busy now",
            "different topic"
        ]
        
        recent_text = ""
        if history:
            recent_text = " ".join([
                msg.get("content", "")
                for msg in history[-3:]
            ]).lower()
        
        for keyword in derailment_keywords:
            if keyword in recent_text:
                logger.info(f"Replanning due to: {keyword}")
                return True
        
        return False
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract important keywords from text"""
        # Simple keyword extraction
        words = text.lower().split()
        
        # Filter out stop words
        stop_words = {"the", "a", "an", "to", "of", "for", "with", "on", "in", "is", "and", "or"}
        keywords = [w for w in words if w not in stop_words and len(w) > 3]
        
        return keywords


# Keep old Planner class for backward compatibility
class Planner:
    """
    Legacy planner - kept for backward compatibility
    New code should use AgentPlanner instead
    """
    
    def __init__(self):
        self.system_prompt = """
        You are an AI planner for voice agents. Generate step-by-step plans.
        """
    
    async def create_plan(self, objective: str, context: str = "", history: List[Dict] = None) -> List[Dict]:
        """Legacy method - returns dict-based plan"""
        if history is None:
            history = []
        
        # Simple fallback plan
        return [
            {
                "action": "speak",
                "content": "Hello! How can I help you today?",
                "expected_response": "User's inquiry",
                "conditions": []
            },
            {
                "action": "listen",
                "content": "",
                "expected_response": "User's response",
                "conditions": []
            }
        ]