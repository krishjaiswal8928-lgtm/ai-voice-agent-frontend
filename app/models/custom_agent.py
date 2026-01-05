from datetime import datetime
from typing import Optional, List, Dict, Any, Union
import json

class CustomAgent:
    """
    CustomAgent model for Firestore.
    """
    def __init__(
        self,
        user_id: Union[int, str],
        name: str,
        description: Optional[str] = None,
        company_name: Optional[str] = None,
        personality: str = "professional",
        tone: str = "formal",
        response_style: str = "concise",
        politeness_level: int = 5,
        sales_aggressiveness: int = 5,
        confidence_level: int = 5,
        
        # Provider configurations
        tts_provider: Optional[str] = "cartesia",
        llm_provider: Optional[str] = "deepseek-v3",
        stt_provider: Optional[str] = "deepgram",
        
        system_prompt: Optional[str] = None,
        trained_documents: Optional[List[Any]] = None,
        website_urls: Optional[List[Any]] = None,
        vector_db_namespace: Optional[str] = None,
        is_active: bool = True,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
        id: Optional[str] = None,
        # Autonomous Agent Capabilities
        enable_learning: bool = True,
        enable_planning: bool = True,
        enable_memory: bool = True,
        enable_callbacks: bool = False,
        enable_workflows: bool = False,
        # Learning Parameters
        learning_rate: float = 0.1,
        memory_retention_days: int = 90,
        max_plan_steps: int = 10,
        # Goals & Success Criteria
        primary_goal: Optional[str] = None,
        success_criteria: Optional[List[str]] = None,
        # Performance Metrics
        total_conversations: int = 0,
        success_rate: float = 0.0,
        average_satisfaction: float = 0.0,
        last_learning_update: Optional[datetime] = None
    ):
        self.id = id
        self.user_id = user_id
        self.name = name
        self.description = description
        self.company_name = company_name
        self.personality = personality
        self.tone = tone
        self.response_style = response_style
        self.politeness_level = politeness_level
        self.sales_aggressiveness = sales_aggressiveness
        self.confidence_level = confidence_level
        
        # Provider configurations
        self.tts_provider = tts_provider or "cartesia"
        self.llm_provider = llm_provider or "deepseek-v3"
        self.stt_provider = stt_provider or "deepgram"
        
        self.system_prompt = system_prompt
        self.trained_documents = trained_documents or []
        self.website_urls = website_urls or []
        self.vector_db_namespace = vector_db_namespace
        self.is_active = is_active
        self.created_at = created_at or datetime.now()
        self.updated_at = updated_at or datetime.now()
        
        # Agent Capabilities
        self.enable_learning = enable_learning
        self.enable_planning = enable_planning
        self.enable_memory = enable_memory
        self.enable_callbacks = enable_callbacks
        self.enable_workflows = enable_workflows
        
        # Learning Parameters
        self.learning_rate = learning_rate
        self.memory_retention_days = memory_retention_days
        self.max_plan_steps = max_plan_steps
        
        # Goals & Success Criteria
        self.primary_goal = primary_goal
        self.success_criteria = success_criteria or []
        
        # Performance Metrics
        self.total_conversations = total_conversations
        self.success_rate = success_rate
        self.average_satisfaction = average_satisfaction
        self.last_learning_update = last_learning_update

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "name": self.name,
            "description": self.description,
            "company_name": self.company_name,
            "personality": self.personality,
            "tone": self.tone,
            "response_style": self.response_style,
            "politeness_level": self.politeness_level,
            "sales_aggressiveness": self.sales_aggressiveness,
            "confidence_level": self.confidence_level,
            
            # Provider configurations
            "tts_provider": self.tts_provider,
            "llm_provider": self.llm_provider,
            "stt_provider": self.stt_provider,
            
            "system_prompt": self.system_prompt,
            "trained_documents": self.trained_documents,
            "website_urls": self.website_urls,
            "vector_db_namespace": self.vector_db_namespace,
            "is_active": self.is_active,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            # Agent Capabilities
            "enable_learning": self.enable_learning,
            "enable_planning": self.enable_planning,
            "enable_memory": self.enable_memory,
            "enable_callbacks": self.enable_callbacks,
            "enable_workflows": self.enable_workflows,
            # Learning Parameters
            "learning_rate": self.learning_rate,
            "memory_retention_days": self.memory_retention_days,
            "max_plan_steps": self.max_plan_steps,
            # Goals & Success Criteria
            "primary_goal": self.primary_goal,
            "success_criteria": self.success_criteria,
            # Performance Metrics
            "total_conversations": self.total_conversations,
            "success_rate": self.success_rate,
            "average_satisfaction": self.average_satisfaction,
            "last_learning_update": self.last_learning_update
        }

    @staticmethod
    def from_dict(source: dict, id: str):
        return CustomAgent(
            id=id,
            user_id=source.get("user_id"),
            name=source.get("name"),
            description=source.get("description"),
            company_name=source.get("company_name"),
            personality=source.get("personality", "professional"),
            tone=source.get("tone", "formal"),
            response_style=source.get("response_style", "concise"),
            politeness_level=source.get("politeness_level", 5),
            sales_aggressiveness=source.get("sales_aggressiveness", 5),
            confidence_level=source.get("confidence_level", 5),
            
            # Provider configurations
            tts_provider=source.get("tts_provider"),
            llm_provider=source.get("llm_provider"),
            stt_provider=source.get("stt_provider"),
            
            system_prompt=source.get("system_prompt"),
            trained_documents=source.get("trained_documents"),
            website_urls=source.get("website_urls"),
            vector_db_namespace=source.get("vector_db_namespace"),
            is_active=source.get("is_active", True),
            created_at=source.get("created_at"),
            updated_at=source.get("updated_at"),
            # Agent Capabilities
            enable_learning=source.get("enable_learning", True),
            enable_planning=source.get("enable_planning", True),
            enable_memory=source.get("enable_memory", True),
            enable_callbacks=source.get("enable_callbacks", False),
            enable_workflows=source.get("enable_workflows", False),
            # Learning Parameters
            learning_rate=source.get("learning_rate", 0.1),
            memory_retention_days=source.get("memory_retention_days", 90),
            max_plan_steps=source.get("max_plan_steps", 10),
            # Goals & Success Criteria
            primary_goal=source.get("primary_goal"),
            success_criteria=source.get("success_criteria"),
            # Performance Metrics
            total_conversations=source.get("total_conversations", 0),
            success_rate=source.get("success_rate", 0.0),
            average_satisfaction=source.get("average_satisfaction", 0.0),
            last_learning_update=source.get("last_learning_update")
        )