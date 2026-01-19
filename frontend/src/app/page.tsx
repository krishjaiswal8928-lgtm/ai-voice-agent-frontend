'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent, Chip, Avatar, List, ListItem, ListItemIcon, ListItemText, LinearProgress } from '@mui/material';
import {
  AutoAwesome,
  Speed,
  Security,
  TrendingUp,
  PhoneInTalk,
  CheckCircle,
  ArrowForward,
  Star,
  Schedule,
  PersonSearch,
  CallSplit,
  Assessment,
  Lightbulb,
  Business,
  LocalHospital,
  School,
  Storefront,
  HeadsetMic,
  RecordVoiceOver,
  Psychology,
  Insights,
  TrendingUpOutlined
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { LandingNav } from '@/components/LandingNav';
import { Footer } from '@/components/Footer';
import '@/styles/animations.css';

export default function LandingPage() {
  const router = useRouter();
  const [stats, setStats] = useState({ calls: 0, users: 0, accuracy: 0, qualified: 0 });
  const [activeDemo, setActiveDemo] = useState(0);

  // Count-up animation for stats
  useEffect(() => {
    const duration = 2000;
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
    }, 4000);
    return () => clearInterval(demoTimer);
  }, []);

  const demoConversations = [
    {
      lead: "Hi, I'm interested in your product",
      ai: "Great! Let me understand your needs. What's your current challenge?",
      action: "🎯 Qualifying lead...",
      color: '#6366f1'
    },
    {
      lead: "I need this urgently for my team",
      ai: "Perfect timing! I can connect you with our sales specialist right now.",
      action: "📞 Transferring to sales...",
      color: '#22c55e'
    },
    {
      lead: "Can we discuss this next week?",
      ai: "Absolutely! What day and time works best for you?",
      action: "📅 Scheduling callback...",
      color: '#f59e0b'
    }
  ];

  const features = [
    {
      icon: <PersonSearch sx={{ fontSize: 48 }} />,
      title: 'BANT Lead Qualification',
      description: 'Automatically qualify every lead using the proven BANT framework (Budget, Authority, Need, Timeline). Our AI asks intelligent questions, detects buying signals, and scores leads 1-10 in real-time.',
      color: '#6366f1',
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
      description: 'Transfer qualified leads to your sales team instantly with full context. Choose warm transfers (AI introduces the lead) or cold transfers (direct connection). Smart agent routing based on availability, expertise, and lead score.',
      color: '#22c55e',
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
      description: 'Schedule callbacks automatically when leads aren\'t ready to buy now. AI captures preferred time slots, timezone detection, adds conversation context, and assigns to the best-fit agent. Automatic calendar integration with reminders.',
      color: '#f59e0b',
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
      description: 'Advanced NLP analyzes every conversation to detect sentiment, buying signals, objections, and competitor mentions. Real-time insights help your AI agent adapt and improve qualification accuracy.',
      color: '#8b5cf6',
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
      title: 'Real-Time Analytics Dashboard',
      description: 'Track qualification rates, transfer success, callback completion, and agent performance in real-time. Get actionable insights into conversion patterns, peak call times, and ROI metrics.',
      color: '#ef4444',
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
      description: 'Create unique AI agents with custom voices, personalities, and conversation flows. Train agents for different campaigns, industries, and customer segments. Multi-language support with natural accents.',
      color: '#22d3ee',
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
      metrics: { qualified: 85, transferred: 42, scheduled: 38 }
    },
    {
      icon: <Storefront />,
      industry: 'E-commerce',
      title: 'Customer Support & Upsells',
      description: 'Handle order inquiries, qualify upsell opportunities based on purchase history, transfer high-value customers to sales specialists, and schedule follow-up calls for abandoned carts.',
      results: '40% increase in upsell conversions, 70% faster response time',
      metrics: { qualified: 78, transferred: 35, scheduled: 45 }
    },
    {
      icon: <LocalHospital />,
      industry: 'Healthcare',
      title: 'Patient Appointment Scheduling',
      description: 'Schedule appointments 24/7, qualify patient needs and urgency, route urgent cases to appropriate medical staff, send automated appointment reminders, and handle rescheduling requests.',
      results: '80% reduction in scheduling time, 95% appointment show-up rate',
      metrics: { qualified: 92, transferred: 15, scheduled: 73 }
    },
    {
      icon: <School />,
      industry: 'Education',
      title: 'Student Enrollment & Counseling',
      description: 'Qualify prospective students using custom criteria, answer program questions, schedule counseling sessions automatically, transfer interested students to admissions, and follow up on applications.',
      results: '50% more enrollments per quarter, 65% faster response time',
      metrics: { qualified: 88, transferred: 40, scheduled: 48 }
    }
  ];

  const qualificationProcess = [
    {
      step: 'Initial Engagement',
      description: 'AI greets the lead warmly, introduces your company professionally, and builds rapport through natural conversation',
      icon: <PhoneInTalk />,
      example: '"Hi! Thanks for calling SpeakSynth AI. I\'m here to help you find the perfect solution. May I ask your name?"'
    },
    {
      step: 'Need Discovery',
      description: 'Asks targeted, open-ended questions to understand the lead\'s pain points, current situation, and desired outcomes',
      icon: <PersonSearch />,
      example: '"What challenges are you currently facing with lead qualification? What would an ideal solution look like for you?"'
    },
    {
      step: 'BANT Qualification',
      description: 'Evaluates Budget, Authority, Need, and Timeline through conversational, non-pushy questions',
      icon: <Assessment />,
      example: '"Do you have a budget allocated for this? Are you the decision-maker, or should we include others in the conversation?"'
    },
    {
      step: 'Lead Scoring',
      description: 'Assigns a qualification score (1-10) based on BANT criteria, buying signals, and conversation quality',
      icon: <TrendingUpOutlined />,
      example: 'Score: 8/10 - High Budget ✓ Decision Maker ✓ Urgent Need ✓ Timeline: This Quarter ✓'
    },
    {
      step: 'Smart Routing',
      description: 'Routes leads based on score: Hot leads (8-10) → Instant transfer | Warm leads (5-7) → Schedule callback | Cold leads (1-4) → Nurture sequence',
      icon: <CallSplit />,
      example: 'Hot Lead Detected! Transferring to Sarah (Top Sales Rep) with full context...'
    }
  ];

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <LandingNav />

      {/* Hero Section with Live Demo */}
      <Box
        sx={{
          position: 'relative',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
          backgroundSize: '200% 200%',
          color: '#ffffff',
          pt: { xs: 12, md: 16 },
          pb: { xs: 12, md: 16 },
          overflow: 'hidden',
          animation: 'gradientShift 15s ease infinite'
        }}
        className="gradient-shift"
      >
        {/* Animated Background Orbs */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
            filter: 'blur(40px)',
            animation: 'floatSlow 8s ease-in-out infinite'
          }}
          className="float-slow"
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '10%',
            right: '10%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animation: 'float 6s ease-in-out infinite'
          }}
          className="float"
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box className="fade-in-left">
                <Chip
                  label="🚀 AI-Powered Lead Qualification Platform"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: '#ffffff',
                    fontWeight: 600,
                    mb: 3,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    animation: 'pulse 2s ease-in-out infinite'
                  }}
                  className="pulse"
                />
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 800,
                    mb: 3,
                    fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                    lineHeight: 1.2,
                    textShadow: '0 4px 20px rgba(0,0,0,0.2)'
                  }}
                >
                  Qualify Leads Automatically with AI Voice Agents
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 4,
                    opacity: 0.95,
                    lineHeight: 1.6,
                    fontSize: { xs: '1.1rem', md: '1.3rem' },
                    fontWeight: 400
                  }}
                >
                  Your AI-powered sales assistant works 24/7 to qualify leads using BANT criteria, transfer hot prospects instantly, and schedule callbacks intelligently
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    onClick={() => router.push('/auth/register')}
                    sx={{
                      bgcolor: '#ffffff',
                      color: '#6366f1',
                      fontWeight: 700,
                      px: 4,
                      py: 2,
                      fontSize: '1.1rem',
                      borderRadius: '12px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                      '&:hover': {
                        bgcolor: '#f5f5f5',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.3)'
                      },
                      transition: 'all 0.3s'
                    }}
                  >
                    Start Free Trial
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => router.push('/contact')}
                    sx={{
                      borderColor: '#ffffff',
                      color: '#ffffff',
                      fontWeight: 700,
                      px: 4,
                      py: 2,
                      fontSize: '1.1rem',
                      borderRadius: '12px',
                      borderWidth: '2px',
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        borderColor: '#ffffff',
                        bgcolor: 'rgba(255,255,255,0.1)',
                        borderWidth: '2px'
                      }
                    }}
                  >
                    Book a Demo
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  {['✓ No credit card required', '✓ 14-day free trial', '✓ Setup in 5 minutes'].map((item, i) => (
                    <Typography key={i} variant="body2" sx={{ display: 'flex', alignItems: 'center', opacity: 0.9 }}>
                      {item}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </Grid>

            {/* Live Demo Conversation */}
            <Grid item xs={12} md={6}>
              <Box
                className="fade-in-right delay-300"
                sx={{
                  position: 'relative'
                }}
              >
                <Card
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    p: 3,
                    border: '1px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    minHeight: '320px'
                  }}
                  className="float"
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: '#6366f1', mr: 2, width: 56, height: 56 }}>
                      <HeadsetMic sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                        AI Voice Agent
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22c55e', animation: 'pulse 2s ease-in-out infinite' }} />
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                          Live Demo
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Box
                      sx={{
                        bgcolor: '#f3f4f6',
                        p: 2,
                        borderRadius: '12px',
                        mb: 2,
                        animation: 'fadeInLeft 0.5s ease-out'
                      }}
                      className="fade-in-left"
                    >
                      <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5 }}>
                        Lead
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#111827' }}>
                        {demoConversations[activeDemo].lead}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        bgcolor: '#6366f1',
                        color: '#ffffff',
                        p: 2,
                        borderRadius: '12px',
                        mb: 2,
                        animation: 'fadeInRight 0.5s ease-out 0.3s both'
                      }}
                      className="fade-in-right delay-300"
                    >
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                        AI Agent
                      </Typography>
                      <Typography variant="body1">
                        {demoConversations[activeDemo].ai}
                      </Typography>
                    </Box>

                    <Chip
                      label={demoConversations[activeDemo].action}
                      sx={{
                        bgcolor: demoConversations[activeDemo].color,
                        color: '#ffffff',
                        fontWeight: 600,
                        animation: 'pulse 2s ease-in-out infinite'
                      }}
                      className="pulse"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    {[0, 1, 2].map((i) => (
                      <Box
                        key={i}
                        sx={{
                          width: activeDemo === i ? 24 : 8,
                          height: 8,
                          borderRadius: '4px',
                          bgcolor: activeDemo === i ? '#6366f1' : '#d1d5db',
                          transition: 'all 0.3s'
                        }}
                      />
                    ))}
                  </Box>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section with Progress Bars */}
      <Container maxWidth="lg" sx={{ mt: -6, position: 'relative', zIndex: 2 }}>
        <Grid container spacing={3}>
          {[
            { label: 'Calls Processed', value: stats.calls.toLocaleString() + '+', icon: <PhoneInTalk />, progress: 100 },
            { label: 'Happy Customers', value: stats.users.toLocaleString() + '+', icon: <Star />, progress: 100 },
            { label: 'Qualification Accuracy', value: stats.accuracy + '%', icon: <CheckCircle />, progress: stats.accuracy },
            { label: 'Leads Qualified', value: stats.qualified + '%', icon: <TrendingUpOutlined />, progress: stats.qualified }
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                className={`fade-in-up delay-${(index + 1) * 100}`}
                sx={{
                  bgcolor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '16px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 60px rgba(99,102,241,0.2)'
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'rgba(99, 102, 241, 0.1)',
                      width: 56,
                      height: 56,
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    {React.cloneElement(stat.icon, { sx: { fontSize: 28, color: '#6366f1' } })}
                  </Avatar>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: '#111827', mb: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, mb: 2 }}>
                    {stat.label}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={stat.progress}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: '#e5e7eb',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: '#6366f1',
                        borderRadius: 3
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Lead Qualification Process with Examples */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }} className="fade-in-up">
          <Chip label="HOW IT QUALIFIES" sx={{ bgcolor: '#6366f1', color: '#ffffff', mb: 2, fontWeight: 600 }} />
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 2,
              color: '#111827',
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            5-Step Lead Qualification Process
          </Typography>
          <Typography variant="h6" sx={{ color: '#6b7280', maxWidth: 700, mx: 'auto' }}>
            Our AI follows a proven methodology to qualify every lead and route them intelligently
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {qualificationProcess.map((item, index) => (
            <Grid item xs={12} key={index}>
              <Card
                className={`fade-in-up delay-${(index + 1) * 100}`}
                sx={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '16px',
                  transition: 'all 0.3s',
                  overflow: 'hidden',
                  '&:hover': {
                    borderColor: '#6366f1',
                    boxShadow: '0 12px 40px rgba(99,102,241,0.15)',
                    transform: 'translateX(8px)'
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: '#6366f1',
                        width: 64,
                        height: 64,
                        fontSize: '1.5rem',
                        fontWeight: 700
                      }}
                    >
                      {index + 1}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827' }}>
                          {item.step}
                        </Typography>
                        {React.cloneElement(item.icon, { sx: { color: '#6366f1' } })}
                      </Box>
                      <Typography variant="body1" sx={{ color: '#6b7280', lineHeight: 1.7, mb: 3 }}>
                        {item.description}
                      </Typography>
                      <Box
                        sx={{
                          bgcolor: '#f0fdf4',
                          border: '1px solid #22c55e',
                          borderLeft: '4px solid #22c55e',
                          p: 2,
                          borderRadius: '8px'
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#166534', fontStyle: 'italic' }}>
                          💬 Example: "{item.example}"
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section with Detailed Lists */}
      <Box sx={{ bgcolor: '#ffffff', py: 12 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }} className="fade-in-up">
            <Chip label="FEATURES" sx={{ bgcolor: '#22c55e', color: '#ffffff', mb: 2, fontWeight: 600 }} />
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                mb: 2,
                color: '#111827',
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}
            >
              Everything You Need to Automate Lead Qualification
            </Typography>
            <Typography variant="h6" sx={{ color: '#6b7280', maxWidth: 600, mx: 'auto' }}>
              Comprehensive features designed to qualify, transfer, and schedule with precision
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card
                  className={`fade-in-up delay-${(index + 1) * 100}`}
                  sx={{
                    height: '100%',
                    border: '1px solid #e5e7eb',
                    borderRadius: '16px',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-12px)',
                      boxShadow: `0 24px 60px ${feature.color}30`,
                      borderColor: feature.color
                    }
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      sx={{
                        color: feature.color,
                        mb: 3,
                        display: 'inline-block',
                        p: 2,
                        borderRadius: '12px',
                        bgcolor: `${feature.color}15`
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#6b7280', lineHeight: 1.7, mb: 3 }}>
                      {feature.description}
                    </Typography>
                    <List dense>
                      {feature.details.map((detail, i) => (
                        <ListItem key={i} sx={{ px: 0, py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckCircle sx={{ fontSize: 18, color: feature.color }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={detail}
                            primaryTypographyProps={{
                              fontSize: '0.9rem',
                              color: '#6b7280'
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

      {/* Use Cases with Metrics */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }} className="fade-in-up">
          <Chip label="USE CASES" sx={{ bgcolor: '#f59e0b', color: '#ffffff', mb: 2, fontWeight: 600 }} />
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 2,
              color: '#111827',
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Proven Results Across Industries
          </Typography>
          <Typography variant="h6" sx={{ color: '#6b7280' }}>
            See how businesses use SpeakSynth AI to transform their sales operations
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {useCases.map((useCase, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                className={`fade-in-up delay-${(index + 1) * 100}`}
                sx={{
                  height: '100%',
                  border: '1px solid #e5e7eb',
                  borderRadius: '16px',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.12)'
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: '#6366f1', mr: 2, width: 56, height: 56 }}>
                      {useCase.icon}
                    </Avatar>
                    <Box>
                      <Chip label={useCase.industry} sx={{ bgcolor: '#f3f4f6', fontWeight: 600, mb: 1 }} />
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827' }}>
                        {useCase.title}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body1" sx={{ color: '#6b7280', lineHeight: 1.7, mb: 3 }}>
                    {useCase.description}
                  </Typography>

                  {/* Metrics */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f9fafb', borderRadius: '8px' }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#6366f1' }}>
                          {useCase.metrics.qualified}%
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6b7280' }}>
                          Qualified
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f9fafb', borderRadius: '8px' }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#22c55e' }}>
                          {useCase.metrics.transferred}%
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6b7280' }}>
                          Transferred
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f9fafb', borderRadius: '8px' }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#f59e0b' }}>
                          {useCase.metrics.scheduled}%
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6b7280' }}>
                          Scheduled
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box sx={{ bgcolor: '#f0fdf4', p: 2, borderRadius: '8px', borderLeft: '4px solid #22c55e' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#166534' }}>
                      📈 Results: {useCase.results}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
          color: '#ffffff',
          py: 12
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Box className="fade-in-up">
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                mb: 3,
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}
            >
              Ready to 10x Your Lead Qualification?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, lineHeight: 1.7 }}>
              Join thousands of companies using SpeakSynth AI to qualify leads 24/7, transfer hot prospects instantly, and never miss a callback
            </Typography>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              onClick={() => router.push('/auth/register')}
              sx={{
                bgcolor: '#6366f1',
                color: '#ffffff',
                fontWeight: 700,
                px: 6,
                py: 2.5,
                fontSize: '1.2rem',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
                '&:hover': {
                  bgcolor: '#4f46e5',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 32px rgba(99, 102, 241, 0.5)'
                },
                transition: 'all 0.3s'
              }}
            >
              Start Free Trial
            </Button>
            <Typography variant="body2" sx={{ mt: 3, opacity: 0.7 }}>
              No credit card required • 14-day free trial • Setup in 5 minutes • Cancel anytime
            </Typography>
          </Box>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}