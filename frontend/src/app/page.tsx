'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent, Chip, Avatar, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import {
    AutoAwesome,
    Speed,
    Security,
    TrendingUp,
    PhoneInTalk,
    SmartToy,
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
    Storefront
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { LandingNav } from '@/components/LandingNav';
import { Footer } from '@/components/Footer';
import '@/styles/animations.css';

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
            icon: <PersonSearch sx={{ fontSize: 48 }} />,
            title: 'AI Lead Qualification',
            description: 'Automatically qualify leads using BANT criteria (Budget, Authority, Need, Timeline). Our AI detects buying signals, asks qualifying questions, and scores leads 1-10 based on conversion probability.',
            color: '#6366f1',
            details: [
                'BANT framework qualification',
                'Real-time lead scoring (1-10)',
                'Buying signal detection',
                'Custom qualification criteria'
            ]
        },
        {
            icon: <CallSplit sx={{ fontSize: 48 }} />,
            title: 'Smart Call Transfers',
            description: 'Transfer hot leads to your sales team instantly. Choose between warm transfers (AI introduces the lead) or cold transfers (direct connection). Automatic agent selection based on availability and expertise.',
            color: '#22c55e',
            details: [
                'Warm & cold transfer options',
                'Automatic agent routing',
                'Lead context handoff',
                'Transfer success tracking'
            ]
        },
        {
            icon: <Schedule sx={{ fontSize: 48 }} />,
            title: 'Intelligent Call Scheduling',
            description: 'Schedule callbacks automatically when leads aren\'t ready to buy now. AI captures preferred time slots, adds context notes, and assigns to the best-fit agent. Automatic calendar integration.',
            color: '#f59e0b',
            details: [
                'Automatic callback scheduling',
                'Calendar integration',
                'Lead context preservation',
                'Smart agent assignment'
            ]
        },
        {
            icon: <Assessment sx={{ fontSize: 48 }} />,
            title: 'Real-Time Analytics',
            description: 'Track qualification rates, transfer success, callback completion, and agent performance in real-time. Get insights into conversion patterns and optimize your sales process.',
            color: '#8b5cf6',
            details: [
                'Live call monitoring',
                'Conversion tracking',
                'Performance dashboards',
                'ROI analytics'
            ]
        },
        {
            icon: <PhoneInTalk sx={{ fontSize: 48 }} />,
            title: 'Multi-Provider Support',
            description: 'Works seamlessly with Twilio and any SIP trunking provider (3CX, FreePBX, Ziwo, Asterisk). Use your existing phone infrastructure without vendor lock-in.',
            color: '#ef4444',
            details: [
                'Twilio integration',
                'Universal SIP support',
                'No vendor lock-in',
                'Easy migration'
            ]
        },
        {
            icon: <SmartToy sx={{ fontSize: 48 }} />,
            title: 'Custom AI Agents',
            description: 'Create reusable autonomous AI agents with custom goals, conversation flows, and qualification criteria. Train agents for different campaigns and industries.',
            color: '#22d3ee',
            details: [
                'Custom conversation flows',
                'Industry-specific training',
                'Multi-language support',
                'Voice customization'
            ]
        }
    ];

    const useCases = [
        {
            icon: <Business />,
            industry: 'B2B Sales',
            title: 'Enterprise Lead Qualification',
            description: 'Qualify enterprise leads 24/7, identify decision-makers, and schedule demos with qualified prospects automatically.',
            results: '3x more qualified leads, 60% time saved'
        },
        {
            icon: <Storefront />,
            industry: 'E-commerce',
            title: 'Customer Support & Upsells',
            description: 'Handle order inquiries, qualify upsell opportunities, and transfer high-value customers to sales specialists.',
            results: '40% increase in upsell conversions'
        },
        {
            icon: <LocalHospital />,
            industry: 'Healthcare',
            title: 'Patient Appointment Scheduling',
            description: 'Schedule appointments, qualify patient needs, and route urgent cases to appropriate medical staff.',
            results: '80% reduction in scheduling time'
        },
        {
            icon: <School />,
            industry: 'Education',
            title: 'Student Enrollment & Counseling',
            description: 'Qualify prospective students, answer program questions, and schedule counseling sessions automatically.',
            results: '50% more enrollments per quarter'
        }
    ];

    const workflowSteps = [
        {
            number: '01',
            title: 'Configure Your AI Agent',
            description: 'Set up your AI agent in minutes with our intuitive interface',
            details: [
                'Define qualification criteria (BANT, custom questions)',
                'Set conversation goals (qualify, transfer, schedule)',
                'Customize voice and personality',
                'Add your product/service knowledge base'
            ]
        },
        {
            number: '02',
            title: 'Connect Your Phone System',
            description: 'Integrate with your existing phone infrastructure seamlessly',
            details: [
                'Connect Twilio account or SIP trunk',
                'Import or purchase phone numbers',
                'Configure call routing rules',
                'Set up agent availability schedules'
            ]
        },
        {
            number: '03',
            title: 'Launch & Monitor',
            description: 'Go live and watch your AI agent qualify leads automatically',
            details: [
                'Start receiving/making calls immediately',
                'Monitor live calls in real-time dashboard',
                'Review call transcripts and recordings',
                'Track qualification rates and conversions'
            ]
        },
        {
            number: '04',
            title: 'Optimize & Scale',
            description: 'Use analytics to improve performance and scale your operations',
            details: [
                'Analyze conversion patterns',
                'A/B test different conversation flows',
                'Train agents with successful examples',
                'Scale to handle unlimited concurrent calls'
            ]
        }
    ];

    const qualificationProcess = [
        {
            step: 'Initial Engagement',
            description: 'AI greets the lead, introduces your company, and builds rapport naturally'
        },
        {
            step: 'Need Discovery',
            description: 'Asks targeted questions to understand the lead\'s pain points and requirements'
        },
        {
            step: 'BANT Qualification',
            description: 'Evaluates Budget, Authority, Need, and Timeline through conversational questions'
        },
        {
            step: 'Lead Scoring',
            description: 'Assigns a score (1-10) based on qualification criteria and buying signals'
        },
        {
            step: 'Smart Routing',
            description: 'Hot leads (8-10) → Instant transfer | Warm leads (5-7) → Schedule callback | Cold leads (1-4) → Nurture sequence'
        }
    ];

    return (
        <Box
            sx={{
                bgcolor: '#f5f5f5',
                backgroundImage: `
                    radial-gradient(circle at 2px 2px, rgba(0,0,0,0.05) 1px, transparent 0)
                `,
                backgroundSize: '32px 32px',
                minHeight: '100vh',
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.03) 0%, transparent 50%)',
                    pointerEvents: 'none',
                    zIndex: 0
                }
            }}
        >
            <LandingNav />

            {/* Hero Section */}
            <Box
                sx={{
                    position: 'relative',
                    pt: { xs: 8, md: 12 },
                    pb: { xs: 8, md: 12 },
                    overflow: 'hidden'
                }}
            >
                {/* Animated floating elements */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: '10%',
                        left: '5%',
                        width: '400px',
                        height: '400px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
                        filter: 'blur(60px)',
                        animation: 'float 8s ease-in-out infinite',
                        zIndex: 0
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: '10%',
                        right: '5%',
                        width: '500px',
                        height: '500px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(236, 72, 153, 0.06) 0%, transparent 70%)',
                        filter: 'blur(80px)',
                        animation: 'floatSlow 10s ease-in-out infinite',
                        zIndex: 0
                    }}
                />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={7}>
                            <Box className="fade-in-left">
                                <Chip
                                    label="🚀 AI-Powered Voice Automation Platform"
                                    sx={{
                                        bgcolor: '#ffffff',
                                        color: '#6366f1',
                                        fontWeight: 600,
                                        mb: 3,
                                        border: '1px solid rgba(99, 102, 241, 0.2)',
                                        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.1)',
                                        animation: 'pulse 3s ease-in-out infinite'
                                    }}
                                />
                                <Typography
                                    variant="h1"
                                    sx={{
                                        fontWeight: 800,
                                        mb: 3,
                                        fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                                        lineHeight: 1.2,
                                        color: '#111827',
                                        background: 'linear-gradient(135deg, #111827 0%, #374151 100%)',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }}
                                >
                                    Qualify Leads, Transfer Calls & Schedule Callbacks Automatically
                                </Typography>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        mb: 4,
                                        color: '#6b7280',
                                        lineHeight: 1.6,
                                        fontSize: { xs: '1.1rem', md: '1.3rem' },
                                        fontWeight: 400
                                    }}
                                >
                                    Your AI-powered sales assistant that works 24/7 to qualify leads using BANT criteria, transfer hot prospects to your team, and schedule callbacks intelligently
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
                                            px: 4,
                                            py: 2,
                                            fontSize: '1.1rem',
                                            borderRadius: '12px',
                                            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                top: 0,
                                                left: '-100%',
                                                width: '100%',
                                                height: '100%',
                                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                                                transition: 'left 0.6s'
                                            },
                                            '&:hover::before': {
                                                left: '100%'
                                            },
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 12px 32px rgba(99, 102, 241, 0.4)'
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
                                            borderColor: '#6366f1',
                                            color: '#6366f1',
                                            fontWeight: 700,
                                            px: 4,
                                            py: 2,
                                            fontSize: '1.1rem',
                                            borderRadius: '12px',
                                            borderWidth: '2px',
                                            bgcolor: '#ffffff',
                                            '&:hover': {
                                                borderColor: '#6366f1',
                                                bgcolor: 'rgba(99, 102, 241, 0.05)',
                                                borderWidth: '2px',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.15)'
                                            },
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        Book a Demo
                                    </Button>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                                    {['✓ No credit card required', '✓ 14-day free trial', '✓ Setup in 5 minutes'].map((item, i) => (
                                        <Typography key={i} variant="body2" sx={{ display: 'flex', alignItems: 'center', color: '#6b7280', fontWeight: 500 }}>
                                            {item}
                                        </Typography>
                                    ))}
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={5}>
                            <Box
                                className="fade-in-right delay-300"
                                sx={{
                                    position: 'relative',
                                    display: { xs: 'none', md: 'flex' },
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                <Box
                                    sx={{
                                        bgcolor: '#ffffff',
                                        borderRadius: '24px',
                                        p: 6,
                                        border: '1px solid rgba(0,0,0,0.08)',
                                        boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        position: 'relative',
                                        animation: 'float 4s ease-in-out infinite',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            inset: -2,
                                            borderRadius: '24px',
                                            padding: '2px',
                                            background: 'linear-gradient(135deg, #6366f1, #ec4899, #8b5cf6)',
                                            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                            WebkitMaskComposite: 'xor',
                                            maskComposite: 'exclude',
                                            opacity: 0.5
                                        }
                                    }}
                                >
                                    <SmartToy sx={{ fontSize: 140, color: '#6366f1' }} />
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Stats Section */}
            <Container maxWidth="lg" sx={{ mt: -4, position: 'relative', zIndex: 2 }}>
                <Grid container spacing={3}>
                    {[
                        { label: 'Calls Processed', value: stats.calls.toLocaleString() + '+', icon: <PhoneInTalk /> },
                        { label: 'Happy Customers', value: stats.users.toLocaleString() + '+', icon: <Star /> },
                        { label: 'Qualification Accuracy', value: stats.accuracy + '%', icon: <CheckCircle /> }
                    ].map((stat, index) => (
                        <Grid item xs={12} md={4} key={index}>
                            <Card
                                className={`fade-in-up delay-${(index + 1) * 100}`}
                                sx={{
                                    bgcolor: '#ffffff',
                                    border: '1px solid rgba(0,0,0,0.08)',
                                    borderRadius: '16px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                                    transition: 'all 0.3s',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: '0 12px 40px rgba(99,102,241,0.15)',
                                        borderColor: 'rgba(99, 102, 241, 0.3)'
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

            {/* Lead Qualification Process */}
            <Container maxWidth="lg" sx={{ py: 12 }}>
                <Box sx={{ textAlign: 'center', mb: 8 }} className="fade-in-up">
                    <Chip
                        label="HOW IT QUALIFIES"
                        sx={{
                            bgcolor: '#ffffff',
                            color: '#6366f1',
                            mb: 2,
                            fontWeight: 600,
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.1)'
                        }}
                    />
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 800,
                            mb: 2,
                            color: '#111827',
                            fontSize: { xs: '2rem', md: '2.5rem' }
                        }}
                    >
                        Intelligent Lead Qualification Process
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#6b7280', maxWidth: 700, mx: 'auto' }}>
                        Our AI follows a proven 5-step process to qualify every lead and route them intelligently
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {qualificationProcess.map((item, index) => (
                        <Grid item xs={12} key={index}>
                            <Card
                                className={`fade-in-up delay-${(index + 1) * 100}`}
                                sx={{
                                    bgcolor: '#ffffff',
                                    border: '1px solid rgba(0,0,0,0.08)',
                                    borderRadius: '12px',
                                    transition: 'all 0.3s',
                                    '&:hover': {
                                        borderColor: '#6366f1',
                                        boxShadow: '0 8px 24px rgba(99,102,241,0.15)',
                                        transform: 'translateX(8px)'
                                    }
                                }}
                            >
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                                        <Chip
                                            label={index + 1}
                                            sx={{
                                                bgcolor: '#6366f1',
                                                color: '#ffffff',
                                                fontWeight: 700,
                                                fontSize: '1.2rem',
                                                width: 48,
                                                height: 48
                                            }}
                                        />
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#111827' }}>
                                                {item.step}
                                            </Typography>
                                            <Typography variant="body1" sx={{ color: '#6b7280', lineHeight: 1.7 }}>
                                                {item.description}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Features Section */}
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.5)', py: 12, backdropFilter: 'blur(10px)' }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 8 }} className="fade-in-up">
                        <Chip
                            label="FEATURES"
                            sx={{
                                bgcolor: '#ffffff',
                                color: '#22c55e',
                                mb: 2,
                                fontWeight: 600,
                                border: '1px solid rgba(34, 197, 94, 0.2)',
                                boxShadow: '0 2px 8px rgba(34, 197, 94, 0.1)'
                            }}
                        />
                        <Typography
                            variant="h2"
                            sx={{
                                fontWeight: 800,
                                mb: 2,
                                color: '#111827',
                                fontSize: { xs: '2rem', md: '2.5rem' }
                            }}
                        >
                            Everything You Need to Automate Sales
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#6b7280', maxWidth: 600, mx: 'auto' }}>
                            Comprehensive features designed to qualify leads, transfer calls, and schedule callbacks automatically
                        </Typography>
                    </Box>

                    <Grid container spacing={4}>
                        {features.map((feature, index) => (
                            <Grid item xs={12} md={6} lg={4} key={index}>
                                <Card
                                    className={`fade-in-up delay-${(index + 1) * 100}`}
                                    sx={{
                                        height: '100%',
                                        bgcolor: '#ffffff',
                                        border: '1px solid rgba(0,0,0,0.08)',
                                        borderRadius: '16px',
                                        transition: 'all 0.3s',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: `0 20px 60px ${feature.color}20`,
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

            {/* Use Cases Section */}
            <Container maxWidth="lg" sx={{ py: 12 }}>
                <Box sx={{ textAlign: 'center', mb: 8 }} className="fade-in-up">
                    <Chip
                        label="USE CASES"
                        sx={{
                            bgcolor: '#ffffff',
                            color: '#f59e0b',
                            mb: 2,
                            fontWeight: 600,
                            border: '1px solid rgba(245, 158, 11, 0.2)',
                            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.1)'
                        }}
                    />
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
                                    bgcolor: '#ffffff',
                                    border: '1px solid rgba(0,0,0,0.08)',
                                    borderRadius: '16px',
                                    transition: 'all 0.3s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 12px 40px rgba(0,0,0,0.1)'
                                    }
                                }}
                            >
                                <CardContent sx={{ p: 4 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Avatar sx={{ bgcolor: '#6366f1', mr: 2 }}>
                                            {useCase.icon}
                                        </Avatar>
                                        <Chip label={useCase.industry} sx={{ bgcolor: '#f3f4f6', fontWeight: 600 }} />
                                    </Box>
                                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                                        {useCase.title}
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: '#6b7280', lineHeight: 1.7, mb: 3 }}>
                                        {useCase.description}
                                    </Typography>
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

            {/* How It Works Section */}
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.5)', py: 12, backdropFilter: 'blur(10px)' }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 8 }} className="fade-in-up">
                        <Chip
                            label="SIMPLE SETUP"
                            sx={{
                                bgcolor: '#ffffff',
                                color: '#8b5cf6',
                                mb: 2,
                                fontWeight: 600,
                                border: '1px solid rgba(139, 92, 246, 0.2)',
                                boxShadow: '0 2px 8px rgba(139, 92, 246, 0.1)'
                            }}
                        />
                        <Typography
                            variant="h2"
                            sx={{
                                fontWeight: 800,
                                mb: 2,
                                color: '#111827',
                                fontSize: { xs: '2rem', md: '2.5rem' }
                            }}
                        >
                            Get Started in 4 Simple Steps
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#6b7280' }}>
                            From setup to your first qualified lead in under 10 minutes
                        </Typography>
                    </Box>

                    <Grid container spacing={6}>
                        {workflowSteps.map((step, index) => (
                            <Grid item xs={12} md={6} key={index}>
                                <Box
                                    className={`fade-in-up delay-${(index + 1) * 200}`}
                                >
                                    <Box sx={{ display: 'flex', gap: 3 }}>
                                        <Typography
                                            variant="h1"
                                            sx={{
                                                fontWeight: 900,
                                                fontSize: '4rem',
                                                background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                                                backgroundClip: 'text',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                opacity: 0.3,
                                                lineHeight: 1
                                            }}
                                        >
                                            {step.number}
                                        </Typography>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#111827' }}>
                                                {step.title}
                                            </Typography>
                                            <Typography variant="body1" sx={{ color: '#6b7280', mb: 2, lineHeight: 1.7 }}>
                                                {step.description}
                                            </Typography>
                                            <List dense>
                                                {step.details.map((detail, i) => (
                                                    <ListItem key={i} sx={{ px: 0, py: 0.5 }}>
                                                        <ListItemIcon sx={{ minWidth: 28 }}>
                                                            <CheckCircle sx={{ fontSize: 16, color: '#6366f1' }} />
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
                                        </Box>
                                    </Box>
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
                    py: 12,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `
                            radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)
                        `,
                        backgroundSize: '32px 32px'
                    }
                }}
            >
                <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
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
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                color: '#ffffff',
                                fontWeight: 700,
                                px: 6,
                                py: 2.5,
                                fontSize: '1.2rem',
                                borderRadius: '12px',
                                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
                                position: 'relative',
                                overflow: 'hidden',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: '-100%',
                                    width: '100%',
                                    height: '100%',
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                                    transition: 'left 0.6s'
                                },
                                '&:hover::before': {
                                    left: '100%'
                                },
                                '&:hover': {
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