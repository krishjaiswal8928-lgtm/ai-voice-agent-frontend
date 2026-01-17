"""
Lead Qualification Service
AI-powered conversation analysis, lead scoring, and qualification decision-making.
"""

import logging
import re
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime

logger = logging.getLogger(__name__)


class LeadQualificationService:
    """
    Service for AI-powered lead qualification.
    Analyzes conversations, scores leads, detects buying signals, and determines disposition.
    """
    
    def __init__(self):
        # BANT criteria keywords
        self.budget_keywords = [
            'budget', 'price', 'cost', 'afford', 'expensive', 'cheap', 
            'investment', 'spend', 'pay', 'money', 'dollar', 'pricing'
        ]
        
        self.timeline_keywords = [
            'when', 'timeline', 'deadline', 'soon', 'urgent', 'asap',
            'today', 'tomorrow', 'week', 'month', 'quarter', 'immediately'
        ]
        
        self.authority_keywords = [
            'decision', 'approve', 'authorize', 'manager', 'director',
            'ceo', 'owner', 'boss', 'team', 'partner', 'stakeholder'
        ]
        
        self.need_keywords = [
            'need', 'require', 'problem', 'issue', 'challenge', 'pain',
            'solution', 'help', 'looking for', 'want', 'interested'
        ]
        
        # Buying signals
        self.strong_buying_signals = [
            'ready to buy', 'let\'s do it', 'sign me up', 'get started',
            'how do we proceed', 'next steps', 'when can we start',
            'send me the contract', 'i\'m interested', 'sounds good'
        ]
        
        self.moderate_buying_signals = [
            'tell me more', 'interested', 'sounds interesting', 'could work',
            'might be good', 'let me think', 'discuss with team', 'consider'
        ]
        
        # Objections
        self.price_objections = [
            'too expensive', 'too much', 'can\'t afford', 'over budget',
            'cheaper alternative', 'discount', 'lower price'
        ]
        
        self.timing_objections = [
            'not right now', 'maybe later', 'call back', 'busy',
            'not ready', 'next quarter', 'next year'
        ]
        
        self.competitor_objections = [
            'already have', 'using competitor', 'working with', 'satisfied with'
        ]
        
        self.authority_objections = [
            'need to ask', 'not my decision', 'talk to manager', 'get approval'
        ]
    
    # ===== CONVERSATION ANALYSIS =====
    
    def analyze_conversation(
        self,
        transcript: str,
        lead_name: Optional[str] = None,
        campaign_goal: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Comprehensive conversation analysis.
        
        Args:
            transcript: Full conversation transcript
            lead_name: Lead's name
            campaign_goal: Campaign objective
            
        Returns:
            dict: Analysis results including score, signals, objections, BANT
        """
        try:
            transcript_lower = transcript.lower()
            
            # Analyze BANT criteria
            bant_analysis = self._analyze_bant(transcript_lower)
            
            # Detect buying signals
            buying_signals = self._detect_buying_signals(transcript_lower)
            
            # Detect objections
            objections = self._detect_objections(transcript_lower)
            
            # Calculate lead score
            lead_score = self._calculate_lead_score(
                bant_analysis, buying_signals, objections
            )
            
            # Determine qualification status
            qualification = self._determine_qualification(
                lead_score, buying_signals, objections, bant_analysis
            )
            
            # Generate conversation summary
            summary = self._generate_summary(
                transcript, bant_analysis, buying_signals, objections
            )
            
            # Identify pain points
            pain_points = self._identify_pain_points(transcript_lower)
            
            return {
                'lead_score': lead_score,
                'qualification_status': qualification['status'],
                'qualification_reason': qualification['reason'],
                'bant_analysis': bant_analysis,
                'buying_signals': buying_signals,
                'objections': objections,
                'pain_points': pain_points,
                'conversation_summary': summary,
                'recommended_action': qualification['action'],
                'confidence_score': qualification['confidence']
            }
            
        except Exception as e:
            logger.error(f"Conversation analysis failed: {str(e)}")
            return {
                'lead_score': 0,
                'qualification_status': 'error',
                'qualification_reason': f'Analysis error: {str(e)}',
                'error': str(e)
            }
    
    def _analyze_bant(self, transcript: str) -> Dict[str, Any]:
        """Analyze BANT (Budget, Authority, Need, Timeline) criteria."""
        
        budget_mentioned = any(keyword in transcript for keyword in self.budget_keywords)
        timeline_mentioned = any(keyword in transcript for keyword in self.timeline_keywords)
        authority_mentioned = any(keyword in transcript for keyword in self.authority_keywords)
        need_mentioned = any(keyword in transcript for keyword in self.need_keywords)
        
        # Extract specific mentions
        budget_context = self._extract_context(transcript, self.budget_keywords)
        timeline_context = self._extract_context(transcript, self.timeline_keywords)
        authority_context = self._extract_context(transcript, self.authority_keywords)
        need_context = self._extract_context(transcript, self.need_keywords)
        
        return {
            'budget': {
                'mentioned': budget_mentioned,
                'context': budget_context,
                'score': 1 if budget_mentioned else 0
            },
            'authority': {
                'mentioned': authority_mentioned,
                'context': authority_context,
                'score': 1 if authority_mentioned else 0
            },
            'need': {
                'mentioned': need_mentioned,
                'context': need_context,
                'score': 1 if need_mentioned else 0
            },
            'timeline': {
                'mentioned': timeline_mentioned,
                'context': timeline_context,
                'score': 1 if timeline_mentioned else 0
            },
            'total_score': sum([
                1 if budget_mentioned else 0,
                1 if authority_mentioned else 0,
                1 if need_mentioned else 0,
                1 if timeline_mentioned else 0
            ])
        }
    
    def _detect_buying_signals(self, transcript: str) -> List[str]:
        """Detect buying signals in conversation."""
        signals = []
        
        # Check for strong signals
        for signal in self.strong_buying_signals:
            if signal in transcript:
                signals.append(f"Strong: {signal}")
        
        # Check for moderate signals
        for signal in self.moderate_buying_signals:
            if signal in transcript:
                signals.append(f"Moderate: {signal}")
        
        return signals
    
    def _detect_objections(self, transcript: str) -> List[str]:
        """Detect objections in conversation."""
        objections = []
        
        # Price objections
        for obj in self.price_objections:
            if obj in transcript:
                objections.append(f"Price: {obj}")
        
        # Timing objections
        for obj in self.timing_objections:
            if obj in transcript:
                objections.append(f"Timing: {obj}")
        
        # Competitor objections
        for obj in self.competitor_objections:
            if obj in transcript:
                objections.append(f"Competitor: {obj}")
        
        # Authority objections
        for obj in self.authority_objections:
            if obj in transcript:
                objections.append(f"Authority: {obj}")
        
        return objections
    
    def _identify_pain_points(self, transcript: str) -> List[str]:
        """Identify customer pain points."""
        pain_keywords = [
            'problem', 'issue', 'challenge', 'difficult', 'struggle',
            'frustrated', 'pain', 'concern', 'worry', 'trouble'
        ]
        
        pain_points = []
        for keyword in pain_keywords:
            if keyword in transcript:
                context = self._extract_context(transcript, [keyword], window=50)
                if context:
                    pain_points.append(context)
        
        return pain_points[:5]  # Return top 5
    
    def _extract_context(
        self,
        transcript: str,
        keywords: List[str],
        window: int = 30
    ) -> str:
        """Extract context around keywords."""
        for keyword in keywords:
            if keyword in transcript:
                idx = transcript.find(keyword)
                start = max(0, idx - window)
                end = min(len(transcript), idx + len(keyword) + window)
                return transcript[start:end].strip()
        return ""
    
    def _calculate_lead_score(
        self,
        bant: Dict[str, Any],
        buying_signals: List[str],
        objections: List[str]
    ) -> int:
        """
        Calculate lead score (1-10).
        
        Scoring logic:
        - BANT: 4 points (1 per criterion)
        - Strong buying signals: 2 points each
        - Moderate buying signals: 1 point each
        - Objections: -1 point each
        """
        score = 0
        
        # BANT score (max 4 points)
        score += bant['total_score']
        
        # Buying signals (max 4 points)
        strong_signals = len([s for s in buying_signals if 'Strong' in s])
        moderate_signals = len([s for s in buying_signals if 'Moderate' in s])
        
        score += min(strong_signals * 2, 4)
        score += min(moderate_signals * 1, 2)
        
        # Objections penalty
        score -= len(objections)
        
        # Normalize to 1-10
        score = max(1, min(10, score))
        
        return score
    
    def _determine_qualification(
        self,
        lead_score: int,
        buying_signals: List[str],
        objections: List[str],
        bant: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Determine if lead is qualified and recommended action.
        
        Returns:
            dict: status, reason, action, confidence
        """
        
        # High score (8-10): Qualified, transfer immediately
        if lead_score >= 8:
            return {
                'status': 'qualified',
                'reason': 'High lead score with strong buying signals',
                'action': 'transfer_to_human',
                'confidence': 0.9
            }
        
        # Good score (6-7): Qualified, but may need nurturing
        elif lead_score >= 6:
            # Check if they have strong buying signals
            strong_signals = [s for s in buying_signals if 'Strong' in s]
            if strong_signals:
                return {
                    'status': 'qualified',
                    'reason': 'Good lead score with buying intent',
                    'action': 'transfer_to_human',
                    'confidence': 0.75
                }
            else:
                return {
                    'status': 'warm_lead',
                    'reason': 'Good potential but needs more nurturing',
                    'action': 'schedule_callback',
                    'confidence': 0.7
                }
        
        # Medium score (4-5): Warm lead, schedule callback
        elif lead_score >= 4:
            return {
                'status': 'warm_lead',
                'reason': 'Some interest but needs follow-up',
                'action': 'schedule_callback',
                'confidence': 0.6
            }
        
        # Low score (1-3): Not qualified
        else:
            # Check for specific disqualifying factors
            if any('Competitor' in obj for obj in objections):
                reason = 'Already using competitor solution'
            elif any('Price' in obj for obj in objections):
                reason = 'Budget concerns'
            elif any('Timing' in obj for obj in objections):
                reason = 'Not ready at this time'
            else:
                reason = 'Low engagement and interest'
            
            return {
                'status': 'not_qualified',
                'reason': reason,
                'action': 'end_call_politely',
                'confidence': 0.8
            }
    
    def _generate_summary(
        self,
        transcript: str,
        bant: Dict[str, Any],
        buying_signals: List[str],
        objections: List[str]
    ) -> str:
        """Generate conversation summary."""
        
        summary_parts = []
        
        # BANT summary
        bant_mentioned = []
        if bant['budget']['mentioned']:
            bant_mentioned.append('Budget')
        if bant['authority']['mentioned']:
            bant_mentioned.append('Authority')
        if bant['need']['mentioned']:
            bant_mentioned.append('Need')
        if bant['timeline']['mentioned']:
            bant_mentioned.append('Timeline')
        
        if bant_mentioned:
            summary_parts.append(f"Discussed: {', '.join(bant_mentioned)}")
        
        # Buying signals
        if buying_signals:
            summary_parts.append(f"Buying signals detected: {len(buying_signals)}")
        
        # Objections
        if objections:
            objection_types = set([obj.split(':')[0] for obj in objections])
            summary_parts.append(f"Objections: {', '.join(objection_types)}")
        
        return '. '.join(summary_parts) if summary_parts else "Brief conversation"
    
    # ===== DECISION MAKING =====
    
    def should_transfer_to_human(
        self,
        lead_score: int,
        buying_signals: List[str],
        auto_transfer_threshold: int = 8
    ) -> Tuple[bool, str]:
        """
        Decide if lead should be transferred to human agent.
        
        Returns:
            tuple: (should_transfer, reason)
        """
        
        # Check score threshold
        if lead_score >= auto_transfer_threshold:
            return True, f"Lead score {lead_score} meets threshold {auto_transfer_threshold}"
        
        # Check for strong buying signals
        strong_signals = [s for s in buying_signals if 'Strong' in s]
        if len(strong_signals) >= 2:
            return True, "Multiple strong buying signals detected"
        
        return False, "Does not meet transfer criteria"
    
    def should_schedule_callback(
        self,
        lead_score: int,
        objections: List[str]
    ) -> Tuple[bool, str]:
        """
        Decide if callback should be scheduled.
        
        Returns:
            tuple: (should_schedule, reason)
        """
        
        # Warm leads (score 4-7)
        if 4 <= lead_score <= 7:
            return True, "Warm lead - schedule for follow-up"
        
        # Timing objections
        timing_objections = [obj for obj in objections if 'Timing' in obj]
        if timing_objections:
            return True, "Lead interested but timing not right"
        
        # Authority objections (need to talk to decision maker)
        authority_objections = [obj for obj in objections if 'Authority' in obj]
        if authority_objections:
            return True, "Need to reach decision maker"
        
        return False, "Not suitable for callback"
    
    def determine_call_end_reason(
        self,
        qualification_status: str,
        objections: List[str]
    ) -> str:
        """Determine appropriate reason for ending call."""
        
        if qualification_status == 'qualified':
            return "Transferring to specialist"
        elif qualification_status == 'warm_lead':
            return "Scheduling follow-up call"
        elif qualification_status == 'not_qualified':
            if any('Competitor' in obj for obj in objections):
                return "Already using competitor - not a fit"
            elif any('Price' in obj for obj in objections):
                return "Budget constraints"
            elif any('Timing' in obj for obj in objections):
                return "Not ready at this time"
            else:
                return "Not interested at this time"
        else:
            return "Thank you for your time"
    
    # ===== QUALIFICATION QUESTIONS =====
    
    def get_qualifying_questions(
        self,
        missing_bant_criteria: List[str]
    ) -> List[str]:
        """
        Get questions to ask based on missing BANT criteria.
        
        Args:
            missing_bant_criteria: List of missing criteria ['budget', 'authority', etc.]
            
        Returns:
            List of questions to ask
        """
        questions = []
        
        if 'budget' in missing_bant_criteria:
            questions.append("Do you have a budget allocated for this type of solution?")
        
        if 'authority' in missing_bant_criteria:
            questions.append("Are you the decision maker for this purchase, or would you need to involve others?")
        
        if 'need' in missing_bant_criteria:
            questions.append("What specific challenges are you looking to solve?")
        
        if 'timeline' in missing_bant_criteria:
            questions.append("What's your timeline for implementing a solution?")
        
        return questions
    
    def detect_interest_level(self, transcript: str) -> str:
        """
        Detect overall interest level from conversation.
        
        Returns:
            'high', 'medium', 'low', or 'none'
        """
        transcript_lower = transcript.lower()
        
        # High interest indicators
        high_interest = [
            'very interested', 'definitely', 'absolutely', 'perfect',
            'exactly what', 'ready to', 'let\'s go', 'sign me up'
        ]
        
        # Low interest indicators
        low_interest = [
            'not interested', 'no thanks', 'not right now', 'maybe later',
            'don\'t need', 'already have', 'not looking'
        ]
        
        high_count = sum(1 for phrase in high_interest if phrase in transcript_lower)
        low_count = sum(1 for phrase in low_interest if phrase in transcript_lower)
        
        if high_count >= 2:
            return 'high'
        elif low_count >= 2:
            return 'none'
        elif high_count > low_count:
            return 'medium'
        elif low_count > 0:
            return 'low'
        else:
            return 'medium'


# Singleton instance
lead_qualification_service = LeadQualificationService()
