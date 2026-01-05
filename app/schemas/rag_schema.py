"""
RAG Schema
Pydantic models for RAG document management
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RAGDocumentBase(BaseModel):
    filename: str
    content: str
    file_type: str

class RAGDocumentCreate(RAGDocumentBase):
    campaign_id: int

class RAGDocumentUpdate(RAGDocumentBase):
    filename: Optional[str] = None
    content: Optional[str] = None
    file_type: Optional[str] = None

class RAGDocumentInDBBase(RAGDocumentBase):
    id: int
    campaign_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class RAGDocument(RAGDocumentInDBBase):
    pass