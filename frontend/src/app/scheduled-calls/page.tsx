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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Alert,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from '@mui/material';
import {
    Schedule,
    Phone,
    Person,
    CheckCircle,
    Cancel,
    Edit,
    Delete,
} from '@mui/icons-material';
import { api } from '@/lib/api';
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
            const response = await api.get('/api/callbacks/upcoming?hours_ahead=168'); // Next 7 days
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
            case 'scheduled': return 'info';
            case 'completed': return 'success';
            case 'missed': return 'error';
            case 'cancelled': return 'default';
            default: return 'default';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'default';
            default: return 'default';
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box mb={4}>
                <Typography variant="h4" gutterBottom fontWeight="bold">
                    Scheduled Calls
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    View and manage all scheduled callbacks from your AI agents
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Summary Cards */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Schedule sx={{ fontSize: 40, color: '#1976d2' }} />
                                <Box>
                                    <Typography variant="h4" fontWeight="bold">
                                        {calls.filter(c => c.status === 'scheduled').length}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Scheduled
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={2}>
                                <CheckCircle sx={{ fontSize: 40, color: '#2e7d32' }} />
                                <Box>
                                    <Typography variant="h4" fontWeight="bold">
                                        {calls.filter(c => c.status === 'completed').length}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Completed
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Cancel sx={{ fontSize: 40, color: '#d32f2f' }} />
                                <Box>
                                    <Typography variant="h4" fontWeight="bold">
                                        {calls.filter(c => c.status === 'missed').length}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Missed
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Person sx={{ fontSize: 40, color: '#ed6c02' }} />
                                <Box>
                                    <Typography variant="h4" fontWeight="bold">
                                        {calls.filter(c => c.assigned_to_agent_id).length}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Assigned
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Calls Table */}
            {calls.length === 0 ? (
                <Card>
                    <CardContent sx={{ textAlign: 'center', py: 8 }}>
                        <Schedule sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No scheduled calls
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Scheduled callbacks will appear here
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Lead</strong></TableCell>
                                <TableCell><strong>Phone</strong></TableCell>
                                <TableCell><strong>Scheduled Time</strong></TableCell>
                                <TableCell><strong>Priority</strong></TableCell>
                                <TableCell><strong>Status</strong></TableCell>
                                <TableCell><strong>Assigned To</strong></TableCell>
                                <TableCell><strong>Reason</strong></TableCell>
                                <TableCell align="right"><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {calls.map((call) => (
                                <TableRow key={call.id} hover>
                                    <TableCell>{call.lead_name || 'Unknown'}</TableCell>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Phone fontSize="small" color="action" />
                                            {call.lead_phone}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(call.scheduled_datetime), 'MMM dd, yyyy HH:mm')}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={call.priority}
                                            size="small"
                                            color={getPriorityColor(call.priority)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={call.status}
                                            size="small"
                                            color={getStatusColor(call.status)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {call.assigned_to_agent_name || (
                                            <Typography variant="body2" color="text.secondary">
                                                Unassigned
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                            {call.callback_reason}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleReschedule(call)}
                                            disabled={call.status !== 'scheduled'}
                                        >
                                            <Edit fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleComplete(call.id)}
                                            disabled={call.status !== 'scheduled'}
                                            color="success"
                                        >
                                            <CheckCircle fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleCancel(call.id)}
                                            disabled={call.status !== 'scheduled'}
                                            color="error"
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Reschedule Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Reschedule Call</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        {selectedCall && (
                            <>
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
                            </>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleSaveReschedule} variant="contained">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
