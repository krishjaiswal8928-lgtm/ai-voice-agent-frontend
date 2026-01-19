'use client';

import React from 'react';
import { Box, Typography, Container, Card, CardContent } from '@mui/material';
import { LandingNav } from '@/components/LandingNav';
import { Footer } from '@/components/Footer';

export default function TermsPage() {
    return (
        <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
            <LandingNav />
            <Container maxWidth="md" sx={{ py: 8 }}>
                <Typography variant="h2" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                    Terms of Service
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 4 }}>
                    Last updated: January 19, 2026
                </Typography>

                <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            1. Acceptance of Terms
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280' }}>
                            By accessing and using SpeakSynth AI ("Service"), you accept and agree to be bound by these Terms of Service
                            and our Privacy Policy. If you do not agree to these terms, please do not use our Service. These terms apply
                            to all users, including businesses, sales teams, and individual users.
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            2. Service Description
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280', mb: 2 }}>
                            SpeakSynth AI provides AI-powered voice agent services for legitimate business purposes, including:
                        </Typography>
                        <Typography component="ul" variant="body1" sx={{ color: '#6b7280', pl: 3 }}>
                            <li>Lead qualification using BANT criteria and custom frameworks</li>
                            <li>Intelligent call transfer to human agents</li>
                            <li>Automated callback scheduling with consent</li>
                            <li>Customer support and service automation</li>
                            <li>Appointment scheduling and reminders</li>
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280', mt: 2 }}>
                            We reserve the right to modify, suspend, or discontinue any part of the Service at any time with reasonable notice.
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 3, border: '1px solid #e5e7eb', bgcolor: '#fef3c7', borderColor: '#f59e0b' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#92400e' }}>
                            3. Acceptable Use Policy (CRITICAL)
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#92400e', mb: 2, fontWeight: 600 }}>
                            You agree to use our Service ethically and in compliance with all applicable laws. The following activities are STRICTLY PROHIBITED:
                        </Typography>
                        <Typography component="ul" variant="body1" sx={{ color: '#92400e', pl: 3 }}>
                            <li><strong>Spam or Robocalling:</strong> Unsolicited bulk calling, auto-dialing, or spam campaigns</li>
                            <li><strong>Illegal Activities:</strong> Fraud, scams, phishing, or any unlawful purpose</li>
                            <li><strong>Harassment:</strong> Threatening, abusive, or harassing communications</li>
                            <li><strong>No-Consent Calling:</strong> Calling individuals on Do Not Call lists without proper exemption</li>
                            <li><strong>Misleading Practices:</strong> Impersonation, false claims, or deceptive tactics</li>
                            <li><strong>Unauthorized Recording:</strong> Recording calls without proper consent in applicable jurisdictions</li>
                            <li><strong>Data Scraping:</strong> Unauthorized collection or harvesting of user data</li>
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#92400e', mt: 2, fontWeight: 600 }}>
                            Violation of this policy will result in immediate account suspension or termination.
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            4. User Responsibilities & Compliance
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280', mb: 2 }}>
                            You are responsible for:
                        </Typography>
                        <Typography component="ul" variant="body1" sx={{ color: '#6b7280', pl: 3 }}>
                            <li><strong>Legal Compliance:</strong> Complying with TCPA, GDPR, CCPA, and all applicable telemarketing laws</li>
                            <li><strong>Consent Management:</strong> Obtaining proper consent before calling or recording conversations</li>
                            <li><strong>Do Not Call Lists:</strong> Maintaining and respecting Do Not Call registries</li>
                            <li><strong>Call Disclosure:</strong> Properly identifying your business and purpose of calls</li>
                            <li><strong>Data Protection:</strong> Securing and protecting lead and customer data</li>
                            <li><strong>Account Security:</strong> Maintaining confidentiality of your account credentials</li>
                            <li><strong>Accurate Information:</strong> Providing truthful account and business information</li>
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            5. Call Recording & Consent
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280' }}>
                            You acknowledge that call recording laws vary by jurisdiction. You are solely responsible for:
                        </Typography>
                        <Typography component="ul" variant="body1" sx={{ color: '#6b7280', pl: 3, mt: 1 }}>
                            <li>Understanding and complying with one-party or two-party consent laws in your region</li>
                            <li>Configuring your AI agents to announce call recording when required</li>
                            <li>Obtaining explicit consent before recording calls where legally required</li>
                            <li>Properly storing and handling recorded conversations</li>
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280', mt: 2 }}>
                            SpeakSynth AI provides tools to help you comply, but ultimate responsibility rests with you.
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            6. Payment Terms
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280' }}>
                            Subscription fees are billed monthly or annually in advance based on your selected plan. All fees are
                            non-refundable except as required by law or explicitly stated in your plan. We reserve the right to change
                            pricing with 30 days advance notice. Failure to pay may result in service suspension or termination.
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            7. Service Availability & Support
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280' }}>
                            We strive for 99.9% uptime but do not guarantee uninterrupted service. Scheduled maintenance will be
                            announced in advance. Support is provided via email at <strong>hello@speaksynthai.com</strong> with
                            response times based on your plan level.
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            8. Intellectual Property
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280' }}>
                            All content, features, functionality, AI models, and technology of the Service are owned by SpeakSynth AI
                            and are protected by copyright, trademark, patent, and other intellectual property laws. You may not copy,
                            modify, distribute, or reverse engineer any part of our Service.
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            9. Limitation of Liability
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280' }}>
                            SpeakSynth AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages
                            resulting from your use of the Service, including but not limited to lost profits, data loss, or business
                            interruption. Our total liability shall not exceed the amount paid by you in the 12 months preceding the claim.
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            10. Indemnification
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280' }}>
                            You agree to indemnify and hold harmless SpeakSynth AI from any claims, damages, or expenses arising from
                            your use of the Service, violation of these Terms, or infringement of any third-party rights.
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            11. Termination
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280', mb: 2 }}>
                            Either party may terminate this agreement:
                        </Typography>
                        <Typography component="ul" variant="body1" sx={{ color: '#6b7280', pl: 3 }}>
                            <li><strong>By You:</strong> Cancel your subscription at any time (effective end of billing period)</li>
                            <li><strong>By Us:</strong> Immediately for violation of Terms, illegal activity, or non-payment</li>
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280', mt: 2 }}>
                            Upon termination, your access will be revoked and data will be deleted per our retention policy.
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            12. Dispute Resolution
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280' }}>
                            Any disputes arising from these Terms shall be resolved through binding arbitration in accordance with
                            the laws of India. You agree to waive any right to a jury trial or class action lawsuit.
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            13. Changes to Terms
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280' }}>
                            We may update these Terms from time to time. Material changes will be communicated via email or platform
                            notification at least 30 days in advance. Continued use after changes constitutes acceptance.
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ border: '1px solid #e5e7eb' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                            14. Contact Information
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280', mb: 2 }}>
                            For questions about these Terms of Service:
                        </Typography>
                        <Typography component="div" variant="body1" sx={{ color: '#6b7280' }}>
                            <strong>Legal Inquiries:</strong> legal@speaksynthai.com<br />
                            <strong>Support:</strong> support@speaksynthai.com<br />
                            <strong>General:</strong> hello@speaksynthai.com<br />
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
