'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    CircularProgress,
    Chip,
    Tab,
    Tabs,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Snackbar,
    Alert,
    Avatar,
    Divider
} from '@mui/material';
import {
    Schedule,
    CheckCircle,
    Cancel,
    Phone,
    Person,
    CalendarToday,
    Edit,
    Done,
    Close
} from '@mui/icons-material';
import { NavigationLayout } from '@/components/NavigationLayout';
import axios from 'axios';

interface Callback {
    id: string;
    lead_id: string;
    campaign_id: string;
    scheduled_datetime: string;
    status: string;
    priority: string;
    lead_name: string | null;
    lead_phone: string;
    lead_score: number;
    assigned_to_agent_id: string | null;
    assigned_to_agent_name: string | null;
    callback_reason: string | null;
    conversation_summary: string | null;
    recommended_talking_points: string[];
    created_at: string;
}

export default function CallbacksPage() {
    const [callbacks, setCallbacks] = useState<Callback[]>([]);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);
    const [selectedCallback, setSelectedCallback] = useState<Callback | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    useEffect(() => {
        fetchCallbacks();
    }, []);

    const fetchCallbacks = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/callbacks/upcoming?hours_ahead=168'); // 7 days
            setCallbacks(response.data);
        } catch (error) {
            console.error('Error fetching callbacks:', error);
            showSnackbar('Failed to load callbacks', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteCallback = async (id: string) => {
        try {
            await axios.patch(`/api/callbacks/${id}/complete`, {
                outcome: 'successful',
                notes: 'Callback completed'
            });
            showSnackbar('Callback marked as completed', 'success');
            fetchCallbacks();
        } catch (error) {
            console.error('Error completing callback:', error);
            showSnackbar('Failed to complete callback', 'error');
        }
    };

    const handleViewDetails = (callback: Callback) => {
        setSelectedCallback(callback);
        setDetailsOpen(true);
    };

    const showSnackbar = (message: string, severity: 'success' | 'error') => {
        setSnackbar({ open: true, message, severity });
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#22c55e';
            default: return '#6b7280';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return '#f59e0b';
            case 'completed': return '#22c55e';
            case 'missed': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const filteredCallbacks = callbacks.filter(callback => {
        if (tabValue === 0) return callback.status === 'pending';
        if (tabValue === 1) return callback.status === 'completed';
        if (tabValue === 2) return callback.status === 'missed';
        return true;
    });

    const stats = {
        total: callbacks.length,
        pending: callbacks.filter(c => c.status === 'pending').length,
        completed: callbacks.filter(c => c.status === 'completed').length,
        missed: callbacks.filter(c => c.status === 'missed').length,
        highPriority: callbacks.filter(c => c.priority === 'high' && c.status === 'pending').length
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
                {/* Header */}
                <Box sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>
                        Scheduled Callbacks
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#6b7280', mt: 1 }}>
                        Manage and track scheduled follow-up calls with qualified leads
                    </Typography>
                </Box>

                {/* Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(99,102,241,0.1)' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ color: '#6b7280', mb: 1, fontWeight: 600, fontSize: '0.9rem' }}>
                                    Total Callbacks
                                </Typography>
                                <Typography variant="h3" sx={{ fontWeight: 700, color: '#111827' }}>
                                    {stats.total}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(99,102,241,0.1)' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ color: '#6b7280', mb: 1, fontWeight: 600, fontSize: '0.9rem' }}>
                                    Pending
                                </Typography>
                                <Typography variant="h3" sx={{ fontWeight: 700, color: '#f59e0b' }}>
                                    {stats.pending}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(99,102,241,0.1)' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ color: '#6b7280', mb: 1, fontWeight: 600, fontSize: '0.9rem' }}>
                                    Completed
                                </Typography>
                                <Typography variant="h3" sx={{ fontWeight: 700, color: '#22c55e' }}>
                                    {stats.completed}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(99,102,241,0.1)' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ color: '#6b7280', mb: 1, fontWeight: 600, fontSize: '0.9rem' }}>
                                    Missed
                                </Typography>
                                <Typography variant="h3" sx={{ fontWeight: 700, color: '#ef4444' }}>
                                    {stats.missed}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(99,102,241,0.1)' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ color: '#6b7280', mb: 1, fontWeight: 600, fontSize: '0.9rem' }}>
                                    High Priority
                                </Typography>
                                <Typography variant="h3" sx={{ fontWeight: 700, color: '#ef4444' }}>
                                    {stats.highPriority}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Callbacks List */}
                <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(99,102,241,0.1)', position: 'relative', zIndex: 1 }}>
                    <CardContent>
                        <Tabs
                            value={tabValue}
                            onChange={(e, newValue) => setTabValue(newValue)}
                            sx={{
                                mb: 3,
                                '& .MuiTab-root': {
                                    color: '#6b7280',
                                    fontWeight: 600
                                },
                                '& .Mui-selected': {
                                    color: '#6366f1'
                                }
                            }}
                        >
                            <Tab label={`Pending (${stats.pending})`} />
                            <Tab label={`Completed (${stats.completed})`} />
                            <Tab label={`Missed (${stats.missed})`} />
                        </Tabs>

                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <CircularProgress sx={{ color: '#6366f1' }} />
                            </Box>
                        ) : filteredCallbacks.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Schedule sx={{ fontSize: 60, color: '#6b7280', mb: 2 }} />
                                <Typography variant="h6" sx={{ color: '#6b7280' }}>
                                    No callbacks in this category
                                </Typography>
                            </Box>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700, color: '#111827' }}>Lead</TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: '#111827' }}>Scheduled</TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: '#111827' }}>Priority</TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: '#111827' }}>Lead Score</TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: '#111827' }}>Assigned Agent</TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: '#111827' }}>Reason</TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: '#111827' }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredCallbacks.map((callback) => (
                                            <TableRow key={callback.id} hover>
                                                <TableCell>
                                                    <Box>
                                                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#111827' }}>
                                                            {callback.lead_name || 'Unknown'}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                                            <Phone sx={{ fontSize: 14, color: '#6b7280' }} />
                                                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                                                {callback.lead_phone}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <CalendarToday sx={{ fontSize: 16, color: '#6366f1' }} />
                                                        <Typography variant="body2" sx={{ color: '#111827' }}>
                                                            {new Date(callback.scheduled_datetime).toLocaleString()}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={callback.priority}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: getPriorityColor(callback.priority),
                                                            color: '#ffffff',
                                                            textTransform: 'capitalize',
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={`${callback.lead_score}/10`}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: callback.lead_score >= 7 ? '#22c55e' : callback.lead_score >= 4 ? '#f59e0b' : '#6b7280',
                                                            color: '#ffffff'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {callback.assigned_to_agent_name ? (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Avatar sx={{ width: 24, height: 24, bgcolor: '#6366f1', fontSize: '0.8rem' }}>
                                                                {callback.assigned_to_agent_name.charAt(0)}
                                                            </Avatar>
                                                            <Typography variant="body2" sx={{ color: '#111827' }}>
                                                                {callback.assigned_to_agent_name}
                                                            </Typography>
                                                        </Box>
                                                    ) : (
                                                        <Typography variant="body2" sx={{ color: '#6b7280', fontStyle: 'italic' }}>
                                                            Unassigned
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ color: '#111827', maxWidth: 200 }} noWrap>
                                                        {callback.callback_reason || 'No reason provided'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleViewDetails(callback)}
                                                            sx={{ color: '#6366f1' }}
                                                        >
                                                            <Edit />
                                                        </IconButton>
                                                        {callback.status === 'pending' && (
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleCompleteCallback(callback.id)}
                                                                sx={{ color: '#22c55e' }}
                                                            >
                                                                <Done />
                                                            </IconButton>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Callback Details Dialog */}
                <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
                    <DialogTitle sx={{ fontWeight: 700, color: '#111827' }}>
                        Callback Details
                    </DialogTitle>
                    <DialogContent>
                        {selectedCallback && (
                            <Box sx={{ mt: 2 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 0.5 }}>
                                            Lead Name
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: '#111827', fontWeight: 600 }}>
                                            {selectedCallback.lead_name || 'Unknown'}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 0.5 }}>
                                            Phone Number
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: '#111827', fontWeight: 600 }}>
                                            {selectedCallback.lead_phone}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 0.5 }}>
                                            Scheduled Time
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: '#111827', fontWeight: 600 }}>
                                            {new Date(selectedCallback.scheduled_datetime).toLocaleString()}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 0.5 }}>
                                            Lead Score
                                        </Typography>
                                        <Chip
                                            label={`${selectedCallback.lead_score}/10`}
                                            sx={{
                                                bgcolor: selectedCallback.lead_score >= 7 ? '#22c55e' : '#f59e0b',
                                                color: '#ffffff'
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Divider sx={{ my: 1 }} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>
                                            Callback Reason
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#111827' }}>
                                            {selectedCallback.callback_reason || 'No reason provided'}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>
                                            Conversation Summary
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#111827' }}>
                                            {selectedCallback.conversation_summary || 'No summary available'}
                                        </Typography>
                                    </Grid>
                                    {selectedCallback.recommended_talking_points.length > 0 && (
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>
                                                Recommended Talking Points
                                            </Typography>
                                            <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                                                {selectedCallback.recommended_talking_points.map((point, index) => (
                                                    <li key={index}>
                                                        <Typography variant="body2" sx={{ color: '#111827' }}>
                                                            {point}
                                                        </Typography>
                                                    </li>
                                                ))}
                                            </Box>
                                        </Grid>
                                    )}
                                </Grid>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDetailsOpen(false)} sx={{ color: '#6b7280' }}>
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </NavigationLayout>
    );
}
