# app/tasks/background_jobs.py

import asyncio
from app.services.summarizer import summarize_conversation
from app.services.excel_exporter import export_conversation_to_excel

async def process_post_call_tasks(conversation, goal, session_id, client_name):
    """
    Asynchronous background task to summarize and export after a call ends.
    """

    print(f"[INFO] Starting background tasks for session: {session_id}")

    try:
        # Step 1: Summarize conversation
        result = summarize_conversation(
            conversation=conversation,
            goal=goal,
            session_id=session_id,
            client_name=client_name
        )

        if "error" in result:
            print(f"[ERROR] Summarization failed: {result['error']}")
            return

        summary = result["summary"]
        export_path = result["export_path"]

        print(f"[SUCCESS] Summary created for {session_id}")
        print(f"Excel Exported to: {export_path}")

        # Step 2: (Optional) Email or store in DB
        # TODO: Integrate email_service / database save later

        return {
            "status": "completed",
            "summary": summary,
            "export_path": export_path
        }

    except Exception as e:
        print(f"[ERROR] Background job failed: {e}")
        return {"status": "failed", "error": str(e)}


def run_background_tasks(conversation, goal, session_id, client_name):
    """
    Helper function to run async background tasks in non-async context.
    """

    loop = asyncio.get_event_loop()
    if loop.is_running():
        asyncio.create_task(
            process_post_call_tasks(conversation, goal, session_id, client_name)
        )
    else:
        loop.run_until_complete(
            process_post_call_tasks(conversation, goal, session_id, client_name)
        )
