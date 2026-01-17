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
    Avatar,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Snackbar,
    Alert
} from '@mui/material';
import {
    Add,
    Person,
    Edit,
    Delete,
    CheckCircle,
    Cancel,
    Phone,
    Email,
    Schedule,
    TrendingUp
} from '@mui/icons-material';
import { NavigationLayout } from '@/components/NavigationLayout';
import axios from 'axios';

interface HumanAgent {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    extension: string | null;
    status: string;
    timezone: string;
    working_hours: any;
    accepts_transfers: boolean;
    accepts_callbacks: boolean;
    max_concurrent_calls: number;
    current_active_calls: number;
    total_transfers_received: number;
    total_callbacks_completed: number;
    average_call_duration: number;
    conversion_rate: number;
    created_at: string;
}

export default function HumanAgentsPage() {
    const [agents, setAgents] = useState<HumanAgent[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingAgent, setEditingAgent] = useState<HumanAgent | null>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        extension: '',
        timezone: 'UTC',
        accepts_transfers: true,
        accepts_callbacks: true,
        max_concurrent_calls: 1
    });

    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/human-agents/');
            setAgents(response.data);
        } catch (error) {
            console.error('Error fetching agents:', error);
            showSnackbar('Failed to load agents', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (agent?: HumanAgent) => {
        if (agent) {
            setEditingAgent(agent);
            setFormData({
                name: agent.name,
                email: agent.email,
                phone: agent.phone || '',
                extension: agent.extension || '',
                timezone: agent.timezone,
                accepts_transfers: agent.accepts_transfers,
                accepts_callbacks: agent.accepts_callbacks,
                max_concurrent_calls: agent.max_concurrent_calls
            });
        } else {
            setEditingAgent(null);
            setFormData({
                name: '',
                email: '',
                phone: '',
                extension: '',
                timezone: 'UTC',
                accepts_transfers: true,
                accepts_callbacks: true,
                max_concurrent_calls: 1
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingAgent(null);
    };

    const handleSaveAgent = async () => {
        try {
            if (editingAgent) {
                await axios.put(`/api/human-agents/${editingAgent.id}`, formData);
                showSnackbar('Agent updated successfully', 'success');
            } else {
                await axios.post('/api/human-agents/', formData);
                showSnackbar('Agent created successfully', 'success');
            }
            handleCloseDialog();
            fetchAgents();
        } catch (error) {
            console.error('Error saving agent:', error);
            showSnackbar('Failed to save agent', 'error');
        }
    };

    const handleDeleteAgent = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this agent?')) {
            try {
                await axios.delete(`/api/human-agents/${id}`);
                showSnackbar('Agent deleted successfully', 'success');
                fetchAgents();
            } catch (error) {
                console.error('Error deleting agent:', error);
                showSnackbar('Failed to delete agent', 'error');
            }
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await axios.patch(`/api/human-agents/${id}/status`, { status });
            showSnackbar('Status updated successfully', 'success');
            fetchAgents();
        } catch (error) {
            console.error('Error updating status:', error);
            showSnackbar('Failed to update status', 'error');
        }
    };

    const showSnackbar = (message: string, severity: 'success' | 'error') => {
        setSnackbar({ open: true, message, severity });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available': return '#22c55e';
            case 'busy': return '#f59e0b';
            case 'on_call': return '#6366f1';
            case 'offline': return '#6b7280';
            default: return '#6b7280';
        }
    };

    const getStatusIcon = (status: string) => {
        return status === 'available' || status === 'on_call' ? <CheckCircle /> : <Cancel />;
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, position: 'relative', zIndex: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>
                        Human Sales Agents
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<Add />}
                        onClick={() => handleOpenDialog()}
                        sx={{
                            bgcolor: '#6366f1',
                            color: '#ffffff',
                            fontWeight: 700,
                            px: 3,
                            py: 1.5,
                            '&:hover': {
                                bgcolor: '#4f46e5'
                            }
                        }}
                    >
                        Add Agent
                    </Button>
                </Box>

                {/* Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(99,102,241,0.1)' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ color: '#6b7280', mb: 1, fontWeight: 600 }}>
                                    Total Agents
                                </Typography>
                                <Typography variant="h3" sx={{ fontWeight: 700, color: '#111827' }}>
                                    {agents.length}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(99,102,241,0.1)' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ color: '#6b7280', mb: 1, fontWeight: 600 }}>
                                    Available
                                </Typography>
                                <Typography variant="h3" sx={{ fontWeight: 700, color: '#22c55e' }}>
                                    {agents.filter(a => a.status === 'available').length}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(99,102,241,0.1)' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ color: '#6b7280', mb: 1, fontWeight: 600 }}>
                                    On Call
                                </Typography>
                                <Typography variant="h3" sx={{ fontWeight: 700, color: '#6366f1' }}>
                                    {agents.filter(a => a.status === 'on_call').length}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(99,102,241,0.1)' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ color: '#6b7280', mb: 1, fontWeight: 600 }}>
                                    Total Transfers
                                </Typography>
                                <Typography variant="h3" sx={{ fontWeight: 700, color: '#111827' }}>
                                    {agents.reduce((sum, a) => sum + a.total_transfers_received, 0)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Agents Table */}
                <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(99,102,241,0.1)', position: 'relative', zIndex: 1 }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#111827' }}>
                            Agents List
                        </Typography>

                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <CircularProgress sx={{ color: '#6366f1' }} />
                            </Box>
                        ) : agents.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Person sx={{ fontSize: 60, color: '#6b7280', mb: 2 }} />
                                <Typography variant="h6" sx={{ color: '#6b7280' }}>
                                    No agents yet
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#888888', mt: 1 }}>
                                    Add your first human sales agent to start receiving transfers
                                </Typography>
                            </Box>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700, color: '#111827' }}>Agent</TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: '#111827' }}>Status</TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: '#111827' }}>Contact</TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: '#111827' }}>Capacity</TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: '#111827' }}>Performance</TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: '#111827' }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {agents.map((agent) => (
                                            <TableRow key={agent.id} hover>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Avatar sx={{ bgcolor: '#6366f1' }}>
                                                            {agent.name.charAt(0)}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body1" sx={{ fontWeight: 600, color: '#111827' }}>
                                                                {agent.name}
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                                                {agent.timezone}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        icon={getStatusIcon(agent.status)}
                                                        label={agent.status}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: getStatusColor(agent.status),
                                                            color: '#ffffff',
                                                            textTransform: 'capitalize'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                            <Email sx={{ fontSize: 16, color: '#6b7280' }} />
                                                            <Typography variant="body2" sx={{ color: '#111827' }}>
                                                                {agent.email}
                                                            </Typography>
                                                        </Box>
                                                        {agent.phone && (
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Phone sx={{ fontSize: 16, color: '#6b7280' }} />
                                                                <Typography variant="body2" sx={{ color: '#111827' }}>
                                                                    {agent.phone}
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ color: '#111827' }}>
                                                        {agent.current_active_calls} / {agent.max_concurrent_calls}
                                                    </Typography>
                                                    <Chip
                                                        label={agent.accepts_transfers ? 'Transfers' : 'No Transfers'}
                                                        size="small"
                                                        sx={{ mt: 0.5, mr: 0.5, fontSize: '0.7rem' }}
                                                    />
                                                    <Chip
                                                        label={agent.accepts_callbacks ? 'Callbacks' : 'No Callbacks'}
                                                        size="small"
                                                        sx={{ mt: 0.5, fontSize: '0.7rem' }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ color: '#111827', mb: 0.5 }}>
                                                        Transfers: {agent.total_transfers_received}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: '#111827', mb: 0.5 }}>
                                                        Callbacks: {agent.total_callbacks_completed}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: '#22c55e', fontWeight: 600 }}>
                                                        Conv: {agent.conversion_rate}%
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleOpenDialog(agent)}
                                                            sx={{ color: '#6366f1' }}
                                                        >
                                                            <Edit />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleDeleteAgent(agent.id)}
                                                            sx={{ color: '#ef4444' }}
                                                        >
                                                            <Delete />
                                                        </IconButton>
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

                {/* Add/Edit Dialog */}
                <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ fontWeight: 700, color: '#111827' }}>
                        {editingAgent ? 'Edit Agent' : 'Add New Agent'}
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                            <TextField
                                label="Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                fullWidth
                                required
                            />
                            <TextField
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                fullWidth
                                required
                            />
                            <TextField
                                label="Phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                fullWidth
                            />
                            <TextField
                                label="Extension"
                                value={formData.extension}
                                onChange={(e) => setFormData({ ...formData, extension: e.target.value })}
                                fullWidth
                            />
                            <FormControl fullWidth>
                                <InputLabel>Timezone</InputLabel>
                                <Select
                                    value={formData.timezone}
                                    label="Timezone"
                                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                                >
                                    <MenuItem value="UTC">UTC</MenuItem>
                                    <MenuItem value="America/New_York">Eastern Time</MenuItem>
                                    <MenuItem value="America/Chicago">Central Time</MenuItem>
                                    <MenuItem value="America/Denver">Mountain Time</MenuItem>
                                    <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                label="Max Concurrent Calls"
                                type="number"
                                value={formData.max_concurrent_calls}
                                onChange={(e) => setFormData({ ...formData, max_concurrent_calls: parseInt(e.target.value) })}
                                fullWidth
                                inputProps={{ min: 1, max: 10 }}
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.accepts_transfers}
                                        onChange={(e) => setFormData({ ...formData, accepts_transfers: e.target.checked })}
                                    />
                                }
                                label="Accepts Transfers"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.accepts_callbacks}
                                        onChange={(e) => setFormData({ ...formData, accepts_callbacks: e.target.checked })}
                                    />
                                }
                                label="Accepts Callbacks"
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} sx={{ color: '#6b7280' }}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveAgent}
                            variant="contained"
                            sx={{
                                bgcolor: '#6366f1',
                                '&:hover': { bgcolor: '#4f46e5' }
                            }}
                        >
                            {editingAgent ? 'Update' : 'Create'}
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
