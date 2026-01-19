'use client';

import React from 'react';
import { Box, Typography, Container, Card, CardContent } from '@mui/material';
import { LandingNav } from '@/components/LandingNav';
import { Footer } from '@/components/Footer';

export default function PrivacyPage() {
    return (
        <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
            <LandingNav />
            <Container maxWidth="md" sx={{ py: 8 }}>
                <Typography variant="h2" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                    Privacy Policy
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 4 }}>
                    Last updated: January 19, 2026
                </Typography>

                <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            1. Information We Collect
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280', mb: 2 }}>
                            SpeakSynth AI ("we", "our", or "us") collects information that you provide directly to us when using our AI voice agent platform:
                        </Typography>
                        <Typography component="ul" variant="body1" sx={{ color: '#6b7280', pl: 3 }}>
                            <li><strong>Account Information:</strong> Name, email address, phone number, company name, and billing details</li>
                            <li><strong>Call Data:</strong> Call recordings, transcripts, duration, timestamps, and phone numbers (with proper consent)</li>
                            <li><strong>Lead Information:</strong> Contact details, qualification scores, and conversation context</li>
                            <li><strong>Usage Data:</strong> Platform interactions, feature usage, and performance analytics</li>
                            <li><strong>Technical Data:</strong> IP address, browser type, device information, and cookies</li>
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            2. Call Recording & User Consent
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280', mb: 2 }}>
                            <strong>Important:</strong> We take call recording compliance seriously:
                        </Typography>
                        <Typography component="ul" variant="body1" sx={{ color: '#6b7280', pl: 3 }}>
                            <li>You are responsible for obtaining proper consent before recording calls in your jurisdiction</li>
                            <li>Our AI agents can announce call recording at the start of conversations</li>
                            <li>All call recordings are encrypted and stored securely</li>
                            <li>You can configure consent requirements in your agent settings</li>
                            <li>We comply with TCPA, GDPR, and other applicable regulations</li>
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            3. How We Use Your Information
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280', mb: 2 }}>
                            We use collected information for legitimate business purposes:
                        </Typography>
                        <Typography component="ul" variant="body1" sx={{ color: '#6b7280', pl: 3 }}>
                            <li>Provide AI-powered lead qualification and call management services</li>
                            <li>Process and analyze conversations for quality and training</li>
                            <li>Generate analytics, reports, and insights</li>
                            <li>Improve our AI models and service quality</li>
                            <li>Communicate with you about your account and service updates</li>
                            <li>Ensure security, prevent fraud, and enforce our Terms of Service</li>
                            <li>Comply with legal obligations and respond to lawful requests</li>
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            4. Data Security Practices
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280', mb: 2 }}>
                            We implement industry-leading security measures:
                        </Typography>
                        <Typography component="ul" variant="body1" sx={{ color: '#6b7280', pl: 3 }}>
                            <li><strong>Encryption:</strong> AES-256 encryption at rest and TLS 1.3 in transit</li>
                            <li><strong>Access Controls:</strong> Role-based access with multi-factor authentication</li>
                            <li><strong>Infrastructure:</strong> SOC 2 compliant cloud infrastructure</li>
                            <li><strong>Monitoring:</strong> 24/7 security monitoring and incident response</li>
                            <li><strong>Audits:</strong> Regular security audits and penetration testing</li>
                            <li><strong>Compliance:</strong> GDPR, CCPA, and HIPAA-ready data handling</li>
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            5. Data Retention & Deletion
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280' }}>
                            We retain your data only as long as necessary to provide services and comply with legal obligations.
                            Call recordings are retained for 90 days by default (configurable). You can request data deletion at any time
                            by contacting <strong>hello@speaksynthai.com</strong>. Upon deletion request, we will permanently remove
                            your data within 30 days, except where retention is required by law.
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            6. Third-Party Services
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280', mb: 2 }}>
                            We use trusted third-party providers to deliver our services:
                        </Typography>
                        <Typography component="ul" variant="body1" sx={{ color: '#6b7280', pl: 3 }}>
                            <li><strong>Twilio:</strong> Telephony and SMS services</li>
                            <li><strong>OpenAI/DeepSeek:</strong> AI language processing</li>
                            <li><strong>Google Cloud/Firebase:</strong> Infrastructure and database</li>
                            <li><strong>Stripe:</strong> Payment processing</li>
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280', mt: 2 }}>
                            All providers are contractually obligated to protect your data and comply with applicable privacy laws.
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            7. Your Privacy Rights
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280', mb: 2 }}>
                            You have the following rights regarding your personal data:
                        </Typography>
                        <Typography component="ul" variant="body1" sx={{ color: '#6b7280', pl: 3 }}>
                            <li><strong>Access:</strong> Request a copy of your personal data</li>
                            <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                            <li><strong>Deletion:</strong> Request deletion of your data ("right to be forgotten")</li>
                            <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                            <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
                            <li><strong>Restriction:</strong> Limit how we process your data</li>
                            <li><strong>Objection:</strong> Object to certain data processing activities</li>
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280', mt: 2 }}>
                            To exercise these rights, contact us at <strong>hello@speaksynthai.com</strong>
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            8. International Data Transfers
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280' }}>
                            Your data may be transferred and processed in countries outside your residence. We ensure appropriate
                            safeguards are in place, including Standard Contractual Clauses (SCCs) and adequacy decisions, to protect
                            your data in accordance with this Privacy Policy and applicable laws.
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            9. Children's Privacy
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280' }}>
                            Our services are not directed to individuals under 18 years of age. We do not knowingly collect personal
                            information from children. If you become aware that a child has provided us with personal data, please
                            contact us immediately.
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            10. Changes to This Policy
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280' }}>
                            We may update this Privacy Policy from time to time. We will notify you of material changes by email
                            or through the platform. Your continued use of our services after changes constitutes acceptance of the
                            updated policy.
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            11. Contact Us
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280', mb: 2 }}>
                            If you have questions or concerns about this Privacy Policy or our data practices:
                        </Typography>
                        <Typography component="div" variant="body1" sx={{ color: '#6b7280' }}>
                            <strong>Email:</strong> privacy@speaksynthai.com<br />
                            <strong>Support:</strong> support@speaksynthai.com<br />
                            <strong>General Inquiries:</strong> hello@speaksynthai.com<br />
                            <strong>Company:</strong> SpeakSynth AI<br />
                            <strong>Location:</strong> India
                        </Typography>
                    </CardContent>
                </Card>
            </Container>
            <Footer />
        </Box>
    );
}
