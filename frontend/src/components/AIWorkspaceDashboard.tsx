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
  Campaign, 
  Analytics, 
  AutoAwesome,
  PhoneInTalk,
  PhoneMissed,
  CheckCircle,
  Error
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useVoice } from '@/hooks/useVoice';

interface ActiveCall {
  call_sid: string;
  start_time: number;
  duration: number;
  last_activity: number;
  conversation_turns: number;
}

export function AIWorkspaceDashboard() {
  const router = useRouter();
  const { activeCalls, loading } = useVoice();
  const [stats, setStats] = useState({
    totalCampaigns: 12,
    activeCalls: 0,
    successRate: 78,
    totalLeads: 1240
  });

  useEffect(() => {
    setStats(prev => ({
      ...prev,
      activeCalls: activeCalls.length
    }));
  }, [activeCalls]);

  const handleCreateAgent = () => {
    router.push('/campaigns/create');
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#ffffff', minHeight: '100vh', color: '#000000' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1, color: '#000000' }}>
            SpeakSynth.ai Dashboard
          </Typography>
          <Typography variant="h6" sx={{ color: '#aaa' }}>
            Create, manage, and monitor your autonomous voice agents
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          size="large"
          onClick={handleCreateAgent}
          sx={{ 
            bgcolor: '#000000', 
            color: '#ffffff',
            fontWeight: 700,
            px: 3,
            py: 1.5,
            '&:hover': {
              bgcolor: '#333333'
            }
          }}
        >
          Create New Agent
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e0e0e0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" sx={{ color: '#555555', mb: 1 }}>
                    Active Calls
                  </Typography>
                  {loading ? (
                    <CircularProgress size={30} sx={{ color: '#000000' }} />
                  ) : (
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#000000' }}>
                      {activeCalls.length}
                    </Typography>
                  )}
                </Box>
                <PhoneInTalk sx={{ fontSize: 40, color: '#4caf50' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e0e0e0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" sx={{ color: '#555555', mb: 1 }}>
                    Total Campaigns
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#000000' }}>
                    {stats.totalCampaigns}
                  </Typography>
                </Box>
                <Campaign sx={{ fontSize: 40, color: '#2196f3' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e0e0e0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" sx={{ color: '#555555', mb: 1 }}>
                    Success Rate
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#000000' }}>
                    {stats.successRate}%
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, color: '#4caf50' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e0e0e0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" sx={{ color: '#555555', mb: 1 }}>
                    Total Leads
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#000000' }}>
                    {stats.totalLeads}
                  </Typography>
                </Box>
                <AutoAwesome sx={{ fontSize: 40, color: '#ff9800' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Active Calls Section */}
      <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e0e0e0', mb: 4, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#000000' }}>
              Active Calls
            </Typography>
            <Chip 
              label={`${activeCalls.length} live`} 
              color="success" 
              size="small" 
              sx={{ bgcolor: '#000000', color: '#ffffff' }} 
            />
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#000000' }} />
            </Box>
          ) : activeCalls.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <PhoneMissed sx={{ fontSize: 60, color: '#555555', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#555555' }}>
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
                      <Avatar sx={{ bgcolor: '#4caf50' }}>
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
                            sx={{ bgcolor: '#000000', color: '#ffffff' }} 
                          />
                          <Chip 
                            label={`${call.conversation_turns} turns`} 
                            size="small" 
                            sx={{ bgcolor: '#000000', color: '#ffffff' }} 
                          />
                        </Box>
                      }
                    />
                    <Button 
                      variant="outlined" 
                      size="small"
                      sx={{ color: '#000000', borderColor: '#000000' }}
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

      {/* Recent Campaigns */}
      <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e0e0e0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#000000' }}>
            Recent Campaigns
          </Typography>
          <Grid container spacing={2}>
            {[1, 2, 3].map((id) => (
              <Grid item xs={12} md={4} key={id}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    bgcolor: '#ffffff', 
                    border: '1px solid #e0e0e0',
                    cursor: 'pointer',
                    height: '100%',
                    '&:hover': {
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }
                  }}
                  onClick={() => router.push(`/campaigns/outbound/${id}`)}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" sx={{ color: '#000000' }}>Product Launch</Typography>
                    <Chip label="Active" size="small" sx={{ bgcolor: '#000000', color: '#ffffff' }} />
                  </Box>
                  <Typography variant="body2" sx={{ color: '#555555', mb: 1 }}>
                    Collecting appointments for new product demo
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#888888' }}>
                      42/120 leads
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#888888' }}>
                      78% success
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}