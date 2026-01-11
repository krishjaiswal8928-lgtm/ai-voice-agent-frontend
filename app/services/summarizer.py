import os
from google import genai
from google.genai import types
from .excel_exporter import export_conversation_to_csv as export_conversation_to_excel

# Load Gemini API key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable not found. Please set it in .env")

# Initialize client
client = genai.Client(api_key=GEMINI_API_KEY)


def summarize_conversation(conversation: list, goal: str, session_id: str, client_name: str = "DefaultClient"):
    """
    Summarize a full conversation using Gemini and export to Excel.
    """

    # 🧠 Prepare text from conversation
    conversation_text = "\n".join([f"{msg['role'].capitalize()}: {msg['content']}" for msg in conversation])

    prompt = f"""
     You are an AI call summarizer for a goal-based voice agent.
     Goal: {goal}
     Conversation:
     {conversation_text}

     Summarize the key points of this call in 4–6 bullet points.
     Focus on intent, decisions, and any follow-ups required.
     Keep it concise and professional.
     """

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=prompt,
                temperature=0.7,
                max_output_tokens=500
            ),
        )

        summary = (response.text or "").strip() or "No summary generated"

        # Export to Excel for record
        export_path = export_conversation_to_excel(
            session_id =session_id,
            conversation = conversation,
            goal = goal,
            client_name=client_name
        )
        return {
            "summary" : summary,
            "export_path" : export_path,
        }
    except Exception as e:
        return {"error" : str(e)}






