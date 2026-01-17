'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Container,
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
    Fade,
    Zoom,
    Avatar,
    LinearProgress,
    Chip,
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
            // Only show scheduled calls
            const scheduledOnly = response.data.filter((call: ScheduledCall) => call.status === 'scheduled');
            setCalls(scheduledOnly);
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
                                Scheduled Callbacks
                            </Typography>
                        </Box>
                        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                            Review and manage callbacks scheduled by your AI agents
                        </Typography>
                    </Box>
                </Fade>

                {/* Scheduled Count Card */}
                <Zoom in timeout={1000}>
                    <Card sx={{
                        mb: 4,
                        borderRadius: '24px',
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.95) 0%, rgba(124, 58, 237, 0.95) 100%)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box display="flex" alignItems="center" justifyContent="center" gap={3}>
                                <Avatar sx={{
                                    width: 80,
                                    height: 80,
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    backdropFilter: 'blur(10px)',
                                }}>
                                    <Schedule sx={{ fontSize: 40, color: 'white' }} />
                                </Avatar>
                                <Box textAlign="center">
                                    <Typography variant="h2" fontWeight="900" color="white">
                                        {scheduledCount}
                                    </Typography>
                                    <Typography variant="h6" color="rgba(255, 255, 255, 0.9)" fontWeight={600}>
                                        Scheduled Callbacks
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Zoom>

                {/* Error Alert */}
                {error && (
                    <Fade in>
                        <Card sx={{ mb: 3, borderRadius: '16px', background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' }}>
                            <CardContent>
                                <Typography color="error">{error}</Typography>
                            </CardContent>
                        </Card>
                    </Fade>
                )}

                {/* Calls Table */}
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
                                    No Scheduled Callbacks
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    When your AI agents schedule callbacks, they will appear here
                                </Typography>
                            </CardContent>
                        </Card>
                    </Fade>
                ) : (
                    <Zoom in timeout={1200}>
                        <TableContainer component={Paper} sx={{
                            borderRadius: '24px',
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                        }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{
                                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
                                    }}>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Customer Name</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Phone Number</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Agent</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Scheduled Time</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Priority</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {calls.map((call, index) => (
                                        <TableRow
                                            key={call.id}
                                            sx={{
                                                '&:hover': {
                                                    background: 'rgba(139, 92, 246, 0.05)',
                                                },
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={1.5}>
                                                    <Avatar sx={{
                                                        width: 36,
                                                        height: 36,
                                                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
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
                                                    <Phone sx={{ fontSize: '1rem', color: '#8b5cf6' }} />
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {call.lead_phone}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Person sx={{ fontSize: '1rem', color: '#8b5cf6' }} />
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
                                                        background: call.priority === 'high'
                                                            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                                            : call.priority === 'medium'
                                                                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                                                                : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
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
                                                            borderColor: '#8b5cf6',
                                                            color: '#8b5cf6',
                                                            '&:hover': {
                                                                borderColor: '#7c3aed',
                                                                background: 'rgba(139, 92, 246, 0.1)',
                                                            }
                                                        }}
                                                    >
                                                        View Summary
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        startIcon={<CheckCircle />}
                                                        onClick={() => handleMarkComplete(call.id)}
                                                        sx={{
                                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                            '&:hover': {
                                                                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
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
                    </Zoom>
                )}

                {/* Summary Dialog */}
                <Dialog
                    open={openSummaryDialog}
                    onClose={() => setOpenSummaryDialog(false)}
                    maxWidth="md"
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
                        Conversation Summary
                    </DialogTitle>
                    <DialogContent sx={{ pt: 4 }}>
                        {selectedCall && (
                            <Box>
                                {/* Customer Info */}
                                <Card sx={{
                                    mb: 3,
                                    borderRadius: '16px',
                                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%)',
                                    border: '1px solid rgba(139, 92, 246, 0.2)'
                                }}>
                                    <CardContent>
                                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                                            <Avatar sx={{
                                                width: 50,
                                                height: 50,
                                                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
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
                                    <Typography variant="subtitle2" fontWeight={700} gutterBottom color="#8b5cf6">
                                        Callback Reason:
                                    </Typography>
                                    <Typography variant="body1" sx={{
                                        p: 2,
                                        borderRadius: '12px',
                                        background: 'rgba(139, 92, 246, 0.05)',
                                        border: '1px solid rgba(139, 92, 246, 0.1)'
                                    }}>
                                        {selectedCall.callback_reason || 'No reason provided'}
                                    </Typography>
                                </Box>

                                {/* Conversation Summary */}
                                <Box>
                                    <Typography variant="subtitle2" fontWeight={700} gutterBottom color="#8b5cf6">
                                        Conversation Summary:
                                    </Typography>
                                    <Typography variant="body1" sx={{
                                        p: 3,
                                        borderRadius: '12px',
                                        background: 'rgba(139, 92, 246, 0.05)',
                                        border: '1px solid rgba(139, 92, 246, 0.1)',
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
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                                }
                            }}
                        >
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
}
