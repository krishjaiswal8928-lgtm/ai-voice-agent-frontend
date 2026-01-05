"""
Callback Scheduler Service
Handles scheduling and execution of callback requests
"""

import asyncio
from datetime import datetime, timedelta
from typing import Dict, List
from app.services.outbound_service import make_outbound_call
import logging

logger = logging.getLogger(__name__)

class CallbackScheduler:
    """Service for scheduling and managing callback requests"""
    
    def __init__(self):
        self.scheduled_callbacks: Dict[str, Dict] = {}
        self.running = False
    
    async def schedule_callback(self, phone_number: str, delay_minutes: int = 60, 
                              context: str = "", campaign_id: int = None) -> str:
        """
        Schedule a callback for a specific phone number
        
        Args:
            phone_number: The phone number to call
            delay_minutes: Delay in minutes before calling (default: 60)
            context: Context for the callback
            campaign_id: Campaign ID for tracking
            
        Returns:
            Callback ID
        """
        callback_id = f"callback_{int(datetime.now().timestamp())}"
        
        # Calculate the callback time
        callback_time = datetime.now() + timedelta(minutes=delay_minutes)
        
        # Store the callback information
        self.scheduled_callbacks[callback_id] = {
            "phone_number": phone_number,
            "callback_time": callback_time,
            "context": context,
            "campaign_id": campaign_id,
            "status": "scheduled"
        }
        
        logger.info(f"Scheduled callback {callback_id} for {phone_number} at {callback_time}")
        
        # Start the scheduler if it's not already running
        if not self.running:
            asyncio.create_task(self._run_scheduler())
            self.running = True
            
        return callback_id
    
    async def _run_scheduler(self):
        """Run the callback scheduler"""
        while self.running:
            try:
                now = datetime.now()
                callbacks_to_execute = []
                
                # Find callbacks that are due
                for callback_id, callback_info in list(self.scheduled_callbacks.items()):
                    if (callback_info["status"] == "scheduled" and 
                        callback_info["callback_time"] <= now):
                        callbacks_to_execute.append((callback_id, callback_info))
                
                # Execute due callbacks
                for callback_id, callback_info in callbacks_to_execute:
                    await self._execute_callback(callback_id, callback_info)
                
                # Wait before checking again
                await asyncio.sleep(60)  # Check every minute
                
            except Exception as e:
                logger.error(f"Error in callback scheduler: {e}")
                await asyncio.sleep(60)
    
    async def _execute_callback(self, callback_id: str, callback_info: Dict):
        """Execute a scheduled callback"""
        try:
            logger.info(f"Executing callback {callback_id} for {callback_info['phone_number']}")
            
            # Update status
            self.scheduled_callbacks[callback_id]["status"] = "executing"
            
            # Make the outbound call
            call_context = {
                "goal": "Follow-up call",
                "context": callback_info.get("context", ""),
                "campaign_id": str(callback_info.get("campaign_id", ""))
            }
            
            result = await make_outbound_call(
                to_number=callback_info["phone_number"],
                call_context=call_context
            )
            
            if result["success"]:
                self.scheduled_callbacks[callback_id]["status"] = "completed"
                self.scheduled_callbacks[callback_id]["call_sid"] = result["call_sid"]
                logger.info(f"Callback {callback_id} completed successfully")
            else:
                self.scheduled_callbacks[callback_id]["status"] = "failed"
                logger.error(f"Callback {callback_id} failed: {result.get('error', 'Unknown error')}")
                
        except Exception as e:
            logger.error(f"Error executing callback {callback_id}: {e}")
            self.scheduled_callbacks[callback_id]["status"] = "failed"
    
    def get_scheduled_callbacks(self) -> List[Dict]:
        """Get all scheduled callbacks"""
        return list(self.scheduled_callbacks.values())
    
    def cancel_callback(self, callback_id: str) -> bool:
        """Cancel a scheduled callback"""
        if callback_id in self.scheduled_callbacks:
            self.scheduled_callbacks[callback_id]["status"] = "cancelled"
            return True
        return False
    
    def stop_scheduler(self):
        """Stop the scheduler"""
        self.running = False

# Global instance
callback_scheduler = CallbackScheduler()