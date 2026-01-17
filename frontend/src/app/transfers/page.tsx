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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    RadioGroup,
    Radio,
    FormLabel,
    Alert,
    Fade,
    Zoom,
} from '@mui/material';
import {
    Add,
    Delete,
    Phone,
    Edit,
    FlashOn,
    CheckCircle,
    Schedule as ScheduleIcon,
} from '@mui/icons-material';
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
                            <FlashOn sx={{ color: '#8b5cf6', fontSize: '2rem' }} />
                            <Typography variant="h3" fontWeight="800" sx={{
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>
                                Call Transfers
                            </Typography>
                        </Box>
                        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                            Configure intelligent transfer actions for your AI agents
                        </Typography>
                    </Box>
                </Fade>

                {/* Action Button */}
                <Zoom in timeout={1000}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => handleOpenDialog()}
                            sx={{
                                px: 4,
                                py: 1.5,
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                                    boxShadow: '0 12px 32px rgba(139, 92, 246, 0.5)',
                                    transform: 'translateY(-2px)',
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Create Transfer Action
                        </Button>
                    </Box>
                </Zoom>

                {/* Transfer Cards */}
                {transfers.length === 0 ? (
                    <Fade in timeout={1200}>
                        <Card sx={{
                            borderRadius: '24px',
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                        }}>
                            <CardContent sx={{ textAlign: 'center', py: 12 }}>
                                <Phone sx={{ fontSize: 80, color: '#8b5cf6', mb: 3, opacity: 0.5 }} />
                                <Typography variant="h5" fontWeight="700" gutterBottom>
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
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                    }}
                                >
                                    Create Transfer Action
                                </Button>
                            </CardContent>
                        </Card>
                    </Fade>
                ) : (
                    <Grid container spacing={3}>
                        {transfers.map((transfer, index) => (
                            <Grid item xs={12} md={6} key={transfer.id}>
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
                                        <CardContent sx={{ p: 3 }}>
                                            <Box display="flex" justifyContent="space-between" alignItems="start" mb={3}>
                                                <Box>
                                                    <Typography variant="h5" fontWeight="700" gutterBottom>
                                                        {transfer.name}
                                                    </Typography>
                                                    <Chip
                                                        label={transfer.transfer_mode === 'blind' ? 'Blind Transfer' : 'Warm Transfer'}
                                                        size="small"
                                                        sx={{
                                                            background: transfer.transfer_mode === 'blind'
                                                                ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                                                                : 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                                                            color: 'white',
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                </Box>
                                                <Box>
                                                    <IconButton size="small" onClick={() => handleOpenDialog(transfer)} sx={{ color: '#8b5cf6' }}>
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
                                                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
                                </Zoom>
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
