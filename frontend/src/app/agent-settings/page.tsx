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
              sx={{ mt: 2, color: '#6366f1', borderColor: '#6366f1', '&:hover': { borderColor: '#4f46e5', color: '#4f46e5' } }}
            >
              Retry
            </Button>
          </Box>
        ) : agents.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <SmartToy sx={{ fontSize: 60, color: '#9ca3af', mb: 2 }} />
            <Typography variant="h5" sx={{ color: '#111827', fontWeight: 600, mb: 1 }}>
              No Agents Deployed
            </Typography>
            <Typography variant="body1" sx={{ color: '#6b7280', mb: 4 }}>
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
                borderRadius: '8px',
                '&:hover': { bgcolor: '#4f46e5' }
              }}
            >
              Create Agent
            </Button>
          </Box>
        ) : (
          <Grid container spacing={4}>
            {agents.map((agent) => {
              // Logic Update: Trained only if > 2 chunks
              const isTrained = Array.isArray(agent.trained_documents) && agent.trained_documents.length > 2;
              const hasPhone = Boolean(agent.phone_number_id);
              const isActive = isTrained && hasPhone;

              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={agent.id}>
                  <Card
                    sx={{
                      height: '100%',
                      aspectRatio: '1/1', // Make it square
                      display: 'flex',
                      flexDirection: 'column',
                      bgcolor: '#ffffff',
                      borderRadius: '16px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      transition: 'all 0.3s ease',
                      border: '1px solid #e5e7eb',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Avatar
                          sx={{
                            width: 64,
                            height: 64,
                            bgcolor: '#f3f4f6', // Light gray background
                            color: '#4f46e5', // Brand Indigo color
                            borderRadius: '12px'
                          }}
                        >
                          <SmartToy sx={{ fontSize: 32 }} />
                        </Avatar>

                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditAgent(agent.id)}
                            sx={{ color: '#9ca3af', '&:hover': { color: '#6366f1', bgcolor: '#eef2ff' } }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteAgent(agent.id)}
                            sx={{ color: '#9ca3af', '&:hover': { color: '#ef4444', bgcolor: '#fef2f2' } }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>

                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 1, lineHeight: 1.2 }}>
                        {agent.name}
                      </Typography>

                      <Typography variant="body2" sx={{
                        color: '#6b7280',
                        mb: 3,
                        flexGrow: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {agent.description || 'No description provided.'}
                      </Typography>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 'auto' }}>
                        {/* Training Status */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="body2" sx={{ color: '#4b5563', fontWeight: 500 }}>Knowledge</Typography>
                          {isTrained ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#059669', bgcolor: '#d1fae5', px: 1, py: 0.5, borderRadius: '4px' }}>
                              <CheckCircle sx={{ fontSize: 16 }} />
                              <Typography variant="caption" fontWeight={700}>Trained</Typography>
                            </Box>
                          ) : (
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => router.push(`/knowledge-base?agent_id=${agent.id}`)}
                              sx={{
                                bgcolor: '#6366f1', // Primary brand color
                                color: '#ffffff',
                                fontSize: '0.75rem',
                                textTransform: 'none',
                                px: 2,
                                py: 0.5,
                                lineHeight: 1.5,
                                minWidth: '80px',
                                boxShadow: 'none',
                                '&:hover': { bgcolor: '#4f46e5' }
                              }}
                            >
                              Train Now
                            </Button>
                          )}
                        </Box>

                        {/* Phone Status */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="body2" sx={{ color: '#4b5563', fontWeight: 500 }}>Phone</Typography>
                          {hasPhone ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#059669', bgcolor: '#d1fae5', px: 1, py: 0.5, borderRadius: '4px' }}>
                              <CheckCircle sx={{ fontSize: 16 }} />
                              <Typography variant="caption" fontWeight={700}>Assigned</Typography>
                            </Box>
                          ) : (
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleEditAgent(agent.id)}
                              sx={{
                                bgcolor: '#6366f1', // Primary brand color
                                color: '#ffffff',
                                fontSize: '0.75rem',
                                textTransform: 'none',
                                px: 2,
                                py: 0.5,
                                lineHeight: 1.5,
                                minWidth: '80px',
                                boxShadow: 'none',
                                '&:hover': { bgcolor: '#4f46e5' }
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
    </NavigationLayout>
  );
}