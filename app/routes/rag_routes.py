from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from google.cloud import firestore
from typing import List, Optional
import os
import uuid
import asyncio
from app.dependencies import get_db
from app.schemas.rag_schema import RAGDocument
from app.services.rag_service import rag_service
from app.models.campaign import CallSession
from app.models.custom_agent import CustomAgent
from app.models.rag_document import RAGDocument as RAGDocumentModel
from app.core.security import get_current_user
from app.middleware.usage_tracker import check_resource_limit, increment_resource_usage

router = APIRouter(prefix="/rag", tags=["RAG"])

UPLOAD_DIR = "data/rag_uploads"

# Create upload directory if it doesn't exist
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload-pdf/{campaign_id}", response_model=RAGDocument)
async def upload_pdf(
    campaign_id: str,
    file: UploadFile = File(...),
    agent_id: Optional[str] = Form(None),
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Upload a PDF file for RAG processing."""
    user_id = current_user["user_id"]
    
    # CHECK DOCUMENT LIMIT BEFORE UPLOADING
    limit_check = await check_resource_limit(user_id, "documents")
    if not limit_check.get("allowed"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Document upload limit reached. {limit_check.get('reason')}. Please upgrade your plan.",
            headers={"X-Upgrade-Required": "true"}
        )
    
    # Check if this is for an agent instead of a campaign
    if agent_id:
        doc_ref = db.collection('custom_agents').document(agent_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agent not found"
            )
        agent = CustomAgent.from_dict(doc.to_dict(), doc.id)
        if agent.user_id != current_user["user_id"]:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agent not found"
            )
    else:
        # Check if campaign exists and belongs to the user
        doc_ref = db.collection('campaigns').document(campaign_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )
        campaign = Campaign.from_dict(doc.to_dict(), doc.id)
        if campaign.user_id != current_user["user_id"]:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )
    
    # Save file
    file_extension = os.path.splitext(file.filename)[1]
    if file_extension.lower() != ".pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed"
        )
    
    file_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}_{file.filename}")
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Process file asynchronously to prevent timeout
    try:
        # Create a task to process the document in the background
        document = await asyncio.wait_for(
            rag_service.process_document(file_path, "pdf", campaign_id if not agent_id else None, db, agent_id),
            timeout=120.0  # Increased timeout to 120 seconds
        )
        
        # INCREMENT USAGE COUNTER after successful upload
        await increment_resource_usage(user_id, "documents")
        
        return document
    except asyncio.TimeoutError:
        # Clean up file if processing times out
        if os.path.exists(file_path):
            os.remove(file_path)
        
        raise HTTPException(
            status_code=status.HTTP_408_REQUEST_TIMEOUT,
            detail="Document processing is taking longer than expected. Please try a smaller document or check your internet connection."
        )
    except Exception as e:
        # Clean up file if processing fails
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Provide user-friendly error message for quota issues
        error_message = str(e)
        if "quota exceeded" in error_message.lower() or "429" in error_message:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="API quota exceeded. The system is using a fallback method that may provide reduced functionality. Please try again or consider upgrading your Google API plan."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error processing file: {str(e)}"
            )

@router.post("/upload-docx/{campaign_id}", response_model=RAGDocument)
async def upload_docx(
    campaign_id: str,
    file: UploadFile = File(...),
    agent_id: Optional[str] = Form(None),
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Upload a DOCX file for RAG processing."""
    user_id = current_user["user_id"]
    
    # CHECK DOCUMENT LIMIT
    limit_check = await check_resource_limit(user_id, "documents")
    if not limit_check.get("allowed"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Document upload limit reached. {limit_check.get('reason')}. Please upgrade your plan.",
            headers={"X-Upgrade-Required": "true"}
        )
    # Check if this is for an agent instead of a campaign
    if agent_id:
        doc_ref = db.collection('custom_agents').document(agent_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agent not found"
            )
        agent = CustomAgent.from_dict(doc.to_dict(), doc.id)
        if agent.user_id != current_user["user_id"]:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agent not found"
            )
    else:
        # Check if campaign exists and belongs to the user
        doc_ref = db.collection('campaigns').document(campaign_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )
        campaign = Campaign.from_dict(doc.to_dict(), doc.id)
        if campaign.user_id != current_user["user_id"]:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )
    
    # Save file
    file_extension = os.path.splitext(file.filename)[1]
    if file_extension.lower() != ".docx":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only DOCX files are allowed"
        )
    
    file_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}_{file.filename}")
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Process file asynchronously to prevent timeout
    try:
        # Create a task to process the document in the background
        document = await asyncio.wait_for(
            rag_service.process_document(file_path, "docx", campaign_id if not agent_id else None, db, agent_id),
            timeout=120.0  # Increased timeout to 120 seconds
        )
        
        # INCREMENT USAGE COUNTER
        await increment_resource_usage(user_id, "documents")
        
        return document
    except asyncio.TimeoutError:
        # Clean up file if processing times out
        if os.path.exists(file_path):
            os.remove(file_path)
        
        raise HTTPException(
            status_code=status.HTTP_408_REQUEST_TIMEOUT,
            detail="Document processing is taking longer than expected. Please try a smaller document or check your internet connection."
        )
    except Exception as e:
        # Clean up file if processing fails
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Provide user-friendly error message for quota issues
        error_message = str(e)
        if "quota exceeded" in error_message.lower() or "429" in error_message:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="API quota exceeded. The system is using a fallback method that may provide reduced functionality. Please try again or consider upgrading your Google API plan."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error processing file: {str(e)}"
            )

