'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Card,
    CardContent,
    TextField,
    MenuItem,
    Switch,
    FormControlLabel,
    Grid,
    Chip,
    IconButton,
    Divider,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    RadioGroup,
    Radio,
    FormLabel,
} from '@mui/material';
import {
    Add,
    Delete,
    Phone,
    Person,
    Schedule,
    Warning,
} from '@mui/icons-material';
import { api } from '@/lib/api';

interface TransferAction {
    id: string;
    name: string;
    phone_number?: string;
    sip_uri?: string;
    transfer_mode: 'blind' | 'warm';
    trying_message: string;
    failed_message: string;
    availability: {
        [key: string]: { enabled: boolean; start: string; end: string };
    };
    timezone: string;
    unavailable_message: string;
    created_at: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function TransfersPage() {
    const [transfers, setTransfers] = useState<TransferAction[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingTransfer, setEditingTransfer] = useState<TransferAction | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        phone_number: '',
        sip_uri: '',
        transfer_mode: 'blind' as 'blind' | 'warm',
        trying_message: 'Let me transfer you to a human. Please hold on.',
        failed_message: "Sorry, I couldn't transfer you. Would you like to continue the conversation with me or try again later?",
        availability: DAYS.reduce((acc, day) => ({
            ...acc,
            [day]: { enabled: day !== 'Saturday' && day !== 'Sunday', start: '09:00', end: '18:00' }
        }), {}),
        timezone: 'UTC',
        unavailable_message: 'There is no-one available to take your call at the moment. Please try again later.',
    });

    useEffect(() => {
        fetchTransfers();
    }, []);

    const fetchTransfers = async () => {
        try {
            const response = await api.get('/api/transfers/actions');
            setTransfers(response.data);
        } catch (err) {
            console.error('Failed to fetch transfers:', err);
        }
    };

    const handleOpenDialog = (transfer?: TransferAction) => {
        if (transfer) {
            setEditingTransfer(transfer);
            setFormData({
                name: transfer.name,
                phone_number: transfer.phone_number || '',
                sip_uri: transfer.sip_uri || '',
                transfer_mode: transfer.transfer_mode,
                trying_message: transfer.trying_message,
                failed_message: transfer.failed_message,
                availability: transfer.availability,
                timezone: transfer.timezone,
                unavailable_message: transfer.unavailable_message,
            });
        } else {
            setEditingTransfer(null);
            setFormData({
                name: '',
                phone_number: '',
                sip_uri: '',
                transfer_mode: 'blind',
                trying_message: 'Let me transfer you to a human. Please hold on.',
                failed_message: "Sorry, I couldn't transfer you. Would you like to continue the conversation with me or try again later?",
                availability: DAYS.reduce((acc, day) => ({
                    ...acc,
                    [day]: { enabled: day !== 'Saturday' && day !== 'Sunday', start: '09:00', end: '18:00' }
                }), {}),
                timezone: 'UTC',
                unavailable_message: 'There is no-one available to take your call at the moment. Please try again later.',
            });
        }
        setOpenDialog(true);
    };

    const handleSave = async () => {
        try {
            if (editingTransfer) {
                await api.put(`/api/transfers/actions/${editingTransfer.id}`, formData);
            } else {
                await api.post('/api/transfers/actions', formData);
            }
            fetchTransfers();
            setOpenDialog(false);
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Failed to save transfer action');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this transfer action?')) return;
        try {
            await api.delete(`/api/transfers/actions/${id}`);
            fetchTransfers();
        } catch (err) {
            alert('Failed to delete transfer action');
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" gutterBottom fontWeight="bold">
                        Call Transfers
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Configure transfer actions for your AI agents
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenDialog()}
                >
                    Create Transfer
                </Button>
            </Box>

            {transfers.length === 0 ? (
                <Card>
                    <CardContent sx={{ textAlign: 'center', py: 8 }}>
                        <Phone sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No transfer actions yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Create your first transfer action to enable human handoff
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => handleOpenDialog()}
                        >
                            Create Transfer Action
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Grid container spacing={3}>
                    {transfers.map((transfer) => (
                        <Grid item xs={12} md={6} key={transfer.id}>
                            <Card>
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                                        <Box>
                                            <Typography variant="h6" fontWeight="bold">
                                                {transfer.name}
                                            </Typography>
                                            <Chip
                                                label={transfer.transfer_mode === 'blind' ? 'Blind Transfer' : 'Warm Transfer'}
                                                size="small"
                                                color={transfer.transfer_mode === 'blind' ? 'default' : 'primary'}
                                                sx={{ mt: 1 }}
                                            />
                                        </Box>
                                        <Box>
                                            <IconButton size="small" onClick={() => handleOpenDialog(transfer)}>
                                                <Phone fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleDelete(transfer.id)}>
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        <strong>Target:</strong> {transfer.phone_number || transfer.sip_uri || 'Not configured'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        <strong>Timezone:</strong> {transfer.timezone}
                                    </Typography>

                                    <Divider sx={{ my: 2 }} />

                                    <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                                        Availability:
                                    </Typography>
                                    <Box display="flex" gap={0.5} flexWrap="wrap">
                                        {DAYS.map((day) => {
                                            const dayData = transfer.availability[day];
                                            return dayData?.enabled ? (
                                                <Chip
                                                    key={day}
                                                    label={day.substring(0, 3)}
                                                    size="small"
                                                    color="success"
                                                    variant="outlined"
                                                />
                                            ) : null;
                                        })}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingTransfer ? 'Edit Transfer Action' : 'Create Transfer Action'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Basic Info */}
                        <TextField
                            label="Action Name"
                            fullWidth
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Transfer to Sales Team"
                            required
                        />

                        {/* Target Configuration */}
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                Transfer Target
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Phone Number"
                                        fullWidth
                                        value={formData.phone_number}
                                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                        placeholder="+1 708 726 3069"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="SIP URI (Optional)"
                                        fullWidth
                                        value={formData.sip_uri}
                                        onChange={(e) => setFormData({ ...formData, sip_uri: e.target.value })}
                                        placeholder="sip:user@domain.com"
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Transfer Mode */}
                        <Box>
                            <FormLabel component="legend">Transfer Mode</FormLabel>
                            <RadioGroup
                                value={formData.transfer_mode}
                                onChange={(e) => setFormData({ ...formData, transfer_mode: e.target.value as 'blind' | 'warm' })}
                            >
                                <FormControlLabel
                                    value="blind"
                                    control={<Radio />}
                                    label="Blind Transfer (Cold) - Direct transfer without introduction"
                                />
                                <FormControlLabel
                                    value="warm"
                                    control={<Radio />}
                                    label="Warm Transfer - Introduce the caller before transferring"
                                />
                            </RadioGroup>
                        </Box>

                        {/* Messages */}
                        <TextField
                            label="Trying to Reach Target Message"
                            fullWidth
                            multiline
                            rows={2}
                            value={formData.trying_message}
                            onChange={(e) => setFormData({ ...formData, trying_message: e.target.value })}
                        />

                        <TextField
                            label="Target Failed to Answer Message"
                            fullWidth
                            multiline
                            rows={2}
                            value={formData.failed_message}
                            onChange={(e) => setFormData({ ...formData, failed_message: e.target.value })}
                        />

                        {/* Availability */}
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                Human Availability
                            </Typography>
                            {DAYS.map((day) => (
                                <Box key={day} display="flex" alignItems="center" gap={2} mb={1}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.availability[day]?.enabled || false}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    availability: {
                                                        ...formData.availability,
                                                        [day]: {
                                                            ...formData.availability[day],
                                                            enabled: e.target.checked
                                                        }
                                                    }
                                                })}
                                            />
                                        }
                                        label={day}
                                        sx={{ minWidth: 120 }}
                                    />
                                    {formData.availability[day]?.enabled && (
                                        <>
                                            <TextField
                                                type="time"
                                                size="small"
                                                value={formData.availability[day]?.start || '09:00'}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    availability: {
                                                        ...formData.availability,
                                                        [day]: {
                                                            ...formData.availability[day],
                                                            start: e.target.value
                                                        }
                                                    }
                                                })}
                                            />
                                            <Typography variant="body2">to</Typography>
                                            <TextField
                                                type="time"
                                                size="small"
                                                value={formData.availability[day]?.end || '18:00'}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    availability: {
                                                        ...formData.availability,
                                                        [day]: {
                                                            ...formData.availability[day],
                                                            end: e.target.value
                                                        }
                                                    }
                                                })}
                                            />
                                        </>
                                    )}
                                </Box>
                            ))}
                        </Box>

                        {/* Timezone */}
                        <TextField
                            label="Timezone"
                            select
                            fullWidth
                            value={formData.timezone}
                            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                            helperText="Mandatory to correctly assess if the human is available"
                        >
                            <MenuItem value="UTC">UTC</MenuItem>
                            <MenuItem value="America/New_York">America/New_York (EST)</MenuItem>
                            <MenuItem value="America/Los_Angeles">America/Los_Angeles (PST)</MenuItem>
                            <MenuItem value="Europe/London">Europe/London (GMT)</MenuItem>
                            <MenuItem value="Asia/Kolkata">Asia/Kolkata (IST)</MenuItem>
                        </TextField>

                        {/* Unavailable Message */}
                        <TextField
                            label="Human Not Available Message"
                            fullWidth
                            multiline
                            rows={2}
                            value={formData.unavailable_message}
                            onChange={(e) => setFormData({ ...formData, unavailable_message: e.target.value })}
                            helperText="Mandatory to ensure a smooth experience when the human is not available"
                        />

                        {editingTransfer && (
                            <Alert severity="info" icon={<Warning />}>
                                <Typography variant="body2">
                                    <strong>Used in Agents:</strong> This action can be assigned to agents in their settings.
                                </Typography>
                            </Alert>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
