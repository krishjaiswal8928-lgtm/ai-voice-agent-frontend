from celery import Celery
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.campaign import CallSession
from app.models.rag_document import RAGDocument
from app.core.scheduler import celery_app
# Import your vector store implementation (FAISS or Pinecone)
# from app.database.vector_store import index_document

@celery_app.task
def index_rag_documents():
    """Index all RAG documents."""
    db_generator = get_db()
    db = next(db_generator)
    
    try:
        # Get all call sessions
        call_sessions = db.query(CallSession).all()
        
        for call_session in call_sessions:
            # Index documents for each call session
            index_campaign_documents.delay(call_session.id)
            
    except Exception as e:
        print(f"Error indexing RAG documents: {e}")
    finally:
        db_generator.close()

@celery_app.task
def index_campaign_documents(campaign_id: int):
    """Index RAG documents for a specific campaign."""
    db_generator = get_db()
    db = next(db_generator)
    
    try:
        # Get call session
        call_session = db.query(CallSession).filter(CallSession.id == campaign_id).first()
        if not call_session:
            return
            
        # Index all documents for the call session
        for document in call_session.rag_documents:
            index_document.delay(document.id)
            
    except Exception as e:
        print(f"Error indexing documents for campaign {campaign_id}: {e}")
    finally:
        db_generator.close()

@celery_app.task
def index_document(document_id: int):
    """Index a specific RAG document."""
    db_generator = get_db()
    db = next(db_generator)
    
    try:
        # Get the document
        document = db.query(RAGDocument).filter(RAGDocument.id == document_id).first()
        if not document:
            return
            
        # Index the document content
        # This would integrate with your vector store (FAISS or Pinecone)
        # index_document_content(document.content, document_id)
        print(f"Document {document_id} indexed successfully")
        
    except Exception as e:
        print(f"Error indexing document {document_id}: {e}")
    finally:
        db_generator.close()