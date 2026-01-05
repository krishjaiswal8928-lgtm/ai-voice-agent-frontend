'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid, Button,
    Chip,
    Alert
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Extension as ExtensionIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { NavigationLayout } from '@/components/NavigationLayout';
import { integrationAPI } from '@/lib/api';

interface Integration {
    id: string;
    provider: string;
    status: string;
    connected_at: string;
    metadata: any;
}

export default function IntegrationsPage() {
    const router = useRouter();
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchIntegrations();
    }, []);

    const fetchIntegrations = async () => {
        try {
            setLoading(false);
            const response = await integrationAPI.getAll();
            setIntegrations(response.data);
            setError('');
        } catch (err) {
            console.error('Error fetching integrations:', err);
            setError('Failed to load integrations');
            setLoading(false);
        }
    };

    const providers = [
        {
            id: 'twilio',
            name: 'Twilio',
            description: 'Connect your Twilio account to import and manage phone numbers',
            icon: '📞',
            color: '#F22F46'
        },
        {
            id: 'exotel',
            name: 'Exotel',
            description: 'Connect your Exotel account (Coming Soon)',
            icon: '📱',
            color: '#4CAF50',
            comingSoon: true
        },
        {
            id: 'plivo',
            name: 'Plivo',
            description: 'Connect your Plivo account (Coming Soon)',
            icon: '☎️',
            color: '#2196F3',
            comingSoon: true
        }
    ];

    const getTwilioIntegration = () => {
        return integrations.find(int => int.provider === 'twilio');
    };

    return (
        <NavigationLayout>
            <Box sx={{
                p: 3,
                background: '#f5f5f5',
                minHeight: '100vh',
                color: '#000000',
                width: '100%',
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    opacity: 0.3,
                    pointerEvents: 'none',
                    zIndex: 0
                }
            }}>
                <Box sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: '#111827' }}>
                        Integrations
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <Grid container spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
                    {providers.map((provider) => {
                        const integration = integrations.find(int => int.provider === provider.id);
                        const isConnected = integration?.status === 'connected';

                        return (
                            <Grid item xs={12} md={6} lg={4} key={provider.id}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        position: 'relative',
                                        border: isConnected ? `2px solid ${provider.color}` : '1px solid #e0e0e0',
                                        '&:hover': {
                                            boxShadow: isConnected ? 6 : 3,
                                            transform: 'translateY(-2px)',
                                            transition: 'all 0.3s'
                                        }
                                    }}
                                >
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Box
                                                    sx={{
                                                        fontSize: 40,
                                                        mr: 2,
                                                        bgcolor: `${provider.color}15`,
                                                        width: 60,
                                                        height: 60,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        borderRadius: 2
                                                    }}
                                                >
                                                    {provider.icon}
                                                </Box>
                                                <Box>
                                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                        {provider.name}
                                                    </Typography>
                                                    {isConnected && (
                                                        <Chip
                                                            icon={<CheckCircleIcon />}
                                                            label="Connected"
                                                            color="success"
                                                            size="small"
                                                            sx={{ mt: 0.5 }}
                                                        />
                                                    )}
                                                    {provider.comingSoon && (
                                                        <Chip
                                                            label="Coming Soon"
                                                            size="small"
                                                            sx={{ mt: 0.5, bgcolor: '#f5f5f5' }}
                                                        />
                                                    )}
                                                </Box>
                                            </Box>
                                        </Box>

                                        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                                            {provider.description}
                                        </Typography>

                                        {isConnected && integration && (
                                            <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                                <Typography variant="caption" color="textSecondary">
                                                    Connected since
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {new Date(integration.connected_at).toLocaleDateString()}
                                                </Typography>
                                                {integration.metadata?.phone_numbers_count !== undefined && (
                                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                                        {integration.metadata.phone_numbers_count} phone number(s)
                                                    </Typography>
                                                )}
                                            </Box>
                                        )}

                                        <Box sx={{ mt: 'auto' }}>
                                            {provider.comingSoon ? (
                                                <Button
                                                    fullWidth
                                                    variant="outlined"
                                                    disabled
                                                >
                                                    Coming Soon
                                                </Button>
                                            ) : isConnected ? (
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    sx={{
                                                        bgcolor: provider.color,
                                                        '&:hover': { bgcolor: provider.color, opacity: 0.9 }
                                                    }}
                                                    onClick={() => router.push(`/integrations/${provider.id}`)}
                                                >
                                                    Manage
                                                </Button>
                                            ) : (
                                                <Button
                                                    fullWidth
                                                    variant="outlined"
                                                    onClick={() => router.push(`/integrations/${provider.id}/connect`)}
                                                    sx={{
                                                        borderColor: provider.color,
                                                        color: provider.color,
                                                        '&:hover': {
                                                            borderColor: provider.color,
                                                            bgcolor: `${provider.color}10`
                                                        }
                                                    }}
                                                >
                                                    Connect {provider.name}
                                                </Button>
                                            )}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            </Box>
        </NavigationLayout>
    );
}
