'use client';

import { useState, useEffect } from 'react';
import {
    Box,
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    RadioGroup,
    Radio,
    FormLabel,
} from '@mui/material';
import {
    Add,
    Delete,
    Phone,
    Edit,
} from '@mui/icons-material';
import { NavigationLayout } from '@/components/NavigationLayout';
import api from '@/lib/api';

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
    const [formData, setFormData] = useState<{
        name: string;
        phone_number: string;
        sip_uri: string;
        transfer_mode: 'blind' | 'warm';
        trying_message: string;
        failed_message: string;
        availability: { [key: string]: { enabled: boolean; start: string; end: string } };
        timezone: string;
        unavailable_message: string;
    }>({
        name: '',
        phone_number: '',
        sip_uri: '',
        transfer_mode: 'blind' as 'blind' | 'warm',
        trying_message: 'Let me transfer you to a human. Please hold on.',
        failed_message: "Sorry, I couldn't transfer you. Would you like to continue the conversation with me or try again later?",
        availability: DAYS.reduce((acc, day) => ({
            ...acc,
            [day]: { enabled: day !== 'Saturday' && day !== 'Sunday', start: '09:00', end: '18:00' }
        }), {} as { [key: string]: { enabled: boolean; start: string; end: string } }),
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
                }), {} as { [key: string]: { enabled: boolean; start: string; end: string } }),
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
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>
                            Call Transfers
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280', mt: 1 }}>
                            Configure intelligent transfer actions for your AI agents
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => handleOpenDialog()}
                        sx={{
                            px: 3,
                            py: 1.5,
                            bgcolor: '#6366f1',
                            '&:hover': {
                                bgcolor: '#4f46e5',
                            }
                        }}
                    >
                        Create Transfer Action
                    </Button>
                </Box>

                {/* Transfer Cards */}
                {transfers.length === 0 ? (
                    <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(99,102,241,0.1)', position: 'relative', zIndex: 1 }}>
                        <CardContent sx={{ textAlign: 'center', py: 12 }}>
                            <Phone sx={{ fontSize: 80, color: '#6366f1', mb: 3, opacity: 0.5 }} />
                            <Typography variant="h5" fontWeight="700" gutterBottom sx={{ color: '#111827' }}>
                                No Transfer Actions Yet
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                                Create your first transfer action to enable intelligent human handoff
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={() => handleOpenDialog()}
                                sx={{
                                    px: 3,
                                    py: 1.5,
                                    bgcolor: '#6366f1',
                                    '&:hover': {
                                        bgcolor: '#4f46e5',
                                    }
                                }}
                            >
                                Create Transfer Action
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Grid container spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
                        {transfers.map((transfer, index) => (
                            <Grid item xs={12} md={6} key={transfer.id}>
                                <Card sx={{
                                    bgcolor: '#ffffff',
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 1px 3px rgba(99,102,241,0.1)',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        boxShadow: '0 4px 12px rgba(99,102,241,0.15)',
                                        transform: 'translateY(-2px)',
                                    }
                                }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                                            <Box>
                                                <Typography variant="h6" fontWeight="700" gutterBottom sx={{ color: '#111827' }}>
                                                    {transfer.name}
                                                </Typography>
                                                <Chip
                                                    label={transfer.transfer_mode === 'blind' ? 'Blind Transfer' : 'Warm Transfer'}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: transfer.transfer_mode === 'blind' ? '#6366f1' : '#ec4899',
                                                        color: 'white',
                                                        fontWeight: 600
                                                    }}
                                                />
                                            </Box>
                                            <Box>
                                                <IconButton size="small" onClick={() => handleOpenDialog(transfer)} sx={{ color: '#6366f1' }}>
                                                    <Edit />
                                                </IconButton>
                                                <IconButton size="small" onClick={() => handleDelete(transfer.id)} sx={{ color: '#ef4444' }}>
                                                    <Delete />
                                                </IconButton>
                                            </Box>
                                        </Box>

                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                <strong>Target:</strong> {transfer.phone_number || transfer.sip_uri || 'Not configured'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                <strong>Timezone:</strong> {transfer.timezone}
                                            </Typography>
                                        </Box>

                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block" mb={1} fontWeight={600}>
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
                                                            sx={{
                                                                bgcolor: '#22c55e',
                                                                color: 'white',
                                                                fontWeight: 600,
                                                                fontSize: '0.7rem'
                                                            }}
                                                        />
                                                    ) : null;
                                                })}
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* Create/Edit Dialog */}
                <Dialog
                    open={openDialog}
                    onClose={() => setOpenDialog(false)}
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
                        {editingTransfer ? 'Edit Transfer Action' : 'Create Transfer Action'}
                    </DialogTitle>
                    <DialogContent sx={{ pt: 3 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <TextField
                                label="Action Name"
                                fullWidth
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Transfer to Sales Team"
                                required
                            />

                            <Box>
                                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
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

                            <Box>
                                <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>Transfer Mode</FormLabel>
                                <RadioGroup
                                    value={formData.transfer_mode}
                                    onChange={(e) => setFormData({ ...formData, transfer_mode: e.target.value as 'blind' | 'warm' })}
                                >
                                    <FormControlLabel value="blind" control={<Radio />} label="Blind Transfer (Direct)" />
                                    <FormControlLabel value="warm" control={<Radio />} label="Warm Transfer (With Introduction)" />
                                </RadioGroup>
                            </Box>

                            <TextField
                                label="Trying to Reach Message"
                                fullWidth
                                multiline
                                rows={2}
                                value={formData.trying_message}
                                onChange={(e) => setFormData({ ...formData, trying_message: e.target.value })}
                            />

                            <TextField
                                label="Failed to Answer Message"
                                fullWidth
                                multiline
                                rows={2}
                                value={formData.failed_message}
                                onChange={(e) => setFormData({ ...formData, failed_message: e.target.value })}
                            />

                            <Box>
                                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                                    Availability Schedule
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

                            <TextField
                                label="Timezone"
                                select
                                fullWidth
                                value={formData.timezone}
                                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                            >
                                <MenuItem value="UTC">UTC</MenuItem>
                                <MenuItem value="America/New_York">America/New_York (EST)</MenuItem>
                                <MenuItem value="America/Los_Angeles">America/Los_Angeles (PST)</MenuItem>
                                <MenuItem value="Europe/London">Europe/London (GMT)</MenuItem>
                                <MenuItem value="Asia/Kolkata">Asia/Kolkata (IST)</MenuItem>
                            </TextField>

                            <TextField
                                label="Unavailable Message"
                                fullWidth
                                multiline
                                rows={2}
                                value={formData.unavailable_message}
                                onChange={(e) => setFormData({ ...formData, unavailable_message: e.target.value })}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={() => setOpenDialog(false)} sx={{ color: '#6b7280' }}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            variant="contained"
                            sx={{
                                px: 4,
                                bgcolor: '#6366f1',
                                '&:hover': {
                                    bgcolor: '#4f46e5',
                                }
                            }}
                        >
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </NavigationLayout>
    );
}
