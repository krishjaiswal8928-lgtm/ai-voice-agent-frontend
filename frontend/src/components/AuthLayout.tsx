'use client';

import React from 'react';
import { Box, Container, Paper, Typography, useTheme, useMediaQuery } from '@mui/material';
import { keyframes } from '@emotion/react';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box
            sx={{
                minHeight: '100vh',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                // Modern Aurora Gradient Background
                background: `
          radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), 
          radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), 
          radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%)
        `,
                backgroundColor: '#1a1a1a', // Fallback/Base color
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0) 100%)',
                    pointerEvents: 'none',
                }
            }}
        >
            {/* Decorative Orbs */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '10%',
                    left: '10%',
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FF6B6B 0%, #556270 100%)',
                    filter: 'blur(80px)',
                    opacity: 0.2,
                    animation: `${float} 8s ease-in-out infinite`,
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: '10%',
                    right: '10%',
                    width: '250px',
                    height: '250px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4ECDC4 0%, #556270 100%)',
                    filter: 'blur(80px)',
                    opacity: 0.2,
                    animation: `${float} 10s ease-in-out infinite reverse`,
                }}
            />

            <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1, p: 2 }}>
                <Paper
                    elevation={24}
                    sx={{
                        p: { xs: 3, sm: 4 },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        background: 'rgba(255, 255, 255, 0.95)', // Highly opaque white for readability
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                        animation: `${fadeIn} 0.8s ease-out`,
                    }}
                >
                    <Box sx={{ mb: 3, textAlign: 'center' }}>
                        {/* Logo placeholder or Icon could go here */}
                        <Typography
                            component="h1"
                            variant="h4"
                            sx={{
                                fontWeight: 800,
                                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                backgroundClip: 'text',
                                textFillColor: 'transparent',
                                mb: 1,
                                letterSpacing: '-0.5px'
                            }}
                        >
                            {title}
                        </Typography>
                        {subtitle && (
                            <Typography variant="body2" color="text.secondary">
                                {subtitle}
                            </Typography>
                        )}
                    </Box>

                    <Box sx={{ width: '100%' }}>
                        {children}
                    </Box>
                </Paper>

                <Box sx={{ mt: 4, textAlign: 'center', opacity: 0.7 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        © {new Date().getFullYear()} SpeakSynth.ai. All rights reserved.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}
