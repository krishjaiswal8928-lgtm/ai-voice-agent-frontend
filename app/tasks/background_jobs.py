# app/tasks/background_jobs.py

import asyncio
from app.services.summarizer import summarize_conversation


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


# SIP Trunk Status Monitoring (ElevenLabs Model)
async def check_sip_trunk_status(db, trunk_id: str):
    """
    Check if a SIP trunk's PBX is reachable.
    This simulates a SIP OPTIONS ping to the user's outbound_address.
    """
    from datetime import datetime
    from app.services.sip_trunk_service import SIPTrunkService
    import socket
    
    print(f"[INFO] Checking SIP trunk status: {trunk_id}")
    
    try:
        service = SIPTrunkService()
        trunk = service.get_sip_trunk(db, trunk_id)
        
        if not trunk:
            print(f"[ERROR] Trunk not found: {trunk_id}")
            return
        
        # Extract hostname from outbound_address
        outbound_host = trunk.outbound_address
        if '://' in outbound_host:
            outbound_host = outbound_host.split('://')[1]
        if ':' in outbound_host:
            outbound_host, port = outbound_host.split(':')
            port = int(port)
        else:
            port = 5060  # Default SIP port
        
        # Try to connect to the PBX
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(5)  # 5 second timeout
            result = sock.connect_ex((outbound_host, port))
            sock.close()
            
            if result == 0:
                # Connection successful
                update_data = {
                    'connection_status': 'connected',
                    'last_connected_at': datetime.utcnow(),
                    'last_checked_at': datetime.utcnow(),
                    'error_message': None
                }
                print(f"[SUCCESS] SIP trunk {trunk_id} is connected")
            else:
                # Connection failed
                update_data = {
                    'connection_status': 'disconnected',
                    'last_checked_at': datetime.utcnow(),
                    'error_message': f'Cannot reach PBX at {outbound_host}:{port}'
                }
                print(f"[WARNING] SIP trunk {trunk_id} is disconnected")
                
        except socket.gaierror:
            # DNS resolution failed
            update_data = {
                'connection_status': 'error',
                'last_checked_at': datetime.utcnow(),
                'error_message': f'DNS resolution failed for {outbound_host}'
            }
            print(f"[ERROR] DNS resolution failed for {trunk_id}")
            
        except Exception as e:
            # Other connection errors
            update_data = {
                'connection_status': 'error',
                'last_checked_at': datetime.utcnow(),
                'error_message': str(e)
            }
            print(f"[ERROR] Connection error for {trunk_id}: {e}")
        
        # Update trunk status in database
        db.collection('sip_trunks').document(trunk_id).update(update_data)
        
    except Exception as e:
        print(f"[ERROR] Failed to check SIP trunk status: {e}")


async def monitor_all_sip_trunks(db):
    """
    Monitor all active SIP trunks.
    This should be run periodically (e.g., every 5 minutes).
    """
    print("[INFO] Starting SIP trunk monitoring...")
    
    try:
        # Get all SIP trunks
        trunks_ref = db.collection('sip_trunks')
        trunks = trunks_ref.where('is_active', '==', True).stream()
        
        tasks = []
        for trunk_doc in trunks:
            trunk_id = trunk_doc.id
            tasks.append(check_sip_trunk_status(db, trunk_id))
        
        # Run all checks concurrently
        await asyncio.gather(*tasks)
        
        print(f"[SUCCESS] Monitored {len(tasks)} SIP trunks")
        
    except Exception as e:
        print(f"[ERROR] SIP trunk monitoring failed: {e}")


def run_sip_trunk_monitoring(db):
    """
    Helper function to run SIP trunk monitoring in non-async context.
    """
    loop = asyncio.get_event_loop()
    if loop.is_running():
        asyncio.create_task(monitor_all_sip_trunks(db))
    else:
        loop.run_until_complete(monitor_all_sip_trunks(db))

