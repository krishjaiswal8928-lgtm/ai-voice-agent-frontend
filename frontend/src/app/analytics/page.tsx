'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    TrendingUp,
    Phone,
    CheckCircle,
    Schedule,
} from '@mui/icons-material';
import { api } from '@/lib/api';

interface DashboardMetrics {
    total_campaigns: number;
    total_leads: number;
    total_qualified_leads: number;
    total_transfers: number;
    total_callbacks: number;
    overall_qualification_rate: number;
    overall_transfer_rate: number;
}

export default function AnalyticsPage() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/api/analytics/summary');
            setMetrics(response.data);
        } catch (err: any) {
            console.error('Failed to fetch analytics:', err);
            setError(err.response?.data?.detail || 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!metrics) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="info">No analytics data available</Alert>
            </Container>
        );
    }

    const statCards = [
        {
            title: 'Total Campaigns',
            value: metrics.total_campaigns,
            icon: <TrendingUp sx={{ fontSize: 40, color: '#1976d2' }} />,
            color: '#e3f2fd',
        },
        {
            title: 'Total Leads',
            value: metrics.total_leads,
            icon: <Phone sx={{ fontSize: 40, color: '#2e7d32' }} />,
            color: '#e8f5e9',
        },
        {
            title: 'Qualified Leads',
            value: metrics.total_qualified_leads,
            icon: <CheckCircle sx={{ fontSize: 40, color: '#ed6c02' }} />,
            color: '#fff3e0',
        },
        {
            title: 'Total Transfers',
            value: metrics.total_transfers,
            icon: <Phone sx={{ fontSize: 40, color: '#9c27b0' }} />,
            color: '#f3e5f5',
        },
        {
            title: 'Total Callbacks',
            value: metrics.total_callbacks,
            icon: <Schedule sx={{ fontSize: 40, color: '#d32f2f' }} />,
            color: '#ffebee',
        },
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
                Analytics Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Overview of your campaign performance
            </Typography>

            <Grid container spacing={3}>
                {statCards.map((card, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card
                            sx={{
                                height: '100%',
                                background: `linear-gradient(135deg, ${card.color} 0%, white 100%)`,
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 3,
                                },
                            }}
                        >
                            <CardContent>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            {card.title}
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold">
                                            {card.value.toLocaleString()}
                                        </Typography>
                                    </Box>
                                    {card.icon}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}

                {/* Qualification Rate */}
                <Grid item xs={12} sm={6}>
                    <Card
                        sx={{
                            background: 'linear-gradient(135deg, #e1f5fe 0%, white 100%)',
                            transition: 'transform 0.2s',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 3,
                            },
                        }}
                    >
                        <CardContent>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Qualification Rate
                            </Typography>
                            <Typography variant="h3" fontWeight="bold" color="primary">
                                {metrics.overall_qualification_rate.toFixed(1)}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Leads qualified from total leads
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Transfer Rate */}
                <Grid item xs={12} sm={6}>
                    <Card
                        sx={{
                            background: 'linear-gradient(135deg, #f3e5f5 0%, white 100%)',
                            transition: 'transform 0.2s',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 3,
                            },
                        }}
                    >
                        <CardContent>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Transfer Rate
                            </Typography>
                            <Typography variant="h3" fontWeight="bold" sx={{ color: '#9c27b0' }}>
                                {metrics.overall_transfer_rate.toFixed(1)}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Leads transferred to human agents
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
}
