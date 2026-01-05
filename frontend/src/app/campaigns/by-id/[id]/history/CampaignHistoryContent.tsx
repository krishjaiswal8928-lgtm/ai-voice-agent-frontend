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
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Search,
  Phone,
  CheckCircle,
  Error,
  AccessTime,
  Refresh,
  Person
} from '@mui/icons-material';
import { reportAPI, callSessionAPI, voiceAPI } from '@/lib/api'; // Add voiceAPI import

interface Conversation {
  id: number;
  lead_id: number | null;
  lead_name: string;
  phone_number: string;
  duration: number;
  status: string;
  created_at: string;
  transcript: string;
}

export default function CampaignHistoryContent({ campaignId }: { campaignId: string }) {  // Changed from number to string
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [campaign, setCampaign] = useState<any>(null);
  const [agentName, setAgentName] = useState<string>('Loading...');
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCalls, setActiveCalls] = useState<any[]>([]); // Track active calls

  // Fetch active calls periodically
  useEffect(() => {
    const fetchActiveCalls = async () => {
      try {
        const response = await voiceAPI.getActiveCalls();
        setActiveCalls(response.data || []);
      } catch (error) {
        console.error('Error fetching active calls:', error);
      }
    };

    // Fetch immediately and then every 10 seconds
    fetchActiveCalls();
    const interval = setInterval(fetchActiveCalls, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        let currentCampaign = campaign;

        // Fetch campaign data only if not already loaded
        if (!currentCampaign) {
          const campaignResponse = await callSessionAPI.getById(campaignId);
          currentCampaign = campaignResponse.data;
          setCampaign(currentCampaign);
        }

        // Fetch agent details if custom_agent_id exists
        if (currentCampaign?.custom_agent_id) {
          try {
            const agentResponse = await voiceAPI.getCustomAgent(currentCampaign.custom_agent_id);
            setAgentName(agentResponse.data.name);
          } catch (agentErr) {
            console.error('Error fetching agent details:', agentErr);
            setAgentName('Unknown Agent');
          }
        } else {
          setAgentName('Default Agent');
        }

        // Fetch conversation data for the campaign
        const conversationsResponse = await reportAPI.getCallSessionConversations(campaignId);
        setConversations(conversationsResponse.data);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError('Failed to load campaign data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (campaignId) {
      fetchData();
    }
  }, [campaignId]); // Removed campaign from dependency array to avoid infinite loop if we set it inside

  const formatDuration = (seconds: number) => {
    if (seconds <= 0) return 'N/A';
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
      case 'in_progress':
        return <AccessTime sx={{ color: '#2196f3' }} />;
      case 'ringing':
        return <Phone sx={{ color: '#ff9800' }} />;
      default:
        return <Phone sx={{ color: '#9e9e9e' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4caf50';
      case 'failed':
        return '#f44336';
      case 'in_progress':
        return '#2196f3';
      case 'ringing':
        return '#ff9800';
      default:
        return '#9e9e9e';
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.phone_number.includes(searchTerm) ||
    (conv.lead_name && conv.lead_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group conversations by status for summary
  const statusSummary = conversations.reduce((acc, conv) => {
    acc[conv.status] = (acc[conv.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Fetch conversation data for the campaign
      const conversationsResponse = await reportAPI.getCallSessionConversations(campaignId);
      setConversations(conversationsResponse.data);
    } catch (error: any) {
      console.error('Error refreshing data:', error);
      setError('Failed to refresh data. Please try again later.');
    } finally {
      setRefreshing(false);
    }
  };

  // Combine conversations with active calls for real-time display
  const allCalls = [...conversations];

  // Add active calls that aren't in conversations yet
  activeCalls.forEach(call => {
    // Check if this call is already in conversations
    const existing = conversations.find(conv => conv.lead_id === call.lead_id);
    if (!existing && call.campaign_id === campaignId) {
      // Create a temporary conversation entry for active calls
      allCalls.push({
        id: call.call_sid,
        lead_id: call.lead_id,
        lead_name: call.lead_name || 'Unknown',
        phone_number: call.to_phone,
        duration: call.duration || 0,
        status: call.status || 'ringing',
        created_at: new Date().toISOString(),
        transcript: ''
      });
    }
  });

  const filteredCalls = allCalls.filter(call =>
    call.phone_number.includes(searchTerm) ||
    (call.lead_name && call.lead_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Box>
      {/* Campaign Summary */}
      {campaign && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <Chip
            label={`Total Calls: ${allCalls.length}`}
            sx={{ bgcolor: '#e0e0e0', color: '#000000' }}
          />
          <Chip
            label={`Completed: ${statusSummary['completed'] || 0}`}
            sx={{ bgcolor: '#4caf50', color: '#ffffff' }}
          />
          <Chip
            label={`Failed: ${statusSummary['failed'] || 0}`}
            sx={{ bgcolor: '#f44336', color: '#ffffff' }}
          />
          <Chip
            label={`In Progress: ${statusSummary['in_progress'] || 0}`}
            sx={{ bgcolor: '#2196f3', color: '#ffffff' }}
          />
          <Chip
            label={`Ringing: ${allCalls.filter(c => c.status === 'ringing').length}`}
            sx={{ bgcolor: '#ff9800', color: '#ffffff' }}
          />
          <Button
            startIcon={refreshing ? <CircularProgress size={20} /> : <Refresh />}
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outlined"
            size="small"
            sx={{
              color: '#000000',
              borderColor: '#000000',
              '&:hover': {
                borderColor: '#333333',
                backgroundColor: 'rgba(0,0,0,0.03)'
              }
            }}
          >
            Refresh
          </Button>
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#000000' }} />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ bgcolor: '#ffffff', border: '1px solid #e0e0e0' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#555555', borderBottom: '1px solid #e0e0e0' }}>Phone Number</TableCell>
                <TableCell sx={{ color: '#555555', borderBottom: '1px solid #e0e0e0' }}>Name</TableCell>
                <TableCell sx={{ color: '#555555', borderBottom: '1px solid #e0e0e0' }}>Agent</TableCell>
                <TableCell sx={{ color: '#555555', borderBottom: '1px solid #e0e0e0' }}>Duration</TableCell>
                <TableCell sx={{ color: '#555555', borderBottom: '1px solid #e0e0e0' }}>Status</TableCell>
                <TableCell sx={{ color: '#555555', borderBottom: '1px solid #e0e0e0' }}>Date</TableCell>
                <TableCell sx={{ color: '#555555', borderBottom: '1px solid #e0e0e0' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCalls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ color: '#555555', borderBottom: '1px solid #e0e0e0', py: 4 }}>
                    <Phone sx={{ fontSize: 40, color: '#e0e0e0', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#000000' }}>No calls found</Typography>
                    <Typography variant="body2" sx={{ color: '#555555' }}>
                      {searchTerm ? 'Try adjusting your search terms' : campaign ? 'No calls have been made in this campaign yet' : 'No campaign data available'}
                    </Typography>
                    {campaign && !searchTerm && (
                      <Typography variant="body2" sx={{ color: '#555555', mt: 1 }}>
                        Campaign was created on {new Date(campaign.created_at).toLocaleDateString()}.
                        {campaign.type === 'outbound' && ' Upload leads and start the campaign to begin making calls.'}
                      </Typography>
                    )}
                    {campaign && campaign.type === 'outbound' && (
                      <Typography variant="body2" sx={{ color: '#555555', mt: 1 }}>
                        Start the campaign to begin making calls to your leads.
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCalls.map((call) => (
                  <TableRow
                    key={call.id}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': { bgcolor: '#f5f5f5' }
                    }}
                  >
                    <TableCell sx={{ color: '#000000', borderBottom: '1px solid #e0e0e0' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getStatusIcon(call.status)}
                        <Typography sx={{ ml: 1, color: '#000000' }}>{call.phone_number}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#000000', borderBottom: '1px solid #e0e0e0' }}>
                      {call.lead_name || 'Unknown Caller'}
                    </TableCell>
                    <TableCell sx={{ color: '#000000', borderBottom: '1px solid #e0e0e0' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person sx={{ fontSize: 16, color: '#888' }} />
                        <Typography variant="body2">{agentName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#000000', borderBottom: '1px solid #e0e0e0' }}>
                      {formatDuration(call.duration)}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                      <Chip
                        label={call.status.replace('_', ' ')}
                        size="small"
                        sx={{
                          bgcolor: getStatusColor(call.status),
                          color: call.status === 'ringing' ? '#ffffff' : '#ffffff'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#000000', borderBottom: '1px solid #e0e0e0' }}>
                      {formatDate(call.created_at)}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #333' }}>
                      <Button
                        size="small"
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
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}