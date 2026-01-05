'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    CircularProgress,
    Chip,
    Tabs,
    Tab
} from '@mui/material';
import {
    ArrowBack,
    PlayArrow,
    Stop
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { NavigationLayout } from '@/components/NavigationLayout';
import { callSessionAPI } from '@/lib/api';

interface Campaign {
    id: string;
    name: string;
    type: 'outbound' | 'inbound';
    status: 'draft' | 'active' | 'paused' | 'completed';
    goal?: string;
    created_at: string;
    updated_at?: string;
}

export default function CampaignLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}) {
    const router = useRouter();
    const pathname = usePathname();

    // Unwrap params using React.use()
    const resolvedParams = React.use(params);
    const campaignId = resolvedParams.id;

    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                setLoading(true);
                setError(null);
                if (!campaignId) {
                    throw new Error('Invalid campaign ID');
                }
                const response = await callSessionAPI.getById(campaignId);
                setCampaign(response.data);
            } catch (err: any) {
                console.error('Error fetching campaign:', err);
                setError('Failed to load campaign details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (campaignId) {
            fetchCampaign();
        } else {
            setLoading(false);
            setError('No campaign ID provided');
        }
    }, [campaignId]);

    const handleBack = () => {
        router.push('/campaigns');
    };

    const handleStartCampaign = async () => {
        if (!campaign) return;
        try {
            setProcessing(true);
            await callSessionAPI.start(campaign.id);
            // Refresh campaign data
            const response = await callSessionAPI.getById(campaign.id);
            setCampaign(response.data);
        } catch (err) {
            console.error('Error starting campaign:', err);
            alert('Failed to start campaign. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const handleStopCampaign = async () => {
        if (!campaign) return;
        try {
            setProcessing(true);
            await callSessionAPI.stop(campaign.id);
            // Refresh campaign data
            const response = await callSessionAPI.getById(campaign.id);
            setCampaign(response.data);
        } catch (err) {
            console.error('Error stopping campaign:', err);
            alert('Failed to stop campaign. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <NavigationLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <CircularProgress sx={{ color: '#000000' }} />
                    <Typography sx={{ ml: 2, color: '#000000' }}>Loading campaign details...</Typography>
                </Box>
            </NavigationLayout>
        );
    }

    if (error) {
        return (
            <NavigationLayout>
                <Box sx={{ p: 3 }}>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={handleBack}
                        sx={{ color: '#000000', mb: 2 }}
                    >
                        Back to Campaigns
                    </Button>
                    <Typography variant="h4" sx={{ color: '#f44336' }}>
                        Error: {error}
                    </Typography>
                </Box>
            </NavigationLayout>
        );
    }

    if (!campaign) {
        return (
            <NavigationLayout>
                <Box sx={{ p: 3 }}>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={handleBack}
                        sx={{ color: '#000000', mb: 2 }}
                    >
                        Back to Campaigns
                    </Button>
                    <Typography variant="h4" sx={{ color: '#000000' }}>
                        Campaign not found
                    </Typography>
                </Box>
            </NavigationLayout>
        );
    }

    const isHistoryPage = pathname?.includes('/history');

    return (
        <NavigationLayout>
            <Box sx={{
                p: 3,
                background: '#f5f5f5',
                minHeight: '100vh',
                color: '#000000',
                width: '100%',
                position: 'relative',
                zIndex: 1,
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
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box>
                        <Button
                            startIcon={<ArrowBack />}
                            onClick={handleBack}
                            sx={{ color: '#000000', mb: 1 }}
                        >
                            Back to Campaigns
                        </Button>
                        <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1, color: '#000000' }}>
                            {campaign.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Chip
                                label={campaign.type}
                                size="small"
                                sx={{
                                    bgcolor: campaign.type === 'outbound' ? '#2196f3' : '#ff9800',
                                    color: '#ffffff'
                                }}
                            />
                            <Chip
                                label={campaign.status}
                                size="small"
                                color={campaign.status === 'active' ? 'success' : 'default'}
                                sx={{
                                    bgcolor: campaign.status === 'active' ? '#4caf50' : '#555',
                                    color: campaign.status === 'active' ? '#ffffff' : '#ffffff'
                                }}
                            />
                        </Box>
                    </Box>
                    <Box>
                        {campaign.status === 'active' ? (
                            <Button
                                variant="contained"
                                startIcon={processing ? <CircularProgress size={20} /> : <Stop />}
                                onClick={handleStopCampaign}
                                disabled={processing}
                                sx={{
                                    backgroundColor: '#f44336',
                                    color: '#ffffff',
                                    '&:hover': {
                                        backgroundColor: '#d32f2f'
                                    }
                                }}
                            >
                                Pause Campaign
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                startIcon={processing ? <CircularProgress size={20} /> : <PlayArrow />}
                                onClick={handleStartCampaign}
                                disabled={processing}
                                sx={{
                                    backgroundColor: '#4caf50',
                                    color: '#ffffff',
                                    '&:hover': {
                                        backgroundColor: '#45a049'
                                    }
                                }}
                            >
                                Start Campaign
                            </Button>
                        )}
                    </Box>
                </Box>

                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: '#e0e0e0', mb: 3 }}>
                    <Tabs
                        value={isHistoryPage ? 1 : 0}
                        textColor="inherit"
                        sx={{
                            '& .MuiTabs-indicator': {
                                bgcolor: '#000000'
                            }
                        }}
                    >
                        <Tab
                            label="Overview"
                            href={`/campaigns/by-id/${campaignId}`}
                            component={Link}
                            sx={{
                                color: '#555555',
                                '&.Mui-selected': {
                                    color: '#000000'
                                }
                            }}
                        />
                        <Tab
                            label="Call History"
                            href={`/campaigns/by-id/${campaignId}/history`}
                            component={Link}
                            sx={{
                                color: '#555555',
                                '&.Mui-selected': {
                                    color: '#000000'
                                }
                            }}
                        />
                    </Tabs>
                </Box>

                {/* Render content */}
                <Box>
                    {children}
                </Box>
            </Box>
        </NavigationLayout>
    );
}
