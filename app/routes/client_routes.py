from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel

# Create router instance
router = APIRouter(
    prefix="/api/clients",
    tags=["clients"],
    responses={404: {"description": "Not found"}},
)

# Example model
class Client(BaseModel):
    id: int
    name: str
    email: str
    is_active: bool = True

# Example in-memory storage
clients_db = []

@router.get("/", response_model=List[Client])
async def list_clients():
    """List all clients"""
    return clients_db

@router.get("/{client_id}", response_model=Client)
async def get_client(client_id: int):
    """Get a specific client by ID"""
    client = next((c for c in clients_db if c.id == client_id), None)
    if client is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Client with ID {client_id} not found"
        )
    return client

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=Client)
async def create_client(client: Client):
    """Create a new client"""
    if any(c.id == client.id for c in clients_db):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Client with ID {client.id} already exists"
        )
    clients_db.append(client)
    return client