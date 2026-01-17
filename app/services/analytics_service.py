"""
Analytics Service
Comprehensive analytics and reporting for campaigns, leads, transfers, and callbacks.
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from google.cloud import firestore
from collections import defaultdict

logger = logging.getLogger(__name__)


class AnalyticsService:
    """Service for generating analytics and reports."""
    
    def __init__(self, db: firestore.Client):
        self.db = db
    
    # ===== CAMPAIGN ANALYTICS =====
    
    def get_campaign_analytics(
        self,
        campaign_id: str,
        date_range: Optional[Dict[str, datetime]] = None
    ) -> Dict[str, Any]:
        """
        Get comprehensive analytics for a campaign.
        
        Args:
            campaign_id: Campaign ID
            date_range: Optional date range filter
            
        Returns:
            dict: Complete campaign analytics
        """
        try:
            # Get campaign data
            campaign_ref = self.db.collection('campaigns').document(campaign_id)
            campaign_doc = campaign_ref.get()
            
            if not campaign_doc.exists:
                return {'error': 'Campaign not found'}
            
            campaign_data = campaign_doc.to_dict()
            
            # Get leads for campaign
            leads_query = self.db.collection('leads').where('campaign_id', '==', campaign_id)
            leads = list(leads_query.stream())
            
            # Calculate metrics
            total_leads = len(leads)
            
            # Call status breakdown
            call_status_counts = self._count_by_field(leads, 'call_status')
            
            # Disposition breakdown
            disposition_counts = self._count_by_field(leads, 'disposition')
            
            # Lead scores distribution
            lead_scores = [doc.to_dict().get('lead_score', 0) for doc in leads]
            avg_lead_score = sum(lead_scores) / len(lead_scores) if lead_scores else 0
            
            # Transfer statistics
            transferred_leads = [doc for doc in leads if doc.to_dict().get('transferred', False)]
            total_transfers = len(transferred_leads)
            transfer_rate = (total_transfers / total_leads * 100) if total_leads > 0 else 0
            
            # Callback statistics
            callback_leads = [doc for doc in leads if doc.to_dict().get('callback_scheduled', False)]
            total_callbacks = len(callback_leads)
            callback_rate = (total_callbacks / total_leads * 100) if total_leads > 0 else 0
            
            # Qualification breakdown
            qualified_leads = len([doc for doc in leads if doc.to_dict().get('disposition') == 'qualified'])
            warm_leads = len([doc for doc in leads if doc.to_dict().get('disposition') == 'warm_lead'])
            not_qualified = len([doc for doc in leads if doc.to_dict().get('disposition') == 'not_qualified'])
            
            qualification_rate = (qualified_leads / total_leads * 100) if total_leads > 0 else 0
            
            # Connection rate
            connected_leads = len([
                doc for doc in leads 
                if doc.to_dict().get('call_status') in ['completed', 'in-progress']
            ])
            connection_rate = (connected_leads / total_leads * 100) if total_leads > 0 else 0
            
            # Average call duration
            call_durations = [
                doc.to_dict().get('call_duration_seconds', 0) 
                for doc in leads 
                if doc.to_dict().get('call_duration_seconds')
            ]
            avg_call_duration = sum(call_durations) / len(call_durations) if call_durations else 0
            
            return {
                'campaign_id': campaign_id,
                'campaign_name': campaign_data.get('name'),
                'campaign_status': campaign_data.get('status'),
                
                # Overall metrics
                'total_leads': total_leads,
                'leads_called': campaign_data.get('leads_called', 0),
                'leads_connected': connected_leads,
                'connection_rate': round(connection_rate, 2),
                
                # Qualification metrics
                'leads_qualified': qualified_leads,
                'leads_warm': warm_leads,
                'leads_not_qualified': not_qualified,
                'qualification_rate': round(qualification_rate, 2),
                'average_lead_score': round(avg_lead_score, 2),
                
                # Transfer metrics
                'total_transfers': total_transfers,
                'transfer_rate': round(transfer_rate, 2),
                'transfer_success_rate': self._calculate_transfer_success_rate(transferred_leads),
                
                # Callback metrics
                'total_callbacks_scheduled': total_callbacks,
                'callback_rate': round(callback_rate, 2),
                'callback_completion_rate': self._calculate_callback_completion_rate(campaign_id),
                
                # Call metrics
                'average_call_duration': round(avg_call_duration, 2),
                'total_call_time': sum(call_durations),
                
                # Breakdowns
                'call_status_breakdown': call_status_counts,
                'disposition_breakdown': disposition_counts,
                'disposition_reasons': self._get_disposition_reasons(leads),
                
                # Time-based metrics
                'created_at': campaign_data.get('created_at'),
                'last_call_at': campaign_data.get('last_call_at')
            }
            
        except Exception as e:
            logger.error(f"Failed to get campaign analytics: {str(e)}")
            return {'error': str(e)}
    
    def get_disposition_breakdown(self, campaign_id: str) -> Dict[str, Any]:
        """Get detailed disposition breakdown with reasons."""
        try:
            leads_query = self.db.collection('leads').where('campaign_id', '==', campaign_id)
            leads = list(leads_query.stream())
            
            disposition_data = defaultdict(lambda: {
                'count': 0,
                'percentage': 0,
                'reasons': defaultdict(int)
            })
            
            total_leads = len(leads)
            
            for doc in leads:
                data = doc.to_dict()
                disposition = data.get('disposition', 'unknown')
                reason = data.get('disposition_reason', 'No reason provided')
                
                disposition_data[disposition]['count'] += 1
                disposition_data[disposition]['reasons'][reason] += 1
            
            # Calculate percentages
            for disposition in disposition_data:
                count = disposition_data[disposition]['count']
                disposition_data[disposition]['percentage'] = round(
                    (count / total_leads * 100) if total_leads > 0 else 0, 2
                )
            
            return dict(disposition_data)
            
        except Exception as e:
            logger.error(f"Failed to get disposition breakdown: {str(e)}")
            return {}
    
    # ===== TRANSFER ANALYTICS =====
    
    def get_transfer_analytics(self, campaign_id: str) -> Dict[str, Any]:
        """Get detailed transfer analytics."""
        try:
            # Get transferred leads
            leads_query = self.db.collection('leads').where(
                'campaign_id', '==', campaign_id
            ).where('transferred', '==', True)
            
            transferred_leads = list(leads_query.stream())
            
            if not transferred_leads:
                return {
                    'total_transfers': 0,
                    'message': 'No transfers for this campaign'
                }
            
            # Transfer type breakdown
            transfer_types = self._count_by_field(transferred_leads, 'transfer_type')
            
            # Transfer status breakdown
            transfer_statuses = self._count_by_field(transferred_leads, 'transfer_status')
            
            # Agent distribution
            agent_distribution = self._count_by_field(transferred_leads, 'transferred_to_agent_name')
            
            # Success rate
            successful = len([
                doc for doc in transferred_leads 
                if doc.to_dict().get('transfer_status') == 'completed'
            ])
            success_rate = (successful / len(transferred_leads) * 100) if transferred_leads else 0
            
            # Average time to transfer (from call start to transfer)
            transfer_times = []
            for doc in transferred_leads:
                data = doc.to_dict()
                if data.get('transferred_at') and data.get('last_call_attempt'):
                    # Calculate time difference
                    # This is simplified - in production, calculate actual time difference
                    transfer_times.append(60)  # Placeholder
            
            avg_transfer_time = sum(transfer_times) / len(transfer_times) if transfer_times else 0
            
            return {
                'total_transfers': len(transferred_leads),
                'successful_transfers': successful,
                'failed_transfers': len(transferred_leads) - successful,
                'success_rate': round(success_rate, 2),
                'average_transfer_time_seconds': round(avg_transfer_time, 2),
                
                'transfer_type_breakdown': transfer_types,
                'transfer_status_breakdown': transfer_statuses,
                'agent_distribution': agent_distribution,
                
                'top_agents': self._get_top_agents(agent_distribution, limit=5)
            }
            
        except Exception as e:
            logger.error(f"Failed to get transfer analytics: {str(e)}")
            return {'error': str(e)}
    
    # ===== CALLBACK ANALYTICS =====
    
    def get_callback_analytics(self, campaign_id: str) -> Dict[str, Any]:
        """Get detailed callback analytics."""
        try:
            # Get callbacks for campaign
            callbacks_query = self.db.collection('scheduled_callbacks').where(
                'campaign_id', '==', campaign_id
            )
            
            callbacks = list(callbacks_query.stream())
            
            if not callbacks:
                return {
                    'total_callbacks': 0,
                    'message': 'No callbacks for this campaign'
                }
            
            # Status breakdown
            status_counts = self._count_by_field(callbacks, 'status')
            
            # Priority breakdown
            priority_counts = self._count_by_field(callbacks, 'priority')
            
            # Completion metrics
            completed = len([doc for doc in callbacks if doc.to_dict().get('status') == 'completed'])
            pending = len([doc for doc in callbacks if doc.to_dict().get('status') == 'pending'])
            missed = len([doc for doc in callbacks if doc.to_dict().get('status') == 'missed'])
            
            completion_rate = (completed / len(callbacks) * 100) if callbacks else 0
            
            # Agent distribution
            agent_distribution = self._count_by_field(callbacks, 'assigned_to_agent_name')
            
            # Outcome breakdown (for completed callbacks)
            completed_callbacks = [doc for doc in callbacks if doc.to_dict().get('status') == 'completed']
            outcome_counts = self._count_by_field(completed_callbacks, 'outcome')
            
            return {
                'total_callbacks': len(callbacks),
                'pending_callbacks': pending,
                'completed_callbacks': completed,
                'missed_callbacks': missed,
                'completion_rate': round(completion_rate, 2),
                
                'status_breakdown': status_counts,
                'priority_breakdown': priority_counts,
                'outcome_breakdown': outcome_counts,
                'agent_distribution': agent_distribution,
                
                'average_lead_score': self._calculate_avg_callback_lead_score(callbacks)
            }
            
        except Exception as e:
            logger.error(f"Failed to get callback analytics: {str(e)}")
            return {'error': str(e)}
    
    # ===== AGENT PERFORMANCE =====
    
    def get_agent_performance(
        self,
        user_id: str,
        date_range: Optional[Dict[str, datetime]] = None
    ) -> List[Dict[str, Any]]:
        """Get performance metrics for all agents."""
        try:
            # Get all agents
            agents_query = self.db.collection('human_agents').where('user_id', '==', user_id)
            agents = list(agents_query.stream())
            
            performance_data = []
            
            for agent_doc in agents:
                agent_data = agent_doc.to_dict()
                agent_id = agent_doc.id
                
                # Get transfers for this agent
                transfers_query = self.db.collection('leads').where(
                    'transferred_to_agent_id', '==', agent_id
                )
                transfers = list(transfers_query.stream())
                
                # Get callbacks for this agent
                callbacks_query = self.db.collection('scheduled_callbacks').where(
                    'assigned_to_agent_id', '==', agent_id
                )
                callbacks = list(callbacks_query.stream())
                
                # Calculate metrics
                total_transfers = len(transfers)
                successful_transfers = len([
                    t for t in transfers 
                    if t.to_dict().get('transfer_status') == 'completed'
                ])
                
                total_callbacks = len(callbacks)
                completed_callbacks = len([
                    c for c in callbacks 
                    if c.to_dict().get('status') == 'completed'
                ])
                
                performance_data.append({
                    'agent_id': agent_id,
                    'agent_name': agent_data.get('name'),
                    'status': agent_data.get('status'),
                    
                    'total_transfers_received': total_transfers,
                    'successful_transfers': successful_transfers,
                    'transfer_success_rate': round(
                        (successful_transfers / total_transfers * 100) if total_transfers > 0 else 0, 2
                    ),
                    
                    'total_callbacks_assigned': total_callbacks,
                    'callbacks_completed': completed_callbacks,
                    'callback_completion_rate': round(
                        (completed_callbacks / total_callbacks * 100) if total_callbacks > 0 else 0, 2
                    ),
                    
                    'average_call_duration': agent_data.get('average_call_duration', 0),
                    'conversion_rate': agent_data.get('conversion_rate', 0),
                    
                    'current_active_calls': agent_data.get('current_active_calls', 0),
                    'max_concurrent_calls': agent_data.get('max_concurrent_calls', 1)
                })
            
            # Sort by total transfers (most active first)
            performance_data.sort(key=lambda x: x['total_transfers_received'], reverse=True)
            
            return performance_data
            
        except Exception as e:
            logger.error(f"Failed to get agent performance: {str(e)}")
            return []
    
    # ===== REAL-TIME DASHBOARD =====
    
    def get_dashboard_metrics(self, user_id: str) -> Dict[str, Any]:
        """Get real-time dashboard metrics for user."""
        try:
            # Get all campaigns for user
            campaigns_query = self.db.collection('campaigns').where('user_id', '==', user_id)
            campaigns = list(campaigns_query.stream())
            
            # Active campaigns
            active_campaigns = [
                c for c in campaigns 
                if c.to_dict().get('status') == 'active'
            ]
            
            # Get all leads for user's campaigns
            campaign_ids = [c.id for c in campaigns]
            
            total_leads = 0
            total_qualified = 0
            total_transfers = 0
            total_callbacks = 0
            
            for campaign_id in campaign_ids:
                leads_query = self.db.collection('leads').where('campaign_id', '==', campaign_id)
                leads = list(leads_query.stream())
                
                total_leads += len(leads)
                total_qualified += len([
                    l for l in leads 
                    if l.to_dict().get('disposition') == 'qualified'
                ])
                total_transfers += len([
                    l for l in leads 
                    if l.to_dict().get('transferred', False)
                ])
                total_callbacks += len([
                    l for l in leads 
                    if l.to_dict().get('callback_scheduled', False)
                ])
            
            # Get upcoming callbacks
            upcoming_callbacks_query = self.db.collection('scheduled_callbacks').where(
                'status', '==', 'pending'
            ).limit(10)
            upcoming_callbacks = list(upcoming_callbacks_query.stream())
            
            # Get available agents
            agents_query = self.db.collection('human_agents').where(
                'user_id', '==', user_id
            ).where('status', '==', 'available')
            available_agents = list(agents_query.stream())
            
            return {
                'total_campaigns': len(campaigns),
                'active_campaigns': len(active_campaigns),
                'total_leads': total_leads,
                'total_qualified_leads': total_qualified,
                'total_transfers': total_transfers,
                'total_callbacks_scheduled': total_callbacks,
                
                'qualification_rate': round(
                    (total_qualified / total_leads * 100) if total_leads > 0 else 0, 2
                ),
                'transfer_rate': round(
                    (total_transfers / total_leads * 100) if total_leads > 0 else 0, 2
                ),
                
                'available_agents_count': len(available_agents),
                'upcoming_callbacks_count': len(upcoming_callbacks),
                
                'recent_activity': self._get_recent_activity(user_id, limit=10)
            }
            
        except Exception as e:
            logger.error(f"Failed to get dashboard metrics: {str(e)}")
            return {'error': str(e)}
    
    # ===== HELPER METHODS =====
    
    def _count_by_field(self, docs: List, field: str) -> Dict[str, int]:
        """Count occurrences of field values."""
        counts = defaultdict(int)
        for doc in docs:
            value = doc.to_dict().get(field, 'unknown')
            counts[str(value)] += 1
        return dict(counts)
    
    def _get_disposition_reasons(self, leads: List) -> Dict[str, int]:
        """Get disposition reasons breakdown."""
        reasons = defaultdict(int)
        for doc in leads:
            reason = doc.to_dict().get('disposition_reason', 'No reason')
            if reason:
                reasons[reason] += 1
        return dict(reasons)
    
    def _calculate_transfer_success_rate(self, transferred_leads: List) -> float:
        """Calculate transfer success rate."""
        if not transferred_leads:
            return 0.0
        
        successful = len([
            doc for doc in transferred_leads 
            if doc.to_dict().get('transfer_status') == 'completed'
        ])
        
        return round((successful / len(transferred_leads) * 100), 2)
    
    def _calculate_callback_completion_rate(self, campaign_id: str) -> float:
        """Calculate callback completion rate."""
        try:
            callbacks_query = self.db.collection('scheduled_callbacks').where(
                'campaign_id', '==', campaign_id
            )
            callbacks = list(callbacks_query.stream())
            
            if not callbacks:
                return 0.0
            
            completed = len([
                doc for doc in callbacks 
                if doc.to_dict().get('status') == 'completed'
            ])
            
            return round((completed / len(callbacks) * 100), 2)
            
        except Exception as e:
            logger.error(f"Failed to calculate callback completion rate: {str(e)}")
            return 0.0
    
    def _calculate_avg_callback_lead_score(self, callbacks: List) -> float:
        """Calculate average lead score for callbacks."""
        scores = [doc.to_dict().get('lead_score', 0) for doc in callbacks]
        return round(sum(scores) / len(scores), 2) if scores else 0.0
    
    def _get_top_agents(self, agent_distribution: Dict[str, int], limit: int = 5) -> List[Dict[str, Any]]:
        """Get top agents by transfer count."""
        sorted_agents = sorted(
            agent_distribution.items(),
            key=lambda x: x[1],
            reverse=True
        )[:limit]
        
        return [
            {'agent_name': name, 'transfer_count': count}
            for name, count in sorted_agents
        ]
    
    def _get_recent_activity(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent activity for dashboard."""
        try:
            # Get recent call dispositions
            dispositions_query = self.db.collection('call_dispositions').order_by(
                'created_at', direction=firestore.Query.DESCENDING
            ).limit(limit)
            
            dispositions = list(dispositions_query.stream())
            
            activity = []
            for doc in dispositions:
                data = doc.to_dict()
                activity.append({
                    'type': 'call_completed',
                    'lead_id': data.get('lead_id'),
                    'disposition': data.get('disposition'),
                    'timestamp': data.get('created_at')
                })
            
            return activity
            
        except Exception as e:
            logger.error(f"Failed to get recent activity: {str(e)}")
            return []


# Factory function
def get_analytics_service(db: firestore.Client) -> AnalyticsService:
    """Get analytics service instance."""
    return AnalyticsService(db)
