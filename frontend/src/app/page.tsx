'use client';

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Paper
} from '@mui/material';
import {
  Call,
  Analytics,
  AutoAwesome,
  PhoneInTalk,
  PhoneMissed,
  CheckCircle,
  Error,
  SmartToy,
  Settings,
  Add
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useCallSessions } from '@/hooks/useCampaigns';
import { voiceAPI } from '@/lib/api';
import { NavigationLayout } from '@/components/NavigationLayout';
import { useTheme } from '@mui/material/styles';

interface ActiveCall {
  call_sid: string;
  start_time: number;
  duration: number;
  last_activity: number;
  conversation_turns: number;
}

export default function DashboardScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { callSessions, loading, error } = useCallSessions();
  const [activeCalls, setActiveCalls] = React.useState<ActiveCall[]>([]);
  const [loadingCalls, setLoadingCalls] = React.useState(true);
  const [stats, setStats] = React.useState({
    totalCallSessions: 0,
    activeCalls: 0
  });

  React.useEffect(() => {
    const fetchActiveCalls = async () => {
      try {
        setLoadingCalls(true);
        const response = await voiceAPI.getActiveCalls();
        setActiveCalls(response.data);
        setStats(prev => ({
          ...prev,
          activeCalls: response.data.length,
          totalCallSessions: callSessions.length
        }));
      } catch (err) {
        console.error('Error fetching active calls:', err);
      } finally {
        setLoadingCalls(false);
      }
    };

    fetchActiveCalls();

    // Set up polling for active calls
    const interval = setInterval(fetchActiveCalls, 5000);
    return () => clearInterval(interval);
  }, [callSessions.length]);

  const handleCreateAgent = () => {
    router.push('/agent-settings/create');
  };

  const handleManageAgents = () => {
    router.push('/agent-settings');
  };

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
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 4, position: 'relative', zIndex: 1 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Add />}
            onClick={handleCreateAgent}
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
            Create Agent
          </Button>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
          <Grid item xs={12} sm={6} md={6}>
            <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', height: '100%', boxShadow: '0 1px 3px rgba(99,102,241,0.1)', '&:hover': { boxShadow: '0 4px 12px rgba(99,102,241,0.15)' } }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#6b7280', mb: 1, fontWeight: 600 }}>
                      Active Calls
                    </Typography>
                    {loadingCalls ? (
                      <CircularProgress size={30} sx={{ color: '#6366f1' }} />
                    ) : (
                      <Typography variant="h3" sx={{ fontWeight: 700, color: '#111827' }}>
                        {activeCalls.length}
                      </Typography>
                    )}
                  </Box>
                  <PhoneInTalk sx={{ fontSize: 48, color: '#22c55e' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', height: '100%', boxShadow: '0 1px 3px rgba(99,102,241,0.1)', '&:hover': { boxShadow: '0 4px 12px rgba(99,102,241,0.15)' } }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#6b7280', mb: 1, fontWeight: 600 }}>
                      Total Call Sessions
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#111827' }}>
                      {callSessions.length}
                    </Typography>
                  </Box>
                  <PhoneInTalk sx={{ fontSize: 48, color: '#6366f1' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

        </Grid>

        {/* Quick Actions */}
        <Grid container spacing={3} sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', height: '100%', boxShadow: '0 1px 3px rgba(99,102,241,0.1)', '&:hover': { boxShadow: '0 4px 12px rgba(99,102,241,0.15)' } }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827' }}>
                    Custom Agents
                  </Typography>
                  <Chip
                    label="New Feature"
                    color="primary"
                    size="small"
                    sx={{ bgcolor: '#6366f1', color: '#ffffff' }}
                  />
                </Box>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>
                  Create and manage reusable autonomous AI agents with custom configurations
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<SmartToy />}
                  onClick={handleManageAgents}
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
                  Manage Agents
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', height: '100%', boxShadow: '0 1px 3px rgba(99,102,241,0.1)', '&:hover': { boxShadow: '0 4px 12px rgba(99,102,241,0.15)' } }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827' }}>
                    Call Session Settings
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>
                  Configure call session types, goals, and lead management settings
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Settings />}
                  onClick={handleCreateAgent}
                  sx={{
                    color: '#6366f1',
                    borderColor: '#6366f1',
                    px: 3,
                    py: 1.5,
                    '&:hover': {
                      borderColor: '#4f46e5',
                      backgroundColor: 'rgba(99,102,241,0.05)'
                    }
                  }}
                >
                  Call Session Settings
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Active Calls Section */}
        <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', mb: 4, boxShadow: '0 1px 3px rgba(99,102,241,0.1)', '&:hover': { boxShadow: '0 4px 12px rgba(99,102,241,0.15)' }, position: 'relative', zIndex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827' }}>
                Active Calls
              </Typography>
              <Chip
                label={`${activeCalls.length} live`}
                color="success"
                size="small"
                sx={{ bgcolor: '#22c55e', color: '#ffffff' }}
              />
            </Box>

            {loadingCalls ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress sx={{ color: '#22c55e' }} />
              </Box>
            ) : activeCalls.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <PhoneMissed sx={{ fontSize: 60, color: '#6b7280', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#6b7280' }}>
                  No active calls
                </Typography>
                <Typography variant="body2" sx={{ color: '#888888', mt: 1 }}>
                  Your agents are ready to make calls
                </Typography>
              </Box>
            ) : (
              <List>
                {activeCalls.map((call, index) => (
                  <React.Fragment key={call.call_sid}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#22c55e' }}>
                          <PhoneInTalk />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`Call ID: ${call.call_sid.substring(0, 8)}...`}
                        secondary={
                          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                            <Chip
                              label={`${Math.floor(call.duration)}s`}
                              size="small"
                              sx={{ bgcolor: '#22c55e', color: '#ffffff' }}
                            />
                            <Chip
                              label={`${call.conversation_turns} turns`}
                              size="small"
                              sx={{ bgcolor: '#22c55e', color: '#ffffff' }}
                            />
                          </Box>
                        }
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ color: '#22c55e', borderColor: '#22c55e', '&:hover': { borderColor: '#16a34a', backgroundColor: 'rgba(34,197,94,0.05)' } }}
                      >
                        View
                      </Button>
                    </ListItem>
                    {index < activeCalls.length - 1 && <Divider sx={{ bgcolor: '#e0e0e0' }} />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

        {/* Recent Call Sessions */}
        <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(99,102,241,0.1)', '&:hover': { boxShadow: '0 4px 12px rgba(99,102,241,0.15)' }, position: 'relative', zIndex: 1 }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
              Recent Call Sessions
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress sx={{ color: '#6366f1' }} />
              </Box>
            ) : callSessions.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <PhoneInTalk sx={{ fontSize: 60, color: '#6b7280', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#6b7280' }}>
                  No call sessions yet
                </Typography>
                <Typography variant="body2" sx={{ color: '#888888', mt: 1 }}>
                  Create your first call session to get started
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleCreateAgent}
                  sx={{
                    mt: 2,
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
                  Create New Call Session
                </Button>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {callSessions.slice(0, 3).map((callSession) => (
                  <Grid item xs={12} md={4} key={callSession.id}>
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        cursor: 'pointer',
                        height: '100%',
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(99,102,241,0.15)',
                          borderColor: '#6366f1'
                        }
                      }}
                      onClick={() => router.push(`/campaigns/${callSession.type}/${callSession.id}`)}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" sx={{ color: '#111827', fontWeight: 600 }}>{callSession.name}</Typography>
                        <Chip
                          label={callSession.status}
                          size="small"
                          color={callSession.status === 'active' ? 'success' : 'default'}
                          sx={{
                            bgcolor: callSession.status === 'active' ? '#6366f1' : '#f5f5f5',
                            color: callSession.status === 'active' ? '#ffffff' : '#6b7280'
                          }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                        {callSession.goal || 'No goal set'}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#888888' }}>
                          {callSession.type}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#888888' }}>
                          {new Date(callSession.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>
      </Box>
    </NavigationLayout>
  );
}