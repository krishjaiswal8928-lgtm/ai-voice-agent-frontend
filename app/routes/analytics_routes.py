"""
Analytics API Routes
Endpoints for retrieving analytics and reports.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from pydantic import BaseModel
from datetime import datetime
from google.cloud import firestore

from app.services.analytics_service import get_analytics_service
from app.config.firebase_config import get_firestore_client
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


# ===== API ENDPOINTS =====

@router.get("/campaign/{campaign_id}")
async def get_campaign_analytics(
    campaign_id: str,
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_firestore_client)
):
    """
    Get comprehensive analytics for a campaign.
    
    Returns:
    - Overall metrics (total leads, connection rate, qualification rate)
    - Disposition breakdown
    - Transfer statistics
    - Callback statistics
    - Call metrics
    """
    try:
        # Verify campaign ownership
        campaign_ref = db.collection('campaigns').document(campaign_id).get()
        if not campaign_ref.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )
        
        campaign_data = campaign_ref.to_dict()
        if campaign_data.get('user_id') != current_user['user_id']:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        service = get_analytics_service(db)
        analytics = service.get_campaign_analytics(campaign_id)
        
        return analytics
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get campaign analytics: {str(e)}"
        )


@router.get("/campaign/{campaign_id}/disposition")
async def get_disposition_breakdown(
    campaign_id: str,
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_firestore_client)
):
    """
    Get detailed disposition breakdown with reasons.
    """
    try:
        # Verify campaign ownership
        campaign_ref = db.collection('campaigns').document(campaign_id).get()
        if not campaign_ref.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )
        
        campaign_data = campaign_ref.to_dict()
        if campaign_data.get('user_id') != current_user['user_id']:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        service = get_analytics_service(db)
        breakdown = service.get_disposition_breakdown(campaign_id)
        
        return breakdown
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get disposition breakdown: {str(e)}"
        )


@router.get("/campaign/{campaign_id}/transfers")
async def get_transfer_analytics(
    campaign_id: str,
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_firestore_client)
):
    """
    Get detailed transfer analytics.
    
    Returns:
    - Total transfers
    - Success rate
    - Transfer type breakdown
    - Agent distribution
    - Top performing agents
    """
    try:
        # Verify campaign ownership
        campaign_ref = db.collection('campaigns').document(campaign_id).get()
        if not campaign_ref.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )
        
        campaign_data = campaign_ref.to_dict()
        if campaign_data.get('user_id') != current_user['user_id']:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        service = get_analytics_service(db)
        analytics = service.get_transfer_analytics(campaign_id)
        
        return analytics
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get transfer analytics: {str(e)}"
        )


@router.get("/campaign/{campaign_id}/callbacks")
async def get_callback_analytics(
    campaign_id: str,
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_firestore_client)
):
    """
    Get detailed callback analytics.
    
    Returns:
    - Total callbacks
    - Completion rate
    - Status breakdown
    - Priority breakdown
    - Outcome breakdown
    - Agent distribution
    """
    try:
        # Verify campaign ownership
        campaign_ref = db.collection('campaigns').document(campaign_id).get()
        if not campaign_ref.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )
        
        campaign_data = campaign_ref.to_dict()
        if campaign_data.get('user_id') != current_user['user_id']:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        service = get_analytics_service(db)
        analytics = service.get_callback_analytics(campaign_id)
        
        return analytics
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get callback analytics: {str(e)}"
        )


@router.get("/agents/performance")
async def get_agent_performance(
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_firestore_client)
):
    """
    Get performance metrics for all agents.
    
    Returns:
    - Transfer statistics per agent
    - Callback completion rates
    - Average call duration
    - Conversion rates
    """
    try:
        service = get_analytics_service(db)
        performance = service.get_agent_performance(current_user['user_id'])
        
        return {
            'agents': performance,
            'total_agents': len(performance)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get agent performance: {str(e)}"
        )


@router.get("/dashboard")
async def get_dashboard_metrics(
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_firestore_client)
):
    """
    Get real-time dashboard metrics.
    
    Returns:
    - Total campaigns, leads, transfers, callbacks
    - Qualification and transfer rates
    - Available agents count
    - Upcoming callbacks
    - Recent activity
    """
    try:
        service = get_analytics_service(db)
        metrics = service.get_dashboard_metrics(current_user['user_id'])
        
        return metrics
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get dashboard metrics: {str(e)}"
        )


@router.get("/summary")
async def get_analytics_summary(
    current_user: dict = Depends(get_current_user),
    db: firestore.Client = Depends(get_firestore_client)
):
    """
    Get high-level analytics summary across all campaigns.
    """
    try:
        # Get all campaigns for user
        campaigns_query = db.collection('campaigns').where('user_id', '==', current_user['user_id'])
        campaigns = list(campaigns_query.stream())
        
        service = get_analytics_service(db)
        
        # Aggregate metrics across all campaigns
        total_leads = 0
        total_qualified = 0
        total_transfers = 0
        total_callbacks = 0
        
        campaign_summaries = []
        
        for campaign_doc in campaigns:
            campaign_id = campaign_doc.id
            analytics = service.get_campaign_analytics(campaign_id)
            
            if 'error' not in analytics:
                total_leads += analytics.get('total_leads', 0)
                total_qualified += analytics.get('leads_qualified', 0)
                total_transfers += analytics.get('total_transfers', 0)
                total_callbacks += analytics.get('total_callbacks_scheduled', 0)
                
                campaign_summaries.append({
                    'campaign_id': campaign_id,
                    'campaign_name': analytics.get('campaign_name'),
                    'total_leads': analytics.get('total_leads', 0),
                    'qualification_rate': analytics.get('qualification_rate', 0),
                    'transfer_rate': analytics.get('transfer_rate', 0)
                })
        
        return {
            'total_campaigns': len(campaigns),
            'total_leads': total_leads,
            'total_qualified_leads': total_qualified,
            'total_transfers': total_transfers,
            'total_callbacks': total_callbacks,
            
            'overall_qualification_rate': round(
                (total_qualified / total_leads * 100) if total_leads > 0 else 0, 2
            ),
            'overall_transfer_rate': round(
                (total_transfers / total_leads * 100) if total_leads > 0 else 0, 2
            ),
            
            'campaign_summaries': campaign_summaries
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get analytics summary: {str(e)}"
        )
