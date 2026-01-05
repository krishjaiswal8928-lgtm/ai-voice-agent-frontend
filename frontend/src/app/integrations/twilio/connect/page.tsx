'use client';

import React, { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    TextField,
    Button,
    Alert,
    CircularProgress,
    Link,
    Stepper,
    Step,
    StepLabel
} from '@mui/material';
import { ArrowBack, CheckCircle } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { NavigationLayout } from '@/components/NavigationLayout';
import { integrationAPI } from '@/lib/api';

function TwilioConnectPage() {
    const router = useRouter();
    const [accountSid, setAccountSid] = useState('');
    const [authToken, setAuthToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleConnect = async () => {
        if (!accountSid || !authToken) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await integrationAPI.connect({
                provider: 'twilio',
                credentials: {
                    account_sid: accountSid,
                    auth_token: authToken
                }
            });

            setSuccess(true);

            setTimeout(() => {
                router.push('/integrations/twilio');
            }, 2000);

        } catch (err: any) {
            console.error('Connection error:', err);
            const errorMsg = err.response?.data?.detail || 'Failed to connect to Twilio. Please check your credentials.';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <NavigationLayout>
                <Box sx={{
                    p: 3,
                    background: '#f5f5f5',
                    minHeight: '100vh',
                    color: '#000000',
                    width: '100%',
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
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
                    <Card sx={{ maxWidth: 500, textAlign: 'center', p: 4, position: 'relative', zIndex: 1 }}>
                        <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                            Successfully Connected!
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                            Your Twilio account is now connected. Redirecting to dashboard...
                        </Typography>
                        <CircularProgress sx={{ mt: 3 }} />
                    </Card>
                </Box>
            </NavigationLayout>
        );
    }

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
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => router.push('/integrations')}
                    sx={{ mb: 3, position: 'relative', zIndex: 1 }}
                >
                    Back to Integrations
                </Button>

                <Box sx={{ maxWidth: 800, mx: 'auto', position: 'relative', zIndex: 1 }}>
                    <Card>
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ mb: 4, textAlign: 'center' }}>
                                <Box sx={{ fontSize: 60, mb: 2 }}>📞</Box>
                                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    Connect Twilio Account
                                </Typography>
                                <Typography variant="body1" color="textSecondary">
                                    Enter your Twilio credentials to connect your account
                                </Typography>
                            </Box>

                            <Stepper activeStep={0} sx={{ mb: 4 }}>
                                <Step>
                                    <StepLabel>Enter Credentials</StepLabel>
                                </Step>
                                <Step>
                                    <StepLabel>Verify Connection</StepLabel>
                                </Step>
                                <Step>
                                    <StepLabel>Import Phone Numbers</StepLabel>
                                </Step>
                            </Stepper>

                            {error && (
                                <Alert severity="error" sx={{ mb: 3 }}>
                                    {error}
                                </Alert>
                            )}

                            <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                    Where to find your credentials:
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    1. Go to{' '}
                                    <Link href="https://console.twilio.com/" target="_blank" rel="noopener">
                                        Twilio Console
                                    </Link>
                                    <br />
                                    2. Find &quot;Account SID&quot; and &quot;Auth Token&quot; on the dashboard
                                    <br />
                                    3. Copy and paste them below
                                </Typography>
                            </Box>

                            <TextField
                                label="Account SID"
                                placeholder="AC..."
                                value={accountSid}
                                onChange={(e) => setAccountSid(e.target.value)}
                                fullWidth
                                sx={{ mb: 3 }}
                                helperText="Starts with 'AC' followed by 32 characters"
                            />

                            <TextField
                                label="Auth Token"
                                type="password"
                                placeholder="Enter your Twilio Auth Token"
                                value={authToken}
                                onChange={(e) => setAuthToken(e.target.value)}
                                fullWidth
                                sx={{ mb: 4 }}
                                helperText="Your secret authentication token from Twilio"
                            />

                            <Button
                                variant="contained"
                                fullWidth
                                size="large"
                                onClick={handleConnect}
                                disabled={loading || !accountSid || !authToken}
                                sx={{
                                    py: 1.5,
                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                    }
                                }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Connect Twilio Account'}
                            </Button>

                            <Box sx={{ mt: 3, p: 2, bgcolor: '#fff3cd', borderRadius: 1, border: '1px solid #ffc107' }}>
                                <Typography variant="caption" color="textSecondary">
                                    <strong>Note:</strong> Your credentials are encrypted and stored securely. We use them only to fetch your phone numbers and configure webhooks.
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </NavigationLayout>
    );
}

export default TwilioConnectPage;
