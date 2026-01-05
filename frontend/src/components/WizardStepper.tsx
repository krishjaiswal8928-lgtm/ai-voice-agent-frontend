'use client';

import React from 'react';
import {
    Box,
    Typography,
    Stepper,
    Step,
    StepLabel,
    LinearProgress,
    useTheme
} from '@mui/material';
import { Check } from '@mui/icons-material';

interface WizardStepperProps {
    steps: string[];
    activeStep: number;
    stepIcons?: React.ReactNode[];
}

export function WizardStepper({ steps, activeStep, stepIcons }: WizardStepperProps) {
    const theme = useTheme();
    const progress = ((activeStep + 1) / steps.length) * 100;

    return (
        <Box sx={{ width: '100%' }}>
            {/* Progress Bar with Gradient */}
            <Box sx={{ mb: 4, position: 'relative' }}>
                <Box sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'rgba(99, 102, 241, 0.1)',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    <Box sx={{
                        height: '100%',
                        width: `${progress}%`,
                        background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)',
                        borderRadius: 4,
                        transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
                        position: 'relative',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                            animation: 'shimmer 2s infinite'
                        }
                    }} />
                </Box>
                <Typography
                    variant="caption"
                    sx={{
                        position: 'absolute',
                        right: 0,
                        top: -24,
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}
                >
                    {Math.round(progress)}% Complete
                </Typography>
            </Box>

            {/* Custom Stepper */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                {/* Connection Line */}
                <Box sx={{
                    position: 'absolute',
                    top: 24,
                    left: '5%',
                    right: '5%',
                    height: 2,
                    bgcolor: 'rgba(99, 102, 241, 0.1)',
                    zIndex: 0
                }}>
                    <Box sx={{
                        height: '100%',
                        width: `${(activeStep / (steps.length - 1)) * 100}%`,
                        background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)',
                        transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                    }} />
                </Box>

                {steps.map((label, index) => {
                    const isCompleted = index < activeStep;
                    const isActive = index === activeStep;
                    const isFuture = index > activeStep;

                    return (
                        <Box
                            key={label}
                            sx={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                position: 'relative',
                                zIndex: 1
                            }}
                        >
                            {/* Step Circle */}
                            <Box sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 1.5,
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                ...(isCompleted && {
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
                                    transform: 'scale(1)'
                                }),
                                ...(isActive && {
                                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.6)',
                                    transform: 'scale(1.1)',
                                    animation: 'pulse 2s infinite'
                                }),
                                ...(isFuture && {
                                    bgcolor: 'rgba(99, 102, 241, 0.1)',
                                    border: '2px solid rgba(99, 102, 241, 0.2)'
                                })
                            }}>
                                {isCompleted ? (
                                    <Check sx={{ color: '#ffffff', fontSize: 24 }} />
                                ) : (
                                    <Typography sx={{
                                        fontWeight: 700,
                                        fontSize: '1.1rem',
                                        color: isActive ? '#ffffff' : 'rgba(99, 102, 241, 0.4)'
                                    }}>
                                        {index + 1}
                                    </Typography>
                                )}
                            </Box>

                            {/* Step Label */}
                            <Typography
                                variant="caption"
                                sx={{
                                    fontWeight: isActive ? 700 : 500,
                                    textAlign: 'center',
                                    color: isActive ? theme.palette.text.primary : theme.palette.text.secondary,
                                    transition: 'all 0.3s ease',
                                    maxWidth: 120,
                                    ...(isActive && {
                                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text'
                                    })
                                }}
                            >
                                {label}
                            </Typography>
                        </Box>
                    );
                })}
            </Box>

            {/* Keyframe animations */}
            <style jsx global>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 4px 20px rgba(99, 102, 241, 0.6);
          }
          50% {
            box-shadow: 0 4px 30px rgba(99, 102, 241, 0.8);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
        </Box>
    );
}