@router.post("/upload-url/{campaign_id}", response_model=RAGDocument)
async def upload_url(
    campaign_id: str,
    url: str = Form(...),
    agent_id: Optional[str] = Form(None),
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Upload a URL for RAG processing."""
    user_id = current_user["user_id"]
    
    # CHECK WEBSITE LIMIT
    limit_check = await check_resource_limit(user_id, "websites")
    if not limit_check.get("allowed"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Website upload limit reached. {limit_check.get('reason')}. Please upgrade your plan.",
            headers={"X-Upgrade-Required": "true"}
        )
    # Check if this is for an agent instead of a campaign
    if agent_id:
        doc_ref = db.collection('custom_agents').document(agent_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agent not found"
            )
        agent = CustomAgent.from_dict(doc.to_dict(), doc.id)
        if agent.user_id != current_user["user_id"]:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agent not found"
            )
    else:
        # Check if campaign exists and belongs to the user
        doc_ref = db.collection('campaigns').document(campaign_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )
        campaign = Campaign.from_dict(doc.to_dict(), doc.id)
        if campaign.user_id != current_user["user_id"]:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )
    
    # Process URL with timeout
    try:
        # Create a task to process the URL in the background
        document = await asyncio.wait_for(
            rag_service.process_url(url, campaign_id if not agent_id else None, db, agent_id),
            timeout=120.0  # Increased timeout to 120 seconds
        )
        
        # INCREMENT USAGE COUNTER
        await increment_resource_usage(user_id, "websites")
        
        return document
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=status.HTTP_408_REQUEST_TIMEOUT,
            detail="URL processing is taking longer than expected. Please try a different URL or check your internet connection."
        )
    except Exception as e:
        # Provide user-friendly error message for quota issues
        error_message = str(e)
        if "quota exceeded" in error_message.lower() or "429" in error_message:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="API quota exceeded. The system is using a fallback method that may provide reduced functionality. Please try again or consider upgrading your Google API plan."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error processing URL: {str(e)}"
            )

@router.post("/crawl-domain/{campaign_id}")
async def crawl_domain(
    campaign_id: str,
    url: str = Form(...),
    agent_id: Optional[str] = Form(None),
    max_pages: int = Form(50),
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Crawl an entire domain and process all pages for RAG."""
    # Check if this is for an agent instead of a campaign
    if agent_id:
        doc_ref = db.collection('custom_agents').document(agent_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agent not found"
            )
        agent = CustomAgent.from_dict(doc.to_dict(), doc.id)
        if agent.user_id != current_user["user_id"]:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agent not found"
            )
        # For agent-based operations, we don't need to validate campaign
        campaign_id = None
    else:
        # Check if campaign exists and belongs to the user
        doc_ref = db.collection('campaigns').document(campaign_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )
        campaign = Campaign.from_dict(doc.to_dict(), doc.id)
        if campaign.user_id != current_user["user_id"]:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )
    
    # Process domain with timeout
    try:
        result = await asyncio.wait_for(
            rag_service.process_domain(url, campaign_id, db, agent_id, max_pages),
            timeout=600.0  # Increased timeout to 10 minutes for domain crawling with more pages
        )
        return {
            "message": f"Successfully crawled {result['total_pages']} pages",
            "total_pages": result['total_pages'],
            "failed_urls": result['failed_urls'],
            "documents": [{"id": doc.id, "title": doc.title, "url": doc.filename} for doc in result['documents']]
        }
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=status.HTTP_408_REQUEST_TIMEOUT,
            detail="Domain crawling is taking longer than expected. The process is still running in the background."
        )
    except Exception as e:
        error_message = str(e)
        if "quota exceeded" in error_message.lower() or "429" in error_message:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="API quota exceeded. Please try again later."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error crawling domain: {str(e)}"
            )

