from pydantic import BaseModel
from typing import Optional, Union
from datetime import datetime

class RAGDocumentBase(BaseModel):
    filename: str
    content: str
    file_type: str

class RAGDocumentCreate(RAGDocumentBase):
    pass

class RAGDocumentUpdate(RAGDocumentBase):
    filename: Optional[str] = None
    content: Optional[str] = None
    file_type: Optional[str] = None

class RAGDocumentInDBBase(RAGDocumentBase):
    id: str  # Firestore IDs are strings
    campaign_id: Optional[Union[int, str]]  # Accept both int and str for compatibility
    agent_id: Optional[Union[int, str]]  # Accept both int and str for compatibility
    created_at: datetime

    class Config:
        from_attributes = True  # Updated from orm_mode to from_attributes

class RAGDocument(RAGDocumentInDBBase):
    pass