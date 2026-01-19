'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent, Chip, Avatar, List, ListItem, ListItemIcon, ListItemText, LinearProgress, IconButton, Tooltip } from '@mui/material';
import {
  PhoneInTalk,
  CheckCircle,
  ArrowForward,
  Star,
  Schedule,
  PersonSearch,
  CallSplit,
  Assessment,
  Business,
  LocalHospital,
  School,
  Storefront,
  HeadsetMic,
  RecordVoiceOver,
  Psychology,
  Insights,
  TrendingUpOutlined,
  PlayArrow,
  VolumeUp,
  Mic,
  Phone,
  ChatBubble,
  AutoAwesome,
  Bolt,
  Rocket
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { LandingNav } from '@/components/LandingNav';
import { Footer } from '@/components/Footer';
import '@/styles/animations.css';

export default function LandingPage() {
  const router = useRouter();
  const [stats, setStats] = useState({ calls: 0, users: 0, accuracy: 0, qualified: 0 });
  const [activeDemo, setActiveDemo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number, x: number, y: number, delay: number }>>([]);
  const heroRef = useRef<HTMLDivElement>(null);

  // Generate floating particles
  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 8
    }));
    setParticles(newParticles);
  }, []);

  // Count-up animation for stats
  useEffect(() => {
    const duration = 2500;
    const steps = 60;
    const interval = duration / steps;

    const targets = { calls: 1000000, users: 5000, accuracy: 98, qualified: 85 };
    let current = { calls: 0, users: 0, accuracy: 0, qualified: 0 };

    const timer = setInterval(() => {
      current.calls = Math.min(current.calls + targets.calls / steps, targets.calls);
      current.users = Math.min(current.users + targets.users / steps, targets.users);
      current.accuracy = Math.min(current.accuracy + targets.accuracy / steps, targets.accuracy);
      current.qualified = Math.min(current.qualified + targets.qualified / steps, targets.qualified);

      setStats({
        calls: Math.floor(current.calls),
        users: Math.floor(current.users),
        accuracy: Math.floor(current.accuracy),
        qualified: Math.floor(current.qualified)
      });

      if (current.calls >= targets.calls) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  // Demo conversation rotation
  useEffect(() => {
    const demoTimer = setInterval(() => {
      setActiveDemo((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(demoTimer);
  }, []);

  const demoConversations = [
    {
      lead: "Hi, I'm interested in your AI voice solution",
      ai: "Excellent! Let me understand your needs. What's your biggest challenge with lead qualification right now?",
      action: "🎯 Qualifying lead using BANT...",
      color: '#6366f1',
      score: 7
    },
    {
      lead: "We need this urgently for our 50-person sales team",
      ai: "Perfect! You sound like a great fit. Let me connect you with our enterprise specialist Sarah right now.",
      action: "📞 Transferring to sales (Hot Lead: 9/10)...",
      color: '#22c55e',
      score: 9
    },
    {
      lead: "Can we discuss pricing next Tuesday at 2 PM?",
      ai: "Absolutely! I've scheduled a call for Tuesday, January 23rd at 2:00 PM EST. You'll receive a calendar invite shortly.",
      action: "📅 Callback scheduled with context...",
      color: '#f59e0b',
      score: 6
    }
  ];

  const features = [
    {
      icon: <PersonSearch sx={{ fontSize: 48 }} />,
      title: 'BANT Lead Qualification',
      description: 'Automatically qualify every lead using the proven BANT framework. Our AI asks intelligent questions, detects buying signals, and scores leads 1-10 in real-time with 98% accuracy.',
      color: '#6366f1',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      details: [
        'Budget assessment through conversational questions',
        'Authority identification (decision-maker detection)',
        'Need analysis with pain point discovery',
        'Timeline evaluation for purchase readiness',
        'Real-time lead scoring (1-10 scale)',
        'Custom qualification criteria support'
      ]
    },
    {
      icon: <CallSplit sx={{ fontSize: 48 }} />,
      title: 'Intelligent Call Transfers',
      description: 'Transfer qualified leads to your sales team instantly with full context. Warm transfers with AI introduction or cold transfers for immediate connection. Smart routing based on expertise.',
      color: '#22c55e',
      gradient: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
      details: [
        'Warm transfers with AI introduction',
        'Cold transfers for immediate connection',
        'Automatic agent selection by expertise',
        'Round-robin or priority-based routing',
        'Lead context handoff (notes, score, history)',
        'Transfer success tracking & analytics'
      ]
    },
    {
      icon: <Schedule sx={{ fontSize: 48 }} />,
      title: 'Smart Callback Scheduling',
      description: 'Schedule callbacks automatically when leads aren\'t ready now. AI captures time slots, detects timezones, preserves context, and assigns to the best-fit agent with calendar integration.',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
      details: [
        'Natural language time slot capture',
        'Automatic timezone detection',
        'Calendar integration (Google, Outlook)',
        'Smart agent assignment',
        'Context preservation (conversation notes)',
        'Automated reminder notifications'
      ]
    },
    {
      icon: <Psychology sx={{ fontSize: 48 }} />,
      title: 'AI Conversation Intelligence',
      description: 'Advanced NLP analyzes every conversation to detect sentiment, buying signals, objections, and competitor mentions. Real-time insights improve qualification accuracy continuously.',
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
      details: [
        'Sentiment analysis (positive/negative/neutral)',
        'Buying signal detection',
        'Objection handling suggestions',
        'Competitor mention alerts',
        'Intent classification',
        'Conversation quality scoring'
      ]
    },
    {
      icon: <Insights sx={{ fontSize: 48 }} />,
      title: 'Real-Time Analytics',
      description: 'Track qualification rates, transfer success, callback completion, and agent performance in real-time. Get actionable insights into conversion patterns and ROI metrics.',
      color: '#ef4444',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      details: [
        'Live call monitoring dashboard',
        'Qualification rate tracking',
        'Conversion funnel analytics',
        'Agent performance metrics',
        'Peak time analysis',
        'ROI calculation & reporting'
      ]
    },
    {
      icon: <RecordVoiceOver sx={{ fontSize: 48 }} />,
      title: 'Custom Voice & Personality',
      description: 'Create unique AI agents with custom voices, personalities, and conversation flows. Train for different campaigns and industries. Multi-language support with natural accents.',
      color: '#22d3ee',
      gradient: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
      details: [
        'Custom voice selection (male/female)',
        'Personality customization',
        'Industry-specific training',
        'Multi-language support (50+ languages)',
        'Natural accent options',
        'Brand tone alignment'
      ]
    }
  ];

  const useCases = [
    {
      icon: <Business />,
      industry: 'B2B SaaS',
      title: 'Enterprise Lead Qualification',
      description: 'Qualify enterprise leads 24/7, identify decision-makers using BANT criteria, schedule demos with qualified prospects, and transfer hot leads to account executives automatically.',
      results: '3x more qualified leads, 60% time saved, 45% higher conversion rate',
      metrics: { qualified: 85, transferred: 42, scheduled: 38 },
      color: '#6366f1'
    },
    {
      icon: <Storefront />,
      industry: 'E-commerce',
      title: 'Customer Support & Upsells',
      description: 'Handle order inquiries, qualify upsell opportunities based on purchase history, transfer high-value customers to sales specialists, and schedule follow-up calls for abandoned carts.',
      results: '40% increase in upsell conversions, 70% faster response time',
      metrics: { qualified: 78, transferred: 35, scheduled: 45 },
      color: '#22c55e'
    },
    {
      icon: <LocalHospital />,
      industry: 'Healthcare',
      title: 'Patient Appointment Scheduling',
      description: 'Schedule appointments 24/7, qualify patient needs and urgency, route urgent cases to appropriate medical staff, send automated appointment reminders, and handle rescheduling requests.',
      results: '80% reduction in scheduling time, 95% appointment show-up rate',
      metrics: { qualified: 92, transferred: 15, scheduled: 73 },
      color: '#f59e0b'
    },
    {
      icon: <School />,
      industry: 'Education',
      title: 'Student Enrollment & Counseling',
      description: 'Qualify prospective students using custom criteria, answer program questions, schedule counseling sessions automatically, transfer interested students to admissions, and follow up on applications.',
      results: '50% more enrollments per quarter, 65% faster response time',
      metrics: { qualified: 88, transferred: 40, scheduled: 48 },
      color: '#8b5cf6'
    }
  ];

  const qualificationSteps = [
    {
      step: 'Initial Engagement',
      description: 'AI greets the lead warmly, introduces your company professionally, and builds rapport through natural conversation',
      icon: <PhoneInTalk />,
      example: '"Hi! Thanks for calling SpeakSynth AI. I\'m here to help you find the perfect solution. May I ask your name?"',
      color: '#6366f1'
    },
    {
      step: 'Need Discovery',
      description: 'Asks targeted, open-ended questions to understand the lead\'s pain points, current situation, and desired outcomes',
      icon: <PersonSearch />,
      example: '"What challenges are you currently facing with lead qualification? What would an ideal solution look like for you?"',
      color: '#22c55e'
    },
    {
      step: 'BANT Qualification',
      description: 'Evaluates Budget, Authority, Need, and Timeline through conversational, non-pushy questions',
      icon: <Assessment />,
      example: '"Do you have a budget allocated for this? Are you the decision-maker, or should we include others in the conversation?"',
      color: '#f59e0b'
    },
    {
      step: 'Lead Scoring',
      description: 'Assigns a qualification score (1-10) based on BANT criteria, buying signals, and conversation quality',
      icon: <TrendingUpOutlined />,
      example: 'Score: 8/10 - High Budget ✓ Decision Maker ✓ Urgent Need ✓ Timeline: This Quarter ✓',
      color: '#8b5cf6'
    },
    {
      step: 'Smart Routing',
      description: 'Routes leads based on score: Hot leads (8-10) → Instant transfer | Warm leads (5-7) → Schedule callback | Cold leads (1-4) → Nurture sequence',
      icon: <CallSplit />,
      example: 'Hot Lead Detected! Transferring to Sarah (Top Sales Rep) with full context...',
      color: '#ef4444'
    }
  ];

  return (
    <Box sx={{ bgcolor: '#0a0a0a', minHeight: '100vh', overflow: 'hidden' }}>
      <LandingNav />

      {/* Hero Section with Particles and Interactive Demo */}
      <Box
        ref={heroRef}
        sx={{
          position: 'relative',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
          backgroundSize: '200% 200%',
          color: '#ffffff',
          pt: { xs: 12, md: 16 },
          pb: { xs: 12, md: 20 },
          overflow: 'hidden'
        }}
        className="gradient-rotate"
      >
        {/* Animated Particles */}
        {particles.map((particle) => (
          <Box
            key={particle.id}
            sx={{
              position: 'absolute',
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              bgcolor: '#6366f1',
              opacity: 0.6,
              animationDelay: `${particle.delay}s`
            }}
            className="particle-float"
          />
        ))}

        {/* Glowing Orbs */}
        <Box
          sx={{
            position: 'absolute',
            top: '20%',
            left: '10%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
            filter: 'blur(60px)'
          }}
          className="float-slow pulse-glow"
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '20%',
            right: '10%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
            filter: 'blur(80px)'
          }}
          className="float-reverse pulse-glow"
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box className="fade-in-left">
                <Chip
                  icon={<Rocket sx={{ color: '#ffffff !important' }} />}
                  label="AI-Powered Lead Qualification Platform"
                  sx={{
                    bgcolor: 'rgba(99,102,241,0.2)',
                    color: '#ffffff',
                    fontWeight: 600,
                    mb: 3,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(99,102,241,0.5)',
                    px: 2,
                    py: 3,
                    fontSize: '0.95rem'
                  }}
                  className="pulse-glow"
                />
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 900,
                    mb: 3,
                    fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4.5rem' },
                    lineHeight: 1.1,
                    background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 40px rgba(99,102,241,0.3)'
                  }}
                >
                  Qualify Leads Automatically with AI Voice Agents
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 4,
                    opacity: 0.9,
                    lineHeight: 1.7,
                    fontSize: { xs: '1.1rem', md: '1.4rem' },
                    fontWeight: 400,
                    color: '#cbd5e1'
                  }}
                >
                  Your AI-powered sales assistant works <Box component="span" sx={{ color: '#22c55e', fontWeight: 700 }}>24/7</Box> to qualify leads using BANT criteria, transfer hot prospects <Box component="span" sx={{ color: '#f59e0b', fontWeight: 700 }}>instantly</Box>, and schedule callbacks <Box component="span" sx={{ color: '#6366f1', fontWeight: 700 }}>intelligently</Box>
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    onClick={() => router.push('/auth/register')}
                    sx={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      color: '#ffffff',
                      fontWeight: 700,
                      px: 5,
                      py: 2.5,
                      fontSize: '1.2rem',
                      borderRadius: '16px',
                      boxShadow: '0 10px 40px rgba(99,102,241,0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                        transform: 'translateY(-4px)',
                        boxShadow: '0 20px 60px rgba(99,102,241,0.6)'
                      },
                      transition: 'all 0.3s'
                    }}
                    className="pulse"
                  >
                    Start Free Trial
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<PlayArrow />}
                    onClick={() => router.push('/contact')}
                    sx={{
                      borderColor: 'rgba(255,255,255,0.3)',
                      color: '#ffffff',
                      fontWeight: 700,
                      px: 5,
                      py: 2.5,
                      fontSize: '1.2rem',
                      borderRadius: '16px',
                      borderWidth: '2px',
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        borderColor: '#ffffff',
                        bgcolor: 'rgba(255,255,255,0.1)',
                        borderWidth: '2px',
                        transform: 'translateY(-4px)'
                      },
                      transition: 'all 0.3s'
                    }}
                  >
                    Watch Demo
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {[
                    { icon: <CheckCircle sx={{ fontSize: 18 }} />, text: 'No credit card required' },
                    { icon: <Bolt sx={{ fontSize: 18 }} />, text: '14-day free trial' },
                    { icon: <AutoAwesome sx={{ fontSize: 18 }} />, text: 'Setup in 5 minutes' }
                  ].map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }} className={`fade-in delay-${(i + 3) * 100}`}>
                      {item.icon}
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {item.text}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>

            {/* Interactive Live Demo */}
            <Grid item xs={12} md={6}>
              <Box className="fade-in-scale delay-300">
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, rgba(30,27,75,0.8) 0%, rgba(49,46,129,0.8) 100%)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    p: 4,
                    border: '1px solid rgba(99,102,241,0.3)',
                    boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
                    minHeight: '420px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  className="glow-pulse"
                >
                  {/* Animated Background */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(45deg, transparent 30%, rgba(99,102,241,0.1) 50%, transparent 70%)',
                      backgroundSize: '200% 200%'
                    }}
                    className="shimmer"
                  />

                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                      <Avatar
                        sx={{
                          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                          mr: 2,
                          width: 64,
                          height: 64,
                          boxShadow: '0 8px 24px rgba(99,102,241,0.4)'
                        }}
                        className="pulse"
                      >
                        <HeadsetMic sx={{ fontSize: 36 }} />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff', mb: 0.5 }}>
                          AI Voice Agent
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              bgcolor: '#22c55e'
                            }}
                            className="pulse"
                          />
                          <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                            Live Demo • Qualifying Lead
                          </Typography>
                        </Box>
                      </Box>
                      <Tooltip title="Play Demo">
                        <IconButton
                          onClick={() => setIsPlaying(!isPlaying)}
                          sx={{
                            bgcolor: 'rgba(99,102,241,0.2)',
                            '&:hover': { bgcolor: 'rgba(99,102,241,0.3)' }
                          }}
                        >
                          {isPlaying ? <VolumeUp sx={{ color: '#22c55e' }} /> : <PlayArrow sx={{ color: '#ffffff' }} />}
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Box sx={{ mb: 4 }}>
                      {/* Lead Message */}
                      <Box
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.1)',
                          backdropFilter: 'blur(10px)',
                          p: 3,
                          borderRadius: '16px',
                          mb: 3,
                          border: '1px solid rgba(255,255,255,0.1)'
                        }}
                        className="fade-in-left"
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Phone sx={{ fontSize: 16, color: '#cbd5e1' }} />
                          <Typography variant="caption" sx={{ color: '#cbd5e1' }}>
                            Lead
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 500 }}>
                          {demoConversations[activeDemo].lead}
                        </Typography>
                      </Box>

                      {/* AI Response */}
                      <Box
                        sx={{
                          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                          p: 3,
                          borderRadius: '16px',
                          mb: 3,
                          boxShadow: '0 8px 24px rgba(99,102,241,0.3)'
                        }}
                        className="fade-in-right delay-300"
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Mic sx={{ fontSize: 16 }} />
                          <Typography variant="caption" sx={{ opacity: 0.9 }}>
                            AI Agent
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {demoConversations[activeDemo].ai}
                        </Typography>
                      </Box>

                      {/* Action Status */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 2,
                          borderRadius: '12px',
                          bgcolor: 'rgba(0,0,0,0.3)',
                          border: `1px solid ${demoConversations[activeDemo].color}40`
                        }}
                        className="pulse"
                      >
                        <Typography variant="body2" sx={{ color: demoConversations[activeDemo].color, fontWeight: 600 }}>
                          {demoConversations[activeDemo].action}
                        </Typography>
                        <Chip
                          label={`Score: ${demoConversations[activeDemo].score}/10`}
                          size="small"
                          sx={{
                            bgcolor: demoConversations[activeDemo].color,
                            color: '#ffffff',
                            fontWeight: 700
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Demo Indicators */}
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                      {[0, 1, 2].map((i) => (
                        <Box
                          key={i}
                          onClick={() => setActiveDemo(i)}
                          sx={{
                            width: activeDemo === i ? 40 : 12,
                            height: 12,
                            borderRadius: '6px',
                            bgcolor: activeDemo === i ? '#6366f1' : 'rgba(255,255,255,0.3)',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            '&:hover': {
                              bgcolor: activeDemo === i ? '#6366f1' : 'rgba(255,255,255,0.5)'
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section with Animated Progress */}
      <Container maxWidth="lg" sx={{ mt: -8, position: 'relative', zIndex: 2 }}>
        <Grid container spacing={3}>
          {[
            { label: 'Calls Processed', value: stats.calls.toLocaleString() + '+', icon: <PhoneInTalk />, progress: 100, color: '#6366f1' },
            { label: 'Happy Customers', value: stats.users.toLocaleString() + '+', icon: <Star />, progress: 100, color: '#22c55e' },
            { label: 'Qualification Accuracy', value: stats.accuracy + '%', icon: <CheckCircle />, progress: stats.accuracy, color: '#f59e0b' },
            { label: 'Leads Qualified', value: stats.qualified + '%', icon: <TrendingUpOutlined />, progress: stats.qualified, color: '#8b5cf6' }
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                className={`fade-in-up delay-${(index + 1) * 100}`}
                sx={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '20px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                  transition: 'all 0.4s',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-12px) scale(1.02)',
                    boxShadow: `0 20px 60px ${stat.color}40`,
                    borderColor: stat.color
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${stat.color} 0%, ${stat.color}80 100%)`
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Avatar
                    sx={{
                      background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}cc 100%)`,
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mb: 2,
                      boxShadow: `0 8px 24px ${stat.color}40`
                    }}
                    className="bounce-in"
                  >
                    {React.cloneElement(stat.icon, { sx: { fontSize: 32, color: '#ffffff' } })}
                  </Avatar>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 900,
                      background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}cc 100%)`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, mb: 2 }}>
                    {stat.label}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={stat.progress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: '#e2e8f0',
                      '& .MuiLinearProgress-bar': {
                        background: `linear-gradient(90deg, ${stat.color} 0%, ${stat.color}cc 100%)`,
                        borderRadius: 4
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Qualification Process with Interactive Steps */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Box sx={{ textAlign: 'center', mb: 10 }} className="fade-in-up">
          <Chip
            label="HOW IT WORKS"
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: '#ffffff',
              mb: 3,
              fontWeight: 700,
              px: 3,
              py: 2.5,
              fontSize: '0.9rem'
            }}
            className="pulse"
          />
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              mb: 3,
              color: '#0f172a',
              fontSize: { xs: '2.5rem', md: '3.5rem' }
            }}
          >
            5-Step Lead Qualification Process
          </Typography>
          <Typography variant="h6" sx={{ color: '#64748b', maxWidth: 700, mx: 'auto', lineHeight: 1.8 }}>
            Our AI follows a proven methodology to qualify every lead and route them intelligently based on their score
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {qualificationSteps.map((item, index) => (
            <Grid item xs={12} key={index}>
              <Card
                className={`fade-in-up delay-${(index + 1) * 100}`}
                sx={{
                  background: '#ffffff',
                  border: '2px solid #e2e8f0',
                  borderRadius: '24px',
                  transition: 'all 0.4s',
                  overflow: 'hidden',
                  position: 'relative',
                  '&:hover': {
                    borderColor: item.color,
                    boxShadow: `0 20px 60px ${item.color}20`,
                    transform: 'translateX(12px)'
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '6px',
                    background: `linear-gradient(180deg, ${item.color} 0%, ${item.color}80 100%)`,
                    opacity: 0,
                    transition: 'opacity 0.3s'
                  },
                  '&:hover::before': {
                    opacity: 1
                  }
                }}
              >
                <CardContent sx={{ p: 5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                    <Avatar
                      sx={{
                        background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}cc 100%)`,
                        width: 80,
                        height: 80,
                        fontSize: '2rem',
                        fontWeight: 900,
                        boxShadow: `0 12px 32px ${item.color}40`
                      }}
                      className="bounce-in"
                    >
                      {index + 1}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>
                          {item.step}
                        </Typography>
                        <Avatar sx={{ bgcolor: `${item.color}20`, width: 40, height: 40 }}>
                          {React.cloneElement(item.icon, { sx: { color: item.color, fontSize: 24 } })}
                        </Avatar>
                      </Box>
                      <Typography variant="body1" sx={{ color: '#64748b', lineHeight: 1.8, mb: 3, fontSize: '1.1rem' }}>
                        {item.description}
                      </Typography>
                      <Box
                        sx={{
                          background: `linear-gradient(135deg, ${item.color}10 0%, ${item.color}05 100%)`,
                          border: `2px solid ${item.color}30`,
                          borderLeft: `6px solid ${item.color}`,
                          p: 3,
                          borderRadius: '12px'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          <ChatBubble sx={{ color: item.color, fontSize: 24, mt: 0.5 }} />
                          <Typography variant="body1" sx={{ fontWeight: 600, color: '#0f172a', fontStyle: 'italic', lineHeight: 1.7 }}>
                            "{item.example}"
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Grid with Hover Effects */}
      <Box sx={{ bgcolor: '#f8fafc', py: 12 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 10 }} className="fade-in-up">
            <Chip
              label="POWERFUL FEATURES"
              sx={{
                background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
                color: '#ffffff',
                mb: 3,
                fontWeight: 700,
                px: 3,
                py: 2.5,
                fontSize: '0.9rem'
              }}
              className="pulse"
            />
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                mb: 3,
                color: '#0f172a',
                fontSize: { xs: '2.5rem', md: '3.5rem' }
              }}
            >
              Everything You Need to Automate Lead Qualification
            </Typography>
            <Typography variant="h6" sx={{ color: '#64748b', maxWidth: 700, mx: 'auto', lineHeight: 1.8 }}>
              Comprehensive features designed to qualify, transfer, and schedule with precision and intelligence
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card
                  className={`fade-in-scale delay-${(index + 1) * 100}`}
                  sx={{
                    height: '100%',
                    background: '#ffffff',
                    border: '2px solid #e2e8f0',
                    borderRadius: '24px',
                    transition: 'all 0.4s',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-16px) scale(1.02)',
                      boxShadow: `0 32px 80px ${feature.color}30`,
                      borderColor: feature.color
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '6px',
                      background: feature.gradient
                    }
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Avatar
                      sx={{
                        background: feature.gradient,
                        width: 80,
                        height: 80,
                        mb: 3,
                        boxShadow: `0 12px 32px ${feature.color}40`
                      }}
                      className="bounce-in"
                    >
                      {feature.icon}
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, color: '#0f172a' }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#64748b', lineHeight: 1.8, mb: 3 }}>
                      {feature.description}
                    </Typography>
                    <List dense>
                      {feature.details.map((detail, i) => (
                        <ListItem key={i} sx={{ px: 0, py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckCircle sx={{ fontSize: 20, color: feature.color }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={detail}
                            primaryTypographyProps={{
                              fontSize: '0.95rem',
                              color: '#64748b',
                              fontWeight: 500
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Use Cases with Metrics Dashboard */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Box sx={{ textAlign: 'center', mb: 10 }} className="fade-in-up">
          <Chip
            label="SUCCESS STORIES"
            sx={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
              color: '#ffffff',
              mb: 3,
              fontWeight: 700,
              px: 3,
              py: 2.5,
              fontSize: '0.9rem'
            }}
            className="pulse"
          />
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              mb: 3,
              color: '#0f172a',
              fontSize: { xs: '2.5rem', md: '3.5rem' }
            }}
          >
            Proven Results Across Industries
          </Typography>
          <Typography variant="h6" sx={{ color: '#64748b', maxWidth: 700, mx: 'auto', lineHeight: 1.8 }}>
            See how businesses use SpeakSynth AI to transform their sales operations and 10x their lead qualification
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {useCases.map((useCase, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                className={`fade-in-up delay-${(index + 1) * 100}`}
                sx={{
                  height: '100%',
                  background: '#ffffff',
                  border: '2px solid #e2e8f0',
                  borderRadius: '24px',
                  transition: 'all 0.4s',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-12px)',
                    boxShadow: `0 24px 60px ${useCase.color}20`,
                    borderColor: useCase.color
                  }
                }}
              >
                <CardContent sx={{ p: 5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Avatar
                      sx={{
                        background: `linear-gradient(135deg, ${useCase.color} 0%, ${useCase.color}cc 100%)`,
                        mr: 3,
                        width: 72,
                        height: 72,
                        boxShadow: `0 8px 24px ${useCase.color}40`
                      }}
                      className="bounce-in"
                    >
                      {useCase.icon}
                    </Avatar>
                    <Box>
                      <Chip
                        label={useCase.industry}
                        sx={{
                          bgcolor: `${useCase.color}20`,
                          color: useCase.color,
                          fontWeight: 700,
                          mb: 1,
                          border: `1px solid ${useCase.color}40`
                        }}
                      />
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
                        {useCase.title}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body1" sx={{ color: '#64748b', lineHeight: 1.8, mb: 4 }}>
                    {useCase.description}
                  </Typography>

                  {/* Metrics Dashboard */}
                  <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={4}>
                      <Box
                        sx={{
                          textAlign: 'center',
                          p: 2.5,
                          background: `linear-gradient(135deg, ${useCase.color}15 0%, ${useCase.color}05 100%)`,
                          borderRadius: '12px',
                          border: `1px solid ${useCase.color}30`
                        }}
                        className="bounce-in delay-100"
                      >
                        <Typography variant="h3" sx={{ fontWeight: 900, color: useCase.color, mb: 0.5 }}>
                          {useCase.metrics.qualified}%
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                          Qualified
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box
                        sx={{
                          textAlign: 'center',
                          p: 2.5,
                          background: `linear-gradient(135deg, ${useCase.color}15 0%, ${useCase.color}05 100%)`,
                          borderRadius: '12px',
                          border: `1px solid ${useCase.color}30`
                        }}
                        className="bounce-in delay-200"
                      >
                        <Typography variant="h3" sx={{ fontWeight: 900, color: useCase.color, mb: 0.5 }}>
                          {useCase.metrics.transferred}%
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                          Transferred
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box
                        sx={{
                          textAlign: 'center',
                          p: 2.5,
                          background: `linear-gradient(135deg, ${useCase.color}15 0%, ${useCase.color}05 100%)`,
                          borderRadius: '12px',
                          border: `1px solid ${useCase.color}30`
                        }}
                        className="bounce-in delay-300"
                      >
                        <Typography variant="h3" sx={{ fontWeight: 900, color: useCase.color, mb: 0.5 }}>
                          {useCase.metrics.scheduled}%
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                          Scheduled
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box
                    sx={{
                      background: `linear-gradient(135deg, ${useCase.color}15 0%, ${useCase.color}05 100%)`,
                      p: 3,
                      borderRadius: '12px',
                      borderLeft: `6px solid ${useCase.color}`
                    }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                      📈 {useCase.results}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section with Gradient */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
          backgroundSize: '200% 200%',
          color: '#ffffff',
          py: 16,
          position: 'relative',
          overflow: 'hidden'
        }}
        className="gradient-rotate"
      >
        {/* Animated Background Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '800px',
            height: '800px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
            filter: 'blur(100px)'
          }}
          className="pulse-glow"
        />

        <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Box className="fade-in-scale">
            <Chip
              icon={<Rocket sx={{ color: '#ffffff !important' }} />}
              label="LIMITED TIME OFFER"
              sx={{
                background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
                color: '#ffffff',
                fontWeight: 700,
                mb: 4,
                px: 3,
                py: 3,
                fontSize: '0.95rem'
              }}
              className="pulse"
            />
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                mb: 4,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Ready to 10x Your Lead Qualification?
            </Typography>
            <Typography variant="h6" sx={{ mb: 6, opacity: 0.9, lineHeight: 1.8, color: '#cbd5e1' }}>
              Join <Box component="span" sx={{ color: '#22c55e', fontWeight: 700 }}>5,000+</Box> companies using SpeakSynth AI to qualify leads 24/7, transfer hot prospects instantly, and never miss a callback
            </Typography>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              onClick={() => router.push('/auth/register')}
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: '#ffffff',
                fontWeight: 700,
                px: 8,
                py: 3.5,
                fontSize: '1.3rem',
                borderRadius: '16px',
                boxShadow: '0 12px 48px rgba(99, 102, 241, 0.5)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  transform: 'translateY(-4px) scale(1.05)',
                  boxShadow: '0 20px 60px rgba(99, 102, 241, 0.7)'
                },
                transition: 'all 0.3s'
              }}
              className="pulse-glow"
            >
              Start Free Trial Now
            </Button>
            <Typography variant="body1" sx={{ mt: 4, opacity: 0.8, color: '#cbd5e1' }}>
              ✓ No credit card required  •  ✓ 14-day free trial  •  ✓ Setup in 5 minutes  •  ✓ Cancel anytime
            </Typography>
          </Box>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}