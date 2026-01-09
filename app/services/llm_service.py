# app/services/llm_service.py
"""
LLM Service with support for multiple providers
"""

import os
import time
import logging
from huggingface_hub import InferenceClient
from dotenv import load_dotenv
from typing import List, Dict, Optional, AsyncGenerator

load_dotenv()

logger = logging.getLogger(__name__)

# API Keys
HF_TOKEN = os.getenv("HF_TOKEN")

# Initialize Deepseek-v3 client
deepseek_v3_client = None

def get_deepseek_client():
    global deepseek_v3_client
    if not deepseek_v3_client and HF_TOKEN:
        try:
            from huggingface_hub import InferenceClient
            deepseek_v3_client = InferenceClient(
                model="deepseek-ai/DeepSeek-V3",
                token=HF_TOKEN
            )
            logger.info("✅ Deepseek-V3 (Hugging Face) initialized lazily")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Deepseek-V3: {e}")
            return None
    return deepseek_v3_client

async def generate_response_stream(transcript: str, goal: str, history: Optional[List[Dict[str, str]]] = None, context: str = "", personality: str = "professional", company_name: str = "", system_prompt: str = "", agent_name: str = "") -> AsyncGenerator[str, None]:
    """
    Generate AI response from user transcript with streaming using Deepseek-V3
    """
    if not transcript or not transcript.strip():
        yield "Hello! I'm here to help you. How can I assist you today?"
        return

    if history is None:
        history = []

    # Build full conversation
    conversation = ""
    for msg in history:
        if isinstance(msg, dict) and "role" in msg and "content" in msg:
            role = "Customer" if msg["role"] == "user" else "Assistant"
            content = msg.get("content", msg.get("text", ""))
            if content and content.strip():
                conversation += f"{role}: {content}\n"
    conversation += f"Customer: {transcript}\nAssistant:"

    # Enhanced language detection with explicit request detection
    def detect_language_preference(text, hist):
        # Check for explicit Hindi requests
        hindi_triggers = ['hindi', 'हिंदी', 'hindi mein', 'speak hindi', 'in hindi', 'hindi me bolo', 'हिंदी में बोलो']
        if any(trigger in text.lower() for trigger in hindi_triggers):
            return 'hindi'
        
        # Check for Hindi script
        if any('\u0900' <= ch <= '\u097F' for ch in text):
            return 'hindi'
        
        # Check recent history for language preference
        for msg in hist[-2:] if hist else []:
            msg_text = msg.get('content', '') if isinstance(msg, dict) else ''
            if any('\u0900' <= ch <= '\u097F' for ch in msg_text):
                return 'hindi'
        
        return 'english'
    
    language = detect_language_preference(transcript, history)
    
    if language == 'hindi':
        language_instruction = (
            "IMPORTANT: User wants Hindi/Hinglish. "
            "Respond in Hinglish (Hindi-English mix) or pure Hindi. "
            "हिंदी या Hinglish में जवाब दें। "
            "Use Devanagari script where appropriate."
        )
    else:
        language_instruction = "Respond in English."

    # Personality-based instructions
    personality_instructions = {
        "professional": (
            "You are a world-class professional communicator with decades of experience in high-stakes business meetings, "
            "executive conversations, and corporate negotiations. You speak with absolute clarity, confidence, and authority. "
            "You use precise language, avoid filler words, and structure your thoughts logically. "
            "You have studied and mastered every major book on professional communication — from 'How to Win Friends and Influence People' "
            "to 'Crucial Conversations', 'Never Split the Difference', and modern business etiquette. "
            "You always maintain respect, stay concise, and focus on value and outcomes. "
            "Try to give short and easy responses."
        ),
        
        "friendly": (
            "You are the warmest, most naturally friendly, and approachable person anyone has ever spoken to. "
            "You instantly make people feel comfortable, valued, and heard. Your tone is light, positive, and full of genuine warmth. "
            "You use simple, everyday language, smile through your voice, and naturally build rapport. "
            "You are an expert in making conversations feel like talking to a trusted friend — relaxed, enjoyable, and human. "
            "Try to give short and easy responses."
        ),
        
        "persuasive": (
            "You are the world's greatest salesperson with unmatched experience closing deals across every industry. "
            "You deeply understand and masterfully apply all proven sales philosophies and principles: "
            "Cialdini's 6 principles of influence, SPIN Selling, Challenger Sale, Solution Selling, consultative selling, "
            "storytelling in sales, handling objections gracefully, building urgency, and creating irresistible value. "
            "You adapt your approach perfectly to the customer's needs, emotions, and objections. "
            "You convince naturally and ethically — people feel excited and confident to say yes because it genuinely benefits them. "
            "Try to give short and easy responses."
        ),
        
        "supportive": (
            "You are an expert consultant who builds trust through education and empathy. "
            "When users ask questions: (1) Give complete, clear explanations with examples and analogies, "
            "(2) Take time to fully educate before suggesting services, (3) Never rush or push sales. "
            "When users provide key information (budget, audience, goals), synthesize it into a concrete, "
            "actionable plan with specific numbers, timelines, and clear next steps. "
            "Be helpful, patient, and genuinely supportive. Keep responses conversational (2-3 sentences max unless explaining concepts)."
        )
    }

    
    personality_prompt = personality_instructions.get(personality, personality_instructions["professional"])

    # Build prompt with enhanced context labeling
    prompt = ""
    if context and context.strip():
        prompt += f"Knowledge Base Information: {context}\n\n"
    
    # Add company introduction if this is the first message
    intro_instruction = ""
    if len(history) == 0:
        # Sanitize defaults
        safe_agent = agent_name or "Assistant"
        safe_company = company_name or "the AI team"
        
        # Check for placeholders
        if "[" in safe_agent or "{" in safe_agent or "Your Name" in safe_agent:
             safe_agent = "Assistant"
        if "[" in safe_company or "{" in safe_company or "Your Company" in safe_company:
             safe_company = "Digitale"
             
        intro_instruction = f"Introduce yourself as {safe_agent} from {safe_company}. "
    
    # Build enhanced prompt with RAG enforcement and memory awareness
    rag_instruction = ""
    if context and context.strip():
        rag_instruction = (
            f"KNOWLEDGE BASE (USE THIS):\n{context}\n\n"
            f"CRITICAL: Base your answer on the Knowledge Base above. "
            f"If the Knowledge Base doesn't contain the answer, clearly state: "
            f"'I don't have that specific information. Let me connect you with my team to help.'"
        )
    else:
        rag_instruction = (
            "WARNING: Limited knowledge base. Only answer if absolutely certain. "
            "Otherwise, offer to check with the team."
        )
    
    prompt += (
        f"You are a voice assistant with a {personality} personality. "
        f"Goal: {goal or 'Help the customer'}. "
        f"{personality_prompt}\n\n"
        f"{rag_instruction}\n\n"
        f"{intro_instruction}"
        f"{language_instruction}\n\n"
        f"CRITICAL FORMATTING (VOICE CONVERSATION):\n"
        f"- Your response will be SPOKEN ALOUD - no markdown (**bold**, *italic*)\n"
        f"- NO parenthetical notes like *(engaging)* or *(tip)*\n"
        f"- NO meta-commentary - only words customer should hear\n"
        f"- Speak naturally as if on phone call\n\n"
        f"Conversation:\n{conversation}"
    )

    max_retries = 3
    for attempt in range(max_retries):
        try:
            # Use lazy loader
            client = get_deepseek_client()
            if not client:
                raise ValueError("Deepseek-V3 model not initialized")
            
            # Use custom system prompt if provided
            system_message = system_prompt if system_prompt and system_prompt.strip() else (
                "You are a helpful voice assistant. "
                "CRITICAL: Your responses will be spoken aloud. "
                "NEVER use markdown formatting (**, *, _, etc.), parenthetical notes, or asterisks. "
                "Speak naturally as if talking directly to someone. "
                "Do NOT include meta-commentary like '(Short, engaging...)' or '(Pro tip:...)'. "
                "NEVER include internal thoughts, stage directions, or notes in brackets like [thinking...] or [pause]. "
                "Output ONLY the exact spoken words - nothing else. "
                "Only say words that should be heard by the customer."
            )

            # Build messages for Deepseek-V3
            messages = [
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ]
            
            # Call Deepseek-V3 with streaming (increased tokens for detailed explanations)
            response = client.chat.completions.create(
                messages=messages,
                max_tokens=300,  # Increased for complete explanations
                temperature=0.7,
                stream=True
            )
            
            # Stream response with safety checks and markdown filtering
            import re
            full_streamed_response = ""
            
            for chunk in response:
                if chunk.choices and len(chunk.choices) > 0:
                    delta = chunk.choices[0].delta
                    if hasattr(delta, 'content') and delta.content:
                        # Accumulate for post-processing
                        full_streamed_response += delta.content
            
            # CRITICAL: Strip ALL meta-notes, markdown, and parenthetical content before yielding
            cleaned_response = full_streamed_response
            
            # Remove markdown bold/italic
            cleaned_response = re.sub(r'\*{1,2}([^*]+)\*{1,2}', r'\1', cleaned_response)
            
            # Remove ALL parenthetical notes (including multi-line)
            cleaned_response = re.sub(r'\n\n\([^)]+\)', '', cleaned_response)  # Paragraph-level
            cleaned_response = re.sub(r'\s*\([^)]+\)', '', cleaned_response)  # Inline
            cleaned_response = re.sub(r'\*\([^)]+\)\*', '', cleaned_response)  # Starred notes
            
            # Remove asterisks at start/end
            cleaned_response = re.sub(r'^\*+\s*', '', cleaned_response)
            cleaned_response = re.sub(r'\s*\*+$', '', cleaned_response)
            
            # Clean up extra whitespace
            cleaned_response = re.sub(r'\s+', ' ', cleaned_response).strip()
            cleaned_response = re.sub(r'\n{3,}', '\n\n', cleaned_response)
            
            # Log if meta-notes were found (for monitoring)
            if full_streamed_response != cleaned_response:
                logger.info(f"Cleaned meta-notes from LLM output (removed {len(full_streamed_response) - len(cleaned_response)} chars)")
            
            # Yield the cleaned response
            yield cleaned_response
            return

        except Exception as e:
            logger.error(f"LLM streaming error (attempt {attempt + 1}): {e}")
            if attempt < max_retries - 1:
                # Wait before retrying
                time.sleep(1)
                continue
            else:
                # No fallback, just return error message
                if is_hindi:
                    yield "माफ़ कीजिए, मुझे तकनीकी समस्या हो रही है।"
                else:
                    yield "I apologize, I'm experiencing technical difficulties."
                return

