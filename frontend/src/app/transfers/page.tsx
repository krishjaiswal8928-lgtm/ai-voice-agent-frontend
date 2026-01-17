'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tab,
    Tabs,
    LinearProgress
} from '@mui/material';
import {
    SwapHoriz,
    CheckCircle,
    Error,
    Person,
    TrendingUp,
    Phone
} from '@mui/icons-material';
import { NavigationLayout } from '@/components/NavigationLayout';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface Transfer {
    lead_id: string;
    lead_name: string | null;
    lead_phone: string;
    agent_id: string | null;
    agent_name: string | null;
    transfer_type: string | null;
    transferred_at: string | null;
    transfer_status: string | null;
}

export default function TransfersPage() {
    const [transfers, setTransfers] = useState<Transfer[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);
    const [selectedCampaign, setSelectedCampaign] = useState<string>('all');

    useEffect(() => {
        fetchTransferData();
    }, [selectedCampaign]);

    const fetchTransferData = async () => {
        try {
            setLoading(true);
            // For demo, using first campaign - in production, allow campaign selection
            const campaignsRes = await axios.get('/api/campaigns/');
            if (campaignsRes.data.length > 0) {
                const campaignId = campaignsRes.data[0].id;

                const [historyRes, statsRes] = await Promise.all([
                    axios.get(`/api/transfers/history/${campaignId}`),
                    axios.get(`/api/transfers/stats/${campaignId}`)
                ]);

                setTransfers(historyRes.data);
                setStats(statsRes.data);
            }
        } catch (error) {
            console.error('Error fetching transfer data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTransfers = transfers.filter(t => {
        if (tabValue === 0) return t.transfer_status === 'completed';
        if (tabValue === 1) return t.transfer_status === 'failed';
        return true;
    });

    const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444'];

    const transferTypeData = stats?.transfer_type_breakdown ?
        Object.entries(stats.transfer_type_breakdown).map(([name, value]) => ({ name, value })) : [];

    const agentData = stats?.agent_distribution ?
        Object.entries(stats.agent_distribution).map(([name, value]) => ({ name, value })).slice(0, 5) : [];

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
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>
                        Call Transfers
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#6b7280', mt: 1 }}>
                        Monitor and analyze call transfers to human agents
                    </Typography>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress sx={{ color: '#6366f1' }} />
                    </Box>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <Grid container spacing={3} sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(99,102,241,0.1)' }}>
                                    <CardContent>
                                        <Typography variant="h6" sx={{ color: '#6b7280', mb: 1, fontWeight: 600, fontSize: '0.9rem' }}>
                                            Total Transfers
                                        </Typography>
                                        <Typography variant="h3" sx={{ fontWeight: 700, color: '#111827' }}>
                                            {stats?.total_transfers || 0}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(99,102,241,0.1)' }}>
                                    <CardContent>
                                        <Typography variant="h6" sx={{ color: '#6b7280', mb: 1, fontWeight: 600, fontSize: '0.9rem' }}>
                                            Successful
                                        </Typography>
                                        <Typography variant="h3" sx={{ fontWeight: 700, color: '#22c55e' }}>
                                            {stats?.successful_transfers || 0}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(99,102,241,0.1)' }}>
                                    <CardContent>
                                        <Typography variant="h6" sx={{ color: '#6b7280', mb: 1, fontWeight: 600, fontSize: '0.9rem' }}>
                                            Failed
                                        </Typography>
                                        <Typography variant="h3" sx={{ fontWeight: 700, color: '#ef4444' }}>
                                            {stats?.failed_transfers || 0}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(99,102,241,0.1)' }}>
                                    <CardContent>
                                        <Typography variant="h6" sx={{ color: '#6b7280', mb: 1, fontWeight: 600, fontSize: '0.9rem' }}>
                                            Success Rate
                                        </Typography>
                                        <Typography variant="h3" sx={{ fontWeight: 700, color: '#6366f1' }}>
                                            {stats?.success_rate || 0}%
                                        </Typography>
                                        <LinearProgress
                                            variant="determinate"
                                            value={stats?.success_rate || 0}
                                            sx={{ mt: 1, bgcolor: '#e5e7eb', '& .MuiLinearProgress-bar': { bgcolor: '#6366f1' } }}
                                        />
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* Charts */}
                        <Grid container spacing={3} sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
                            <Grid item xs={12} md={6}>
                                <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(99,102,241,0.1)' }}>
                                    <CardContent>
                                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#111827' }}>
                                            Transfer Type Distribution
                                        </Typography>
                                        {transferTypeData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height={250}>
                                                <PieChart>
                                                    <Pie
                                                        data={transferTypeData}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                        outerRadius={80}
                                                        fill="#8884d8"
                                                        dataKey="value"
                                                    >
                                                        {transferTypeData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <Typography sx={{ textAlign: 'center', py: 4, color: '#6b7280' }}>
                                                No data available
                                            </Typography>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(99,102,241,0.1)' }}>
                                    <CardContent>
                                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#111827' }}>
                                            Top Agents by Transfers
                                        </Typography>
                                        {agentData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height={250}>
                                                <BarChart data={agentData}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="name" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Bar dataKey="value" fill="#6366f1" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <Typography sx={{ textAlign: 'center', py: 4, color: '#6b7280' }}>
                                                No data available
                                            </Typography>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* Transfer History */}
                        <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(99,102,241,0.1)', position: 'relative', zIndex: 1 }}>
                            <CardContent>
                                <Tabs
                                    value={tabValue}
                                    onChange={(e, newValue) => setTabValue(newValue)}
                                    sx={{
                                        mb: 3,
                                        '& .MuiTab-root': { color: '#6b7280', fontWeight: 600 },
                                        '& .Mui-selected': { color: '#6366f1' }
                                    }}
                                >
                                    <Tab label={`Successful (${stats?.successful_transfers || 0})`} />
                                    <Tab label={`Failed (${stats?.failed_transfers || 0})`} />
                                    <Tab label="All" />
                                </Tabs>

                                {filteredTransfers.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <SwapHoriz sx={{ fontSize: 60, color: '#6b7280', mb: 2 }} />
                                        <Typography variant="h6" sx={{ color: '#6b7280' }}>
                                            No transfers in this category
                                        </Typography>
                                    </Box>
                                ) : (
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 700, color: '#111827' }}>Lead</TableCell>
                                                    <TableCell sx={{ fontWeight: 700, color: '#111827' }}>Agent</TableCell>
                                                    <TableCell sx={{ fontWeight: 700, color: '#111827' }}>Type</TableCell>
                                                    <TableCell sx={{ fontWeight: 700, color: '#111827' }}>Status</TableCell>
                                                    <TableCell sx={{ fontWeight: 700, color: '#111827' }}>Time</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {filteredTransfers.map((transfer, index) => (
                                                    <TableRow key={index} hover>
                                                        <TableCell>
                                                            <Box>
                                                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#111827' }}>
                                                                    {transfer.lead_name || 'Unknown'}
                                                                </Typography>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                                                    <Phone sx={{ fontSize: 14, color: '#6b7280' }} />
                                                                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                                                        {transfer.lead_phone}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Person sx={{ fontSize: 20, color: '#6366f1' }} />
                                                                <Typography variant="body2" sx={{ color: '#111827' }}>
                                                                    {transfer.agent_name || 'Unassigned'}
                                                                </Typography>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={transfer.transfer_type || 'Unknown'}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: transfer.transfer_type === 'warm' ? '#6366f1' : '#6b7280',
                                                                    color: '#ffffff',
                                                                    textTransform: 'capitalize'
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                icon={transfer.transfer_status === 'completed' ? <CheckCircle /> : <Error />}
                                                                label={transfer.transfer_status || 'Unknown'}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: transfer.transfer_status === 'completed' ? '#22c55e' : '#ef4444',
                                                                    color: '#ffffff',
                                                                    textTransform: 'capitalize'
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" sx={{ color: '#111827' }}>
                                                                {transfer.transferred_at ? new Date(transfer.transferred_at).toLocaleString() : 'N/A'}
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
            </Box>
        </NavigationLayout>
    );
}
