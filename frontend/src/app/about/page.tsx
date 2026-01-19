'use client';

import React from 'react';
import { Box, Typography, Container, Grid, Card, CardContent, Avatar } from '@mui/material';
import { Business, Speed, Security, Support } from '@mui/icons-material';
import { LandingNav } from '@/components/LandingNav';
import { Footer } from '@/components/Footer';
import '../styles/animations.css';

export default function AboutPage() {
    return (
        <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
            <LandingNav />
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                    <Typography variant="h2" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                        About Us
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#6b7280', maxWidth: 800, mx: 'auto' }}>
                        We're building the future of AI-powered sales automation
                    </Typography>
                </Box>

                <Card sx={{ mb: 6, border: '1px solid #e5e7eb' }}>
                    <CardContent sx={{ p: 6 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#111827' }}>
                            Our Mission
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280', fontSize: '1.1rem', lineHeight: 1.8 }}>
                            At AI Voice Agent, we're on a mission to revolutionize how businesses qualify leads and manage their sales pipeline.
                            Our AI-powered platform combines cutting-edge natural language processing with intelligent call routing to help
                            sales teams focus on what they do best: closing deals.
                        </Typography>
                    </CardContent>
                </Card>

                <Grid container spacing={4} sx={{ mb: 8 }}>
                    <Grid item xs={12} md={3}>
                        <Card sx={{ textAlign: 'center', height: '100%', border: '1px solid #e5e7eb' }}>
                            <CardContent>
                                <Business sx={{ fontSize: 60, color: '#6366f1', mb: 2 }} />
                                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#111827' }}>
                                    500+
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                    Companies Trust Us
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card sx={{ textAlign: 'center', height: '100%', border: '1px solid #e5e7eb' }}>
                            <CardContent>
                                <Speed sx={{ fontSize: 60, color: '#22c55e', mb: 2 }} />
                                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#111827' }}>
                                    1M+
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                    Calls Processed
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card sx={{ textAlign: 'center', height: '100%', border: '1px solid #e5e7eb' }}>
                            <CardContent>
                                <Security sx={{ fontSize: 60, color: '#f59e0b', mb: 2 }} />
                                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#111827' }}>
                                    99.9%
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                    Uptime SLA
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card sx={{ textAlign: 'center', height: '100%', border: '1px solid #e5e7eb' }}>
                            <CardContent>
                                <Support sx={{ fontSize: 60, color: '#8b5cf6', mb: 2 }} />
                                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#111827' }}>
                                    24/7
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                    Support Available
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, textAlign: 'center', color: '#111827' }}>
                    Our Values
                </Typography>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', border: '1px solid #e5e7eb' }}>
                            <CardContent>
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                                    Innovation
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#6b7280' }}>
                                    We continuously push the boundaries of what's possible with AI and voice technology
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', border: '1px solid #e5e7eb' }}>
                            <CardContent>
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                                    Customer Success
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#6b7280' }}>
                                    Your success is our success. We're committed to helping you achieve your sales goals
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', border: '1px solid #e5e7eb' }}>
                            <CardContent>
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                                    Transparency
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#6b7280' }}>
                                    We believe in clear pricing, honest communication, and building trust with our customers
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>

            <Footer />
        </Box>
    );
}
