'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Divider,
  Link
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';

// Dynamically import Google OAuth components to avoid SSR issues
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);

  // Fix for hydration error - only render Google components on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(username, password);
      localStorage.setItem('token', response.data.access_token);
      router.push('/');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Login failed';
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.googleAuth(credentialResponse.credential);
      localStorage.setItem('token', response.data.access_token);
      router.push('/');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Google authentication failed';
      setError(errorMessage);
      console.error('Google auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google authentication failed. Please try again.');
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          p: 2,
          bgcolor: '#ffffff',
          width: '100%'
        }}
      >
        <Card sx={{
          maxWidth: 400,
          width: '100%',
          bgcolor: '#ffffff',
          border: '1px solid #e0e0e0',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
          <CardContent>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              align="center"
              sx={{ color: '#000000', mb: 3, fontWeight: 700 }}
            >
              SpeakSynth.ai Login
            </Typography>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 2
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Username"
                variant="outlined"
                margin="normal"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover fieldset': {
                      borderColor: '#000000',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#000000',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#000000',
                  },
                  '& .MuiInputBase-input': {
                    color: '#000000',
                  }
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                variant="outlined"
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover fieldset': {
                      borderColor: '#000000',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#000000',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#000000',
                  },
                  '& .MuiInputBase-input': {
                    color: '#000000',
                  }
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  bgcolor: '#000000',
                  color: '#ffffff',
                  fontWeight: 700,
                  py: 1.5,
                  '&:hover': {
                    bgcolor: '#333333'
                  }
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: '#ffffff' }} /> : 'Login'}
              </Button>
            </Box>

            <Divider sx={{ my: 2 }}>or</Divider>

            {/* Only render Google Login on client to avoid hydration errors */}
            {isClient && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap={false}
                  theme="outline"
                  size="large"
                  text="continue_with"
                  shape="rectangular"
                  width="100%"
                />
              </Box>
            )}

            <Typography
              variant="body2"
              align="center"
              sx={{ color: '#888888' }}
            >
              Don't have an account?{' '}
              <Link href="/auth/register" underline="hover" sx={{ color: '#000000', fontWeight: 700 }}>
                Register
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </GoogleOAuthProvider>
  );
}