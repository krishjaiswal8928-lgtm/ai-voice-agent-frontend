'use client';

import React from 'react';
import { Box, Typography, Grid, useTheme, useMediaQuery, Stack } from '@mui/material';
import { keyframes } from '@emotion/react';

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.1); }
  70% { box-shadow: 0 0 0 10px rgba(0, 0, 0, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); }
`;

const wave = keyframes`
  0% { transform: translateX(0) translateZ(0) scaleY(1); }
  50% { transform: translateX(-25%) translateZ(0) scaleY(0.8); }
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
                    borderRight: '1px solid #f0f0f0' // Subtle separation
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
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                            }}
                        >
                            S
                        </Box>
                        <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ letterSpacing: '-0.5px' }}>
                            SpeakSynth
                        </Typography>
                    </Box>

                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h4" fontWeight="800" sx={{ mb: 1, color: '#111827', letterSpacing: '-1px' }}>
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

            {/* Right Side - Light Theme Creative Visuals */}
            {!isMobile && (
                <Grid
                    item
                    md={7}
                    lg={8}
                    sx={{
                        position: 'relative',
                        bgcolor: '#f9fafb', // Very Light Gray
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        p: 8,
                        color: '#111827', // Dark Text
                        // Dotted Background Pattern
                        backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                    }}
                >
                    {/* Soft Gradient Overlay for depth */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '120%',
                            height: '120%',
                            background: `
                radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.05) 0%, transparent 40%),
                radial-gradient(circle at 90% 80%, rgba(236, 72, 153, 0.05) 0%, transparent 40%)
              `,
                            filter: 'blur(80px)',
                            pointerEvents: 'none',
                            zIndex: 0
                        }}
                    />

                    {/* Animated "Sound Waves" - Darker version for light bg */}
                    <Box sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '250px',
                        opacity: 0.1, // Subtle
                        overflow: 'hidden',
                        zIndex: 0
                    }}>
                        {[1, 2, 3].map((i) => (
                            <Box
                                key={i}
                                sx={{
                                    position: 'absolute',
                                    bottom: -40,
                                    left: 0,
                                    width: '200%',
                                    height: '100%',
                                    backgroundRepeat: 'repeat-x',
                                    // Black wave for contrast
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 198.5'%3E%3Cpath fill='%23000000' d='M800,53.1c-137.5,0-137.5-35.4-275-35.4c-137.5,0-137.5,35.4-275,35.4C112.5,53.1,112.5,17.7,0,17.7v180.8h800V53.1z' opacity='0.3'/%3E%3C/svg%3E")`,
                                    backgroundSize: '50% 100%',
                                    animation: `${wave} ${20 + i * 5}s linear infinite`,
                                    transform: `translateZ(0) opacity(${0.5 + i * 0.1})`,
                                }}
                            />
                        ))}
                    </Box>

                    {/* Top Right Decoration - Glass Pill */}
                    <Box sx={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Box sx={{
                            padding: '8px 20px',
                            bgcolor: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(12px)',
                            borderRadius: '50px',
                            border: '1px solid rgba(0,0,0,0.05)',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                            animation: `${float} 6s ease-in-out infinite`
                        }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#4f46e5', letterSpacing: 1 }}>
                                AI-POWERED VOICE
                            </Typography>
                        </Box>
                    </Box>

                    {/* Center Content */}
                    <Stack spacing={5} sx={{ position: 'relative', zIndex: 2, maxWidth: '650px' }}>
                        <Box>
                            <Typography
                                variant="h1"
                                sx={{
                                    fontSize: { md: '3.5rem', lg: '4.5rem' },
                                    fontWeight: 900,
                                    lineHeight: 1.05,
                                    mb: 3,
                                    color: '#111827',
                                    letterSpacing: '-2px'
                                }}
                            >
                                Orchestrate Your <br />
                                <span style={{
                                    background: 'linear-gradient(135deg, #4f46e5 0%, #ec4899 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}>
                                    Digital Voice.
                                </span>
                            </Typography>
                            <Typography variant="h6" sx={{ color: '#4b5563', fontWeight: 500, maxWidth: '480px', lineHeight: 1.6 }}>
                                Deploy intelligent voice agents in minutes. Scale interactions with human-like precision.
                            </Typography>
                        </Box>

                        {/* Social Proof - Clean Cards */}
                        <Stack direction="row" spacing={4} alignItems="center">
                            <Box>
                                <Typography variant="h3" fontWeight="800" sx={{ color: '#111827' }}>98%</Typography>
                                <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500 }}>Satisfaction Rate</Typography>
                            </Box>
                            <Box sx={{ width: '1px', height: '50px', bgcolor: '#e5e7eb' }} />
                            <Box>
                                <Typography variant="h3" fontWeight="800" sx={{ color: '#111827' }}>24/7</Typography>
                                <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500 }}>Availability</Typography>
                            </Box>

                            <Box sx={{
                                flexGrow: 1,
                                display: 'flex',
                                justifyContent: 'flex-end',
                                alignItems: 'center'
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    padding: '10px 20px',
                                    bgcolor: '#ffffff',
                                    borderRadius: '50px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                                }}>
                                    <Box sx={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        bgcolor: '#10b981',
                                        animation: `${pulse} 2s infinite`
                                    }} />
                                    <Typography variant="body2" fontWeight="700" color="text.primary">System Operational</Typography>
                                </Box>
                            </Box>
                        </Stack>
                    </Stack>
                </Grid>
            )}
        </Grid>
    );
}
