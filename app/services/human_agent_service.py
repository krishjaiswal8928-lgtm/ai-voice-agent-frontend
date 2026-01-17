"""
Human Agent Service
Manages human sales agents for call transfers and callback assignments.
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, time
from google.cloud import firestore
from app.models.human_agent import HumanAgent

logger = logging.getLogger(__name__)


class HumanAgentService:
    """Service for managing human sales agents."""
    
    def __init__(self, db: firestore.Client):
        self.db = db
        self.collection = db.collection('human_agents')
    
    # ===== CRUD OPERATIONS =====
    
    def create_agent(self, user_id: str, agent_data: Dict[str, Any]) -> HumanAgent:
        """
        Create a new human agent.
        
        Args:
            user_id: Organization/user ID
            agent_data: Agent information (name, email, phone, etc.)
            
        Returns:
            HumanAgent: Created agent
        """
        try:
            # Create agent model
            agent = HumanAgent(
                user_id=user_id,
                name=agent_data['name'],
                email=agent_data['email'],
                phone=agent_data.get('phone'),
                extension=agent_data.get('extension'),
                timezone=agent_data.get('timezone', 'UTC'),
                working_hours=agent_data.get('working_hours', {}),
                accepts_transfers=agent_data.get('accepts_transfers', True),
                accepts_callbacks=agent_data.get('accepts_callbacks', True),
                max_concurrent_calls=agent_data.get('max_concurrent_calls', 1),
                transfer_notification_method=agent_data.get('transfer_notification_method', 'call'),
                callback_notification_method=agent_data.get('callback_notification_method', 'email')
            )
            
            # Save to Firestore
            doc_ref = self.collection.document()
            doc_ref.set(agent.to_dict())
            
            agent.id = doc_ref.id
            
            logger.info(f"Created human agent: {agent.name} (ID: {agent.id})")
            return agent
            
        except Exception as e:
            logger.error(f"Failed to create agent: {str(e)}")
            raise
    
    def get_agent(self, agent_id: str) -> Optional[HumanAgent]:
        """
        Retrieve agent by ID.
        
        Args:
            agent_id: Agent ID
            
        Returns:
            HumanAgent or None
        """
        try:
            doc = self.collection.document(agent_id).get()
            
            if doc.exists:
                return HumanAgent.from_dict(doc.to_dict(), doc.id)
            return None
            
        except Exception as e:
            logger.error(f"Failed to get agent {agent_id}: {str(e)}")
            return None
    
    def update_agent(self, agent_id: str, updates: Dict[str, Any]) -> Optional[HumanAgent]:
        """
        Update agent information.
        
        Args:
            agent_id: Agent ID
            updates: Fields to update
            
        Returns:
            Updated HumanAgent or None
        """
        try:
            doc_ref = self.collection.document(agent_id)
            doc = doc_ref.get()
            
            if not doc.exists:
                return None
            
            # Update document
            doc_ref.update(updates)
            
            # Return updated agent
            updated_doc = doc_ref.get()
            return HumanAgent.from_dict(updated_doc.to_dict(), updated_doc.id)
            
        except Exception as e:
            logger.error(f"Failed to update agent {agent_id}: {str(e)}")
            return None
    
    def delete_agent(self, agent_id: str) -> bool:
        """
        Delete agent.
        
        Args:
            agent_id: Agent ID
            
        Returns:
            bool: True if successful
        """
        try:
            self.collection.document(agent_id).delete()
            logger.info(f"Deleted agent {agent_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete agent {agent_id}: {str(e)}")
            return False
    
    def list_agents(self, user_id: str, filters: Optional[Dict[str, Any]] = None) -> List[HumanAgent]:
        """
        List all agents for an organization.
        
        Args:
            user_id: Organization/user ID
            filters: Optional filters (status, accepts_transfers, etc.)
            
        Returns:
            List of HumanAgent
        """
        try:
            query = self.collection.where('user_id', '==', user_id)
            
            # Apply filters
            if filters:
                if 'status' in filters:
                    query = query.where('status', '==', filters['status'])
                if 'accepts_transfers' in filters:
                    query = query.where('accepts_transfers', '==', filters['accepts_transfers'])
                if 'accepts_callbacks' in filters:
                    query = query.where('accepts_callbacks', '==', filters['accepts_callbacks'])
            
            docs = query.stream()
            agents = [HumanAgent.from_dict(doc.to_dict(), doc.id) for doc in docs]
            
            return agents
            
        except Exception as e:
            logger.error(f"Failed to list agents: {str(e)}")
            return []
    
    # ===== AVAILABILITY MANAGEMENT =====
    
    def update_agent_status(self, agent_id: str, status: str) -> bool:
        """
        Update agent status.
        
        Args:
            agent_id: Agent ID
            status: New status ('available', 'busy', 'offline', 'on_call', 'break')
            
        Returns:
            bool: True if successful
        """
        try:
            updates = {
                'status': status,
                'last_status_change': datetime.now()
            }
            
            self.collection.document(agent_id).update(updates)
            logger.info(f"Agent {agent_id} status updated to {status}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to update agent status: {str(e)}")
            return False
    
    def get_available_agents(self, user_id: str, campaign_id: Optional[str] = None) -> List[HumanAgent]:
        """
        Get all available agents.
        
        Args:
            user_id: Organization/user ID
            campaign_id: Optional campaign ID for campaign-specific filtering
            
        Returns:
            List of available HumanAgent
        """
        try:
            # Query for available agents
            query = self.collection.where('user_id', '==', user_id).where('status', '==', 'available')
            
            docs = query.stream()
            agents = []
            
            for doc in docs:
                agent = HumanAgent.from_dict(doc.to_dict(), doc.id)
                
                # Check if agent can take more calls
                if agent.current_active_calls < agent.max_concurrent_calls:
                    # Check if within working hours
                    if self.check_working_hours(agent.id, datetime.now()):
                        agents.append(agent)
            
            return agents
            
        except Exception as e:
            logger.error(f"Failed to get available agents: {str(e)}")
            return []
    
    def is_agent_available(self, agent_id: str) -> bool:
        """
        Check if specific agent is available.
        
        Args:
            agent_id: Agent ID
            
        Returns:
            bool: True if available
        """
        try:
            agent = self.get_agent(agent_id)
            
            if not agent:
                return False
            
            # Check status
            if agent.status != 'available':
                return False
            
            # Check capacity
            if agent.current_active_calls >= agent.max_concurrent_calls:
                return False
            
            # Check working hours
            if not self.check_working_hours(agent_id, datetime.now()):
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to check agent availability: {str(e)}")
            return False
    
    def check_working_hours(self, agent_id: str, check_datetime: datetime) -> bool:
        """
        Verify if datetime is within agent's working hours.
        
        Args:
            agent_id: Agent ID
            check_datetime: Datetime to check
            
        Returns:
            bool: True if within working hours
        """
        try:
            agent = self.get_agent(agent_id)
            
            if not agent or not agent.working_hours:
                # If no working hours defined, assume always available
                return True
            
            # Get day of week (monday, tuesday, etc.)
            day_name = check_datetime.strftime('%A').lower()
            
            if day_name not in agent.working_hours:
                return False
            
            day_hours = agent.working_hours[day_name]
            
            # Check if day is a working day
            if not day_hours or day_hours.get('off', False):
                return False
            
            # Parse start and end times
            start_time_str = day_hours.get('start', '09:00')
            end_time_str = day_hours.get('end', '17:00')
            
            start_time = datetime.strptime(start_time_str, '%H:%M').time()
            end_time = datetime.strptime(end_time_str, '%H:%M').time()
            
            current_time = check_datetime.time()
            
            return start_time <= current_time <= end_time
            
        except Exception as e:
            logger.error(f"Failed to check working hours: {str(e)}")
            return True  # Default to available on error
    
    def get_agent_capacity(self, agent_id: str) -> Dict[str, Any]:
        """
        Check agent's current capacity.
        
        Args:
            agent_id: Agent ID
            
        Returns:
            dict: Capacity information
        """
        try:
            agent = self.get_agent(agent_id)
            
            if not agent:
                return {
                    'available': False,
                    'current_calls': 0,
                    'max_calls': 0,
                    'remaining_capacity': 0
                }
            
            remaining = agent.max_concurrent_calls - agent.current_active_calls
            
            return {
                'available': remaining > 0,
                'current_calls': agent.current_active_calls,
                'max_calls': agent.max_concurrent_calls,
                'remaining_capacity': remaining
            }
            
        except Exception as e:
            logger.error(f"Failed to get agent capacity: {str(e)}")
            return {
                'available': False,
                'current_calls': 0,
                'max_calls': 0,
                'remaining_capacity': 0
            }
    
    # ===== AGENT ASSIGNMENT LOGIC =====
    
    def assign_transfer(self, campaign_id: str, lead_id: str, routing_method: str = 'round_robin') -> Optional[HumanAgent]:
        """
        Assign transfer to best available agent.
        
        Args:
            campaign_id: Campaign ID
            lead_id: Lead ID
            routing_method: 'round_robin', 'least_busy', 'skill_based', 'specific_agent'
            
        Returns:
            HumanAgent or None
        """
        try:
            # Get campaign to find user_id
            campaign_ref = self.db.collection('campaigns').document(campaign_id).get()
            if not campaign_ref.exists:
                logger.error(f"Campaign {campaign_id} not found")
                return None
            
            campaign_data = campaign_ref.to_dict()
            user_id = campaign_data.get('user_id')
            
            # Get available agents
            available_agents = self.get_available_agents(user_id, campaign_id)
            
            if not available_agents:
                logger.warning(f"No available agents for campaign {campaign_id}")
                return None
            
            # Apply routing method
            if routing_method == 'round_robin':
                return self._assign_round_robin(available_agents)
            elif routing_method == 'least_busy':
                return self._assign_least_busy(available_agents)
            elif routing_method == 'skill_based':
                return self._assign_skill_based(available_agents, lead_id)
            elif routing_method == 'specific_agent':
                # Get default agent from campaign settings
                default_agent_id = campaign_data.get('default_transfer_agent_id')
                if default_agent_id:
                    return self.get_agent(default_agent_id)
                return available_agents[0] if available_agents else None
            else:
                # Default to round robin
                return self._assign_round_robin(available_agents)
                
        except Exception as e:
            logger.error(f"Failed to assign transfer: {str(e)}")
            return None
    
    def _assign_round_robin(self, agents: List[HumanAgent]) -> Optional[HumanAgent]:
        """Round robin assignment - rotate through agents."""
        if not agents:
            return None
        
        # Simple implementation: return first agent
        # In production, track last assigned agent and rotate
        return agents[0]
    
    def _assign_least_busy(self, agents: List[HumanAgent]) -> Optional[HumanAgent]:
        """Assign to agent with fewest active calls."""
        if not agents:
            return None
        
        # Sort by current_active_calls (ascending)
        sorted_agents = sorted(agents, key=lambda a: a.current_active_calls)
        return sorted_agents[0]
    
    def _assign_skill_based(self, agents: List[HumanAgent], lead_id: str) -> Optional[HumanAgent]:
        """Assign based on agent skills and lead requirements."""
        # Simplified: return first agent
        # In production, match agent skills with lead requirements
        return agents[0] if agents else None
    
    def assign_callback(self, campaign_id: str, lead_id: str, scheduled_time: datetime) -> Optional[HumanAgent]:
        """
        Assign callback to an agent.
        
        Args:
            campaign_id: Campaign ID
            lead_id: Lead ID
            scheduled_time: When callback is scheduled
            
        Returns:
            HumanAgent or None
        """
        try:
            # Get campaign
            campaign_ref = self.db.collection('campaigns').document(campaign_id).get()
            if not campaign_ref.exists:
                return None
            
            campaign_data = campaign_ref.to_dict()
            user_id = campaign_data.get('user_id')
            routing_method = campaign_data.get('transfer_routing_method', 'round_robin')
            
            # Get agents who accept callbacks
            agents = self.list_agents(user_id, {'accepts_callbacks': True})
            
            if not agents:
                return None
            
            # Filter agents available at scheduled time
            available_at_time = [
                agent for agent in agents
                if self.check_working_hours(agent.id, scheduled_time)
            ]
            
            if not available_at_time:
                # Fallback to any agent who accepts callbacks
                available_at_time = agents
            
            # Use same routing logic as transfers
            if routing_method == 'least_busy':
                return self._assign_least_busy(available_at_time)
            else:
                return self._assign_round_robin(available_at_time)
                
        except Exception as e:
            logger.error(f"Failed to assign callback: {str(e)}")
            return None
    
    # ===== PERFORMANCE TRACKING =====
    
    def track_transfer_received(self, agent_id: str, lead_id: str) -> bool:
        """
        Log transfer received by agent.
        
        Args:
            agent_id: Agent ID
            lead_id: Lead ID
            
        Returns:
            bool: True if successful
        """
        try:
            agent = self.get_agent(agent_id)
            if not agent:
                return False
            
            # Increment counters
            updates = {
                'total_transfers_received': agent.total_transfers_received + 1,
                'current_active_calls': agent.current_active_calls + 1
            }
            
            self.collection.document(agent_id).update(updates)
            logger.info(f"Tracked transfer for agent {agent_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to track transfer: {str(e)}")
            return False
    
    def track_callback_completed(self, agent_id: str, callback_id: str, outcome: str) -> bool:
        """
        Log callback completion.
        
        Args:
            agent_id: Agent ID
            callback_id: Callback ID
            outcome: Callback outcome
            
        Returns:
            bool: True if successful
        """
        try:
            agent = self.get_agent(agent_id)
            if not agent:
                return False
            
            # Increment counter
            updates = {
                'total_callbacks_completed': agent.total_callbacks_completed + 1
            }
            
            self.collection.document(agent_id).update(updates)
            logger.info(f"Tracked callback completion for agent {agent_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to track callback: {str(e)}")
            return False
    
    def get_agent_metrics(self, agent_id: str, date_range: Optional[Dict[str, datetime]] = None) -> Dict[str, Any]:
        """
        Get agent performance metrics.
        
        Args:
            agent_id: Agent ID
            date_range: Optional date range filter
            
        Returns:
            dict: Performance metrics
        """
        try:
            agent = self.get_agent(agent_id)
            if not agent:
                return {}
            
            return {
                'agent_id': agent_id,
                'agent_name': agent.name,
                'total_transfers_received': agent.total_transfers_received,
                'total_callbacks_completed': agent.total_callbacks_completed,
                'average_call_duration': agent.average_call_duration,
                'conversion_rate': agent.conversion_rate,
                'current_active_calls': agent.current_active_calls,
                'status': agent.status
            }
            
        except Exception as e:
            logger.error(f"Failed to get agent metrics: {str(e)}")
            return {}
    
    def calculate_agent_conversion_rate(self, agent_id: str) -> float:
        """
        Calculate agent's conversion rate.
        
        Args:
            agent_id: Agent ID
            
        Returns:
            float: Conversion rate (0-1)
        """
        try:
            agent = self.get_agent(agent_id)
            if not agent or agent.total_transfers_received == 0:
                return 0.0
            
            # This would need to query actual conversion data
            # Simplified: return stored conversion_rate
            return agent.conversion_rate
            
        except Exception as e:
            logger.error(f"Failed to calculate conversion rate: {str(e)}")
            return 0.0


# Singleton instance
def get_human_agent_service(db: firestore.Client) -> HumanAgentService:
    """Get human agent service instance."""
    return HumanAgentService(db)
