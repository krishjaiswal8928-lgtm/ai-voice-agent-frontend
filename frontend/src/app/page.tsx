'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent, Chip, Avatar } from '@mui/material';
import {
  AutoAwesome,
  Speed,
  Security,
  TrendingUp,
  PhoneInTalk,
  SmartToy,
  CheckCircle,
  ArrowForward,
  Star
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { LandingNav } from '@/components/LandingNav';
import { Footer } from '@/components/Footer';
import '../styles/animations.css';

export default function LandingPage() {
  const router = useRouter();
  const [stats, setStats] = useState({ calls: 0, users: 0, accuracy: 0 });

  // Count-up animation for stats
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    const targets = { calls: 1000000, users: 5000, accuracy: 98 };
    let current = { calls: 0, users: 0, accuracy: 0 };

    const timer = setInterval(() => {
      current.calls = Math.min(current.calls + targets.calls / steps, targets.calls);
      current.users = Math.min(current.users + targets.users / steps, targets.users);
      current.accuracy = Math.min(current.accuracy + targets.accuracy / steps, targets.accuracy);

      setStats({
        calls: Math.floor(current.calls),
        users: Math.floor(current.users),
        accuracy: Math.floor(current.accuracy)
      });

      if (current.calls >= targets.calls) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: <AutoAwesome sx={{ fontSize: 48 }} />,
      title: 'AI Lead Qualification',
      description: 'Automatically qualify leads using BANT criteria, detect buying signals, and score leads 1-10 in real-time',
      color: '#6366f1'
    },
    {
      icon: <TrendingUp sx={{ fontSize: 48 }} />,
      title: 'Smart Call Transfers',
      description: 'Transfer qualified leads to human agents instantly with warm or cold transfers and automatic agent selection',
      color: '#22c55e'
    },
    {
      icon: <Speed sx={{ fontSize: 48 }} />,
      title: 'Intelligent Callbacks',
      description: 'Schedule callbacks with lead context, talking points, and auto-assignment to available agents',
      color: '#f59e0b'
    },
    {
      icon: <Security sx={{ fontSize: 48 }} />,
      title: 'Enterprise Security',
      description: 'Bank-level encryption, SOC 2 compliance, and GDPR-ready data handling for complete peace of mind',
      color: '#8b5cf6'
    },
    {
      icon: <PhoneInTalk sx={{ fontSize: 48 }} />,
      title: 'Multi-Provider Support',
      description: 'Works seamlessly with Twilio and SIP trunking providers (3CX, FreePBX, Ziwo) for maximum flexibility',
      color: '#ef4444'
    },
    {
      icon: <SmartToy sx={{ fontSize: 48 }} />,
      title: 'Custom AI Agents',
      description: 'Create reusable autonomous AI agents with custom configurations, goals, and conversation flows',
      color: '#22d3ee'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Configure Your Agent',
      description: 'Set up your AI agent with custom goals, conversation flows, and qualification criteria in minutes'
    },
    {
      number: '02',
      title: 'Connect Your Phone',
      description: 'Integrate with Twilio or your existing SIP trunk provider with just a few clicks'
    },
    {
      number: '03',
      title: 'Start Converting',
      description: 'Watch as your AI agent qualifies leads, transfers hot prospects, and schedules callbacks automatically'
    }
  ];

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <LandingNav />

      {/* Hero Section */}
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
        {/* Floating orbs */}
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
            <Grid item xs={12} md={7}>
              <Box className="fade-in-left">
                <Chip
                  label="🚀 AI-Powered Voice Automation"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: '#ffffff',
                    fontWeight: 600,
                    mb: 3,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)'
                  }}
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
                  Orchestrate Your AI Agent
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
                  Automate lead qualification, transfer hot leads to your sales team, and schedule callbacks intelligently with our AI-powered voice platform
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box
                className="fade-in-right delay-300"
                sx={{
                  position: 'relative',
                  display: { xs: 'none', md: 'block' }
                }}
              >
                <Box
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    p: 4,
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                  }}
                  className="float"
                >
                  <SmartToy sx={{ fontSize: 120, opacity: 0.9 }} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ mt: -6, position: 'relative', zIndex: 2 }}>
        <Grid container spacing={3}>
          {[
            { label: 'Calls Processed', value: stats.calls.toLocaleString() + '+', icon: <PhoneInTalk /> },
            { label: 'Happy Customers', value: stats.users.toLocaleString() + '+', icon: <Star /> },
            { label: 'Accuracy Rate', value: stats.accuracy + '%', icon: <CheckCircle /> }
          ].map((stat, index) => (
            <Grid item xs={12} md={4} key={index}>
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
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'rgba(99, 102, 241, 0.1)',
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    {React.cloneElement(stat.icon, { sx: { fontSize: 32, color: '#6366f1' } })}
                  </Avatar>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: '#111827', mb: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#6b7280', fontWeight: 500 }}>
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }} className="fade-in-up">
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 2,
              color: '#111827',
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Powerful Features
          </Typography>
          <Typography variant="h6" sx={{ color: '#6b7280', maxWidth: 600, mx: 'auto' }}>
            Everything you need to automate your voice operations and scale your sales
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
                    transform: 'translateY(-8px)',
                    boxShadow: `0 20px 60px ${feature.color}30`,
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
                  <Typography variant="body1" sx={{ color: '#6b7280', lineHeight: 1.7 }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Box sx={{ bgcolor: '#ffffff', py: 12 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }} className="fade-in-up">
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                mb: 2,
                color: '#111827',
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}
            >
              How It Works
            </Typography>
            <Typography variant="h6" sx={{ color: '#6b7280' }}>
              Get started in three simple steps
            </Typography>
          </Box>

          <Grid container spacing={6}>
            {steps.map((step, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box
                  className={`fade-in-up delay-${(index + 1) * 200}`}
                  sx={{ textAlign: 'center' }}
                >
                  <Typography
                    variant="h1"
                    sx={{
                      fontWeight: 900,
                      fontSize: '5rem',
                      background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 2,
                      opacity: 0.3
                    }}
                  >
                    {step.number}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#6b7280', lineHeight: 1.7 }}>
                    {step.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

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
              Ready to Transform Your Sales Process?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, lineHeight: 1.7 }}>
              Join thousands of companies using SpeakSynth AI to qualify leads, transfer calls, and close deals faster
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
              No credit card required • 14-day free trial • Cancel anytime
            </Typography>
          </Box>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}