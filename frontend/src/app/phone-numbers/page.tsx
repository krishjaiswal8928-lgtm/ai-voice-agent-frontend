'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Phone as PhoneIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { NavigationLayout } from '@/components/NavigationLayout';
import { phoneNumberAPI, sipTrunkAPI } from '@/lib/api';

interface PhoneNumber {
    id: string;
    phone_number: string;
    display_name?: string;
    label?: string;
    provider: string;
    is_active: boolean;
    assigned_agents?: string[];
    type: 'provider' | 'sip';
    connection_status?: string;
    sip_domain?: string;
}

export default function PhoneNumbersPage() {
    const router = useRouter();
    const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPhoneNumbers();
    }, []);

    const fetchPhoneNumbers = async () => {
        try {
            setLoading(true);

            // Fetch both provider numbers and SIP trunks
            const [providerResponse, sipResponse] = await Promise.all([
                phoneNumberAPI.getAll().catch(() => ({ data: [] })),
                sipTrunkAPI.getAll().catch(() => ({ data: [] }))
            ]);

            // Combine both lists
            const providerNumbers = (providerResponse.data || []).map((phone: any) => ({
                ...phone,
                type: 'provider' as const,
                display_name: phone.display_name || phone.phone_number
            }));

            const sipTrunks = (sipResponse.data || []).map((trunk: any) => ({
                ...trunk,
                type: 'sip' as const,
                provider: 'SIP Trunk',
                display_name: trunk.label,
                assigned_agents: trunk.assigned_agent_id ? [trunk.assigned_agent_id] : []
            }));

            setPhoneNumbers([...providerNumbers, ...sipTrunks]);
            setError('');
        } catch (err) {
            console.error('Error fetching phone numbers:', err);
            setError('Failed to load phone numbers');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this phone number?')) {
            try {
                await phoneNumberAPI.delete(id);
                fetchPhoneNumbers();
            } catch (err) {
                console.error('Error deleting phone number:', err);
                alert('Failed to delete phone number');
            }
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, position: 'relative', zIndex: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#111827' }}>
                        Phone Numbers
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => router.push('/phone-numbers/create')}
                        sx={{
                            bgcolor: '#6366f1',
                            '&:hover': { bgcolor: '#4f46e5' }
                        }}
                    >
                        Add Phone Number
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                        <CircularProgress sx={{ color: '#6366f1' }} />
                    </Box>
                ) : phoneNumbers.length === 0 ? (
                    <Card sx={{ textAlign: 'center', p: 5 }}>
                        <PhoneIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                        <Typography variant="h6" color="textSecondary" gutterBottom>
                            No phone numbers configured
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                            Add a virtual phone number to start making calls with your agents.
                        </Typography>
                        <Button
                            variant="outlined"
                            onClick={() => router.push('/phone-numbers/create')}
                        >
                            Configure First Number
                        </Button>
                    </Card>
                ) : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Display Name</TableCell>
                                    <TableCell>Phone Number</TableCell>
                                    <TableCell>Provider</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Assigned Agents</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {phoneNumbers.map((phone) => (
                                    <TableRow key={phone.id}>
                                        <TableCell sx={{ fontWeight: 500 }}>{phone.display_name}</TableCell>
                                        <TableCell>{phone.phone_number}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={phone.provider.toUpperCase()}
                                                size="small"
                                                variant="outlined"
                                                sx={{
                                                    bgcolor: phone.type === 'sip' ? '#f0f9ff' : 'transparent',
                                                    borderColor: phone.type === 'sip' ? '#6366f1' : 'default'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {phone.type === 'sip' ? (
                                                // Show connection status for SIP trunks
                                                phone.connection_status === 'connected' ? (
                                                    <Chip
                                                        icon={<CheckCircleIcon />}
                                                        label="Connected"
                                                        color="success"
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                ) : phone.connection_status === 'disconnected' ? (
                                                    <Chip
                                                        icon={<CancelIcon />}
                                                        label="Disconnected"
                                                        color="error"
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                ) : phone.connection_status === 'error' ? (
                                                    <Chip
                                                        icon={<CancelIcon />}
                                                        label="Error"
                                                        color="warning"
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                ) : (
                                                    <Chip
                                                        label="Pending"
                                                        color="default"
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                )
                                            ) : (
                                                // Show active/inactive for provider numbers
                                                phone.is_active ? (
                                                    <Chip
                                                        icon={<CheckCircleIcon />}
                                                        label="Active"
                                                        color="success"
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                ) : (
                                                    <Chip
                                                        icon={<CancelIcon />}
                                                        label="Inactive"
                                                        color="default"
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                )
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {phone.assigned_agents && phone.assigned_agents.length > 0 ? (
                                                <Chip label={`${phone.assigned_agents.length} Agents`} size="small" />
                                            ) : (
                                                <Typography variant="caption" color="textSecondary">None</Typography>
                                            )}
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                onClick={() => router.push(`/phone-numbers/edit/${phone.id}`)}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleDelete(phone.id)}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
        </NavigationLayout>
    );
}