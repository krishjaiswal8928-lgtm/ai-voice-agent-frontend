'use client';

import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Link,
  Box,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, Person, Email, Lock } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import AuthLayout from '@/components/AuthLayout';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await authAPI.register(formData.username, formData.email, formData.password);
      setSuccess(true);
      setTimeout(() => router.push('/auth/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    try {
      const response = await authAPI.googleAuth(credentialResponse.credential);
      localStorage.setItem('token', response.data.access_token);
      router.push('/');
    } catch (err: any) {
      setError('Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthLayout
        title="Get Started"
        subtitle="Create your account to join SpeakSynth.ai"
      >
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>Registration successful! Redirecting...</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="Username"
            name="username"
            variant="outlined"
            margin="normal"
            value={formData.username}
            onChange={handleChange}
            required
            InputProps={{
              startAdornment: <InputAdornment position="start"><Person color="action" /></InputAdornment>,
              sx: { borderRadius: 3 }
            }}
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            variant="outlined"
            margin="normal"
            value={formData.email}
            onChange={handleChange}
            required
            InputProps={{
              startAdornment: <InputAdornment position="start"><Email color="action" /></InputAdornment>,
              sx: { borderRadius: 3 }
            }}
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            margin="normal"
            value={formData.password}
            onChange={handleChange}
            required
            InputProps={{
              startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment>,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              sx: { borderRadius: 3 }
            }}
          />

          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            margin="normal"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            InputProps={{
              startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment>,
              sx: { borderRadius: 3 }
            }}
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            size="large"
            sx={{
              py: 1.5,
              borderRadius: 3,
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '1rem',
              boxShadow: '0 4px 14px 0 rgba(33, 150, 243, 0.3)',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              '&:hover': {
                boxShadow: '0 6px 20px 0 rgba(33, 150, 243, 0.4)',
                background: 'linear-gradient(45deg, #1976D2 30%, #00BCD4 90%)',
              }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
          </Button>
        </Box>

        <Box sx={{ my: 3, display: 'flex', alignItems: 'center' }}>
          <Divider sx={{ flex: 1 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>
            OR
          </Typography>
          <Divider sx={{ flex: 1 }} />
        </Box>

        {isClient && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Login Failed')}
              useOneTap={false}
              theme="filled_blue"
              shape="pill"
              width="100%"
            />
          </Box>
        )}

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              underline="hover"
              sx={{
                fontWeight: 600,
                color: '#2196F3'
              }}
            >
              Sign In
            </Link>
          </Typography>
        </Box>
      </AuthLayout>
    </GoogleOAuthProvider>
  );
}