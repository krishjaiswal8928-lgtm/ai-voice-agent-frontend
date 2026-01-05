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
import { useLeads } from '@/hooks/useLeads';
import { useVoice } from '@/hooks/useVoice';
import { callSessionAPI } from '@/lib/api';

interface Call {
  id: string;
  leadName: string;
  phoneNumber: string;
  status: 'ringing' | 'in-progress' | 'completed' | 'failed';
  duration: number;
}

export const dynamicParams = false;

export default function OutboundCallingLiveScreen({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { callSessions, loading: campaignsLoading, fetchCallSessions } = useCallSessions();
  const { leads, loading: leadsLoading, fetchLeads } = useLeads(parseInt(params.id));
  const { activeCalls, loading: voiceLoading, fetchActiveCalls } = useVoice();

  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const campaignId = parseInt(params.id);

  // Get campaign data
  const campaign = callSessions.find(c => c.id === params.id);
  const campaignStatus = campaign?.status || 'draft';

  const handleViewHistory = () => {
    router.push(`/campaigns/by-id/${campaignId}/history`);
  };

  const handleBack = () => {
    router.push('/campaigns');
  };

  const handleStartCampaign = async () => {
    try {
      setProcessing(true);
      await callSessionAPI.start(params.id);
      fetchCallSessions(); // Refresh the call sessions list
    } catch (err) {
      console.error('Error starting campaign:', err);
      alert('Failed to start campaign. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleStopCampaign = async () => {
    try {
      setProcessing(true);
      await callSessionAPI.stop(params.id);
      fetchCallSessions(); // Refresh the call sessions list
    } catch (err) {
      console.error('Error stopping campaign:', err);
      alert('Failed to stop campaign. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Fetch leads and active calls when component mounts
  useEffect(() => {
    if (campaignId) {
      fetchLeads(campaignId);
      fetchActiveCalls();
    }
  }, [campaignId, fetchLeads, fetchActiveCalls]);

  // Remove the tight polling interval - the useVoice hook already handles polling
  // The useEffect for active calls polling has been removed

  const handleEndCall = (callId: string) => {
    // In a real implementation, this would call the API to end the call
    console.log('Ending call:', callId);
  };

  if (campaignsLoading || leadsLoading) {
    return (
      <NavigationLayout>
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress />
        </Box>
      </NavigationLayout>
    );
  }

  // Convert leads to calls for display
  const leadCalls: Call[] = leads.map((lead, index) => ({
    id: `lead-${lead.id}`,
    leadName: lead.name,
    phoneNumber: lead.phone,
    status: lead.status === 'new' ? 'ringing' : lead.status === 'in_progress' ? 'in-progress' : 'completed',
    duration: 0
  }));

  // Combine with active calls from WebSocket
  const allCalls = [...leadCalls, ...activeCalls.map(call => ({
    id: call.call_sid,
    leadName: 'Unknown', // Would be fetched from lead data
    phoneNumber: 'Unknown',
    status: 'in-progress' as const,
    duration: Math.floor(call.duration)
  }))];

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
                label="outbound"
                size="small"
                sx={{
                  bgcolor: '#2196f3',
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
                startIcon={processing ? <CircularProgress size={20} /> : <Stop />}
                onClick={handleStopCampaign}
                disabled={processing}
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
                startIcon={processing ? <CircularProgress size={20} /> : <PlayArrow />}
                onClick={handleStartCampaign}
                disabled={processing || leads.length === 0}
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

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h5" sx={{ color: '#000000' }}>
                    Campaign Controls
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

                <Box mb={2}>
                  <Typography variant="body1">
                    <strong>Total Leads:</strong> {leads.length}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Completed Calls:</strong> {leads.filter(l => l.status === 'completed').length}
                  </Typography>
                </Box>

                {leads.length === 0 && (
                  <Alert severity="warning" sx={{ bgcolor: '#ffecb3', color: '#000000' }}>
                    No leads uploaded. Please upload leads to start the campaign.
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card sx={{ mt: 3, bgcolor: '#ffffff', border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ color: '#000000' }}>
                  Lead List
                </Typography>
                {leads.length === 0 ? (
                  <Alert severity="info" sx={{ bgcolor: '#e3f2fd', color: '#000000' }}>
                    No leads available.
                  </Alert>
                ) : (
                  <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                    {leads.map(lead => (
                      <Box key={lead.id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #333' }}>
                        <Typography variant="body1" sx={{ color: '#000000' }}>
                          <strong>{lead.name}</strong>
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#555555' }}>
                          {lead.phone} {lead.email ? `(${lead.email})` : ''}
                        </Typography>
                        <Chip
                          label={lead.status}
                          size="small"
                          color={
                            lead.status === 'new' ? 'default' :
                              lead.status === 'in_progress' ? 'primary' :
                                lead.status === 'completed' ? 'success' : 'default'
                          }
                          sx={{ mt: 1, color: '#fff' }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Active Calls
                </Typography>
                {allCalls.filter(c => c.status === 'in-progress' || c.status === 'ringing').length === 0 ? (
                  <Alert severity="info" sx={{ bgcolor: '#e3f2fd', color: '#000000' }}>
                    No active calls.
                  </Alert>
                ) : (
                  allCalls.filter(c => c.status === 'in-progress' || c.status === 'ringing').map(call => (
                    <ActiveCallCard
                      key={call.id}
                      call={call}
                      onEndCall={handleEndCall}
                    />
                  ))
                )}
              </CardContent>
            </Card>

            <Card sx={{ mt: 3, bgcolor: '#ffffff', border: '1px solid #e0e0e0' }}>
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
              Completed Calls
            </Typography>
            {allCalls.filter(c => c.status === 'completed').length === 0 ? (
              <Alert severity="info" sx={{ bgcolor: '#e3f2fd', color: '#000000' }}>
                No completed calls yet.
              </Alert>
            ) : (
              allCalls.filter(c => c.status === 'completed').map(call => (
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