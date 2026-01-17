'use client';

import React from 'react';
import { Box, Typography, Container, Card, CardContent } from '@mui/material';

export default function TermsPage() {
    return (
        <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 8 }}>
            <Container maxWidth="md">
                <Typography variant="h2" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                    Terms of Service
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 4 }}>
                    Last updated: January 17, 2026
                </Typography>

                <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            1. Acceptance of Terms
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280' }}>
                            By accessing and using AI Voice Agent, you accept and agree to be bound by these Terms of Service.
                            If you do not agree to these terms, please do not use our service.
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            2. Service Description
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280' }}>
                            AI Voice Agent provides AI-powered lead qualification, call transfer, and callback scheduling services.
                            We reserve the right to modify, suspend, or discontinue any part of the service at any time.
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            3. User Responsibilities
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280', mb: 2 }}>
                            You agree to:
                        </Typography>
                        <Typography component="ul" variant="body1" sx={{ color: '#6b7280', pl: 3 }}>
                            <li>Provide accurate account information</li>
                            <li>Maintain the security of your account</li>
                            <li>Comply with all applicable laws and regulations</li>
                            <li>Not use the service for illegal or unauthorized purposes</li>
                            <li>Obtain proper consent before recording calls</li>
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            4. Payment Terms
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280' }}>
                            Subscription fees are billed monthly or annually in advance. All fees are non-refundable except as required by law.
                            We reserve the right to change pricing with 30 days notice.
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            5. Cancellation Policy
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280' }}>
                            You may cancel your subscription at any time. Cancellations take effect at the end of the current billing period.
                            No refunds will be provided for partial months.
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            6. Intellectual Property
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280' }}>
                            All content, features, and functionality of the service are owned by AI Voice Agent and are protected by
                            copyright, trademark, and other intellectual property laws.
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            7. Limitation of Liability
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280' }}>
                            AI Voice Agent shall not be liable for any indirect, incidental, special, consequential, or punitive damages
                            resulting from your use of the service. Our total liability shall not exceed the amount paid by you in the 12 months
                            preceding the claim.
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            8. Termination
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280' }}>
                            We reserve the right to terminate or suspend your account immediately, without prior notice, for conduct that
                            violates these Terms or is harmful to other users, us, or third parties.
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            9. Contact Information
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280' }}>
                            For questions about these Terms of Service, please contact us at legal@aivoiceagent.com
                        </Typography>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
}
