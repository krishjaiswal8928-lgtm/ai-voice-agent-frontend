'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    IconButton
} from '@mui/material';
import {
    ArrowBack,
    Refresh,
    Settings,
    CheckCircle,
    Cancel,
    Phone
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { NavigationLayout } from '@/components/NavigationLayout';
import { integrationAPI, voiceAPI } from '@/lib/api';

interface PhoneNumber {
    sid: string;
    phone_number: string;
    friendly_name: string;
    capabilities: any;
    imported: boolean;
    assigned_agent_id?: string;
}

export default function TwilioDashboardPage() {
    const router = useRouter();
    const [integration, setIntegration] = useState<any>(null);
    const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
    const [agents, setAgents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState('');
    const [configureModal, setConfigureModal] = useState(false);
    const [selectedNumber, setSelectedNumber] = useState<PhoneNumber | null>(null);
    const [selectedAgent, setSelectedAgent] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [importing, setImporting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Get all integrations
            const intResponse = await integrationAPI.getAll();
            const twilioInt = intResponse.data.find((i: any) => i.provider === 'twilio');

            if (!twilioInt) {
                router.push('/integrations/twilio/connect');
                return;
            }

            setIntegration(twilioInt);

            // Fetch phone numbers
            await syncPhoneNumbers(twilioInt.id);

            // Fetch agents
            const agentsResponse = await voiceAPI.getCustomAgents();
            setAgents(agentsResponse.data);

            setError('');
        } catch (err: any) {
            console.error('Error fetching data:', err);
            // Check for specific error details from the backend
            if (err.response?.data?.detail) {
                setError(`Failed to load Twilio integration: ${err.response.data.detail}`);
            } else {
                setError(`Failed to load Twilio integration: ${err.message || 'Unknown error'}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const syncPhoneNumbers = async (integrationId: string) => {
        try {
            setSyncing(true);
            const response = await integrationAPI.fetchPhoneNumbers(integrationId);
            setPhoneNumbers(response.data);
        } catch (err) {
            console.error('Error syncing phone numbers:', err);
            throw err;
        } finally {
            setSyncing(false);
        }
    };

    const handleConfigure = (number: PhoneNumber) => {
        setSelectedNumber(number);
        setDisplayName(number.friendly_name);
        setSelectedAgent('');
        setConfigureModal(true);
    };

    const handleImport = async () => {
        if (!selectedNumber || !integration) return;

        setImporting(true);
        try {
            await integrationAPI.importPhoneNumber(integration.id, {
                phone_number_sid: selectedNumber.sid,
                agent_id: selectedAgent || undefined,
                display_name: displayName
            });

            setConfigureModal(false);
            await syncPhoneNumbers(integration.id);

        } catch (err: any) {
            console.error('Import error:', err);
            alert(err.response?.data?.detail || 'Failed to import phone number');
        } finally {
            setImporting(false);
        }
    };

    const handleDisconnect = async () => {
        if (!integration || !confirm('Are you sure you want to disconnect your Twilio account?')) {
            return;
        }

        try {
            await integrationAPI.disconnect(integration.id);
            router.push('/integrations');
        } catch (err) {
            alert('Failed to disconnect');
        }
    };

    if (loading) {
        return (
            <NavigationLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <CircularProgress />
                </Box>
            </NavigationLayout>
        );
    }

    return (
        <NavigationLayout>
            <Box sx={{ p: 3 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => router.push('/integrations')}
                    sx={{ mb: 3 }}
                >
                    Back to Integrations
                </Button>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box sx={{ fontSize: 40, mr: 2 }}>📞</Box>
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                        Twilio Integration
                                    </Typography>
                                    <Chip
                                        icon={<CheckCircle />}
                                        label="Connected"
                                        color="success"
                                        size="small"
                                        sx={{ mt: 1 }}
                                    />
                                </Box>
                            </Box>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={handleDisconnect}
                            >
                                Disconnect
                            </Button>
                        </Box>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                Phone Numbers
                            </Typography>
                            <Button
                                startIcon={syncing ? <CircularProgress size={20} /> : <Refresh />}
                                onClick={() => syncPhoneNumbers(integration.id)}
                                disabled={syncing}
                            >
                                Sync Numbers
                            </Button>
                        </Box>

                        {phoneNumbers.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 5 }}>
                                <Phone sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                                <Typography variant="h6" color="textSecondary">
                                    No phone numbers found
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Purchase phone numbers in your Twilio account
                                </Typography>
                            </Box>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Phone Number</TableCell>
                                            <TableCell>Friendly Name</TableCell>
                                            <TableCell>Capabilities</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell align="right">Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {phoneNumbers.map((number) => (
                                            <TableRow key={number.sid}>
                                                <TableCell sx={{ fontWeight: 500 }}>{number.phone_number}</TableCell>
                                                <TableCell>{number.friendly_name}</TableCell>
                                                <TableCell>
                                                    {number.capabilities?.voice && <Chip label="Voice" size="small" sx={{ mr: 0.5 }} />}
                                                    {number.capabilities?.sms && <Chip label="SMS" size="small" />}
                                                </TableCell>
                                                <TableCell>
                                                    {number.imported ? (
                                                        <Chip
                                                            icon={<CheckCircle />}
                                                            label="Imported"
                                                            color="success"
                                                            size="small"
                                                        />
                                                    ) : (
                                                        <Chip
                                                            icon={<Cancel />}
                                                            label="Not Imported"
                                                            size="small"
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {number.imported ? (
                                                        <Button
                                                            size="small"
                                                            onClick={() => router.push('/phone-numbers')}
                                                        >
                                                            View
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="contained"
                                                            size="small"
                                                            onClick={() => handleConfigure(number)}
                                                            sx={{
                                                                bgcolor: '#F22F46',
                                                                '&:hover': { bgcolor: '#d12a3d' }
                                                            }}
                                                        >
                                                            Configure
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Configure Modal */}
                <Dialog open={configureModal} onClose={() => setConfigureModal(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Configure Phone Number</DialogTitle>
                    <DialogContent>
                        <Box sx={{ pt: 2 }}>
                            <Alert severity="info" sx={{ mb: 3 }}>
                                Webhook will be automatically configured for this number
                            </Alert>

                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Phone Number
                            </Typography>
                            <Typography variant="h6" sx={{ mb: 3 }}>
                                {selectedNumber?.phone_number}
                            </Typography>

                            <TextField
                                label="Display Name"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                fullWidth
                                sx={{ mb: 3 }}
                            />

                            <FormControl fullWidth>
                                <InputLabel>Assign Agent (Optional)</InputLabel>
                                <Select
                                    value={selectedAgent}
                                    onChange={(e) => setSelectedAgent(e.target.value)}
                                    label="Assign Agent (Optional)"
                                >
                                    <MenuItem value="">
                                        <em>None</em>
                                    </MenuItem>
                                    {agents.map((agent) => (
                                        <MenuItem key={agent.id} value={agent.id}>
                                            {agent.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setConfigureModal(false)}>Cancel</Button>
                        <Button
                            variant="contained"
                            onClick={handleImport}
                            disabled={importing}
                            sx={{
                                bgcolor: '#F22F46',
                                '&:hover': { bgcolor: '#d12a3d' }
                            }}
                        >
                            {importing ? <CircularProgress size={20} /> : 'Import & Configure'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </NavigationLayout>
    );
}
