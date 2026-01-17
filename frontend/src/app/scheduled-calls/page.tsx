'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Fade,
    Zoom,
    Avatar,
    LinearProgress,
} from '@mui/material';
import {
    Schedule,
    Phone,
    Person,
    CheckCircle,
    Cancel,
    Edit,
    Delete,
    Event,
    AccessTime,
    TrendingUp,
} from '@mui/icons-material';
import api from '@/lib/api';
import { format } from 'date-fns';

interface ScheduledCall {
    id: string;
    lead_id: string;
    lead_name: string;
    lead_phone: string;
    campaign_id: string;
    scheduled_datetime: string;
    status: string;
    priority: string;
    callback_reason: string;
    assigned_to_agent_id?: string;
    assigned_to_agent_name?: string;
    created_at: string;
}

export default function ScheduledCallsPage() {
    const [calls, setCalls] = useState<ScheduledCall[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedCall, setSelectedCall] = useState<ScheduledCall | null>(null);
    const [newDateTime, setNewDateTime] = useState('');

    useEffect(() => {
        fetchScheduledCalls();
    }, []);

    const fetchScheduledCalls = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/callbacks/upcoming?hours_ahead=168');
            setCalls(response.data);
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch scheduled calls:', err);
            setError(err.response?.data?.detail || 'Failed to load scheduled calls');
        } finally {
            setLoading(false);
        }
    };

    const handleReschedule = (call: ScheduledCall) => {
        setSelectedCall(call);
        setNewDateTime(call.scheduled_datetime);
        setOpenDialog(true);
    };

    const handleSaveReschedule = async () => {
        if (!selectedCall) return;

        try {
            await api.patch(`/api/callbacks/${selectedCall.id}/reschedule`, {
                new_datetime: newDateTime,
                reason: 'Rescheduled by user'
            });
            fetchScheduledCalls();
            setOpenDialog(false);
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Failed to reschedule call');
        }
    };

    const handleComplete = async (callId: string) => {
        if (!confirm('Mark this callback as completed?')) return;

        try {
            await api.patch(`/api/callbacks/${callId}/complete`, {
                outcome: 'successful',
                notes: 'Completed from scheduled calls page'
            });
            fetchScheduledCalls();
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Failed to complete callback');
        }
    };

    const handleCancel = async (callId: string) => {
        if (!confirm('Are you sure you want to cancel this scheduled call?')) return;

        try {
            await api.delete(`/api/callbacks/${callId}`);
            fetchScheduledCalls();
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Failed to cancel callback');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'scheduled': return { bg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', text: 'white' };
            case 'completed': return { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', text: 'white' };
            case 'missed': return { bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', text: 'white' };
            case 'cancelled': return { bg: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)', text: 'white' };
            default: return { bg: '#e5e7eb', text: '#111827' };
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'high': return { bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', text: 'white' };
            case 'medium': return { bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', text: 'white' };
            case 'low': return { bg: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)', text: 'white' };
            default: return { bg: '#e5e7eb', text: '#111827' };
        }
    };

    const stats = {
        scheduled: calls.filter(c => c.status === 'scheduled').length,
        completed: calls.filter(c => c.status === 'completed').length,
        missed: calls.filter(c => c.status === 'missed').length,
        assigned: calls.filter(c => c.assigned_to_agent_id).length,
    };

    if (loading) {
        return (
            <Box sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Box sx={{ textAlign: 'center' }}>
                    <Schedule sx={{ fontSize: 80, color: '#8b5cf6', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">Loading scheduled calls...</Typography>
                    <LinearProgress sx={{ mt: 2, width: 200 }} />
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
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
                pointerEvents: 'none'
            }
        }}>
            <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
                {/* Hero Section */}
                <Fade in timeout={800}>
                    <Box sx={{ mb: 6, textAlign: 'center' }}>
                        <Box sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 2,
                            mb: 2,
                            px: 3,
                            py: 1,
                            borderRadius: '50px',
                            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
                            border: '1px solid rgba(139, 92, 246, 0.2)'
                        }}>
                            <Schedule sx={{ color: '#8b5cf6', fontSize: '2rem' }} />
                            <Typography variant="h3" fontWeight="800" sx={{
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>
                                Scheduled Calls
                            </Typography>
                        </Box>
                        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                            Manage callbacks scheduled by your AI agents
                        </Typography>
                    </Box>
                </Fade>

                {/* Stats Cards */}
                <Grid container spacing={3} mb={4}>
                    {[
                        { label: 'Scheduled', value: stats.scheduled, icon: <Schedule />, gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
                        { label: 'Completed', value: stats.completed, icon: <CheckCircle />, gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
                        { label: 'Missed', value: stats.missed, icon: <Cancel />, gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' },
                        { label: 'Assigned', value: stats.assigned, icon: <Person />, gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
                    ].map((stat, index) => (
                        <Grid item xs={12} sm={6} md={3} key={stat.label}>
                            <Zoom in timeout={800 + index * 100}>
                                <Card sx={{
                                    borderRadius: '20px',
                                    background: 'rgba(255, 255, 255, 0.95)',
                                    backdropFilter: 'blur(10px)',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: '0 12px 40px rgba(139, 92, 246, 0.2)',
                                    }
                                }}>
                                    <CardContent>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Avatar sx={{
                                                width: 56,
                                                height: 56,
                                                background: stat.gradient,
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                            }}>
                                                {stat.icon}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="h3" fontWeight="800">
                                                    {stat.value}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                                    {stat.label}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Zoom>
                        </Grid>
                    ))}
                </Grid>

                {/* Calls List */}
                {error && (
                    <Fade in>
                        <Card sx={{ mb: 3, borderRadius: '16px', background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' }}>
                            <CardContent>
                                <Typography color="error">{error}</Typography>
                            </CardContent>
                        </Card>
                    </Fade>
                )}

                {calls.length === 0 ? (
                    <Fade in timeout={1200}>
                        <Card sx={{
                            borderRadius: '24px',
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                        }}>
                            <CardContent sx={{ textAlign: 'center', py: 12 }}>
                                <Schedule sx={{ fontSize: 80, color: '#8b5cf6', mb: 3, opacity: 0.5 }} />
                                <Typography variant="h5" fontWeight="700" gutterBottom>
                                    No Scheduled Calls
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Callbacks scheduled by your AI agents will appear here
                                </Typography>
                            </CardContent>
                        </Card>
                    </Fade>
                ) : (
                    <Grid container spacing={3}>
                        {calls.map((call, index) => (
                            <Grid item xs={12} key={call.id}>
                                <Zoom in timeout={800 + index * 50}>
                                    <Card sx={{
                                        borderRadius: '20px',
                                        background: 'rgba(255, 255, 255, 0.95)',
                                        backdropFilter: 'blur(10px)',
                                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 12px 40px rgba(139, 92, 246, 0.15)',
                                        }
                                    }}>
                                        <CardContent sx={{ p: 3 }}>
                                            <Grid container spacing={3} alignItems="center">
                                                <Grid item xs={12} md={3}>
                                                    <Box>
                                                        <Typography variant="h6" fontWeight="700" gutterBottom>
                                                            {call.lead_name || 'Unknown'}
                                                        </Typography>
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <Phone sx={{ fontSize: '1rem', color: '#6b7280' }} />
                                                            <Typography variant="body2" color="text.secondary">
                                                                {call.lead_phone}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>

                                                <Grid item xs={12} md={2}>
                                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                                        <Event sx={{ fontSize: '1rem', color: '#8b5cf6' }} />
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {format(new Date(call.scheduled_datetime), 'MMM dd, yyyy')}
                                                        </Typography>
                                                    </Box>
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <AccessTime sx={{ fontSize: '1rem', color: '#8b5cf6' }} />
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {format(new Date(call.scheduled_datetime), 'HH:mm')}
                                                        </Typography>
                                                    </Box>
                                                </Grid>

                                                <Grid item xs={12} md={2}>
                                                    <Chip
                                                        label={call.priority}
                                                        size="small"
                                                        sx={{
                                                            background: getPriorityColor(call.priority).bg,
                                                            color: getPriorityColor(call.priority).text,
                                                            fontWeight: 700,
                                                            mb: 1
                                                        }}
                                                    />
                                                    <Chip
                                                        label={call.status}
                                                        size="small"
                                                        sx={{
                                                            background: getStatusColor(call.status).bg,
                                                            color: getStatusColor(call.status).text,
                                                            fontWeight: 700
                                                        }}
                                                    />
                                                </Grid>

                                                <Grid item xs={12} md={2}>
                                                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                                                        Assigned To:
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {call.assigned_to_agent_name || 'Unassigned'}
                                                    </Typography>
                                                </Grid>

                                                <Grid item xs={12} md={3}>
                                                    <Box display="flex" gap={1} justifyContent="flex-end">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleReschedule(call)}
                                                            disabled={call.status !== 'scheduled'}
                                                            sx={{
                                                                color: '#8b5cf6',
                                                                '&:hover': { background: 'rgba(139, 92, 246, 0.1)' }
                                                            }}
                                                        >
                                                            <Edit fontSize="small" />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleComplete(call.id)}
                                                            disabled={call.status !== 'scheduled'}
                                                            sx={{
                                                                color: '#10b981',
                                                                '&:hover': { background: 'rgba(16, 185, 129, 0.1)' }
                                                            }}
                                                        >
                                                            <CheckCircle fontSize="small" />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleCancel(call.id)}
                                                            disabled={call.status !== 'scheduled'}
                                                            sx={{
                                                                color: '#ef4444',
                                                                '&:hover': { background: 'rgba(239, 68, 68, 0.1)' }
                                                            }}
                                                        >
                                                            <Delete fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                </Grid>
                                            </Grid>

                                            {call.callback_reason && (
                                                <Box sx={{
                                                    mt: 2,
                                                    pt: 2,
                                                    borderTop: '1px solid rgba(0,0,0,0.1)',
                                                    background: 'rgba(139, 92, 246, 0.05)',
                                                    borderRadius: '12px',
                                                    p: 2
                                                }}>
                                                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5} fontWeight={600}>
                                                        Reason:
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {call.callback_reason}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Zoom>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* Reschedule Dialog */}
                <Dialog
                    open={openDialog}
                    onClose={() => setOpenDialog(false)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: '24px',
                            background: 'rgba(255, 255, 255, 0.98)',
                            backdropFilter: 'blur(20px)',
                        }
                    }}
                >
                    <DialogTitle sx={{
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1.5rem'
                    }}>
                        Reschedule Call
                    </DialogTitle>
                    <DialogContent sx={{ pt: 3 }}>
                        {selectedCall && (
                            <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Lead: <strong>{selectedCall.lead_name}</strong>
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom mb={3}>
                                    Phone: <strong>{selectedCall.lead_phone}</strong>
                                </Typography>
                                <TextField
                                    label="New Date & Time"
                                    type="datetime-local"
                                    fullWidth
                                    value={newDateTime.substring(0, 16)}
                                    onChange={(e) => setNewDateTime(e.target.value + ':00Z')}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={() => setOpenDialog(false)} sx={{ color: '#6b7280' }}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveReschedule}
                            variant="contained"
                            sx={{
                                px: 4,
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                                }
                            }}
                        >
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
}
