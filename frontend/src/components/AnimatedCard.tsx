'use client';

import React from 'react';
import { Box, Card, CardProps } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

interface AnimatedCardProps extends CardProps {
    gradient?: string;
    glassEffect?: boolean;
    hoverScale?: boolean;
    selected?: boolean;
    children: React.ReactNode;
}

export function AnimatedCard({
    gradient,
    glassEffect = false,
    hoverScale = true,
    selected = false,
    children,
    sx,
    ...props
}: AnimatedCardProps) {
    return (
        <Card
            {...props}
            sx={{
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: props.onClick ? 'pointer' : 'default',
                ...(glassEffect && {
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }),
                ...(!glassEffect && {
                    bgcolor: '#ffffff',
                    border: selected ? '2px solid #6366f1' : '1px solid #e0e0e0',
                    boxShadow: selected
                        ? '0 8px 24px rgba(99, 102, 241, 0.2)'
                        : '0 4px 12px rgba(0, 0, 0, 0.05)'
                }),
                '&:hover': {
                    ...(hoverScale && {
                        transform: 'translateY(-4px)',
                        boxShadow: selected
                            ? '0 12px 32px rgba(99, 102, 241, 0.3)'
                            : '0 12px 32px rgba(0, 0, 0, 0.15)'
                    }),
                    ...(!hoverScale && {
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
                    }),
                    ...(props.onClick && !selected && {
                        borderColor: '#6366f1'
                    })
                },
                '& > *': {
                    position: 'relative',
                    zIndex: 1
                },
                ...sx
            }}
        >
            {children}

            {/* Selection checkmark indicator */}
            {selected && (
                <Box sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    zIndex: 10
                }}>
                    <CheckCircle sx={{
                        fontSize: 28,
                        color: '#6366f1',
                        filter: 'drop-shadow(0 2px 8px rgba(99, 102, 241, 0.3))'
                    }} />
                </Box>
            )}
        </Card>
    );
}
