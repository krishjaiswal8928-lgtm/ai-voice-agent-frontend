from sqlalchemy import Column, DateTime, Integer, String, ForeignKey
from sqlalchemy.sql import func
from app.database.base import Base


class Client(Base):
    """SQLAlchemy model representing a client in the system.

    Attributes:
        id: Primary key
        name: Client's full name
        email: Client's email address (must be unique)
        company_name: Client's company name (optional)
        api_key: Client's API key (optional)
        created_at: Timestamp when the client was created
    """
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    company_name = Column(String, nullable=True)
    api_key = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())