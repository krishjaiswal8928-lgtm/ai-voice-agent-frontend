"""
Agent Executor Module
Executes actions planned by the agent
"""

import logging
from typing import Optional, Dict, Any
from app.models.action import (
    Action, ActionResult, ActionType,
    SpeakAction, ListenAction, RetrieveInfoAction,
    RememberAction, ScheduleCallbackAction, AskClarificationAction,
    EndConversationAction, LearnAction
)
from app.services.llm_service import generate_response
from app.services.tts_service import synthesize_speech_with_provider
from app.models.custom_agent import CustomAgent

# Make RAG import optional to prevent server startup failures
try:
    from app.services.retriever_service import get_relevant_context
    RAG_AVAILABLE = True
except ImportError as e:
    logger_temp = logging.getLogger(__name__)
    logger_temp.warning(f"RAG service not available: {e}")
    RAG_AVAILABLE = False
    get_relevant_context = None

logger = logging.getLogger(__name__)


class AgentExecutor:
    """
    Executes individual actions from conversation plans
    """
    
    def __init__(self, custom_agent: CustomAgent):
        self.config = custom_agent
        self.personality = custom_agent.personality
        self.tone = custom_agent.tone
        self.response_style = custom_agent.response_style
        self.system_prompt = custom_agent.system_prompt or ""
        self.company_name = custom_agent.company_name or "our company"
        
    async def execute_action(
        self,
        action: Action,
        context: Dict[str, Any]
    ) -> ActionResult:
        """
        Execute a single action
        
        Args:
            action: The action to execute
            context: Current conversation context
            
        Returns:
            ActionResult with output and metadata
        """
        logger.info(f"Executing action: {action.type}")
        
        try:
            if action.type == ActionType.SPEAK:
                return await self._execute_speak(action, context)
            
            elif action.type == ActionType.LISTEN:
                return await self._execute_listen(action, context)
            
            elif action.type == ActionType.RETRIEVE_INFO:
                return await self._execute_retrieve_info(action, context)
            
            elif action.type == ActionType.REMEMBER:
                return await self._execute_remember(action, context)
            
            elif action.type == ActionType.SCHEDULE_CALLBACK:
                return await self._execute_schedule_callback(action, context)
            
            elif action.type == ActionType.ASK_CLARIFICATION:
                return await self._execute_ask_clarification(action, context)
            
            elif action.type == ActionType.END_CONVERSATION:
                return await self._execute_end_conversation(action, context)
            
            elif action.type == ActionType.LEARN:
                return await self._execute_learn(action, context)
            
            else:
                return ActionResult(
                    action=action,
                    success=False,
                    error=f"Unknown action type: {action.type}"
                )
                
        except Exception as e:
            logger.error(f"Error executing action {action.type}: {e}")
            return ActionResult(
                action=action,
                success=False,
                error=str(e)
            )
    
    async def _execute_speak(
        self,
        action: Action,
        context: Dict[str, Any]
    ) -> ActionResult:
        """Execute SPEAK action - generate and return spoken text"""
        
        # Cast to specific action type
        speak_action = action if isinstance(action, SpeakAction) else SpeakAction(**action.dict())
        
        # Get the text to speak
        text = speak_action.content
        
        if not text:
            # If no content provided, generate response based on context
            # Enhance context with clear indication it's from knowledge base
            rag_context = context.get("rag_context", "")
            enhanced_context = f"Knowledge Base Context:\n{rag_context}" if rag_context else ""
            
            text = await self._generate_response(
                user_input=context.get("last_user_input", ""),
                context_data=enhanced_context,
                history=context.get("history", [])
            )
        
        # Generate TTS audio with provider validation
        tts_provider = speak_action.tts_provider or "cartesia"
        # Validate the provider
        from app.services.tts_service import validate_tts_provider
        tts_provider = validate_tts_provider(tts_provider)
        try:
            audio_bytes = await synthesize_speech_with_provider(tts_provider, text)
            
            return ActionResult(
                action=speak_action,
                success=True,
                output={
                    "text": text,
                    "audio": audio_bytes
                },
                requires_user_input=False
            )
        except Exception as e:
            logger.error(f"TTS failed: {e}")
            # Return text-only result
            return ActionResult(
                action=speak_action,
                success=True,
                output={"text": text, "audio": None},
                requires_user_input=False
            )
    
    async def _execute_listen(
        self,
        action: Action,
        context: Dict[str, Any]
    ) -> ActionResult:
        """Execute LISTEN action - wait for user input"""
        
        # Cast to specific action type
        listen_action = action if isinstance(action, ListenAction) else ListenAction(**action.dict())
        
        # LISTEN actions are passive - they signal to wait for user
        return ActionResult(
            action=listen_action,
            success=True,
            output={"waiting_for": listen_action.expected_input},
            requires_user_input=True
        )
    
    async def _execute_retrieve_info(
        self,
        action: Action,
        context: Dict[str,Any]
    ) -> ActionResult:
        """Execute RETRIEVE_INFO action - get info from RAG/knowledge base"""
        
        # Check if RAG is available
        if not RAG_AVAILABLE or get_relevant_context is None:
            logger.warning("RAG service not available, skipping retrieval")
            return ActionResult(
                action=action,
                success=False,
                error="RAG service not available"
            )
        
        try:
            # Get relevant context from vector DB
            campaign_id = context.get("campaign_id")
            namespace = action.namespace or context.get("namespace")
            
            if campaign_id:
                # Use the retriever service
                relevant_docs = get_relevant_context(
                    query=action.query,
                    campaign_id=campaign_id,
                    limit=action.limit
                )
                
                return ActionResult(
                    action=action,
                    success=True,
                    output={"documents": relevant_docs},
                    requires_user_input=False,
                    metadata={"source": "rag", "count": len(relevant_docs) if relevant_docs else 0}
                )
            else:
                return ActionResult(
                    action=action,
                    success=False,
                    error="No campaign_id provided for RAG retrieval"
                )
                
        except Exception as e:
            logger.error(f"RAG retrieval failed: {e}")
            return ActionResult(
                action=action,
                success=False,
                error=str(e)
            )
    
    async def _execute_remember(
        self,
        action: Action,
        context: Dict[str, Any]
    ) -> ActionResult:
        """Execute REMEMBER action - store in agent memory"""
        
        # This will be implemented with AgentMemory in Phase 2
        # For now, just acknowledge
        logger.info(f"Memory action: {action.content} (importance: {action.importance})")
        
        return ActionResult(
            action=action,
            success=True,
            output={"stored": action.content},
            requires_user_input=False,
            metadata={"importance": action.importance, "type": action.memory_type}
        )
    
    async def _execute_schedule_callback(
        self,
        action: Action,
        context: Dict[str, Any]
    ) -> ActionResult:
        """Execute SCHEDULE_CALLBACK action"""
        
        # This will integrate with callback scheduler service
        phone_number = action.phone_number or context.get("phone_number")
        
        if not phone_number:
            return ActionResult(
                action=action,
                success=False,
                error="No phone number provided for callback"
            )
        
        # TODO: Integrate with actual callback scheduler
        logger.info(f"Callback scheduled for {phone_number} in {action.delay_minutes} minutes")
        
        return ActionResult(
            action=action,
            success=True,
            output={
                "scheduled": True,
                "delay_minutes": action.delay_minutes,
                "phone_number": phone_number
            },
            requires_user_input=False
        )
    
    async def _execute_ask_clarification(
        self,
        action: Action,
        context: Dict[str, Any]
    ) -> ActionResult:
        """Execute ASK_CLARIFICATION action"""
        
        # Cast to specific action type
        ask_action = action if isinstance(action, AskClarificationAction) else AskClarificationAction(**action.dict())
        
        # This is essentially a specialized SPEAK + LISTEN
        try:
            # Use validated provider
            from app.services.tts_service import validate_tts_provider
            tts_provider = validate_tts_provider("cartesia")
            tts_audio = await synthesize_speech_with_provider(tts_provider, ask_action.question)
            
            return ActionResult(
                action=ask_action,
                success=True,
                output={
                    "text": ask_action.question,
                    "audio": tts_audio
                },
                requires_user_input=True,
                metadata={"seeking": ask_action.expected_info}
            )
        except Exception as e:
            return ActionResult(
                action=ask_action,
                success=True,
                output={"text": ask_action.question, "audio": None},
                requires_user_input=True
            )
    
    async def _execute_end_conversation(
        self,
        action: Action,
        context: Dict[str, Any]
    ) -> ActionResult:
        """Execute END_CONVERSATION action"""
        
        final_message = action.final_message or "Thank you for your time. Goodbye!"
        
        try:
            # Use validated provider
            from app.services.tts_service import validate_tts_provider
            tts_provider = validate_tts_provider("cartesia")
            tts_audio = await synthesize_speech_with_provider(tts_provider, final_message)
            
            return ActionResult(
                action=action,
                success=True,
                output={
                    "text": final_message,
                    "audio": tts_audio,
                    "conversation_ended": True
                },
                requires_user_input=False,
                metadata={"reason": action.reason}
            )
        except Exception as e:
            return ActionResult(
                action=action,
                success=True,
                output={"text": final_message, "audio": None, "conversation_ended": True},
                requires_user_input=False
            )
    
    async def _execute_learn(
        self,
        action: Action,
        context: Dict[str, Any]
    ) -> ActionResult:
        """Execute LEARN action - record learning insight"""
        
        # This will be implemented with AgentLearner in Phase 2
        logger.info(f"Learning action: pattern={action.pattern}, outcome={action.outcome}, success={action.success}")
        
        return ActionResult(
            action=action,
            success=True,
            output={"learned": True},
            requires_user_input=False,
            metadata={"pattern": action.pattern, "success": action.success}
        )
    
    async def _generate_response(
        self,
        user_input: str,
        context_data: str = "",
        history: list = None
    ) -> str:
        """Generate LLM response when action doesn't have content"""
        
        if history is None:
            history = []
        
        try:
            response = generate_response(
                transcript=user_input,
                goal=self.config.primary_goal or "Answer customer questions",
                history=history,
                context=context_data,
                personality=self.personality,
                company_name=self.company_name
            )
            return response
        except Exception as e:
            logger.error(f"LLM generation failed: {e}")
            return "I apologize, I'm having trouble processing that. Could you please repeat?"