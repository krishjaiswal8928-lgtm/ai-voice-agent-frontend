from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.base import Base

class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    name = Column(String, nullable=False)
    description = Column(Text)
    llm_prompt = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    client = relationship("Client", backref="goals")