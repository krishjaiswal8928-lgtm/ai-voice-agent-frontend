'use client';

import React from 'react';
import { Box, Container, Grid, Typography, Button, Divider, IconButton } from '@mui/material';
import { Twitter, LinkedIn, GitHub, Email } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export function Footer() {
    const router = useRouter();

    return (
        <Box sx={{ bgcolor: '#111827', color: '#ffffff', pt: 8, pb: 4 }}>
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    {/* Company Info */}
                    <Grid item xs={12} md={4}>
                        <Box sx={{ fontWeight: 700, fontSize: '1.5rem', mb: 2, display: 'flex', alignItems: 'center' }}>
                            <span style={{ color: '#6366f1' }}>Spe</span>
                            <span style={{ color: '#22d3ee' }}>a</span>
                            <span style={{ color: '#a855f7' }}>k</span>
                            <span style={{ color: '#ec4899' }}>Synt</span>
                            <span style={{ color: '#f59e0b' }}>h</span>
                            <span style={{ color: '#ffffff' }}> AI</span>
                        </Box>
                        <Typography variant="body2" sx={{ color: '#9ca3af', mb: 3, lineHeight: 1.7 }}>
                            The most advanced AI-powered voice agent platform for automating lead qualification, call transfers, and intelligent scheduling.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton sx={{ color: '#9ca3af', '&:hover': { color: '#6366f1', bgcolor: 'rgba(99, 102, 241, 0.1)' } }}>
                                <Twitter />
                            </IconButton>
                            <IconButton sx={{ color: '#9ca3af', '&:hover': { color: '#6366f1', bgcolor: 'rgba(99, 102, 241, 0.1)' } }}>
                                <LinkedIn />
                            </IconButton>
                            <IconButton sx={{ color: '#9ca3af', '&:hover': { color: '#6366f1', bgcolor: 'rgba(99, 102, 241, 0.1)' } }}>
                                <GitHub />
                            </IconButton>
                            <IconButton sx={{ color: '#9ca3af', '&:hover': { color: '#6366f1', bgcolor: 'rgba(99, 102, 241, 0.1)' } }}>
                                <Email />
                            </IconButton>
                        </Box>
                    </Grid>

                    {/* Quick Links */}
                    <Grid item xs={12} sm={6} md={2}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontSize: '1rem' }}>
                            Product
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Button
                                onClick={() => router.push('/')}
                                sx={{ justifyContent: 'flex-start', color: '#9ca3af', textTransform: 'none', '&:hover': { color: '#ffffff', bgcolor: 'transparent' } }}
                            >
                                Home
                            </Button>
                            <Button
                                onClick={() => router.push('/pricing')}
                                sx={{ justifyContent: 'flex-start', color: '#9ca3af', textTransform: 'none', '&:hover': { color: '#ffffff', bgcolor: 'transparent' } }}
                            >
                                Pricing
                            </Button>
                            <Button
                                onClick={() => router.push('/dashboard')}
                                sx={{ justifyContent: 'flex-start', color: '#9ca3af', textTransform: 'none', '&:hover': { color: '#ffffff', bgcolor: 'transparent' } }}
                            >
                                Dashboard
                            </Button>
                        </Box>
                    </Grid>

                    {/* Company */}
                    <Grid item xs={12} sm={6} md={2}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontSize: '1rem' }}>
                            Company
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Button
                                onClick={() => router.push('/about')}
                                sx={{ justifyContent: 'flex-start', color: '#9ca3af', textTransform: 'none', '&:hover': { color: '#ffffff', bgcolor: 'transparent' } }}
                            >
                                About Us
                            </Button>
                            <Button
                                onClick={() => router.push('/contact')}
                                sx={{ justifyContent: 'flex-start', color: '#9ca3af', textTransform: 'none', '&:hover': { color: '#ffffff', bgcolor: 'transparent' } }}
                            >
                                Contact
                            </Button>
                        </Box>
                    </Grid>

                    {/* Legal */}
                    <Grid item xs={12} sm={6} md={2}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontSize: '1rem' }}>
                            Legal
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Button
                                onClick={() => router.push('/privacy')}
                                sx={{ justifyContent: 'flex-start', color: '#9ca3af', textTransform: 'none', '&:hover': { color: '#ffffff', bgcolor: 'transparent' } }}
                            >
                                Privacy Policy
                            </Button>
                            <Button
                                onClick={() => router.push('/terms')}
                                sx={{ justifyContent: 'flex-start', color: '#9ca3af', textTransform: 'none', '&:hover': { color: '#ffffff', bgcolor: 'transparent' } }}
                            >
                                Terms of Service
                            </Button>
                        </Box>
                    </Grid>

                    {/* Resources */}
                    <Grid item xs={12} sm={6} md={2}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontSize: '1rem' }}>
                            Resources
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Button
                                sx={{ justifyContent: 'flex-start', color: '#9ca3af', textTransform: 'none', '&:hover': { color: '#ffffff', bgcolor: 'transparent' } }}
                            >
                                Documentation
                            </Button>
                            <Button
                                sx={{ justifyContent: 'flex-start', color: '#9ca3af', textTransform: 'none', '&:hover': { color: '#ffffff', bgcolor: 'transparent' } }}
                            >
                                API Reference
                            </Button>
                            <Button
                                sx={{ justifyContent: 'flex-start', color: '#9ca3af', textTransform: 'none', '&:hover': { color: '#ffffff', bgcolor: 'transparent' } }}
                            >
                                Support
                            </Button>
                        </Box>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 4, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                        © {new Date().getFullYear()} SpeakSynth AI. All rights reserved.
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                        Made with ❤️ for better conversations
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}
