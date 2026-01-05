import streamlit as st
import os
import sys

# Add the project root and app directory to Python path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
app_dir = os.path.join(project_root, "app")
sys.path.insert(0, project_root)
sys.path.insert(0, app_dir)


from app.ui.rag_utils import (
    load_rag_index, save_rag_index, process_uploaded_file, process_url
)
from app.ui.config_ui import UIConfig

# Page config must be the first Streamlit command
st.set_page_config(
    page_title = "AI Voice Agent Dashboard",
    page_icon = "phone",
    layout = "wide",
    initial_sidebar_state = "expanded"
)

# Title
st.title("AI Voice Agent Control Panel")
st.markdown("### Manage RAG Data • Inbound & Outbound Calls • Call History")

# Sidebar navigation
st.sidebar.title("Navigation")
page = st.sidebar.radio("Go to", [
    "RAG Data Upload",
    "Inbound Calls",
    "Outbound Calls",
    "Call History"
])

# Placeholder pages
if page == "RAG Data Upload":
    st.header("Upload Data for RAG")
    st.info("Upload websites, PDFs or DOCX files to build your knowledge base.")
    rag_index = load_rag_index()
    st.write(f"**{len(rag_index)} sources loaded**")

    # Tabs
    tab1, tab2, tab3 = st.tabs (["Upload Files", "Add URLs", "View Index"])
    with tab1 :
        uploaded_files = st.file_uploader(
            "Upload PDF, Docx",
            type=["pdf", "docx", "txt"],
            accept_multiple_files=True,
            help=f"Max {UIConfig.MAX_FILE_SIZE_MB} MB per file"
        )

        if uploaded_files and st.button("Process Files", type = "primary"):
            new_entries = []
            progress_bar = st.progress(0)
            status_text = st.empty()

            for i, file in enumerate(uploaded_files):
                status_text.text(f"Processing {file.name}...")
                entry = process_uploaded_file(file, progress_bar, status_text)
                if entry and entry["content"]:
                    new_entries.append(entry)
                progress_bar.progress((i + 1) / len(uploaded_files))

            if new_entries :
                rag_index.extend(new_entries)
                save_rag_index(rag_index)
                st.success(f"Added {len(new_entries)} files!")
                st.rerun()
            else:
                st.error("No text Extracted.")
    with tab2:
        url_input = st.text_area("Enter URLs (one per line)", height=150)
        if st.button("Scrape URLs", type = "primary"):
            urls = [u.strip() for u in url_input.splitlines() if u.strip()]
            if not urls:
                st.warning("Enter at least one URL")

            elif len(urls) > UIConfig.MAX_URLS:
                st.error(f"Max {UIConfig.MAX_URLS} URLs are allowed")

            else :
                new_entries = []
                progress_bar = st.progress(0)
                for i, url in enumerate(urls):
                    entry = process_url(url, progress_bar, st.empty())
                    if entry and entry["content"]:
                        new_entries.append(entry)
                    progress_bar.progress((i+1) / len(urls))

                if new_entries :
                    rag_index.extend(new_entries)
                    save_rag_index(rag_index)
                    st.success(f"Scraped {len(new_entries)} URLs!")
                    st.rerun()
    with tab3:
        if rag_index:
            for i, item in enumerate(rag_index):
                with st.expander(f"{item['type'].title()}: {item['source'] [:60]}..."):
                    st.write(f"**Chars** {len(item['content']) :,}")
                    st.write(f"**Chunks** {len(item['chunks'])}")
                    st.code(item['content'] [ : 500] + "...", language="text")

        else :
            st.info("No data in RAG index yet.")



elif page == "Inbound Calls" :
    st.header("Inbound Call Monitor")
    st.info("Real-time view of incoming calls.")

elif page == "Outbound Calls":
    st.header("Make Outbound Calls")
    st.info("Enter a phone number to start a call.")

elif page == "Call History":
    st.header("Call History")
    st.info("View and export past conversations.")

# Footer
st.markdown("___")
st.caption("AI Voice Agent • Powered by Agon")
