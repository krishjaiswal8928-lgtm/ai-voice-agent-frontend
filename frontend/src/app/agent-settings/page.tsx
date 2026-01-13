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
  Paper,
  IconButton
} from '@mui/material';
import {
  Add,
  Settings,
  SmartToy,
  Edit,
  Delete,
  Psychology,
  RecordVoiceOver,
  Hearing,
  AutoAwesome,
  Campaign as CampaignIcon,  // Rename to avoid conflict
  Error
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { NavigationLayout } from '@/components/NavigationLayout';
import { voiceAPI } from '@/lib/api';

interface CustomAgent {
  id: string;  // Changed from number to string to match Firebase IDs
  name: string;
  description: string;
  llm_provider: string;
  tts_provider: string;
  stt_provider: string;
  personality: string;
  created_at: string;
}

export default function AgentSettingsScreen() {
  const router = useRouter();
  const [agents, setAgents] = useState<CustomAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await voiceAPI.getCustomAgents();
      setAgents(response.data);
    } catch (err) {
      setError('Failed to fetch agents');
      console.error('Error fetching agents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = () => {
    router.push('/agent-settings/create');
  };

  const handleEditAgent = (agentId: string) => {  // Changed from number to string
    router.push(`/agent-settings/${agentId}/edit`);
  };

  const handleDeleteAgent = async (agentId: string) => {  // Changed from number to string
    if (window.confirm('Are you sure you want to delete this agent?')) {
      try {
        await voiceAPI.deleteCustomAgent(agentId);
        fetchAgents(); // Refresh the list
      } catch (err) {
        setError('Failed to delete agent');
        console.error('Error deleting agent:', err);
      }
    }
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, position: 'relative', zIndex: 1 }}>
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700, color: '#111827' }}>
              Agent
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            size="large"
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
            Create New Agent
          </Button>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', height: '100%', boxShadow: '0 1px 3px rgba(99,102,241,0.1)', '&:hover': { boxShadow: '0 4px 12px rgba(99,102,241,0.15)' } }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#555555', mb: 1 }}>
                      Total Agents
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#000000' }}>
                      {agents.length}
                    </Typography>
                  </Box>
                  <SmartToy sx={{ fontSize: 48, color: '#6366f1' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', height: '100%', boxShadow: '0 1px 3px rgba(99,102,241,0.1)', '&:hover': { boxShadow: '0 4px 12px rgba(99,102,241,0.15)' } }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#555555', mb: 1 }}>
                      Active Campaigns
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#000000' }}>
                      0
                    </Typography>
                  </Box>
                  <CampaignIcon sx={{ fontSize: 48, color: '#6366f1' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', height: '100%', boxShadow: '0 1px 3px rgba(99,102,241,0.1)', '&:hover': { boxShadow: '0 4px 12px rgba(99,102,241,0.15)' } }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#555555', mb: 1 }}>
                      Training Data
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#000000' }}>
                      0
                    </Typography>
                  </Box>
                  <AutoAwesome sx={{ fontSize: 48, color: '#6366f1' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Agents List */}
        <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(99,102,241,0.1)', '&:hover': { boxShadow: '0 4px 12px rgba(99,102,241,0.15)' }, position: 'relative', zIndex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827' }}>
                Your Custom Agents
              </Typography>
              <Chip
                label={`${agents.length} agents`}
                size="small"
                sx={{ bgcolor: '#6366f1', color: '#ffffff' }}
              />
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress sx={{ color: '#6366f1' }} />
              </Box>
            ) : error ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Error sx={{ fontSize: 60, color: '#f44336', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#f44336' }}>
                  {error}
                </Typography>
                <Button
                  variant="contained"
                  onClick={fetchAgents}
                  sx={{
                    mt: 2,
                    bgcolor: '#f44336',
                    color: '#ffffff',
                    '&:hover': {
                      bgcolor: '#d32f2f'
                    }
                  }}
                >
                  Retry
                </Button>
              </Box>
            ) : agents.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <SmartToy sx={{ fontSize: 60, color: '#6b7280', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#6b7280' }}>
                  No agents created yet
                </Typography>
                <Typography variant="body2" sx={{ color: '#888888', mt: 1 }}>
                  Create your first custom agent to get started
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
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
                  Create New Agent
                </Button>
              </Box>
            ) : (
              <List>
                {agents.map((agent, index) => (
                  <React.Fragment key={agent.id}>
                    <ListItem
                      sx={{
                        bgcolor: '#ffffff',
                        mb: 1,
                        borderRadius: 1,
                        border: '1px solid #e0e0e0',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#6366f1' }}>
                          <SmartToy />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6" sx={{ color: '#111827', fontWeight: 600 }}>{agent.name}</Typography>
                            <Chip
                              label={agent.personality}
                              size="small"
                              sx={{
                                bgcolor: '#f5f5f5',
                                color: '#000000',
                                textTransform: 'capitalize'
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" component="div" sx={{ color: '#6b7280', mb: 1, display: 'block' }}>
                              {agent.description || 'No description'}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                              <Chip
                                icon={<Psychology />}
                                label={agent.llm_provider}
                                size="small"
                                sx={{
                                  bgcolor: '#f5f5f5',
                                  color: '#000000',
                                  textTransform: 'capitalize'
                                }}
                              />
                              <Chip
                                icon={<RecordVoiceOver />}
                                label={agent.tts_provider}
                                size="small"
                                sx={{
                                  bgcolor: '#f5f5f5',
                                  color: '#000000',
                                  textTransform: 'capitalize'
                                }}
                              />
                              <Chip
                                icon={<Hearing />}
                                label={agent.stt_provider}
                                size="small"
                                sx={{
                                  bgcolor: '#f5f5f5',
                                  color: '#000000',
                                  textTransform: 'capitalize'
                                }}
                              />
                            </Box>
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          onClick={() => handleEditAgent(agent.id)}
                          sx={{ color: '#6366f1', '&:hover': { bgcolor: 'rgba(99,102,241,0.1)' } }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteAgent(agent.id)}
                          sx={{ color: '#f44336' }}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </ListItem>
                    {index < agents.length - 1 && <Divider sx={{ bgcolor: '#e0e0e0', my: 1 }} />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Box>
    </NavigationLayout>
  );
}