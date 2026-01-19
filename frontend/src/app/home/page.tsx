'use client';

import React from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent, Chip } from '@mui/material';
import { Phone, AutoAwesome, TrendingUp, Speed, Security, Support } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { LandingNav } from '@/components/LandingNav';
import { Footer } from '@/components/Footer';
import '../styles/animations.css';

export default function HomePage() {
    const router = useRouter();

    return (
        <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
            <LandingNav />
            {/* Hero Section */}
            <Box sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: '#ffffff',
                py: 12,
                position: 'relative',
                overflow: 'hidden'
            }}>
                <Container maxWidth="lg">
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Chip label="AI-Powered" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#ffffff', mb: 2 }} />
                            <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
                                AI Lead Qualifier & Call Scheduler
                            </Typography>
                            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                                Automate lead qualification, transfer hot leads to your sales team, and schedule callbacks intelligently
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={() => router.push('/auth/signup')}
                                    sx={{
                                        bgcolor: '#ffffff',
                                        color: '#6366f1',
                                        fontWeight: 700,
                                        px: 4,
                                        py: 1.5,
                                        '&:hover': { bgcolor: '#f5f5f5' }
                                    }}
                                >
                                    Get Started Free
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    onClick={() => router.push('/pricing')}
                                    sx={{
                                        borderColor: '#ffffff',
                                        color: '#ffffff',
                                        fontWeight: 700,
                                        px: 4,
                                        py: 1.5,
                                        '&:hover': { borderColor: '#f5f5f5', bgcolor: 'rgba(255,255,255,0.1)' }
                                    }}
                                >
                                    View Pricing
                                </Button>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Phone sx={{ fontSize: 200, opacity: 0.2 }} />
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Features Section */}
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Typography variant="h3" sx={{ fontWeight: 700, textAlign: 'center', mb: 6, color: '#111827' }}>
                    Powerful Features
                </Typography>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', border: '1px solid #e5e7eb' }}>
                            <CardContent>
                                <AutoAwesome sx={{ fontSize: 48, color: '#6366f1', mb: 2 }} />
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                                    AI Lead Qualification
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#6b7280' }}>
                                    Automatically qualify leads using BANT criteria, detect buying signals, and score leads 1-10 in real-time
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', border: '1px solid #e5e7eb' }}>
                            <CardContent>
                                <TrendingUp sx={{ fontSize: 48, color: '#22c55e', mb: 2 }} />
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                                    Smart Call Transfers
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#6b7280' }}>
                                    Transfer qualified leads to human agents instantly with warm or cold transfers and automatic agent selection
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', border: '1px solid #e5e7eb' }}>
                            <CardContent>
                                <Speed sx={{ fontSize: 48, color: '#f59e0b', mb: 2 }} />
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                                    Intelligent Callbacks
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#6b7280' }}>
                                    Schedule callbacks with lead context, talking points, and auto-assignment to available agents
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', border: '1px solid #e5e7eb' }}>
                            <CardContent>
                                <Security sx={{ fontSize: 48, color: '#8b5cf6', mb: 2 }} />
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                                    Comprehensive Analytics
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#6b7280' }}>
                                    Track qualification rates, transfer success, callback completion, and agent performance in real-time
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', border: '1px solid #e5e7eb' }}>
                            <CardContent>
                                <Phone sx={{ fontSize: 48, color: '#ef4444', mb: 2 }} />
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                                    Multi-Provider Support
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#6b7280' }}>
                                    Works with Twilio and SIP trunking providers (3CX, FreePBX, Ziwo) for maximum flexibility
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', border: '1px solid #e5e7eb' }}>
                            <CardContent>
                                <Support sx={{ fontSize: 48, color: '#6366f1', mb: 2 }} />
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                                    24/7 Support
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#6b7280' }}>
                                    Get help whenever you need it with our dedicated support team and comprehensive documentation
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>

            {/* CTA Section */}
            <Box sx={{ bgcolor: '#111827', color: '#ffffff', py: 8 }}>
                <Container maxWidth="md" sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
                        Ready to Transform Your Sales Process?
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 4, opacity: 0.8 }}>
                        Start qualifying leads and closing deals faster with AI
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => router.push('/auth/signup')}
                        sx={{
                            bgcolor: '#6366f1',
                            color: '#ffffff',
                            fontWeight: 700,
                            px: 6,
                            py: 2,
                            '&:hover': { bgcolor: '#4f46e5' }
                        }}
                    >
                        Start Free Trial
                    </Button>
                </Container>
            </Box>

            {/* Footer */}
            <Box sx={{ bgcolor: '#f5f5f5', py: 4, borderTop: '1px solid #e5e7eb' }}>
                <Container maxWidth="lg">
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={4}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                                AI Voice Agent
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                The most advanced AI-powered lead qualification and call scheduling platform
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                                Quick Links
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Button onClick={() => router.push('/pricing')} sx={{ justifyContent: 'flex-start', color: '#6b7280' }}>
                                    Pricing
                                </Button>
                                <Button onClick={() => router.push('/about')} sx={{ justifyContent: 'flex-start', color: '#6b7280' }}>
                                    About Us
                                </Button>
                                <Button onClick={() => router.push('/contact')} sx={{ justifyContent: 'flex-start', color: '#6b7280' }}>
                                    Contact
                                </Button>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                                Legal
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Button onClick={() => router.push('/privacy')} sx={{ justifyContent: 'flex-start', color: '#6b7280' }}>
                                    Privacy Policy
                                </Button>
                                <Button onClick={() => router.push('/terms')} sx={{ justifyContent: 'flex-start', color: '#6b7280' }}>
                                    Terms of Service
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                    <Typography variant="body2" sx={{ textAlign: 'center', mt: 4, color: '#6b7280' }}>
                        © 2026 AI Voice Agent. All rights reserved.
                    </Typography>
                </Container>
            </Box>

            <Footer />
        </Box>
    );
}
