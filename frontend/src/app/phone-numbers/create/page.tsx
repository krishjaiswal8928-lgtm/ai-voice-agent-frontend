'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Stepper,
    Step,
    StepLabel,
    Button,
    Card,
    CardContent,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Alert,
    CircularProgress,
    Grid,
    Checkbox,
    ListItemText,
    OutlinedInput
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { NavigationLayout } from '@/components/NavigationLayout';
import { ExotelForm } from '@/components/phone-numbers/forms/ExotelForm';
import { TwilioForm } from '@/components/phone-numbers/forms/TwilioForm';
import { phoneNumberAPI, voiceAPI } from '@/lib/api';

const steps = ['Select Provider', 'Configure Credentials', 'Basic Info', 'Assign Agents'];

export default function CreatePhoneNumberPage() {
    const router = useRouter();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [agents, setAgents] = useState<any[]>([]);

    // Form State
    const [provider, setProvider] = useState('');
    const [credentials, setCredentials] = useState<any>({});
    const [basicInfo, setBasicInfo] = useState({
        display_name: '',
        phone_number: '' // Will be populated from provider form
    });
    const [assignedAgents, setAssignedAgents] = useState<string[]>([]);

    useEffect(() => {
        // Fetch agents for assignment step
        const fetchAgents = async () => {
            try {
                const response = await voiceAPI.getCustomAgents();
                setAgents(response.data);
            } catch (err) {
                console.error('Error fetching agents:', err);
            }
        };
        fetchAgents();
    }, []);

    const handleNext = async () => {
        if (activeStep === steps.length - 1) {
            await handleSubmit();
        } else {
            if (!validateStep()) return;
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const validateStep = () => {
        setError('');
        if (activeStep === 0) {
            if (!provider) {
                setError('Please select a provider');
                return false;
            }
        } else if (activeStep === 1) {
            // Basic validation based on provider
            if (provider === 'exotel') {
                if (!credentials.api_key || !credentials.api_token || !credentials.account_sid || !credentials.exotel_number) {
                    setError('Please fill in all required fields');
                    return false;
                }
                // Auto-populate phone number for next steps
                setBasicInfo(prev => ({ ...prev, phone_number: credentials.exotel_number }));
            } else if (provider === 'twilio') {
                if (!credentials.account_sid || !credentials.auth_token || !credentials.phone_number) {
                    setError('Please fill in all required fields');
                    return false;
                }
                setBasicInfo(prev => ({ ...prev, phone_number: credentials.phone_number }));
            }
        } else if (activeStep === 2) {
            if (!basicInfo.display_name) {
                setError('Please enter a display name');
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        try {
            const payload = {
                phone_number: basicInfo.phone_number,
                provider: provider,
                display_name: basicInfo.display_name,
                credentials: credentials,
                is_active: true
            };

            const response = await phoneNumberAPI.create(payload);
            const phoneId = response.data.id;

            // Assign agents if selected
            if (assignedAgents.length > 0) {
                for (const agentId of assignedAgents) {
                    await phoneNumberAPI.assignAgent(phoneId, agentId);
                }
            }

            router.push('/phone-numbers');
        } catch (err: any) {
            console.error('Error creating phone number:', err);
            setError(err.response?.data?.detail || 'Failed to create phone number');
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                        <FormControl fullWidth>
                            <InputLabel>Select Provider</InputLabel>
                            <Select
                                value={provider}
                                label="Select Provider"
                                onChange={(e) => setProvider(e.target.value)}
                            >
                                <MenuItem value="exotel">Exotel (India)</MenuItem>
                                <MenuItem value="twilio">Twilio (Global)</MenuItem>
                                <MenuItem value="knowlarity" disabled>Knowlarity (Coming Soon)</MenuItem>
                                <MenuItem value="sip" disabled>Custom SIP (Coming Soon)</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                );
            case 1:
                return (
                    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                        {provider === 'exotel' && (
                            <ExotelForm data={credentials} onChange={setCredentials} />
                        )}
                        {provider === 'twilio' && (
                            <TwilioForm data={credentials} onChange={setCredentials} />
                        )}
                    </Box>
                );
            case 2:
                return (
                    <Box sx={{ maxWidth: 600, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            label="Phone Number"
                            value={basicInfo.phone_number}
                            disabled
                            fullWidth
                            helperText="Phone number from provider settings"
                        />
                        <TextField
                            label="Display Name"
                            placeholder="e.g., Sales Line 1"
                            value={basicInfo.display_name}
                            onChange={(e) => setBasicInfo({ ...basicInfo, display_name: e.target.value })}
                            fullWidth
                            required
                            helperText="A friendly name to identify this number"
                        />
                    </Box>
                );
            case 3:
                return (
                    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Select which agents can use this phone number for outbound calls.
                        </Typography>
                        <FormControl fullWidth>
                            <InputLabel>Assigned Agents</InputLabel>
                            <Select
                                multiple
                                value={assignedAgents}
                                onChange={(e) => setAssignedAgents(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                                input={<OutlinedInput label="Assigned Agents" />}
                                renderValue={(selected) => {
                                    if (selected.length === 0) return 'None';
                                    return selected.map(id => agents.find(a => a.id === id)?.name || id).join(', ');
                                }}
                            >
                                {agents.map((agent) => (
                                    <MenuItem key={agent.id} value={agent.id}>
                                        <Checkbox checked={assignedAgents.indexOf(agent.id) > -1} />
                                        <ListItemText primary={agent.name} secondary={agent.personality} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                );
            default:
                return null;
        }
    };

    return (
        <NavigationLayout>
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
                    Add Phone Number
                </Typography>

                <Card>
                    <CardContent sx={{ p: 4 }}>
                        <Stepper activeStep={activeStep} sx={{ mb: 5 }}>
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>

                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        )}

                        <Box sx={{ minHeight: 300 }}>
                            {renderStepContent(activeStep)}
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
                            <Button
                                disabled={activeStep === 0 || loading}
                                onClick={handleBack}
                            >
                                Back
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleNext}
                                disabled={loading}
                                sx={{
                                    bgcolor: '#000000',
                                    '&:hover': { bgcolor: '#333333' }
                                }}
                            >
                                {loading ? <CircularProgress size={24} /> : activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </NavigationLayout>
    );
}