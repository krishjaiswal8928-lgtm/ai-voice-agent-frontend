from datetime import datetime
from typing import Optional

class RAGDocument:
    """
    RAGDocument model for Firestore.
    """
    def __init__(
        self,
        filename: str,
        content: str,
        file_type: str,
        campaign_id: Optional[str] = None, # Changed to str
        agent_id: Optional[str] = None, # Changed to str
        title: Optional[str] = None,
        chunks_extracted: int = 0,
        created_at: Optional[datetime] = None,
        id: Optional[str] = None
    ):
        self.id = id
        self.campaign_id = campaign_id
        self.agent_id = agent_id
        self.filename = filename
        self.title = title
        self.content = content
        self.file_type = file_type
        self.chunks_extracted = chunks_extracted
        self.created_at = created_at or datetime.now()

    def to_dict(self):
        return {
            "campaign_id": self.campaign_id,
            "agent_id": self.agent_id,
            "filename": self.filename,
            "title": self.title,
            "content": self.content,
            "file_type": self.file_type,
            "chunks_extracted": self.chunks_extracted,
            "created_at": self.created_at
        }

    @staticmethod
    def from_dict(source: dict, id: str):
        return RAGDocument(
            id=id,
            campaign_id=source.get("campaign_id"),
            agent_id=source.get("agent_id"),
            filename=source.get("filename"),
            title=source.get("title"),
            content=source.get("content"),
            file_type=source.get("file_type"),
            chunks_extracted=source.get("chunks_extracted", 0),
            created_at=source.get("created_at")
        )