def generate_response(transcript: str, goal: str, history: Optional[List[Dict[str, str]]] = None, context: str = "", personality: str = "professional", company_name: str = "", system_prompt: str = "", agent_name: str = "") -> str:

    if not transcript or not transcript.strip():
        return "Hello! I'm here to help you. How can I assist you today?"

    if history is None:
        history = []

    # Build full conversation
    conversation = ""
    for msg in history:
        if isinstance(msg, dict) and "role" in msg and "content" in msg:
            role = "Customer" if msg["role"] == "user" else "Assistant"
            content = msg.get("content", msg.get("text", ""))
            if content and content.strip():
                conversation += f"{role}: {content}\n"
    conversation += f"Customer: {transcript}\nAssistant:"

    # Detect language
    is_hindi = any("\u0900" <= ch <= "\u097F" for ch in transcript)
    language_instruction = (
        "Respond in Hindi (हिंदी में जवाब दें)."
        if is_hindi else
        "Respond in English."
    )

    # Personality-based instructions
    personality_instructions = {
        "professional": (
            "You are a world-class professional communicator with decades of experience in high-stakes business meetings, "
            "executive conversations, and corporate negotiations. You speak with absolute clarity, confidence, and authority. "
            "You use precise language, avoid filler words, and structure your thoughts logically. "
            "You have studied and mastered every major book on professional communication — from 'How to Win Friends and Influence People' "
            "to 'Crucial Conversations', 'Never Split the Difference', and modern business etiquette. "
            "You always maintain respect, stay concise, and focus on value and outcomes. "
            "Try to give short and easy responses."
        ),
        
        "friendly": (
            "You are the warmest, most naturally friendly, and approachable person anyone has ever spoken to. "
            "You instantly make people feel comfortable, valued, and heard. Your tone is light, positive, and full of genuine warmth. "
            "You use simple, everyday language, smile through your voice, and naturally build rapport. "
            "You are an expert in making conversations feel like talking to a trusted friend — relaxed, enjoyable, and human. "
            "Try to give short and easy responses."
        ),
        
        "persuasive": (
            "You are the world's greatest salesperson with unmatched experience closing deals across every industry. "
            "You deeply understand and masterfully apply all proven sales philosophies and principles: "
            "Cialdini's 6 principles of influence, SPIN Selling, Challenger Sale, Solution Selling, consultative selling, "
            "storytelling in sales, handling objections gracefully, building urgency, and creating irresistible value. "
            "You adapt your approach perfectly to the customer's needs, emotions, and objections. "
            "You convince naturally and ethically — people feel excited and confident to say yes because it genuinely benefits them. "
            "Try to give short and easy responses."
        ),
        
        "supportive": (
            "You are the most empathetic, patient, and skilled customer support expert in the world. "
            "You have helped thousands of people solve problems and always leave them feeling relieved, understood, and cared for. "
            "You listen deeply, validate emotions, and respond with genuine compassion. "
            "You master active listening, de-escalation techniques, and clear step-by-step guidance. "
            "You stay calm under pressure and turn frustrated customers into happy, loyal ones. "
            "Try to give short and easy responses."
        )
    }
    
    personality_prompt = personality_instructions.get(personality, personality_instructions["professional"])

    # Build prompt with enhanced context labeling
    prompt = ""
    if context and context.strip():
        prompt += f"Knowledge Base Context: {context}\n\n"
    
    # Add company introduction if this is the first message
    intro_instruction = ""
    if len(history) == 0:
        # Sanitize defaults
        safe_agent = agent_name or "Assistant"
        safe_company = company_name or "the AI team"
        
        # Check for placeholders
        if "[" in safe_agent or "{" in safe_agent or "Your Name" in safe_agent:
             safe_agent = "Assistant"
        if "[" in safe_company or "{" in safe_company or "Your Company" in safe_company:
             safe_company = "Digitale"
             
        intro_instruction = f"Introduce yourself as {safe_agent} from {safe_company}. "
    
    prompt += (
        f"You are a voice assistant with a {personality} personality. "
        f"Goal: {goal or 'Answer customer questions'}. "
        f"{personality_prompt} "
        f"{intro_instruction}"
        f"{language_instruction} "
        f"Use the conversation history to stay on topic. "
        f"Be concise (1-2 sentences), natural, and conversational. "
        f"Always respond directly to the customer's last message. "
        f"If you don't understand, ask clarifying questions. "
        f"IMPORTANT: Always use the Knowledge Base Context to answer questions accurately. "
        f"If the Knowledge Base Context contains relevant information, you MUST use it. \n\n"
        f"CRITICAL FORMATTING RULES:\n"
        f"- This is a VOICE conversation - your response will be SPOKEN ALOUD\n"
        f"- DO NOT use **bold**, *italics*, or any markdown\n"
        f"- DO NOT add notes in parentheses like *(tip)* or *(engaging)*\n"
        f"- DO NOT add commentary - only words the customer should hear\n"
        f"- Speak naturally as if on a phone call\n\n"
        f"Conversation:\n{conversation}"
    )

    max_retries = 3
    for attempt in range(max_retries):
        try:
            client = get_deepseek_client()
            if not client:
                raise ValueError("Deepseek-V3 model not initialized")
            
            # Use custom system prompt if provided, otherwise use default
            system_message = system_prompt if system_prompt and system_prompt.strip() else (
                "You are a helpful voice assistant. Always respond in a conversational tone suitable for voice interactions. "
                "CRITICAL: Your responses will be spoken aloud. "
                "NEVER use markdown formatting (**, *, _, backticks, etc.), parenthetical notes in asterisks like *(note)*, or any special characters. "
                "Speak naturally as if talking directly to someone on a phone call. "
                "Do NOT include meta-commentary, tips, or notes like '(Short, engaging...)' or '(Pro tip:...)'. "
                "NEVER include internal thoughts, stage directions, or notes in brackets like [thinking...] or [pause]. "
                "Output ONLY the exact spoken words - nothing else. "
                "Only say words that should be heard by the customer. Be concise and clear."
            )
            
            # Build messages for Deepseek-V3
            messages = [
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ]
            
            # Call Deepseek-V3 (increased tokens for complete explanations)
            response = client.chat.completions.create(
                messages=messages,
                max_tokens=300,  # Increased for detailed answers
                temperature=0.7,
                top_p=0.9,
                frequency_penalty=0.5,
                presence_penalty=0.5
            )
            
            # Safely extract response text
            response_content = response.choices[0].message.content if response.choices and response.choices[0].message else None
            response_text = response_content.strip() if response_content else ""

            # Check for errors
            if not response_text:
                if attempt < max_retries - 1:
                    logger.warning(f"Empty response from Deepseek-V3, retrying... (attempt {attempt + 1})")
                    time.sleep(1)
                    continue
                else:
                    if is_hindi:
                        return "माफ़ कीजिए, मुझे समझने में थोड़ी दिक्कत हो रही है। क्या आप दोहरा सकते हैं?"
                    else:
                        return "I'm sorry, I'm having trouble understanding that. Could you repeat?"

            # CRITICAL: Strip markdown and notes before returning  
            import re
            # Remove markdown bold/italic (including partial matches)
            response_text = re.sub(r'\*{1,2}([^*]+)\*{1,2}', r'\1', response_text)
            # Remove ALL parenthetical notes (including multi-line and nested)
            response_text = re.sub(r'\n\n\([^)]+\)', '', response_text)  # Paragraph-level notes
            response_text = re.sub(r'\s*\([^)]+\)', '', response_text)  # Inline notes
            # Remove quotes around responses if present
            response_text = re.sub(r'^"(.+)"$', r'\1', response_text.strip())
            # Clean up extra spaces and newlines
            response_text = re.sub(r'\s+', ' ', response_text).strip()

            # Ensure response is not too long for voice
            if len(response_text) > 300:  # Limit to ~300 characters for voice
                response_text = response_text[:297] + "..."
                
            return response_text

        except Exception as e:
            logger.error(f"LLM error (attempt {attempt + 1}): {e}")
            if attempt < max_retries - 1:
                # Wait before retrying
                time.sleep(1)
                continue
            else:
                # No fallback, just return error message
                if is_hindi:
                    return "माफ़ कीजिए, मुझे तकनीकी समस्या हो रही है। कृपया दोबारा कोशिश करें।"
                else:
                    return "I apologize, I'm experiencing technical difficulties. Please try again."
    
    # Fallback return in case all retries are exhausted
    return "I'm sorry, I'm unable to assist right now. Please try again later."