@router.post("/crawl-domain-agent/{agent_id}")
async def crawl_domain_agent(
    agent_id: str,
    url: str = Form(...),
    max_pages: int = Form(1000),  # Default to 1000 pages for agent-based crawling
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Crawl an entire domain and process all pages for RAG (agent-specific)."""
    # Check if agent exists and belongs to the user
    doc_ref = db.collection('custom_agents').document(agent_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    agent = CustomAgent.from_dict(doc.to_dict(), doc.id)
    if agent.user_id != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    
    # Process domain with timeout
    try:
        result = await asyncio.wait_for(
            rag_service.process_domain(url, None, db, agent_id, max_pages),
            timeout=600.0  # Increased timeout to 10 minutes for domain crawling with more pages
        )
        return {
            "message": f"Successfully crawled {result['total_pages']} pages",
            "total_pages": result['total_pages'],
            "failed_urls": result['failed_urls'],
            "documents": [{"id": doc.id, "title": doc.title, "url": doc.filename} for doc in result['documents']]
        }
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=status.HTTP_408_REQUEST_TIMEOUT,
            detail="Domain crawling is taking longer than expected. The process is still running in the background."
        )
    except Exception as e:
        error_message = str(e)
        if "quota exceeded" in error_message.lower() or "429" in error_message:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="API quota exceeded. Please try again later."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error crawling domain: {str(e)}"
            )

@router.get("/documents/{campaign_id}", response_model=List[RAGDocument])
async def get_rag_documents(
    campaign_id: str,
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all RAG documents for a campaign."""
    # Check if campaign exists and belongs to the user
    doc_ref = db.collection('campaigns').document(campaign_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    campaign = Campaign.from_dict(doc.to_dict(), doc.id)
    if campaign.user_id != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    # Query documents
    docs_ref = db.collection('rag_documents')
    docs = docs_ref.where('campaign_id', '==', campaign_id).stream()
    
    documents = []
    for doc in docs:
        documents.append(RAGDocumentModel.from_dict(doc.to_dict(), doc.id))
        
    return documents

@router.get("/documents/agent/{agent_id}")
async def get_agent_documents(
    agent_id: str,
    file_type: str = None,
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all RAG documents for a specific agent."""
    # Check if agent exists and belongs to the user
    doc_ref = db.collection('custom_agents').document(agent_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    agent = CustomAgent.from_dict(doc.to_dict(), doc.id)
    if agent.user_id != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    
    # Query documents
    docs_ref = db.collection('rag_documents')
    query = docs_ref.where('agent_id', '==', agent_id)
    
    if file_type:
        query = query.where('file_type', '==', file_type)
    
    docs = query.stream()
    documents = []
    for doc in docs:
        documents.append(RAGDocumentModel.from_dict(doc.to_dict(), doc.id))
    
    return [{
        "id": doc.id,
        "title": doc.title or doc.filename,
        "filename": doc.filename,
        "file_type": doc.file_type,
        "chunks_extracted": doc.chunks_extracted,
        "created_at": doc.created_at
    } for doc in documents]

@router.get("/document/{document_id}/content")
async def get_document_content(
    document_id: str,
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get the full content of a document for context review."""
    # Get document
    doc_ref = db.collection('rag_documents').document(document_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    document = RAGDocumentModel.from_dict(doc.to_dict(), doc.id)
    
    # Check ownership via agent or campaign
    if document.agent_id:
        agent_ref = db.collection('custom_agents').document(document.agent_id)
        agent_doc = agent_ref.get()
        if not agent_doc.exists:
             raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        agent = CustomAgent.from_dict(agent_doc.to_dict(), agent_doc.id)
        if agent.user_id != current_user["user_id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    elif document.campaign_id:
        campaign_ref = db.collection('campaigns').document(document.campaign_id)
        campaign_doc = campaign_ref.get()
        if not campaign_doc.exists:
             raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        campaign = Campaign.from_dict(campaign_doc.to_dict(), campaign_doc.id)
        if campaign.user_id != current_user["user_id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    
    return {
        "id": document.id,
        "title": document.title or document.filename,
        "filename": document.filename,
        "file_type": document.file_type,
        "content": document.content,
        "chunks_extracted": document.chunks_extracted,
        "created_at": document.created_at
    }

@router.delete("/document/{document_id}")
async def delete_document(
    document_id: str,
    db: firestore.Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a RAG document."""
    # Get document
    doc_ref = db.collection('rag_documents').document(document_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    document = RAGDocumentModel.from_dict(doc.to_dict(), doc.id)
    
    # Check ownership via agent or campaign
    if document.agent_id:
        agent_ref = db.collection('custom_agents').document(document.agent_id)
        agent_doc = agent_ref.get()
        if not agent_doc.exists:
             raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        agent = CustomAgent.from_dict(agent_doc.to_dict(), agent_doc.id)
        if agent.user_id != current_user["user_id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    elif document.campaign_id:
        campaign_ref = db.collection('campaigns').document(document.campaign_id)
        campaign_doc = campaign_ref.get()
        if not campaign_doc.exists:
             raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        campaign = Campaign.from_dict(campaign_doc.to_dict(), campaign_doc.id)
        if campaign.user_id != current_user["user_id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    
    doc_ref.delete()
    
    return {"message": "Document deleted successfully"}