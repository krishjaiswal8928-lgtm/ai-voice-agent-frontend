'use client';

import React from 'react';
import { Box, Typography, Grid, useTheme, useMediaQuery, Stack } from '@mui/material';
import { keyframes } from '@emotion/react';

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(100, 100, 255, 0.4); }
  70% { box-shadow: 0 0 0 20px rgba(100, 100, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(100, 100, 255, 0); }
`;

const wave = keyframes`
  0% { transform: translateX(0) translateZ(0) scaleY(1); }
  50% { transform: translateX(-25%) translateZ(0) scaleY(0.55); }
  100% { transform: translateX(-50%) translateZ(0) scaleY(1); }
`;

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <Grid container sx={{ minHeight: '100vh', overflow: 'hidden' }}>
            {/* Left Side - Clean Form */}
            <Grid
                item
                xs={12}
                md={5}
                lg={4}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    position: 'relative',
                    bgcolor: '#ffffff',
                    zIndex: 2,
                }}
            >
                <Box
                    sx={{
                        width: '100%',
                        maxWidth: '480px',
                        mx: 'auto',
                        p: { xs: 4, md: 6 },
                    }}
                >
                    {/* Logo / Brand Name Small */}
                    <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                            sx={{
                                width: 32,
                                height: 32,
                                borderRadius: 1,
                                background: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold'
                            }}
                        >
                            S
                        </Box>
                        <Typography variant="h6" fontWeight="bold" color="text.primary">
                            SpeakSynth
                        </Typography>
                    </Box>

                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h4" fontWeight="800" sx={{ mb: 1, color: '#1a1a1a', letterSpacing: '-0.5px' }}>
                            {title}
                        </Typography>
                        {subtitle && (
                            <Typography variant="body1" color="text.secondary">
                                {subtitle}
                            </Typography>
                        )}
                    </Box>

                    {children}
                </Box>
            </Grid>

            {/* Right Side - Creative Visuals */}
            {!isMobile && (
                <Grid
                    item
                    md={7}
                    lg={8}
                    sx={{
                        position: 'relative',
                        background: 'radial-gradient(ellipse at bottom right, #1a237e 0%, #000000 100%)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        p: 8,
                        color: 'white',
                    }}
                >
                    {/* Abstract Animated Background Elements */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '150%',
                            height: '150%',
                            opacity: 0.4,
                            background: `
                radial-gradient(circle at 50% 50%, rgba(76, 29, 149, 0.4) 0%, transparent 50%),
                radial-gradient(circle at 10% 80%, rgba(59, 130, 246, 0.4) 0%, transparent 40%)
              `,
                            filter: 'blur(60px)',
                            pointerEvents: 'none',
                        }}
                    />

                    {/* Animated "Sound Waves" */}
                    <Box sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '300px',
                        opacity: 0.2,
                        overflow: 'hidden'
                    }}>
                        {[1, 2, 3].map((i) => (
                            <Box
                                key={i}
                                sx={{
                                    position: 'absolute',
                                    bottom: -50,
                                    left: 0,
                                    width: '200%',
                                    height: '100%',
                                    backgroundRepeat: 'repeat-x',
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 198.5'%3E%3Cpath fill='%23FFFFFF' d='M800,53.1c-137.5,0-137.5-35.4-275-35.4c-137.5,0-137.5,35.4-275,35.4C112.5,53.1,112.5,17.7,0,17.7v180.8h800V53.1z' opacity='0.3'/%3E%3C/svg%3E")`,
                                    backgroundSize: '50% 100%',
                                    animation: `${wave} ${15 + i * 5}s linear infinite`,
                                    transform: `translateZ(0) opacity(${0.3 + i * 0.1})`,
                                }}
                            />
                        ))}
                    </Box>

                    {/* Top Right Decoration */}
                    <Box sx={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Box sx={{
                            padding: '8px 16px',
                            bgcolor: 'rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '50px',
                            border: '1px solid rgba(255,255,255,0.2)',
                            animation: `${float} 6s ease-in-out infinite`
                        }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: 1 }}>
                                AI-POWERED VOICE AGENTS
                            </Typography>
                        </Box>
                    </Box>

                    {/* Center Content - The "Wow" Factor */}
                    <Stack spacing={4} sx={{ position: 'relative', zIndex: 2, maxWidth: '600px' }}>
                        <Box>
                            <Typography
                                variant="h1"
                                sx={{
                                    fontSize: { md: '3.5rem', lg: '4.5rem' },
                                    fontWeight: 800,
                                    lineHeight: 1.1,
                                    mb: 3,
                                    background: 'linear-gradient(135deg, #FFFFFF 0%, #94A3B8 100%)',
                                    backgroundClip: 'text',
                                    textFillColor: 'transparent',
                                }}
                            >
                                Orchestrate Your <br />
                                <span style={{ color: '#60A5FA', textFillColor: '#60A5FA' }}>Digital Voice.</span>
                            </Typography>
                            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 400, maxWidth: '480px', lineHeight: 1.6 }}>
                                Deploy intelligent voice agents in minutes. Scale your conversations with human-like interactions and seamless integration.
                            </Typography>
                        </Box>

                        {/* Simulated Live Activity / Social Proof */}
                        <Stack direction="row" spacing={3} alignItems="center">
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="h4" fontWeight="bold">98%</Typography>
                                <Typography variant="caption" sx={{ opacity: 0.6 }}>Satisfaction Rate</Typography>
                            </Box>
                            <Box sx={{ width: '1px', height: '40px', bgcolor: 'rgba(255,255,255,0.2)' }} />
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="h4" fontWeight="bold">24/7</Typography>
                                <Typography variant="caption" sx={{ opacity: 0.6 }}>Availability</Typography>
                            </Box>
                            <Box sx={{ width: '1px', height: '40px', bgcolor: 'rgba(255,255,255,0.2)' }} />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    bgcolor: '#4ade80',
                                    animation: `${pulse} 2s infinite`
                                }} />
                                <Typography variant="body2" fontWeight="600">System Operational</Typography>
                            </Box>
                        </Stack>
                    </Stack>
                </Grid>
            )}
        </Grid>
    );
}
