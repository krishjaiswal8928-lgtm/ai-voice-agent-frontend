'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Chip,
  Fab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import {
  Add,
  PhoneInTalk,
  PlayArrow,
  Stop,
  Edit,
  Delete,
  Search
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useCallSessions } from '@/hooks/useCampaigns';
import { callSessionAPI } from '@/lib/api';
import { NavigationLayout } from '@/components/NavigationLayout';

export default function CallSessionsPage() {
  const router = useRouter();
  const [campaignTypeFilter, setCampaignTypeFilter] = useState<string>('all');
  const { callSessions, loading, error, fetchCallSessions } = useCallSessions(campaignTypeFilter === 'all' ? null : campaignTypeFilter);
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleCreateCallSession = () => {
    router.push('/campaigns/create');
  };

  const handleViewCallSession = (id: string, type: string) => {
    router.push(`/campaigns/by-id/${id}`);
  };

  const handleStartCallSession = async (id: string) => {
    try {
      setProcessing(id);
      await callSessionAPI.start(id);
      fetchCallSessions();
    } catch (err) {
      console.error('Error starting call session:', err);
    } finally {
      setProcessing(null);
    }
  };

  const handleStopCallSession = async (id: string) => {
    try {
      setProcessing(id);
      await callSessionAPI.stop(id);
      fetchCallSessions();
    } catch (err) {
      console.error('Error stopping call session:', err);
    } finally {
      setProcessing(null);
    }
  };

  const handleDeleteCallSession = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this call session? This action cannot be undone.')) {
      try {
        setProcessing(id);
        await callSessionAPI.delete(id);
        fetchCallSessions();
      } catch (err) {
        console.error('Error deleting call session:', err);
        alert('Failed to delete call session. Please try again.');
      } finally {
        setProcessing(null);
      }
    }
  };

  // Filter call sessions based on search term
  const filteredCallSessions = callSessions.filter(callSession =>
    callSession.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (callSession.goal && callSession.goal.toLowerCase().includes(searchTerm.toLowerCase()))
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
        zIndex: 1,
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
        {/* Filters and Create Button */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Search Call Sessions"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                bgcolor: '#ffffff',
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
              InputProps={{
                endAdornment: <Search sx={{ color: '#888888' }} />
              }}
            />

            <FormControl size="small" sx={{ minWidth: 120, bgcolor: '#ffffff' }}>
              <InputLabel sx={{ color: '#000000' }}>Type</InputLabel>
              <Select
                value={campaignTypeFilter}
                label="Type"
                onChange={(e) => setCampaignTypeFilter(e.target.value as string)}
                sx={{
                  color: '#000000',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e0e0e0'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#000000'
                  }
                }}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="outbound">Outbound</MenuItem>
                <MenuItem value="inbound">Inbound</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Button
            variant="contained"
            size="large"
            startIcon={<Add />}
            onClick={handleCreateCallSession}
            sx={{
              bgcolor: '#6366f1',
              color: '#ffffff',
              fontWeight: 700,
              px: 3,
              py: 1.5,
              '&:hover': {
                bgcolor: '#4f46e5'
              }
            }}
          >
            Create Call Session
          </Button>
        </Box>

        {error && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" color="error">
              Error loading call sessions: {error}
            </Typography>
          </Box>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#000000' }} />
          </Box>
        ) : filteredCallSessions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <PhoneInTalk sx={{ fontSize: 80, color: '#e0e0e0', mb: 3 }} />
            <Typography variant="h5" sx={{ color: '#555555', mb: 2 }}>
              No call sessions found
            </Typography>
            <Typography variant="body1" sx={{ color: '#888888', mb: 3 }}>
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first AI voice agent call session to get started'}
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={handleCreateCallSession}
              sx={{
                bgcolor: '#000000',
                color: '#ffffff',
                fontWeight: 700,
                px: 4,
                py: 1.5,
                '&:hover': {
                  bgcolor: '#333333'
                }
              }}
            >
              Create Your First Call Session
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredCallSessions.map((callSession) => (
              <Grid item xs={12} md={6} lg={4} key={callSession.id}>
                <Card
                  sx={{
                    bgcolor: '#ffffff',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 16px rgba(99, 102, 241, 0.2)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#000000' }}>
                        {callSession.name}
                      </Typography>
                      <Chip
                        label={callSession.type}
                        size="small"
                        sx={{
                          bgcolor: callSession.type === 'outbound' ? '#000000' : '#f5f5f5',
                          color: callSession.type === 'outbound' ? '#ffffff' : '#000000'
                        }}
                      />
                    </Box>

                    <Typography variant="body2" sx={{ color: '#555555', mb: 2, minHeight: 60 }}>
                      {callSession.goal || 'No goal set'}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Chip
                        label={callSession.status}
                        size="small"
                        sx={{
                          bgcolor: callSession.status === 'active' ? '#4caf50' : callSession.status === 'paused' ? '#f44336' : '#f5f5f5',
                          color: (callSession.status === 'active' || callSession.status === 'paused') ? '#ffffff' : '#000000',
                          textTransform: 'capitalize'
                        }}
                      />
                      <Typography variant="body2" sx={{ color: '#888888' }}>
                        {new Date(callSession.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => handleViewCallSession(callSession.id, callSession.type)}
                        sx={{
                          color: '#000000',
                          borderColor: '#000000',
                          '&:hover': {
                            borderColor: '#333333',
                            backgroundColor: 'rgba(0,0,0,0.03)'
                          }
                        }}
                        variant="outlined"
                      >
                        View Details
                      </Button>

                      {callSession.status === 'active' ? (
                        <Button
                          size="small"
                          startIcon={processing === callSession.id ? <CircularProgress size={16} /> : <Stop />}
                          onClick={() => handleStopCallSession(callSession.id)}
                          disabled={processing === callSession.id}
                          sx={{
                            color: '#000000',
                            borderColor: '#000000',
                            '&:hover': {
                              borderColor: '#333333',
                              backgroundColor: 'rgba(0,0,0,0.03)'
                            }
                          }}
                          variant="outlined"
                        >
                          Pause
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          startIcon={processing === callSession.id ? <CircularProgress size={16} /> : <PlayArrow />}
                          onClick={() => handleStartCallSession(callSession.id)}
                          disabled={processing === callSession.id}
                          sx={{
                            color: '#000000',
                            borderColor: '#000000',
                            '&:hover': {
                              borderColor: '#333333',
                              backgroundColor: 'rgba(0,0,0,0.03)'
                            }
                          }}
                          variant="outlined"
                        >
                          Start
                        </Button>
                      )}

                      <Button
                        size="small"
                        startIcon={<Delete />}
                        onClick={() => handleDeleteCallSession(callSession.id)}
                        disabled={processing === callSession.id}
                        sx={{
                          color: '#f44336',
                          borderColor: '#f44336',
                          '&:hover': {
                            borderColor: '#f44336',
                            backgroundColor: 'rgba(244, 67, 54, 0.1)'
                          }
                        }}
                        variant="outlined"
                      >
                        Delete
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Floating Action Button */}
        <Fab
          aria-label="add"
          onClick={handleCreateCallSession}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            bgcolor: '#000000',
            color: '#ffffff',
            '&:hover': {
              bgcolor: '#333333'
            }
          }}
        >
          <Add />
        </Fab>
      </Box>
    </NavigationLayout>
  );
}