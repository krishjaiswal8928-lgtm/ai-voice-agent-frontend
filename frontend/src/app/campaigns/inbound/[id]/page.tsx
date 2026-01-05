'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  Grid,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import {
  ArrowBack,
  PlayArrow,
  Stop
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { NavigationLayout } from '@/components/NavigationLayout';
import { ActiveCallCard } from '@/components/ActiveCallCard';
import { TranscriptViewer } from '@/components/TranscriptViewer';
import { useCallSessions } from '@/hooks/useCampaigns';

interface Call {
  id: string;
  callerName: string;
  phoneNumber: string;
  status: 'ringing' | 'in-progress' | 'completed' | 'failed';
  duration: number;
}

export const dynamicParams = false;

export default function InboundLiveCallDashboardScreen({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { callSessions, loading: campaignsLoading } = useCallSessions();
  const [calls, setCalls] = useState<Call[]>([
    {
      id: '1',
      callerName: 'Unknown',
      phoneNumber: '+1 (555) 123-4567',
      status: 'in-progress',
      duration: 45
    }
  ]);
  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  const [campaignStatus, setCampaignStatus] = useState<'active' | 'paused' | 'completed'>('active');

  const campaignId = params.id;
  const campaign = callSessions.find(c => c.id === campaignId);

  const handleViewHistory = () => {
    router.push(`/campaigns/by-id/${campaignId}/history`);
  };

  const handleBack = () => {
    router.push('/campaigns');
  };

  useEffect(() => {
    // In a real implementation, you would connect to a WebSocket
    // to receive real-time updates about calls
    const interval = setInterval(() => {
      // Mock updating call durations
      setCalls(prev => prev.map(call =>
        call.status === 'in-progress' ? { ...call, duration: call.duration + 1 } : call
      ));

      // Mock updating transcript
      if (calls.some(c => c.status === 'in-progress')) {
        setCurrentTranscript(prev => prev + `\nAI Agent: Hello, thank you for calling. How can I help you today?\nCaller: I have a question about my order.`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [calls]);

  const handleStopCampaign = () => {
    setCampaignStatus('paused');
  };

  const handleStartCampaign = () => {
    setCampaignStatus('active');
  };

  const handleEndCall = (callId: string) => {
    setCalls(prev => prev.map(call =>
      call.id === callId
        ? { ...call, status: 'completed' }
        : call
    ));
  };

  if (campaignsLoading) {
    return (
      <NavigationLayout>
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress />
        </Box>
      </NavigationLayout>
    );
  }

  return (
    <NavigationLayout>
      <Box sx={{ p: 3, bgcolor: '#ffffff', minHeight: '100vh', color: '#000000', width: '100%' }}>
        {/* Header with campaign name and start/stop button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Button
              startIcon={<ArrowBack />}
              onClick={handleBack}
              sx={{ color: '#000000', mb: 1 }}
            >
              Back to Campaigns
            </Button>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1, color: '#000000' }}>
              {campaign?.name || `Campaign #${campaignId}`}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                label="inbound"
                size="small"
                sx={{
                  bgcolor: '#ff9800',
                  color: '#ffffff'
                }}
              />
              <Chip
                label={campaignStatus}
                size="small"
                color={campaignStatus === 'active' ? 'success' : 'default'}
                sx={{
                  bgcolor: campaignStatus === 'active' ? '#4caf50' : '#555',
                  color: campaignStatus === 'active' ? '#ffffff' : '#ffffff'
                }}
              />
            </Box>
          </Box>
          <Box>
            {campaignStatus === 'active' ? (
              <Button
                variant="contained"
                startIcon={<Stop />}
                onClick={handleStopCampaign}
                sx={{
                  backgroundColor: '#f44336',
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: '#d32f2f'
                  }
                }}
              >
                Pause Campaign
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={<PlayArrow />}
                onClick={handleStartCampaign}
                sx={{
                  backgroundColor: '#4caf50',
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: '#45a049'
                  }
                }}
              >
                Start Campaign
              </Button>
            )}
          </Box>
        </Box>

        <Alert severity="info" sx={{ mb: 3, bgcolor: '#e3f2fd', color: '#000000' }}>
          <Typography variant="body1">
            To receive calls for this inbound campaign, configure a Twilio phone number to point to your webhook URL:
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, fontFamily: 'monospace' }}>
            https://your-domain.ngrok-free.dev/twilio/voice/webhook
          </Typography>
        </Alert>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h5" sx={{ color: '#000000' }}>
                    Incoming Calls
                  </Typography>
                  <Box>
                    <Button
                      variant="outlined"
                      sx={{ mr: 1, color: '#000000', borderColor: '#000000' }}
                      onClick={handleViewHistory}
                    >
                      View History
                    </Button>
                  </Box>
                </Box>

                {calls.filter(c => c.status !== 'completed').length === 0 ? (
                  <Alert severity="info" sx={{ bgcolor: '#e3f2fd', color: '#000000' }}>
                    No active calls. Waiting for incoming calls.
                  </Alert>
                ) : (
                  calls.filter(c => c.status !== 'completed').map(call => (
                    <ActiveCallCard
                      key={call.id}
                      call={call}
                      onEndCall={handleEndCall}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ color: '#000000' }}>
                  Live Transcript
                </Typography>
                <TranscriptViewer transcript={currentTranscript} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ mt: 3, bgcolor: '#ffffff', border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ color: '#000000' }}>
              Recent Calls
            </Typography>
            {calls.filter(c => c.status === 'completed').length === 0 ? (
              <Alert severity="info" sx={{ bgcolor: '#e3f2fd', color: '#000000' }}>
                No recent calls.
              </Alert>
            ) : (
              calls.filter(c => c.status === 'completed').map(call => (
                <ActiveCallCard
                  key={call.id}
                  call={call}
                  onEndCall={handleEndCall}
                />
              ))
            )}
          </CardContent>
        </Card>
      </Box>
    </NavigationLayout>
  );
}