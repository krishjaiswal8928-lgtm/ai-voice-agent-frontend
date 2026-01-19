'use client';

import React, { useState } from 'react';
import { Box, Typography, Container, Card, CardContent, TextField, Button, Grid, Snackbar, Alert } from '@mui/material';
import { Email, Phone, LocationOn } from '@mui/icons-material';
import { LandingNav } from '@/components/LandingNav';
import { Footer } from '@/components/Footer';
import '@/styles/animations.css';

export default function ContactPage() {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSnackbar({ open: true, message: 'Message sent! We\'ll get back to you soon.' });
        setFormData({ name: '', email: '', message: '' });
    };

    return (
        <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
            <LandingNav />
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                    <Typography variant="h2" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
                        Contact Us
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#6b7280' }}>
                        Get in touch with our team
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={8}>
                        <Card sx={{ border: '1px solid #e5e7eb' }}>
                            <CardContent sx={{ p: 4 }}>
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#111827' }}>
                                    Send us a message
                                </Typography>
                                <form onSubmit={handleSubmit}>
                                    <TextField
                                        fullWidth
                                        label="Name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        sx={{ mb: 3 }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        sx={{ mb: 3 }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Message"
                                        multiline
                                        rows={6}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        required
                                        sx={{ mb: 3 }}
                                    />
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        fullWidth
                                        sx={{
                                            bgcolor: '#6366f1',
                                            color: '#ffffff',
                                            fontWeight: 700,
                                            py: 1.5,
                                            '&:hover': { bgcolor: '#4f46e5' }
                                        }}
                                    >
                                        Send Message
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Email sx={{ color: '#6366f1', mr: 2 }} />
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ color: '#6b7280' }}>
                                            Email
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: '#111827', fontWeight: 600 }}>
                                            hello@speaksynthai.com
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>

                        <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Phone sx={{ color: '#6366f1', mr: 2 }} />
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ color: '#6b7280' }}>
                                            Phone
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: '#111827', fontWeight: 600 }}>
                                            +1 (555) 123-4567
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>

                        <Card sx={{ border: '1px solid #e5e7eb' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <LocationOn sx={{ color: '#6366f1', mr: 2 }} />
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ color: '#6b7280' }}>
                                            Office
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: '#111827', fontWeight: 600 }}>
                                            India
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    <Alert severity="success">{snackbar.message}</Alert>
                </Snackbar>
            </Container>

            <Footer />
        </Box>
    );
}
