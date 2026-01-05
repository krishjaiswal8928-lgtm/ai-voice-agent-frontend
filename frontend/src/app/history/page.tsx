'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Chip,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Search,
  Phone,
  PhoneInTalk,
  PhoneMissed,
  CheckCircle,
  Error
} from '@mui/icons-material';
import { NavigationLayout } from '@/components/NavigationLayout';

export default function CallHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for call history
  const [calls, setCalls] = useState([
    {
      id: '1',
      phoneNumber: '+1 (555) 123-4567',
      duration: 124,
      status: 'completed',
      date: '2023-05-15T14:30:00Z',
      campaign: 'Product Demo Campaign',
      transcript: 'Call transcript would be here...'
    },
    {
      id: '2',
      phoneNumber: '+1 (555) 987-6543',
      duration: 87,
      status: 'completed',
      date: '2023-05-15T13:15:00Z',
      campaign: 'Lead Qualification',
      transcript: 'Call transcript would be here...'
    },
    {
      id: '3',
      phoneNumber: '+1 (555) 456-7890',
      duration: 0,
      status: 'failed',
      date: '2023-05-14T16:45:00Z',
      campaign: 'Appointment Booking',
      transcript: 'Call transcript would be here...'
    },
    {
      id: '4',
      phoneNumber: '+1 (555) 234-5678',
      duration: 210,
      status: 'completed',
      date: '2023-05-14T11:20:00Z',
      campaign: 'Product Demo Campaign',
      transcript: 'Call transcript would be here...'
    },
    {
      id: '5',
      phoneNumber: '+1 (555) 876-5432',
      duration: 65,
      status: 'completed',
      date: '2023-05-13T15:30:00Z',
      campaign: 'Lead Qualification',
      transcript: 'Call transcript would be here...'
    }
  ]);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle sx={{ color: '#4caf50' }} />;
      case 'failed':
        return <Error sx={{ color: '#f44336' }} />;
      default:
        return <PhoneInTalk sx={{ color: '#2196f3' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredCalls = calls.filter(call =>
    call.phoneNumber.includes(searchTerm) ||
    call.campaign.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, position: 'relative', zIndex: 1 }}>
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1, color: '#111827' }}>
              Call History
            </Typography>
            <Typography variant="h6" sx={{ color: '#6b7280' }}>
              Review past calls and their outcomes
            </Typography>
          </Box>
          <TextField
            placeholder="Search calls..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#888888' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: 300,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#e0e0e0',
                },
                '&:hover fieldset': {
                  borderColor: '#000000',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#6366f1',
                },
              },
              '& .MuiInputBase-input': {
                color: '#000000',
              }
            }}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#6366f1' }} />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(99,102,241,0.1)', position: 'relative', zIndex: 1 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#000000', fontWeight: 700, borderBottom: '1px solid #e0e0e0' }}>Phone Number</TableCell>
                  <TableCell sx={{ color: '#000000', fontWeight: 700, borderBottom: '1px solid #e0e0e0' }}>Duration</TableCell>
                  <TableCell sx={{ color: '#000000', fontWeight: 700, borderBottom: '1px solid #e0e0e0' }}>Status</TableCell>
                  <TableCell sx={{ color: '#000000', fontWeight: 700, borderBottom: '1px solid #e0e0e0' }}>Date</TableCell>
                  <TableCell sx={{ color: '#000000', fontWeight: 700, borderBottom: '1px solid #e0e0e0' }}>Campaign</TableCell>
                  <TableCell sx={{ color: '#000000', fontWeight: 700, borderBottom: '1px solid #e0e0e0' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCalls.map((call) => (
                  <TableRow
                    key={call.id}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': { backgroundColor: 'rgba(0,0,0,0.03)' }
                    }}
                  >
                    <TableCell sx={{ color: '#000000', borderBottom: '1px solid #e0e0e0' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getStatusIcon(call.status)}
                        <Typography sx={{ ml: 1, color: '#000000' }}>{call.phoneNumber}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#000000', borderBottom: '1px solid #e0e0e0' }}>
                      {call.duration > 0 ? formatDuration(call.duration) : 'N/A'}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                      <Chip
                        label={call.status}
                        size="small"
                        color={getStatusColor(call.status) as any}
                        sx={{
                          bgcolor: call.status === 'completed' ? '#6366f1' : call.status === 'failed' ? '#f44336' : '#f5f5f5',
                          color: call.status === 'completed' ? '#ffffff' : call.status === 'failed' ? '#ffffff' : '#000000'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#000000', borderBottom: '1px solid #e0e0e0' }}>
                      {formatDate(call.date)}
                    </TableCell>
                    <TableCell sx={{ color: '#000000', borderBottom: '1px solid #e0e0e0' }}>
                      {call.campaign}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                      <Button
                        size="small"
                        sx={{
                          color: '#6366f1',
                          borderColor: '#6366f1',
                          '&:hover': {
                            borderColor: '#4f46e5',
                            backgroundColor: 'rgba(99,102,241,0.05)'
                          }
                        }}
                        variant="outlined"
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {!loading && filteredCalls.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Phone sx={{ fontSize: 80, color: '#e0e0e0', mb: 3 }} />
            <Typography variant="h5" sx={{ color: '#555555', mb: 2 }}>
              No calls found
            </Typography>
            <Typography variant="body1" sx={{ color: '#888888' }}>
              {searchTerm ? 'Try adjusting your search terms' : 'No call history available yet'}
            </Typography>
          </Box>
        )}
      </Box>
    </NavigationLayout>
  );
}