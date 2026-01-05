from pydantic import BaseModel
from typing import List, Optional, Union
from datetime import datetime
import json

class CustomAgentCreate(BaseModel):
    name: str
    description: str = ""
    company_name: Optional[str] = None
    personality: str = "professional"
    tone: str = "formal"
    response_style: str = "concise"
    politeness_level: int = 5
    sales_aggressiveness: int = 5
    confidence_level: int = 5
    system_prompt: str = ""
    trained_documents: List[str] = []
    website_urls: List[str] = []
    vector_db_namespace: str = ""
    # Autonomous Agent Capabilities
    enable_learning: bool = True
    enable_planning: bool = True
    enable_memory: bool = True
    enable_callbacks: bool = False
    enable_workflows: bool = False
    # Learning Parameters
    learning_rate: float = 0.1
    memory_retention_days: int = 90
    max_plan_steps: int = 10
    # Goals & Success Criteria
    primary_goal: Optional[str] = None
    success_criteria: Optional[List[str]] = None

class CustomAgentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    company_name: Optional[str] = None
    personality: Optional[str] = None
    tone: Optional[str] = None
    response_style: Optional[str] = None
    politeness_level: Optional[int] = None
    sales_aggressiveness: Optional[int] = None
    confidence_level: Optional[int] = None
    system_prompt: Optional[str] = None
    trained_documents: Optional[List[str]] = None
    website_urls: Optional[List[str]] = None
    vector_db_namespace: Optional[str] = None
    # Autonomous Agent Capabilities
    enable_learning: Optional[bool] = None
    enable_planning: Optional[bool] = None
    enable_memory: Optional[bool] = None
    enable_callbacks: Optional[bool] = None
    enable_workflows: Optional[bool] = None
    # Learning Parameters
    learning_rate: Optional[float] = None
    memory_retention_days: Optional[int] = None
    max_plan_steps: Optional[int] = None
    # Goals & Success Criteria
    primary_goal: Optional[str] = None
    success_criteria: Optional[List[str]] = None

class CustomAgentResponse(CustomAgentCreate):
    id: str
    user_id: Union[int, str]  # Accept both int and str for compatibility
    is_active: bool
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, obj):
        # Convert the model object to a dictionary with proper field conversions
        data = {
            "id": getattr(obj, 'id', ''),
            "user_id": getattr(obj, 'user_id', ''),
            "name": getattr(obj, 'name', ''),
            "description": getattr(obj, 'description', ''),
            "company_name": getattr(obj, 'company_name', None) or '',
            "personality": getattr(obj, 'personality', 'professional'),
            "tone": getattr(obj, 'tone', 'formal'),
            "response_style": getattr(obj, 'response_style', 'concise'),
            "politeness_level": getattr(obj, 'politeness_level', 5),
            "sales_aggressiveness": getattr(obj, 'sales_aggressiveness', 5),
            "confidence_level": getattr(obj, 'confidence_level', 5),
            "system_prompt": getattr(obj, 'system_prompt', ''),
            "trained_documents": getattr(obj, 'trained_documents', []) if isinstance(getattr(obj, 'trained_documents', []), list) else (json.loads(getattr(obj, 'trained_documents', '[]')) if getattr(obj, 'trained_documents', None) else []),
            "website_urls": getattr(obj, 'website_urls', []) if isinstance(getattr(obj, 'website_urls', []), list) else (json.loads(getattr(obj, 'website_urls', '[]')) if getattr(obj, 'website_urls', None) else []),
            "vector_db_namespace": getattr(obj, 'vector_db_namespace', ''),
            "is_active": getattr(obj, 'is_active', True),
            "created_at": getattr(obj, 'created_at').isoformat() if getattr(obj, 'created_at', None) else None,
            "updated_at": getattr(obj, 'updated_at').isoformat() if getattr(obj, 'updated_at', None) else None
        }
        return cls(**data)