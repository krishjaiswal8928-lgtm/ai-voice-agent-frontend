"""
Tool Registry Module
Registers and manages available tools for the autonomous agent
"""

from typing import Dict, Callable, Any, List
import asyncio

class ToolRegistry:
    """Registry for available tools"""
    
    def __init__(self):
        self.tools: Dict[str, Callable] = {}
    
    def register_tool(self, name: str):
        """Register a tool - decorator"""
        def decorator(func: Callable):
            self.tools[name] = func
            return func
        return decorator
    
    def get_tool(self, name: str) -> Callable:
        """Get a registered tool"""
        return self.tools.get(name)
    
    def list_tools(self) -> List[str]:
        """List all registered tools"""
        return list(self.tools.keys())
    
    async def execute_tool(self, name: str, **kwargs) -> Any:
        """Execute a tool with given arguments"""
        tool = self.get_tool(name)
        if not tool:
            raise ValueError(f"Tool '{name}' not found")
        
        try:
            if asyncio.iscoroutinefunction(tool):
                return await tool(**kwargs)
            else:
                return tool(**kwargs)
        except Exception as e:
            raise RuntimeError(f"Error executing tool '{name}': {e}")

# Global tool registry instance
tool_registry = ToolRegistry()

# Register default tools
def register_default_tools():
    """Register default tools for the autonomous agent"""
    
    @tool_registry.register_tool("speak")
    async def speak_tool(text: str) -> bytes:
        """Convert text to speech"""
        from app.services.tts_service import synthesize_speech
        return await synthesize_speech(text)
    
    @tool_registry.register_tool("listen")
    async def listen_tool(audio_data: bytes) -> str:
        """Convert speech to text"""
        from app.services.stt_service import transcribe_audio_direct
        return await transcribe_audio_direct(audio_data)
    
    @tool_registry.register_tool("plan")
    async def plan_tool(objective: str, context: str = "", history: list = None) -> list:
        """Generate a plan for achieving an objective"""
        from app.agent.autonomous.planner import Planner
        planner = Planner()
        return await planner.create_plan(objective, context, history)
    
    @tool_registry.register_tool("evaluate")
    async def evaluate_tool(objective: str, success_criteria: str, history: list) -> dict:
        """Evaluate progress toward a goal"""
        from app.agent.autonomous.evaluator import Evaluator
        evaluator = Evaluator()
        return await evaluator.evaluate_progress(objective, success_criteria, history)

# Register default tools when module is imported
register_default_tools()