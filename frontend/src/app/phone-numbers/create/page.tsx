'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Alert,
    CircularProgress,
    Checkbox,
    ListItemText,
    OutlinedInput,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    InputAdornment,
    Fade,
    Paper,
    Stack,
    Divider,
    Chip
} from '@mui/material';
import {
    ContentCopy as CopyIcon,
    CheckCircle as CheckIcon,
    ArrowBack as ArrowBackIcon,
    ArrowForward as ArrowForwardIcon,
    Phone as PhoneIcon,
    Cloud as CloudIcon,
    Cable as CableIcon,
    Settings as SettingsIcon,
    Label as LabelIcon,
    People as PeopleIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { NavigationLayout } from '@/components/NavigationLayout';
import { ExotelForm } from '@/components/phone-numbers/forms/ExotelForm';
import { TwilioForm } from '@/components/phone-numbers/forms/TwilioForm';
import { SIPTrunkForm } from '@/components/phone-numbers/forms/SIPTrunkForm';
import { phoneNumberAPI, voiceAPI, sipTrunkAPI } from '@/lib/api';

export default function CreatePhoneNumberPage() {
    const router = useRouter();
    const [sourceType, setSourceType] = useState<'provider' | 'sip' | ''>(''); // NEW: First choice
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [agents, setAgents] = useState<any[]>([]);

    // Form State
    const [provider, setProvider] = useState('');
    const [credentials, setCredentials] = useState<any>({});
    const [basicInfo, setBasicInfo] = useState({
        display_name: '',
        phone_number: ''
    });
    const [assignedAgents, setAssignedAgents] = useState<string[]>([]);
    const [createdSipDomain, setCreatedSipDomain] = useState<string>('');
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    useEffect(() => {
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

    const getSteps = () => {
        if (sourceType === 'provider') {
            return [
                { label: 'Select Provider', icon: CloudIcon },
                { label: 'Configure', icon: SettingsIcon },
                { label: 'Basic Info', icon: LabelIcon },
                { label: 'Assign Agents', icon: PeopleIcon }
            ];
        } else if (sourceType === 'sip') {
            return [
                { label: 'Configure SIP', icon: SettingsIcon },
                { label: 'Assign Agents', icon: PeopleIcon }
            ];
        }
        return [];
    };

    const steps = getSteps();

    const handleNext = async () => {
        if (activeStep === steps.length - 1) {
            await handleSubmit();
        } else {
            if (!validateStep()) return;
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        if (activeStep === 0 && sourceType) {
            // Go back to source type selection
            setSourceType('');
            setProvider('');
            setCredentials({});
        } else {
            setActiveStep((prev) => prev - 1);
        }
    };

    const validateStep = () => {
        setError('');

        if (sourceType === 'provider') {
            if (activeStep === 0) {
                if (!provider) {
                    setError('Please select a provider');
                    return false;
                }
            } else if (activeStep === 1) {
                if (provider === 'exotel') {
                    if (!credentials.api_key || !credentials.api_token || !credentials.account_sid || !credentials.exotel_number) {
                        setError('Please fill in all required fields');
                        return false;
                    }
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
        } else if (sourceType === 'sip') {
            if (activeStep === 0) {
                if (!credentials.phone_number || !credentials.label || !credentials.outbound_address) {
                    setError('Please fill in all required fields (Phone Number, Label, and Outbound Address)');
                    return false;
                }
            }
        }

        return true;
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        try {
            if (sourceType === 'sip') {
                const sipPayload = {
                    phone_number: credentials.phone_number,
                    label: credentials.label,
                    outbound_address: credentials.outbound_address,
                    inbound_transport: credentials.inbound_transport || 'tcp',
                    outbound_transport: credentials.outbound_transport || 'tcp',
                    inbound_media_encryption: credentials.inbound_media_encryption || 'disabled',
                    outbound_media_encryption: credentials.outbound_media_encryption || 'disabled',
                    auth_username: credentials.auth_username || null,
                    auth_password: credentials.auth_password || null,
                    custom_headers: credentials.custom_headers || null,
                    assigned_agent_id: assignedAgents.length > 0 ? assignedAgents[0] : null
                };

                const response = await sipTrunkAPI.create(sipPayload);
                setCreatedSipDomain(response.data.sip_domain);
                setShowSuccessDialog(true);
            } else {
                const payload = {
                    phone_number: basicInfo.phone_number,
                    provider: provider,
                    display_name: basicInfo.display_name,
                    credentials: credentials,
                    is_active: true
                };

                const response = await phoneNumberAPI.create(payload);
                const phoneId = response.data.id;

                if (assignedAgents.length > 0) {
                    for (const agentId of assignedAgents) {
                        await phoneNumberAPI.assignAgent(phoneId, agentId);
                    }
                }

                router.push('/phone-numbers');
            }
        } catch (err: any) {
            console.error('Error creating phone number:', err);
            setError(err.response?.data?.detail || 'Failed to create phone number');
        } finally {
            setLoading(false);
        }
    };

    const renderSourceTypeSelection = () => (
        <Fade in timeout={500}>
            <Box>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: '#1a1a1a', textAlign: 'center' }}>
                    How would you like to add a phone number?
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
                    Choose your preferred method to connect phone numbers
                </Typography>

                <Stack spacing={3} sx={{ maxWidth: 800, mx: 'auto' }}>
                    {/* From Providers Option */}
                    <Paper
                        elevation={sourceType === 'provider' ? 8 : 2}
                        sx={{
                            p: 4,
                            cursor: 'pointer',
                            border: sourceType === 'provider' ? '3px solid #000' : '2px solid transparent',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 8
                            }
                        }}
                        onClick={() => {
                            setSourceType('provider');
                            setActiveStep(0);
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                            <Box
                                sx={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: 2,
                                    bgcolor: '#f5f5f5',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <CloudIcon sx={{ fontSize: 36, color: '#000' }} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                    From Providers
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Import phone numbers from Twilio, Exotel, or other providers
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                    <Chip label="Twilio" size="small" />
                                    <Chip label="Exotel" size="small" />
                                    <Chip label="Knowlarity" size="small" variant="outlined" />
                                </Stack>
                            </Box>
                            {sourceType === 'provider' && (
                                <CheckIcon sx={{ color: '#4caf50', fontSize: 32 }} />
                            )}
                        </Box>
                    </Paper>

                    {/* SIP Trunks Option */}
                    <Paper
                        elevation={sourceType === 'sip' ? 8 : 2}
                        sx={{
                            p: 4,
                            cursor: 'pointer',
                            border: sourceType === 'sip' ? '3px solid #000' : '2px solid transparent',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 8
                            }
                        }}
                        onClick={() => {
                            setSourceType('sip');
                            setProvider('sip');
                            setActiveStep(0);
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                            <Box
                                sx={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: 2,
                                    bgcolor: '#f5f5f5',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <CableIcon sx={{ fontSize: 36, color: '#000' }} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                    SIP Trunks
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Connect your existing PBX system (3CX, FreePBX, Ziwo, etc.)
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                    <Chip label="3CX" size="small" />
                                    <Chip label="FreePBX" size="small" />
                                    <Chip label="Ziwo" size="small" />
                                    <Chip label="Custom" size="small" />
                                </Stack>
                            </Box>
                            {sourceType === 'sip' && (
                                <CheckIcon sx={{ color: '#4caf50', fontSize: 32 }} />
                            )}
                        </Box>
                    </Paper>
                </Stack>
            </Box>
        </Fade>
    );

    const renderStepContent = (step: number) => {
        if (sourceType === 'provider') {
            switch (step) {
                case 0:
                    return (
                        <Fade in timeout={500}>
                            <Box>
                                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1a1a1a' }}>
                                    Select Your Provider
                                </Typography>
                                <Stack spacing={2}>
                                    {[
                                        { value: 'exotel', label: 'Exotel', subtitle: 'India-based provider', available: true },
                                        { value: 'twilio', label: 'Twilio', subtitle: 'Global provider', available: true },
                                        { value: 'knowlarity', label: 'Knowlarity', subtitle: 'Coming Soon', available: false }
                                    ].map((option) => (
                                        <Paper
                                            key={option.value}
                                            elevation={provider === option.value ? 8 : 1}
                                            sx={{
                                                p: 3,
                                                cursor: option.available ? 'pointer' : 'not-allowed',
                                                border: provider === option.value ? '2px solid #000' : '2px solid transparent',
                                                transition: 'all 0.3s ease',
                                                opacity: option.available ? 1 : 0.5,
                                                '&:hover': option.available ? {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: 6
                                                } : {}
                                            }}
                                            onClick={() => option.available && setProvider(option.value)}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Box>
                                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                        {option.label}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {option.subtitle}
                                                    </Typography>
                                                </Box>
                                                {provider === option.value && (
                                                    <CheckIcon sx={{ color: '#4caf50', fontSize: 32 }} />
                                                )}
                                            </Box>
                                        </Paper>
                                    ))}
                                </Stack>
                            </Box>
                        </Fade>
                    );
                case 1:
                    return (
                        <Fade in timeout={500}>
                            <Box>
                                {provider === 'exotel' && <ExotelForm data={credentials} onChange={setCredentials} />}
                                {provider === 'twilio' && <TwilioForm data={credentials} onChange={setCredentials} />}
                            </Box>
                        </Fade>
                    );
                case 2:
                    return (
                        <Fade in timeout={500}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#1a1a1a' }}>
                                    Basic Information
                                </Typography>
                                <TextField
                                    label="Phone Number"
                                    value={basicInfo.phone_number}
                                    disabled
                                    fullWidth
                                    helperText="Phone number from provider settings"
                                    sx={{ '& .MuiInputBase-root': { bgcolor: '#f5f5f5' } }}
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
                        </Fade>
                    );
                case 3:
                    return (
                        <Fade in timeout={500}>
                            <Box>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1a1a1a' }}>
                                    Assign AI Agents
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
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
                        </Fade>
                    );
                default:
                    return null;
            }
        } else if (sourceType === 'sip') {
            switch (step) {
                case 0:
                    return (
                        <Fade in timeout={500}>
                            <Box>
                                <SIPTrunkForm data={credentials} onChange={setCredentials} />
                            </Box>
                        </Fade>
                    );
                case 1:
                    return (
                        <Fade in timeout={500}>
                            <Box>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1a1a1a' }}>
                                    Assign AI Agents
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    Select which agent will handle calls from this SIP trunk.
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
                        </Fade>
                    );
                default:
                    return null;
            }
        }
        return null;
    };

    return (
        <NavigationLayout>
            <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#1a1a1a' }}>
                        Add Phone Number
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Connect a phone number to your AI voice agents
                    </Typography>
                </Box>

                {/* Source Type Selection or Stepper */}
                {!sourceType ? (
                    renderSourceTypeSelection()
                ) : (
                    <>
                        {/* Modern Stepper */}
                        <Box sx={{ mb: 4 }}>
                            <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                                {steps.map((step, index) => {
                                    const StepIcon = step.icon;
                                    const isActive = index === activeStep;
                                    const isCompleted = index < activeStep;

                                    return (
                                        <Box
                                            key={step.label}
                                            sx={{
                                                flex: 1,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                position: 'relative'
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 56,
                                                    height: 56,
                                                    borderRadius: '50%',
                                                    bgcolor: isActive ? '#000' : isCompleted ? '#4caf50' : '#e0e0e0',
                                                    color: isActive || isCompleted ? '#fff' : '#757575',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mb: 1,
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: isActive ? 4 : 0
                                                }}
                                            >
                                                {isCompleted ? <CheckIcon /> : <StepIcon />}
                                            </Box>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontWeight: isActive ? 600 : 400,
                                                    color: isActive ? '#000' : '#757575',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                {step.label}
                                            </Typography>
                                            {index < steps.length - 1 && (
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 28,
                                                        left: 'calc(50% + 28px)',
                                                        width: 'calc(100% - 56px)',
                                                        height: 2,
                                                        bgcolor: isCompleted ? '#4caf50' : '#e0e0e0',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    );
                                })}
                            </Stack>
                        </Box>

                        {/* Content Card */}
                        <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                            <Box sx={{ p: 4 }}>
                                {error && (
                                    <Alert severity="error" sx={{ mb: 3 }}>
                                        {error}
                                    </Alert>
                                )}

                                <Box sx={{ minHeight: 400 }}>
                                    {renderStepContent(activeStep)}
                                </Box>

                                {/* Navigation Buttons */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: '1px solid #e0e0e0' }}>
                                    <Button
                                        disabled={loading}
                                        onClick={handleBack}
                                        startIcon={<ArrowBackIcon />}
                                        sx={{ color: '#000', '&:hover': { bgcolor: '#f5f5f5' } }}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleNext}
                                        disabled={loading}
                                        endIcon={loading ? null : activeStep === steps.length - 1 ? <CheckIcon /> : <ArrowForwardIcon />}
                                        sx={{
                                            bgcolor: '#000',
                                            px: 4,
                                            '&:hover': { bgcolor: '#333' },
                                            '&:disabled': { bgcolor: '#e0e0e0' }
                                        }}
                                    >
                                        {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                                    </Button>
                                </Box>
                            </Box>
                        </Card>
                    </>
                )}

                {/* Success Dialog */}
                <Dialog
                    open={showSuccessDialog}
                    onClose={() => { }}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{ sx: { borderRadius: 2 } }}
                >
                    <DialogTitle sx={{ bgcolor: '#4caf50', color: 'white', display: 'flex', alignItems: 'center', gap: 1, py: 3 }}>
                        <CheckIcon sx={{ fontSize: 32 }} />
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                            SIP Trunk Created Successfully!
                        </Typography>
                    </DialogTitle>
                    <DialogContent sx={{ mt: 3, px: 4 }}>
                        <Alert severity="success" sx={{ mb: 3 }}>
                            Your SIP trunk has been created. Configure this SIP domain in your PBX system (3CX, FreePBX, etc.) to route calls to your AI agents.
                        </Alert>

                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                            Your SIP Domain:
                        </Typography>

                        <TextField
                            fullWidth
                            value={createdSipDomain}
                            InputProps={{
                                readOnly: true,
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => {
                                                navigator.clipboard.writeText(createdSipDomain);
                                                alert('SIP domain copied to clipboard!');
                                            }}
                                            edge="end"
                                        >
                                            <CopyIcon />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                                sx: {
                                    bgcolor: '#f5f5f5',
                                    fontFamily: 'monospace',
                                    fontSize: '1.1rem',
                                    fontWeight: 600
                                }
                            }}
                        />

                        <Paper sx={{ mt: 3, p: 3, bgcolor: '#f9f9f9' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                                Next Steps:
                            </Typography>
                            <Typography variant="body2" component="ol" sx={{ pl: 2, '& li': { mb: 1 } }}>
                                <li>Copy the SIP domain above</li>
                                <li>Open your PBX system (3CX, FreePBX, etc.)</li>
                                <li>Create a new SIP trunk</li>
                                <li>Configure it with the SIP domain</li>
                                <li>Route calls to your AI agents!</li>
                            </Typography>
                        </Paper>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button
                            variant="contained"
                            onClick={() => {
                                setShowSuccessDialog(false);
                                router.push('/phone-numbers');
                            }}
                            sx={{
                                bgcolor: '#000',
                                px: 4,
                                '&:hover': { bgcolor: '#333' }
                            }}
                        >
                            Go to Phone Numbers
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </NavigationLayout>
    );
}