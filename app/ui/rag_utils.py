# app/ui/rag_utils.py
import os
import json
import requests
from bs4 import BeautifulSoup
from pypdf import PdfReader
from docx import Document
from urllib.parse import urljoin, urlparse
import logging

logger = logging.getLogger(__name__)

# Temporary storage path
RAG_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "rag")
os.makedirs(RAG_DATA_DIR, exist_ok=True)
RAG_INDEX_FILE = os.path.join(RAG_DATA_DIR, "rag_index.json")


def load_rag_index():
    if os.path.exists(RAG_INDEX_FILE):
        with open(RAG_INDEX_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []


def save_rag_index(index):
    with open(RAG_INDEX_FILE, 'w', encoding='utf-8') as f:
        json.dump(index, f, indent=2, ensure_ascii=False)


def extract_text_from_pdf(file_path):
    try:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        logger.error(f"PDF extract error: {e}")
        return ""


def extract_text_from_docx(file_path):
    try:
        doc = Document(file_path)
        text = "\n".join([para.text for para in doc.paragraphs])
        return text.strip()
    except Exception as e:
        logger.error(f"DOCX extract error: {e}")
        return ""


def extract_text_from_txt(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read().strip()
    except:
        try:
            with open(file_path, 'r', encoding='latin-1') as f:
                return f.read().strip()
        except Exception as e:
            logger.error(f"TXT read error: {e}")
            return ""


def scrape_website(url, max_depth=1):
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'lxml')

        # Remove scripts/styles
        for script in soup(["script", "style", "nav", "footer", "header"]):
            script.decompose()

        text = soup.get_text(separator='\n')
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = '\n'.join(chunk for chunk in chunks if chunk)
        return text[:50000]  # Limit size
    except Exception as e:
        logger.error(f"Scrape error {url}: {e}")
        return ""


def process_uploaded_file(uploaded_file, progress_bar=None, status_text=None):
    if not uploaded_file:
        return None

    file_ext = os.path.splitext(uploaded_file.name)[1].lower()
    temp_path = os.path.join(RAG_DATA_DIR, uploaded_file.name)

    with open(temp_path, "wb") as f:
        f.write(uploaded_file.getbuffer())

    if status_text:
        status_text.text(f"Extracting text from {uploaded_file.name}...")

    text = ""
    if file_ext == ".pdf":
        text = extract_text_from_pdf(temp_path)
    elif file_ext == ".docx":
        text = extract_text_from_docx(temp_path)
    elif file_ext in {".txt", ".md"}:
        text = extract_text_from_txt(temp_path)

    os.unlink(temp_path)  # Clean up

    if progress_bar:
        progress_bar.progress(100)

    return {
        "source": uploaded_file.name,
        "type": "file",
        "content": text,
        "chunks": [text[i:i + 1000] for i in range(0, len(text), 800)]  # Simple chunking
    }


def process_url(url, progress_bar=None, status_text=None):
    if status_text:
        status_text.text(f"Scraping {url}...")
    text = scrape_website(url)
    if progress_bar:
        progress_bar.progress(100)
    return {
        "source": url,
        "type": "url",
        "content": text,
        "chunks": [text[i:i + 1000] for i in range(0, len(text), 800)]
    }