def generate_response_with_tools(
    transcript: str,
    goal: str,
    history: Optional[List[Dict[str, str]]] = None,
    context: str = "",
    personality: str = "professional",
    company_name: str = "",
    agent_name: str = ""
) -> Dict[str, Any]:
    """
    Generate response with intelligent tool calling capability.
    Returns either a text response or a tool call decision.
    
    This enables the AI agent to proactively:
    - End calls with unqualified leads (competitors, not interested, etc.)
    - Schedule callbacks when timing is bad
    - Continue conversations strategically
    - Transfer to human agents when needed
    """
    import json
    from app.agent.tools.agent_tools import AGENT_TOOLS
    
    if not transcript or not transcript.strip():
        return {
            "type": "text",
            "content": "Hello! I'm here to help you. How can I assist you today?"
        }
    
    if history is None:
        history = []
    
    # Build conversation context
    conversation_history = ""
    for msg in history:
        if isinstance(msg, dict) and "role" in msg and "content" in msg:
            role = "Customer" if msg["role"] == "user" else "Assistant"
            content = msg.get("content", msg.get("text", ""))
            if content and content.strip():
                conversation_history += f"{role}: {content}\n"
    
    # Detect language
    is_hindi = any("\u0900" <= ch <= "\u097F" for ch in transcript)
    language_instruction = (
        "Respond in Hindi/Hinglish if appropriate."
        if is_hindi else
        "Respond in English."
    )
    
    # Build enhanced system prompt for intelligent decision making
    system_prompt = f"""You are {agent_name or 'an AI sales agent'} from {company_name or 'our company'}.

Your goal: {goal or 'Help the customer'}

You are a {personality} communicator with access to intelligent tools to make strategic decisions.

AVAILABLE TOOLS:
1. end_call - Use when lead is unqualified (competitor, not interested, already has product, hostile, wrong demographics)
2. schedule_callback - Use when timing is bad but lead might be interested later
3. continue_conversation - Use when lead is engaged and conversation should continue
4. transfer_to_human - Use when situation requires human judgment

DECISION-MAKING GUIDELINES:
- Be PROACTIVE and STRATEGIC - don't waste time on clearly unqualified leads
- COMPETITOR detected? → Use end_call immediately with polite goodbye
- "Already have product" + no interest? → Use end_call to save time
- "Not interested" clearly stated? → Use end_call respectfully
- Lead is busy/driving? → Use schedule_callback
- Lead engaged/asking questions? → Use continue_conversation
- Complex situation? → Use transfer_to_human

IMPORTANT: Analyze each customer response intelligently and choose the RIGHT tool.
Don't continue conversations that are clearly unproductive.

{language_instruction}

Knowledge Base: {context if context else 'Limited information available'}
"""

    # Build user message with conversation context
    user_message = f"""Conversation History:
{conversation_history}

Customer's Latest Message: {transcript}

Analyze this message and decide:
1. Is this lead qualified and worth continuing?
2. Should I end the call, schedule callback, continue, or transfer?
3. What's the most strategic action?

Make your decision and use the appropriate tool."""

    max_retries = 2
    for attempt in range(max_retries):
        try:
            # Try OpenAI first (has best function calling)
            import openai
            openai_key = os.getenv("OPENAI_API_KEY")
            
            if not openai_key:
                # Fallback to regular response without tools
                logger.warning("OpenAI API key not found, falling back to regular response")
                return {
                    "type": "text",
                    "content": generate_response(transcript, goal, history, context, personality, company_name, "", agent_name)
                }
            
            openai.api_key = openai_key
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ]
            
            response = openai.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=messages,
                tools=AGENT_TOOLS,
                tool_choice="auto",  # Let AI decide when to use tools
                temperature=0.7
            )
            
            message = response.choices[0].message
            
            # Check if AI decided to use a tool
            if message.tool_calls and len(message.tool_calls) > 0:
                tool_call = message.tool_calls[0]
                tool_name = tool_call.function.name
                
                try:
                    arguments = json.loads(tool_call.function.arguments)
                except json.JSONDecodeError:
                    logger.error(f"Failed to parse tool arguments: {tool_call.function.arguments}")
                    arguments = {}
                
                logger.info(f"🤖 AI decided to use tool: {tool_name} with args: {arguments}")
                
                return {
                    "type": "tool_call",
                    "tool": tool_name,
                    "arguments": arguments
                }
            else:
                # Regular text response
                response_text = message.content if message.content else "I understand. How can I help you?"
                
                return {
                    "type": "text",
                    "content": response_text
                }
        
        except Exception as e:
            logger.error(f"Error in generate_response_with_tools (attempt {attempt + 1}): {e}")
            if attempt < max_retries - 1:
                time.sleep(1)
                continue
            else:
                # Fallback to regular response
                logger.warning("Function calling failed, falling back to regular response")
                return {
                    "type": "text",
                    "content": generate_response(transcript, goal, history, context, personality, company_name, "", agent_name)
                }
    
    # Final fallback
    return {
        "type": "text",
        "content": "I'm here to help. What can I do for you?"
    }
