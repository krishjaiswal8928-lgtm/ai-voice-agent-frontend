# app/services/ingestion_service.py

import os
from pathlib import Path
from typing import List
import chromadb
from chromadb.config import Settings
import google.generativeai as genai
from dotenv import load_dotenv
from PyPDF2 import PdfReader
import docx
import csv
import requests
from bs4 import BeautifulSoup

# --- Load environment ---
load_dotenv()

# --- Gemini Initialization ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables")

genai.configure(api_key=GEMINI_API_KEY)

# --- ChromaDB Singleton ---
CHROMA_DIR = Path("data/chroma_store")
CHROMA_DIR.mkdir(parents=True, exist_ok=True)

# Initialize Chroma client
chroma_client = chromadb.PersistentClient(
    path=str(CHROMA_DIR),
    settings=Settings(anonymized_telemetry=False)
)

# Get or create the collection
collection_name = "documents"
collection = chroma_client.get_or_create_collection(collection_name)


# --- File Reading Utilities ---
def read_pdf(file_path: str) -> str:
    reader = PdfReader(file_path)
    return " ".join([p.extract_text() or "" for p in reader.pages])


def read_docx(file_path: str) -> str:
    doc = docx.Document(file_path)
    return " ".join([p.text for p in doc.paragraphs])


def read_txt(file_path: str) -> str:
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()


def read_csv(file_path: str) -> str:
    with open(file_path, newline="", encoding="utf-8") as csvfile:
        reader = csv.reader(csvfile)
        return " ".join([" ".join(row) for row in reader])


def fetch_web_text(url: str) -> str:
    response = requests.get(url, timeout=10)
    soup = BeautifulSoup(response.text, "html.parser")
    return soup.get_text(separator=" ", strip=True)


# --- Text Chunking & Embedding ---
def chunk_text(text: str, chunk_size: int = 500) -> List[str]:
    words = text.split()
    return [" ".join(words[i:i + chunk_size]) for i in range(0, len(words), chunk_size)]


def embed_texts(chunks: List[str]) -> List[List[float]]:
    """Embed a list of text chunks using Gemini's embedding model."""
    embeddings = []
    for chunk in chunks:
        try:
            response = genai.embed_content(
                model="models/text-embedding-004",
                content=chunk,
                task_type="retrieval_document"
            )
            # Gemini API response can vary
            if "embedding" in response:
                embeddings.append(response["embedding"])
            elif hasattr(response, "embedding"):
                embeddings.append(response.embedding)
            else:
                embeddings.append([0.0] * 768)  # fallback
        except Exception as e:
            print(f"Error generating embedding: {e}")
            embeddings.append([0.0] * 768)
    return embeddings


# --- Ingestion Functions ---
def ingest_document(file_path: str):
    ext = Path(file_path).suffix.lower()
    if ext == ".pdf":
        text = read_pdf(file_path)
    elif ext == ".docx":
        text = read_docx(file_path)
    elif ext == ".csv":
        text = read_csv(file_path)
    else:
        text = read_txt(file_path)

    chunks = chunk_text(text)
    embeddings = embed_texts(chunks)

    for i, chunk in enumerate(chunks):
        collection.add(
            documents=[chunk],
            embeddings=[embeddings[i]],
            ids=[f"{file_path}_{i}"]
        )

    print(f"✅ Ingested {len(chunks)} chunks from {file_path}")


def ingest_url(url: str):
    text = fetch_web_text(url)
    chunks = chunk_text(text)
    embeddings = embed_texts(chunks)

    for i, chunk in enumerate(chunks):
        collection.add(
            documents=[chunk],
            embeddings=[embeddings[i]],
            ids=[f"{url}_{i}"]
        )

    print(f"🌐 Ingested {len(chunks)} chunks from URL: {url}")
