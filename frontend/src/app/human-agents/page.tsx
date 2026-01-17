'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Card,
    CardContent,
    Grid,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Switch,
    FormControlLabel,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    Add,
    Edit,
    Delete,
    Phone,
    Email,
    Schedule,
} from '@mui/icons-material';
import { api } from '@/lib/api';

interface HumanAgent {
    id: string;
    name: string;
    email: string;
    phone?: string;
    extension?: string;
    status: string;
    timezone: string;
    working_hours: any;
    accepts_transfers: boolean;
    accepts_callbacks: boolean;
    max_concurrent_calls: number;
    current_active_calls: number;
    total_transfers_received: number;
    total_callbacks_completed: number;
    created_at: string;
}

export default function HumanAgentsPage() {
    const [agents, setAgents] = useState<HumanAgent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingAgent, setEditingAgent] = useState<HumanAgent | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        extension: '',
        timezone: 'Asia/Kolkata',
        accepts_transfers: true,
        accepts_callbacks: true,
        max_concurrent_calls: 2,
    });

    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/human-agents/');
            setAgents(response.data);
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch agents:', err);
            setError(err.response?.data?.detail || 'Failed to load agents');
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
                max_concurrent_calls: agent.max_concurrent_calls,
            });
        } else {
            setEditingAgent(null);
            setFormData({
                name: '',
                email: '',
                phone: '',
                extension: '',
                timezone: 'Asia/Kolkata',
                accepts_transfers: true,
                accepts_callbacks: true,
                max_concurrent_calls: 2,
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingAgent(null);
    };

    const handleSubmit = async () => {
        try {
            if (editingAgent) {
                await api.put(`/api/human-agents/${editingAgent.id}`, formData);
            } else {
                await api.post('/api/human-agents/', formData);
            }
            fetchAgents();
            handleCloseDialog();
        } catch (err: any) {
            console.error('Failed to save agent:', err);
            alert(err.response?.data?.detail || 'Failed to save agent');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this agent?')) return;

        try {
            await api.delete(`/api/human-agents/${id}`);
            fetchAgents();
        } catch (err: any) {
            console.error('Failed to delete agent:', err);
            alert(err.response?.data?.detail || 'Failed to delete agent');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'available': return 'success';
            case 'busy': return 'warning';
            case 'on_call': return 'info';
            case 'offline': return 'default';
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
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" gutterBottom fontWeight="bold">
                        Human Agents
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage your sales team for call transfers and callbacks
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenDialog()}
                >
                    Add Agent
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {agents.length === 0 ? (
                <Card>
                    <CardContent sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No human agents yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Add your first human agent to enable call transfers and callbacks
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => handleOpenDialog()}
                        >
                            Add Your First Agent
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Grid container spacing={3}>
                    {agents.map((agent) => (
                        <Grid item xs={12} md={6} key={agent.id}>
                            <Card>
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                                        <Box>
                                            <Typography variant="h6" fontWeight="bold">
                                                {agent.name}
                                            </Typography>
                                            <Chip
                                                label={agent.status}
                                                color={getStatusColor(agent.status)}
                                                size="small"
                                                sx={{ mt: 1 }}
                                            />
                                        </Box>
                                        <Box>
                                            <IconButton size="small" onClick={() => handleOpenDialog(agent)}>
                                                <Edit fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleDelete(agent.id)}>
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Box>

                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                        <Email fontSize="small" color="action" />
                                        <Typography variant="body2" color="text.secondary">
                                            {agent.email}
                                        </Typography>
                                    </Box>

                                    {agent.phone && (
                                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                                            <Phone fontSize="small" color="action" />
                                            <Typography variant="body2" color="text.secondary">
                                                {agent.phone}
                                                {agent.extension && ` ext. ${agent.extension}`}
                                            </Typography>
                                        </Box>
                                    )}

                                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                                        <Schedule fontSize="small" color="action" />
                                        <Typography variant="body2" color="text.secondary">
                                            {agent.timezone}
                                        </Typography>
                                    </Box>

                                    <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                                        {agent.accepts_transfers && (
                                            <Chip label="Accepts Transfers" size="small" variant="outlined" />
                                        )}
                                        {agent.accepts_callbacks && (
                                            <Chip label="Accepts Callbacks" size="small" variant="outlined" />
                                        )}
                                    </Box>

                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">
                                                Active Calls
                                            </Typography>
                                            <Typography variant="h6">
                                                {agent.current_active_calls} / {agent.max_concurrent_calls}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">
                                                Total Transfers
                                            </Typography>
                                            <Typography variant="h6">
                                                {agent.total_transfers_received}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingAgent ? 'Edit Agent' : 'Add New Agent'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Name"
                            fullWidth
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <TextField
                            label="Email"
                            type="email"
                            fullWidth
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                        <TextField
                            label="Phone"
                            fullWidth
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+1234567890"
                        />
                        <TextField
                            label="Extension"
                            fullWidth
                            value={formData.extension}
                            onChange={(e) => setFormData({ ...formData, extension: e.target.value })}
                            placeholder="Optional"
                        />
                        <TextField
                            label="Timezone"
                            select
                            fullWidth
                            value={formData.timezone}
                            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                        >
                            <MenuItem value="Asia/Kolkata">Asia/Kolkata (IST)</MenuItem>
                            <MenuItem value="America/New_York">America/New_York (EST)</MenuItem>
                            <MenuItem value="America/Los_Angeles">America/Los_Angeles (PST)</MenuItem>
                            <MenuItem value="Europe/London">Europe/London (GMT)</MenuItem>
                            <MenuItem value="UTC">UTC</MenuItem>
                        </TextField>
                        <TextField
                            label="Max Concurrent Calls"
                            type="number"
                            fullWidth
                            value={formData.max_concurrent_calls}
                            onChange={(e) => setFormData({ ...formData, max_concurrent_calls: parseInt(e.target.value) })}
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
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingAgent ? 'Save Changes' : 'Create Agent'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
