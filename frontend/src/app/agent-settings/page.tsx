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
  Campaign as CampaignIcon,
  Error,
  CheckCircle,
  Cancel,
  School,
  Phone
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
  trained_documents?: any[];
  phone_number_id?: string;
  is_active?: boolean;
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
        minHeight: '100vh',
        background: '#09090b', // Deep dark background
        color: '#ffffff',
        width: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Ambient Background Effects */}
        <Box sx={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(60px)',
          zIndex: 0
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: '-20%',
          left: '-10%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(60px)',
          zIndex: 0
        }} />

        <Box sx={{ p: 4, position: 'relative', zIndex: 1, maxWidth: 1600, mx: 'auto' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
            <Box>
              <Typography variant="h3" component="h1" sx={{
                fontWeight: 800,
                mb: 1,
                background: 'linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                AI Agents
              </Typography>
              <Typography variant="body1" sx={{ color: '#a1a1aa' }}>
                Manage and train your fleet of intelligent voice assistants
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              size="large"
              onClick={handleCreateAgent}
              sx={{
                bgcolor: '#ffffff',
                color: '#000000',
                fontWeight: 700,
                px: 3,
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                fontSize: '1rem',
                boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  bgcolor: '#f4f4f5',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 0 30px rgba(255, 255, 255, 0.2)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              Create New Agent
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
              <CircularProgress sx={{ color: '#6366f1' }} />
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: 'center', py: 12 }}>
              <Error sx={{ fontSize: 60, color: '#ef4444', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#ef4444' }}>
                {error}
              </Typography>
              <Button
                variant="outlined"
                onClick={fetchAgents}
                sx={{ mt: 2, color: '#ffffff', borderColor: '#ffffff' }}
              >
                Retry
              </Button>
            </Box>
          ) : agents.length === 0 ? (
            <Paper
              sx={{
                p: 8,
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}
            >
              <SmartToy sx={{ fontSize: 80, color: 'rgba(255, 255, 255, 0.1)', mb: 3 }} />
              <Typography variant="h5" sx={{ color: '#ffffff', fontWeight: 600, mb: 1 }}>
                No Agents Deployed
              </Typography>
              <Typography variant="body1" sx={{ color: '#a1a1aa', mb: 4 }}>
                Create your first AI agent to start automating your calls.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateAgent}
                sx={{
                  bgcolor: '#6366f1',
                  color: '#ffffff',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  borderRadius: '12px',
                  '&:hover': { bgcolor: '#4f46e5' }
                }}
              >
                Create Agent
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {agents.map((agent) => {
                // Robust check for trained documents (could be null, undefined, or empty array)
                const isTrained = Array.isArray(agent.trained_documents) && agent.trained_documents.length > 0;
                // Robust check for phone number (could be null, undefined, or empty string)
                const hasPhone = Boolean(agent.phone_number_id);
                // Agent is active only if BOTH conditions are met
                const isActive = isTrained && hasPhone;

                return (
                  <Grid item xs={12} md={6} lg={4} key={agent.id}>
                    <Card
                      sx={{
                        height: '100%',
                        background: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '24px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'visible',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* Agent Header */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Avatar
                              sx={{
                                width: 56,
                                height: 56,
                                borderRadius: '16px',
                                bgcolor: isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                color: isActive ? '#10b981' : '#f59e0b',
                                border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                              }}
                            >
                              <SmartToy sx={{ fontSize: 28 }} />
                            </Avatar>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff', lineHeight: 1.2, mb: 0.5 }}>
                                {agent.name}
                              </Typography>
                              <Chip
                                label={isActive ? 'Active' : 'Setup Required'}
                                size="small"
                                variant="outlined"
                                sx={{
                                  height: 20,
                                  fontSize: '0.7rem',
                                  borderColor: isActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)',
                                  color: isActive ? '#10b981' : '#f59e0b',
                                  bgcolor: isActive ? 'rgba(16, 185, 129, 0.05)' : 'rgba(245, 158, 11, 0.05)'
                                }}
                              />
                            </Box>
                          </Box>

                          {/* Actions Menu */}
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleEditAgent(agent.id)}
                              sx={{
                                color: '#a1a1aa',
                                '&:hover': { color: '#ffffff', bgcolor: 'rgba(255,255,255,0.1)' }
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteAgent(agent.id)}
                              sx={{
                                color: '#a1a1aa',
                                '&:hover': { color: '#ef4444', bgcolor: 'rgba(239,68,68,0.1)' }
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>

                        <Typography variant="body2" sx={{ color: '#a1a1aa', mb: 3, flexGrow: 1, lineHeight: 1.6 }}>
                          {agent.description || 'No description provided for this agent.'}
                        </Typography>

                        {/* Status Grid */}
                        <Box sx={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: 2,
                          mt: 'auto'
                        }}>
                          {/* Training Status */}
                          <Box sx={{
                            p: 2,
                            borderRadius: '16px',
                            bgcolor: 'rgba(0,0,0,0.2)',
                            border: '1px solid rgba(255,255,255,0.03)'
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                              <School sx={{ fontSize: 18, color: '#a1a1aa' }} />
                              <Typography variant="caption" sx={{ color: '#a1a1aa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Knowledge
                              </Typography>
                            </Box>
                            {isTrained ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#10b981' }}>
                                <CheckCircle sx={{ fontSize: 18 }} />
                                <Typography variant="body2" fontWeight={600}>Trained</Typography>
                              </Box>
                            ) : (
                              <Button
                                fullWidth
                                variant="contained"
                                size="small"
                                onClick={() => router.push(`/knowledge-base?agent_id=${agent.id}`)}
                                sx={{
                                  bgcolor: '#f59e0b',
                                  color: '#000000',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  textTransform: 'none',
                                  borderRadius: '8px',
                                  '&:hover': { bgcolor: '#d97706' }
                                }}
                              >
                                Train Now
                              </Button>
                            )}
                          </Box>

                          {/* Phone Status */}
                          <Box sx={{
                            p: 2,
                            borderRadius: '16px',
                            bgcolor: 'rgba(0,0,0,0.2)',
                            border: '1px solid rgba(255,255,255,0.03)'
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                              <Phone sx={{ fontSize: 18, color: '#a1a1aa' }} />
                              <Typography variant="caption" sx={{ color: '#a1a1aa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Connection
                              </Typography>
                            </Box>
                            {hasPhone ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#10b981' }}>
                                <CheckCircle sx={{ fontSize: 18 }} />
                                <Typography variant="body2" fontWeight={600}>Connected</Typography>
                              </Box>
                            ) : (
                              <Button
                                fullWidth
                                variant="contained"
                                size="small"
                                onClick={() => handleEditAgent(agent.id)}
                                sx={{
                                  bgcolor: '#f59e0b',
                                  color: '#000000',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  textTransform: 'none',
                                  borderRadius: '8px',
                                  '&:hover': { bgcolor: '#d97706' }
                                }}
                              >
                                Assign #
                              </Button>
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      </Box>
    </NavigationLayout>
  );
}