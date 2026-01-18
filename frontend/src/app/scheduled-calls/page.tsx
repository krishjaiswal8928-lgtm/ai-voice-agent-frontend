'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    LinearProgress,
    Chip,
    Grid,
    Avatar,
} from '@mui/material';
import {
    Schedule,
    Phone,
    CheckCircle,
    Visibility,
    Event,
    AccessTime,
    Person,
} from '@mui/icons-material';
import { NavigationLayout } from '@/components/NavigationLayout';
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
    conversation_summary?: string;
    assigned_to_agent_id?: string;
    assigned_to_agent_name?: string;
    created_at: string;
}

export default function ScheduledCallsPage() {
    const [calls, setCalls] = useState<ScheduledCall[]>([]);
    const [allFetchedCalls, setAllFetchedCalls] = useState<ScheduledCall[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openSummaryDialog, setOpenSummaryDialog] = useState(false);
    const [selectedCall, setSelectedCall] = useState<ScheduledCall | null>(null);

    useEffect(() => {
        fetchScheduledCalls();
    }, []);

    const fetchScheduledCalls = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/callbacks/upcoming?hours_ahead=168');
            // Show only scheduled in table, but keep all for metrics
            const allCalls = response.data;
            const scheduledOnly = allCalls.filter((call: ScheduledCall) => call.status === 'scheduled');
            setCalls(scheduledOnly);
            setAllFetchedCalls(allCalls); // Store all calls for metrics
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch scheduled calls:', err);
            setError(err.response?.data?.detail || 'Failed to load scheduled calls');
        } finally {
            setLoading(false);
        }
    };

    const handleViewSummary = (call: ScheduledCall) => {
        setSelectedCall(call);
        setOpenSummaryDialog(true);
    };

    const handleMarkComplete = async (callId: string) => {
        if (!confirm('Mark this callback as completed?')) return;

        try {
            await api.patch(`/api/callbacks/${callId}/complete`, {
                outcome: 'successful',
                notes: 'Completed by owner'
            });
            // Remove from list immediately
            setCalls(calls.filter(c => c.id !== callId));
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Failed to complete callback');
        }
    };

    const scheduledCount = calls.length;

    if (loading) {
        return (
            <NavigationLayout>
                <Box sx={{
                    p: 3,
                    background: '#f5f5f5',
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Box sx={{ textAlign: 'center' }}>
                        <Schedule sx={{ fontSize: 80, color: '#6366f1', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">Loading scheduled calls...</Typography>
                        <LinearProgress sx={{ mt: 2, width: 200 }} />
                    </Box>
                </Box>
            </NavigationLayout>
        );
    }

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
                {/* Header */}
                <Box sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>
                        Scheduled Callbacks
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#6b7280', mt: 1 }}>
                        Review and manage callbacks scheduled by your AI agents
                    </Typography>
                </Box>

                {/* Metrics Cards */}
                <Grid container spacing={3} mb={4} sx={{ position: 'relative', zIndex: 1 }}>
                    <Grid item xs={12} md={6}>
                        <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(99,102,241,0.1)' }}>
                            <CardContent sx={{ p: 4 }}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography variant="body2" sx={{ color: '#6b7280', mb: 1, fontWeight: 600 }}>
                                            Scheduled
                                        </Typography>
                                        <Typography variant="h2" sx={{ fontWeight: 700, color: '#6366f1' }}>
                                            {scheduledCount}
                                        </Typography>
                                    </Box>
                                    <Avatar sx={{
                                        width: 60,
                                        height: 60,
                                        bgcolor: 'rgba(99, 102, 241, 0.1)',
                                    }}>
                                        <Schedule sx={{ fontSize: 32, color: '#6366f1' }} />
                                    </Avatar>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(99,102,241,0.1)' }}>
                            <CardContent sx={{ p: 4 }}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography variant="body2" sx={{ color: '#6b7280', mb: 1, fontWeight: 600 }}>
                                            Completed
                                        </Typography>
                                        <Typography variant="h2" sx={{ fontWeight: 700, color: '#22c55e' }}>
                                            {allFetchedCalls.filter(c => c.status === 'completed').length}
                                        </Typography>
                                    </Box>
                                    <Avatar sx={{
                                        width: 60,
                                        height: 60,
                                        bgcolor: 'rgba(34, 197, 94, 0.1)',
                                    }}>
                                        <CheckCircle sx={{ fontSize: 32, color: '#22c55e' }} />
                                    </Avatar>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Error Alert */}
                {error && (
                    <Card sx={{ mb: 3, bgcolor: '#fee2e2', border: '1px solid #fecaca', position: 'relative', zIndex: 1 }}>
                        <CardContent>
                            <Typography color="error">{error}</Typography>
                        </CardContent>
                    </Card>
                )}

                {/* Calls Table */}
                {calls.length === 0 ? (
                    <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(99,102,241,0.1)', position: 'relative', zIndex: 1 }}>
                        <CardContent sx={{ textAlign: 'center', py: 12 }}>
                            <Schedule sx={{ fontSize: 80, color: '#6366f1', mb: 3, opacity: 0.5 }} />
                            <Typography variant="h5" fontWeight="700" gutterBottom sx={{ color: '#111827' }}>
                                No Scheduled Callbacks
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                When your AI agents schedule callbacks, they will appear here
                            </Typography>
                        </CardContent>
                    </Card>
                ) : (
                    <TableContainer component={Paper} sx={{
                        bgcolor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 1px 3px rgba(99,102,241,0.1)',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#f9fafb' }}>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>Customer Name</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>Phone Number</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>Agent</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>Scheduled Time</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>Priority</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {calls.map((call, index) => (
                                    <TableRow
                                        key={call.id}
                                        sx={{
                                            '&:hover': {
                                                bgcolor: 'rgba(99, 102, 241, 0.05)',
                                            },
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={1.5}>
                                                <Avatar sx={{
                                                    width: 36,
                                                    height: 36,
                                                    bgcolor: '#6366f1',
                                                    fontSize: '0.9rem',
                                                    fontWeight: 700
                                                }}>
                                                    {call.lead_name ? call.lead_name.charAt(0).toUpperCase() : '?'}
                                                </Avatar>
                                                <Typography variant="body1" fontWeight={600}>
                                                    {call.lead_name || 'Unknown'}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Phone sx={{ fontSize: '1rem', color: '#6366f1' }} />
                                                <Typography variant="body2" fontWeight={500}>
                                                    {call.lead_phone}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Person sx={{ fontSize: '1rem', color: '#6366f1' }} />
                                                <Typography variant="body2" fontWeight={500}>
                                                    {call.assigned_to_agent_name || 'AI Agent'}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                                                    <Event sx={{ fontSize: '0.9rem', color: '#6b7280' }} />
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {format(new Date(call.scheduled_datetime), 'MMM dd, yyyy')}
                                                    </Typography>
                                                </Box>
                                                <Box display="flex" alignItems="center" gap={0.5}>
                                                    <AccessTime sx={{ fontSize: '0.9rem', color: '#6b7280' }} />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {format(new Date(call.scheduled_datetime), 'hh:mm a')}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={call.priority}
                                                size="small"
                                                sx={{
                                                    bgcolor: call.priority === 'high'
                                                        ? '#ef4444'
                                                        : call.priority === 'medium'
                                                            ? '#f59e0b'
                                                            : '#6b7280',
                                                    color: 'white',
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    fontSize: '0.7rem'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Box display="flex" gap={1} justifyContent="flex-end">
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<Visibility />}
                                                    onClick={() => handleViewSummary(call)}
                                                    sx={{
                                                        borderColor: '#6366f1',
                                                        color: '#6366f1',
                                                        '&:hover': {
                                                            borderColor: '#4f46e5',
                                                            bgcolor: 'rgba(99, 102, 241, 0.1)',
                                                        }
                                                    }}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    startIcon={<CheckCircle />}
                                                    onClick={() => handleMarkComplete(call.id)}
                                                    sx={{
                                                        bgcolor: '#22c55e',
                                                        '&:hover': {
                                                            bgcolor: '#16a34a',
                                                        }
                                                    }}
                                                >
                                                    Complete
                                                </Button>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* Summary Dialog */}
                <Dialog
                    open={openSummaryDialog}
                    onClose={() => setOpenSummaryDialog(false)}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{
                        sx: {
                            bgcolor: '#ffffff',
                            border: '1px solid #e5e7eb',
                        }
                    }}
                >
                    <DialogTitle sx={{
                        bgcolor: '#6366f1',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1.25rem'
                    }}>
                        Conversation Summary
                    </DialogTitle>
                    <DialogContent sx={{ pt: 4 }}>
                        {selectedCall && (
                            <Box>
                                {/* Customer Info */}
                                <Card sx={{
                                    mb: 3,
                                    bgcolor: 'rgba(99, 102, 241, 0.05)',
                                    border: '1px solid rgba(99, 102, 241, 0.2)'
                                }}>
                                    <CardContent>
                                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                                            <Avatar sx={{
                                                width: 50,
                                                height: 50,
                                                bgcolor: '#6366f1',
                                                fontSize: '1.2rem',
                                                fontWeight: 700
                                            }}>
                                                {selectedCall.lead_name ? selectedCall.lead_name.charAt(0).toUpperCase() : '?'}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="h6" fontWeight={700}>
                                                    {selectedCall.lead_name || 'Unknown Customer'}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {selectedCall.lead_phone}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box display="flex" gap={2}>
                                            <Chip
                                                icon={<Person />}
                                                label={`Agent: ${selectedCall.assigned_to_agent_name || 'AI Agent'}`}
                                                size="small"
                                                sx={{ fontWeight: 600 }}
                                            />
                                            <Chip
                                                icon={<Schedule />}
                                                label={format(new Date(selectedCall.scheduled_datetime), 'MMM dd, yyyy hh:mm a')}
                                                size="small"
                                                sx={{ fontWeight: 600 }}
                                            />
                                        </Box>
                                    </CardContent>
                                </Card>

                                {/* Callback Reason */}
                                <Box mb={3}>
                                    <Typography variant="subtitle2" fontWeight={700} gutterBottom color="#6366f1">
                                        Callback Reason:
                                    </Typography>
                                    <Typography variant="body1" sx={{
                                        p: 2,
                                        bgcolor: 'rgba(99, 102, 241, 0.05)',
                                        border: '1px solid rgba(99, 102, 241, 0.1)'
                                    }}>
                                        {selectedCall.callback_reason || 'No reason provided'}
                                    </Typography>
                                </Box>

                                {/* Conversation Summary */}
                                <Box>
                                    <Typography variant="subtitle2" fontWeight={700} gutterBottom color="#6366f1">
                                        Conversation Summary:
                                    </Typography>
                                    <Typography variant="body1" sx={{
                                        p: 3,
                                        bgcolor: 'rgba(99, 102, 241, 0.05)',
                                        border: '1px solid rgba(99, 102, 241, 0.1)',
                                        minHeight: 120,
                                        lineHeight: 1.8
                                    }}>
                                        {selectedCall.conversation_summary || 'The AI agent had a conversation with this customer and determined a callback was needed. The customer showed interest and requested to be contacted at the scheduled time.'}
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button
                            onClick={() => setOpenSummaryDialog(false)}
                            variant="contained"
                            sx={{
                                px: 4,
                                bgcolor: '#6366f1',
                                '&:hover': {
                                    bgcolor: '#4f46e5',
                                }
                            }}
                        >
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </NavigationLayout>
    );
}
