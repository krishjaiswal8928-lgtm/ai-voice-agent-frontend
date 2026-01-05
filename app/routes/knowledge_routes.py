from fastapi import APIRouter, UploadFile, File, Form
# Defer import of ingestion service to avoid initialization issues
# from app.services.ingestion_service import ingest_document, ingest_url
import os
from pathlib import Path
import tempfile

router = APIRouter()

UPLOAD_DIR = Path("data/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/upload_document")
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a document (PDF, DOCX, TXT, CSV) and ingest into vector store.
    """
    try:
        # Import here to defer initialization
        from app.services.ingestion_service import ingest_document
        
        if not file.filename:
            return {"status": "error", "message": "Filename is required"}
        
        file_path = UPLOAD_DIR / file.filename
        with open(file_path, "wb") as f:
            f.write(await file.read())

        ingest_document(str(file_path))
        return {"status": "success", "message": f"File {file.filename} ingested successfully."}

    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.post("/upload_url")
async def upload_url(url: str = Form(...)):
    """
    Provide a URL to fetch and ingest content into vector store.
    """
    try:
        # Import here to defer initialization
        from app.services.ingestion_service import ingest_url
        
        ingest_url(url)
        return {"status": "success", "message": f"URL {url} ingested successfully."}

    except Exception as e:
        return {"status": "error", "message": str(e)}