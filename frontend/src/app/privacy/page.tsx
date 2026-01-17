'use client';

import React from 'react';
import { Box, Typography, Container, Card, CardContent } from '@mui/material';

export default function PrivacyPage() {
    return (
        <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 8 }}>
            <Container maxWidth="md">
                <Typography variant="h2" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                    Privacy Policy
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 4 }}>
                    Last updated: January 17, 2026
                </Typography>

                <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            1. Information We Collect
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280', mb: 2 }}>
                            We collect information that you provide directly to us, including:
                        </Typography>
                        <Typography component="ul" variant="body1" sx={{ color: '#6b7280', pl: 3 }}>
                            <li>Account information (name, email, phone number)</li>
                            <li>Call recordings and transcripts</li>
                            <li>Lead data and contact information</li>
                            <li>Usage data and analytics</li>
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            2. How We Use Your Information
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280', mb: 2 }}>
                            We use the information we collect to:
                        </Typography>
                        <Typography component="ul" variant="body1" sx={{ color: '#6b7280', pl: 3 }}>
                            <li>Provide and improve our services</li>
                            <li>Process AI-powered lead qualification</li>
                            <li>Generate analytics and reports</li>
                            <li>Communicate with you about your account</li>
                            <li>Ensure security and prevent fraud</li>
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            3. Data Security
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280' }}>
                            We implement industry-standard security measures to protect your data, including encryption at rest and in transit,
                            regular security audits, and access controls. All call recordings and sensitive data are encrypted using AES-256 encryption.
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            4. Data Retention
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280' }}>
                            We retain your data for as long as your account is active or as needed to provide services.
                            You can request deletion of your data at any time by contacting support@aivoiceagent.com.
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            5. Third-Party Services
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280' }}>
                            We use third-party services including Twilio for telephony, OpenAI for AI processing, and Google Cloud for infrastructure.
                            These providers are contractually obligated to protect your data.
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            6. Your Rights
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280', mb: 2 }}>
                            You have the right to:
                        </Typography>
                        <Typography component="ul" variant="body1" sx={{ color: '#6b7280', pl: 3 }}>
                            <li>Access your personal data</li>
                            <li>Correct inaccurate data</li>
                            <li>Request deletion of your data</li>
                            <li>Export your data</li>
                            <li>Opt-out of marketing communications</li>
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            7. Contact Us
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280' }}>
                            If you have questions about this Privacy Policy, please contact us at privacy@aivoiceagent.com
                        </Typography>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
}
