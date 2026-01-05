"""
Enhanced Autonomous Agent Module
Integrates planning, execution, and learning based on Custom Agent configuration
"""

import asyncio
import uuid
import logging
from typing import Optional, Dict, Any, List, AsyncGenerator
from app.models.custom_agent import CustomAgent
from app.models.action import Action, ActionResult, ConversationPlan, SpeakAction, ListenAction
from app.agent.autonomous.planner import AgentPlanner
from app.agent.autonomous.executor import AgentExecutor

logger = logging.getLogger(__name__)


class AutonomousAgent:
    """
    Enhanced autonomous agent with planning, execution, and learning capabilities
    Configured via CustomAgent model
    """
    
    def __init__(self, custom_agent: CustomAgent):
        """
        Initialize autonomous agent with custom configuration
        
        Args:
            custom_agent: CustomAgent instance with personality, goals, and capabilities
        """
        self.config = custom_agent
        self.agent_id = custom_agent.id
        self.session_id = str(uuid.uuid4())
        
        # Initialize components based on capabilities
        self.planner = None
        self.executor = None
        self.learner = None
        self.memory = None
        
        if custom_agent.enable_planning:
            self.planner = AgentPlanner(custom_agent)
        
        # Executor is always needed
        self.executor = AgentExecutor(custom_agent)
        
        # Learning and Memory will be added in Phase 2
        if custom_agent.enable_learning:
            logger.info(f"Learning enabled for agent {custom_agent.name} (Phase 2)")
            # self.learner = AgentLearner(custom_agent)
        
        if custom_agent.enable_memory:
            logger.info(f"Memory enabled for agent {custom_agent.name} (Phase 2)")
            # self.memory = AgentMemory(custom_agent)
        
        # State management
        self.current_plan: Optional[ConversationPlan] = None
        self.current_context: Dict[str, Any] = {}
        self.conversation_history: List[Dict] = []
        self.is_initialized =False
        
        logger.info(f"Initialized AutonomousAgent: {custom_agent.name}")
    
    async def process_user_input_stream(self, user_text: str, context: str = "", history: List[Dict[str, str]] = None) -> AsyncGenerator[str, None]:
        """
        Process user input and yield streaming response tokens.
        Skips complex planning to ensure low latency.
        """
        if history is None:
            history = self.conversation_history
        
        # Update context
        self.current_context.update({
            "last_user_input": user_text,
            "rag_context": context,
            "history": history
        })
        
        # Add user message to history (Ensure we update the passed list reference)
        history.append({
            "role": "user",
            "content": user_text
        })
        
        # --- Streaming Logic ---
        from app.services.llm_service import generate_response_stream
        
        full_response = ""
        
        try:
            # Call streaming service
            async for token in generate_response_stream(
                transcript=user_text,
                goal=self.config.primary_goal or "Answer customer questions",
                history=history,
                context=context,
                personality=self.config.personality,
                company_name=self.config.company_name or "our company",
                system_prompt=self.config.system_prompt or "",
                agent_name=self.config.name or "Assistant"
            ):
                full_response += token
                yield token
                
            # After stream finishes, save full response to history
            history.append({
                "role": "assistant",
                "content": full_response
            })
            
        except Exception as e:
            logger.error(f"Error in agent stream: {e}")
            error_msg = "I apologize, I encountered an error."
            yield error_msg
            self.conversation_history.append({"role": "assistant", "content": error_msg})

    async def process_user_input(
        self,
        user_text: str,
        context: str = "",
        history: List[Dict] = None
    ) -> str:
        """
        Main entry point for processing user input
        
        Args:
            user_text: User's input text
            context: Additional context (RAG, etc.)
            history: Conversation history
            
        Returns:
            Agent's text response
        """
        if history is None:
            history = self.conversation_history
        
        # Update context
        self.current_context.update({
            "last_user_input": user_text,
            "rag_context": context,
            "history": history
        })
        
        # Log context usage for debugging
        if context and context.strip():
            logger.info(f"Using RAG context with {len(context)} characters")
        else:
            logger.info("No RAG context available for this interaction")
        
        # Add user message to history
        self.conversation_history.append({
            "role": "user",
            "content": user_text
        })
        
        # FAST TRACK: Skip planning for simple inputs or greetings to reduce latency
        # Only use planner for complex queries (heuristic: > 8 words)
        is_complex = len(user_text.split()) > 8
        
        # Initialize plan only if essential
        if (is_complex or not self.current_plan) and self.planner and is_complex:
            goal = self.config.primary_goal or "Answer customer questions"
            logger.info("Complex input detected, creating plan...")
            self.current_plan = await self.planner.create_plan(
                goal=goal,
                context=context,
                history=history
            )
            logger.info(f"Created new plan with {len(self.current_plan.actions)} actions")
        elif not self.current_plan:
            # For simple inputs, skip planning and just execute direct response
            logger.info("Simple input detected, skipping plan for speed")
            response_text = await self._generate_direct_response()
            
            # Add assistant response to history
            self.conversation_history.append({
                "role": "assistant",
                "content": response_text
            })
            return response_text
        
        # Execute current action or generate response
        response_text = await self._execute_next_action()
        
        # Add assistant response to history
        self.conversation_history.append({
            "role": "assistant",
            "content": response_text
        })
        
        return response_text
    
    async def _execute_next_action(self) -> str:
        """Execute the next action in the plan"""
        
        # If we have a plan, execute next action
        if self.current_plan and not self.current_plan.is_complete():
            action = self.current_plan.get_current_action()
            
            if action:
                logger.info(f"Executing action: {action.type}")
                
                # Execute the action
                result = await self.executor.execute_action(action, self.current_context)
                
                if result.success:
                    # Move to next step
                    self.current_plan.advance_step()
                    
                    # Return text response if available
                    if isinstance(result.output, dict):
                        return result.output.get("text", "")
                    return str(result.output)
                else:
                    logger.error(f"Action failed: {result.error}")
                    return "I apologize, I encountered an issue. Could you please repeat that?"
        
        # Fallback: Generate response directly (no planning)
        return await self._generate_direct_response()
    
    async def _generate_direct_response(self) -> str:
        """Generate response without planning (fallback)"""
        
        from app.services.llm_service import generate_response
        
        user_input = self.current_context.get("last_user_input", "")
        context = self.current_context.get("rag_context", "")
        history = self.current_context.get("history", [])
        
        try:
            response = generate_response(
                transcript=user_input,
                goal=self.config.primary_goal or "Answer customer questions",
                history=history,
                context=context,
                personality=self.config.personality,
                company_name=self.config.company_name or "our company",
                system_prompt=self.config.system_prompt or "",
                agent_name=self.config.name or "Assistant"
            )
            return response
        except Exception as e:
            logger.error(f"Direct response generation failed: {e}")
            return "I'm sorry, I'm having trouble processing that. Could you please try again?"
    
    async def adapt_plan(self, new_context: str):
        """Adapt the current plan based on new information"""
        
        if self.planner and self.current_plan:
            self.current_plan = await self.planner.adapt_plan(
                current_plan=self.current_plan,
                new_context=new_context,
                history=self.conversation_history
            )
            logger.info("Plan adapted to new context")
    
    def get_progress(self) -> float:
        """Get progress towards goal (0.0 to 1.0)"""
        
        if self.current_plan:
            if self.planner:
                return self.planner.evaluate_progress(
                    self.current_plan,
                    self.conversation_history
                )
            return self.current_plan.progress
        
        return 0.0
    
    def is_goal_achieved(self) -> bool:
        """Check if the conversation goal has been achieved"""
        
        if self.current_plan:
            return self.current_plan.is_complete()
        
        # Heuristic: if we've had a good conversation
        return len(self.conversation_history) >= 4
    
    def get_stats(self) -> Dict[str, Any]:
        """Get agent statistics"""
        
        return {
            "agent_id": self.agent_id,
            "agent_name": self.config.name,
            "session_id": self.session_id,
            "messages_exchanged": len(self.conversation_history),
            "plan_progress": self.get_progress(),
            "goal_achieved": self.is_goal_achieved(),
            "capabilities": {
                "planning": self.config.enable_planning,
                "learning": self.config.enable_learning,
                "memory": self.config.enable_memory,
                "workflows": self.config.enable_workflows
            }
        }


# Factory function for creating agents
def create_agent(custom_agent: CustomAgent) -> AutonomousAgent:
    """
    Factory function to create an autonomous agent
    
    Args:
        custom_agent: CustomAgent configuration
        
    Returns:
        Initialized AutonomousAgent
    """
    return AutonomousAgent(custom_agent)


# Legacy support - keep old signature for backward compatibility
_legacy_agents: Dict[str, AutonomousAgent] = {}

def create_agent_legacy(session_id: Optional[str] = None) -> AutonomousAgent:
    """
    Legacy method for creating agents without CustomAgent
    Creates a default agent configuration
    """
    from app.models.custom_agent import CustomAgent
    
    default_config = CustomAgent(
        user_id="system",
        name="Default Agent",
        description="Default autonomous agent",
        personality="professional",
        enable_planning=True,
        enable_learning=False,
        enable_memory=False
    )
    
    agent = AutonomousAgent(default_config)
    if session_id:
        _legacy_agents[session_id] = agent
    
    return agent


def get_agent(session_id: str) -> Optional[AutonomousAgent]:
    """Get an existing agent by session ID"""
    return _legacy_agents.get(session_id)