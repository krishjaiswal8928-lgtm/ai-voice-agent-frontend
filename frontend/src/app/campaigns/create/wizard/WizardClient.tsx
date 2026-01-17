'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Grid,
  Paper,
  Fade,
  Grow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Backdrop
} from '@mui/material';
import {
  SmartToy,
  Psychology,
  RecordVoiceOver,
  Hearing,
  ArrowBack,
  ArrowForward,
  CallMade,
  CallReceived,
  Upload,
  CheckCircle,
  AutoAwesome,
  Groups,
  TrendingUp
} from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { NavigationLayout } from '@/components/NavigationLayout';
import { WizardStepper } from '@/components/WizardStepper';
import { AnimatedCard } from '@/components/AnimatedCard';
import { callSessionAPI, voiceAPI } from '@/lib/api';
import { LeadCSVUploader } from '@/components/campaign/LeadCSVUploader';
import { useTheme } from '@mui/material/styles';

interface Lead {
  name: string;
  phone: string;
  email?: string;
}

interface CustomAgent {
  id: number;
  name: string;
  description: string;
  llm_provider: string;
  tts_provider: string;
  stt_provider: string;
  personality: string;
  created_at: string;
}

export default function CampaignCreationWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') || 'outbound';
  const theme = useTheme();

  // Step state
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Campaign data
  const [campaignType, setCampaignType] = useState<'outbound' | 'inbound'>(initialType as any);
  const [campaignName, setCampaignName] = useState('');
  const [campaignGoal, setCampaignGoal] = useState('');
  const [idealCustomerDescription, setIdealCustomerDescription] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaignId, setCampaignId] = useState<number | null>(null);
  const [customAgentId, setCustomAgentId] = useState<number | null>(null);
  const [customAgents, setCustomAgents] = useState<CustomAgent[]>([]);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (token) {
        setIsAuthenticated(true);
      } else {
        setError('You must be logged in to create a campaign');
        router.push('/auth/login');
      }
      setAuthChecked(true);
    };

    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [router]);

  // Fetch custom agents
  useEffect(() => {
    if (isAuthenticated) {
      fetchCustomAgents();
    }
  }, [isAuthenticated]);

  const fetchCustomAgents = async () => {
    try {
      const response = await voiceAPI.getCustomAgents();
      setCustomAgents(response.data);
    } catch (err) {
      console.error('Error fetching custom agents:', err);
    }
  };

  const steps = campaignType === 'outbound'
    ? ['Call Session Type', 'Upload Leads', 'Select Agent', 'Goal & Qualification', 'Review & Create']
    : ['Call Session Type', 'Select Agent', 'Goal & Qualification', 'Review & Create'];

  // Step 0: Campaign Type
  const handleTypeChange = (type: 'outbound' | 'inbound') => {
    setCampaignType(type);
  };

  // Step 1 (Outbound): Upload Leads
  const handleLeadFileUpload = async (file: File) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required. Please log in again.');
      router.push('/auth/login');
      return;
    }

    if (!campaignId) {
      setError('Call Session ID not found. Please restart the wizard.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await callSessionAPI.uploadLeads(campaignId.toString(), file);
      if (response && response.data) {
        setLeads(response.data);
      }
      setError('');
    } catch (err: any) {
      console.error('Error uploading leads:', err);
      let errorMessage = 'Failed to upload leads';

      if (err.response) {
        if (err.response?.data?.detail) {
          errorMessage = err.response.data.detail;
        } else if (typeof err.response?.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response?.data) {
          errorMessage = JSON.stringify(err.response.data);
        } else {
          errorMessage = `Server error: ${err.response.status} ${err.response.statusText}`;
        }
      } else if (err.request) {
        errorMessage = 'Network error: Unable to connect to server. Please check your internet connection and try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(`Error uploading leads: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Navigation
  const handleNext = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required. Please log in again.');
      router.push('/auth/login');
      return;
    }

    // Validate required fields for current step
    if (activeStep === 0) {
      if (!campaignName.trim()) {
        setError('Call session name is required');
        return;
      }
    } else if (activeStep === 1 && campaignType === 'outbound') {
      if (leads.length === 0) {
        setError('Please upload leads');
        return;
      }
    } else if (
      (activeStep === 1 && campaignType === 'inbound') ||
      (activeStep === 2 && campaignType === 'outbound')
    ) {
      if (!customAgentId) {
        console.log('No custom agent selected');
      }
    } else if (
      (activeStep === 2 && campaignType === 'inbound') ||
      (activeStep === 3 && campaignType === 'outbound')
    ) {
      if (!campaignGoal.trim()) {
        setError('Call session goal is required');
        return;
      }
    }

    // Create or Update campaign on first step
    if (activeStep === 0) {
      setLoading(true);
      setError('');

      try {
        const requestData = {
          name: campaignName,
          type: campaignType,
          goal: campaignGoal || '',
        };

        if (campaignId) {
          console.log('Updating campaign with data:', requestData);
          await callSessionAPI.update(campaignId.toString(), requestData);
        } else {
          console.log('Creating campaign with data:', requestData);
          const response = await callSessionAPI.create(requestData);
          console.log('Campaign creation response:', response);
          setCampaignId(response.data.id);
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.detail || err.message || 'Failed to save campaign';
        setError(`Failed to save campaign: ${errorMessage}`);
        console.error('Error saving campaign:', err);
        setLoading(false);
        return;
      } finally {
        setLoading(false);
      }
    }

    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleFinish = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required. Please log in again.');
      router.push('/auth/login');
      return;
    }

    if (!campaignId) return;

    setLoading(true);
    setError('');

    try {
      await callSessionAPI.update(campaignId.toString(), {
        name: campaignName,
        goal: campaignGoal,
        ideal_customer_description: idealCustomerDescription,
        type: campaignType,
        custom_agent_id: customAgentId
      });

      router.push('/campaigns');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to finalize Call Session';
      setError(`Failed to finalize Call Session: ${errorMessage}`);
      console.error('Error finalizing campaign:', err);
    } finally {
      setLoading(false);
    }
  };

  // Step components
  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Call Session Type
        return (
          <Fade in timeout={500}>
            <Box sx={{ maxWidth: 900, mx: 'auto', width: '100%' }}>
              <Box sx={{ textAlign: 'center', mb: 5 }}>
                <Typography
                  variant="h4"
                  gutterBottom
                  sx={{
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    mb: 2
                  }}
                >
                  Choose Your Call Session Type
                </Typography>
                <Typography variant="body1" sx={{ color: theme.palette.text.secondary, maxWidth: 600, mx: 'auto' }}>
                  Select how you want to engage with your audience
                </Typography>
              </Box>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <AnimatedCard
                    selected={campaignType === 'outbound'}
                    onClick={() => handleTypeChange('outbound')}
                    gradient="linear-gradient(135deg, #6366f1 0%, #a855f7 100%)"
                    sx={{ height: '100%', p: 3 }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <Box sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3,
                        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)'
                      }}>
                        <CallMade sx={{ fontSize: 40, color: '#ffffff' }} />
                      </Box>
                      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                        Outbound Call Session
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
                        Proactively reach out to your leads with AI-powered calls
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: 'flex-start' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircle sx={{ fontSize: 20, color: '#10b981' }} />
                          <Typography variant="body2">Upload lead lists</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircle sx={{ fontSize: 20, color: '#10b981' }} />
                          <Typography variant="body2">Automated dialing</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircle sx={{ fontSize: 20, color: '#10b981' }} />
                          <Typography variant="body2">Track conversion rates</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </AnimatedCard>
                </Grid>

                <Grid item xs={12} md={6}>
                  <AnimatedCard
                    selected={campaignType === 'inbound'}
                    onClick={() => handleTypeChange('inbound')}
                    gradient="linear-gradient(135deg, #ec4899 0%, #f97316 100%)"
                    sx={{ height: '100%', p: 3 }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <Box sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3,
                        boxShadow: '0 8px 24px rgba(236, 72, 153, 0.3)'
                      }}>
                        <CallReceived sx={{ fontSize: 40, color: '#ffffff' }} />
                      </Box>
                      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                        Inbound Call Session
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
                        Handle incoming calls with intelligent AI assistants
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: 'flex-start' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircle sx={{ fontSize: 20, color: '#10b981' }} />
                          <Typography variant="body2">24/7 availability</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircle sx={{ fontSize: 20, color: '#10b981' }} />
                          <Typography variant="body2">Instant responses</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircle sx={{ fontSize: 20, color: '#10b981' }} />
                          <Typography variant="body2">Smart call routing</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </AnimatedCard>
                </Grid>
              </Grid>
              <AnimatedCard glassEffect sx={{ p: 3 }}>
                <TextField
                  fullWidth
                  label="Call Session Name"
                  variant="outlined"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  required
                  placeholder="e.g., Q1 Sales Outreach, Customer Support Line"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#6366f1',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#6366f1',
                        borderWidth: 2
                      },
                    },
                  }}
                />
              </AnimatedCard>
            </Box>
          </Fade>
        );

      case 1: // Upload Leads (Outbound only) or Select Agent (Inbound)
        if (campaignType === 'outbound') {
          return (
            <Fade in timeout={500}>
              <Box sx={{ maxWidth: 900, mx: 'auto', width: '100%' }}>
                <Box sx={{ textAlign: 'center', mb: 5 }}>
                  <Box sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)'
                  }}>
                    <Upload sx={{ fontSize: 40, color: '#ffffff' }} />
                  </Box>
                  <Typography
                    variant="h4"
                    gutterBottom
                    sx={{
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      mb: 2
                    }}
                  >
                    Upload Your Leads
                  </Typography>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary, maxWidth: 600, mx: 'auto' }}>
                    Upload a CSV file containing your leads. The file must include a 'phone' column.
                  </Typography>
                </Box>

                <AnimatedCard glassEffect sx={{ p: 4 }}>
                  <LeadCSVUploader
                    onFileUpload={handleLeadFileUpload}
                    leads={leads}
                    loading={loading}
                  />

                  {leads.length > 0 && (
                    <Grow in timeout={500}>
                      <Alert
                        severity="success"
                        icon={<Groups />}
                        sx={{
                          mt: 3,
                          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
                          border: '1px solid rgba(16, 185, 129, 0.2)'
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                          {leads.length} leads uploaded successfully!
                        </Typography>
                        <Typography variant="body2">
                          Your leads are ready for the campaign
                        </Typography>
                      </Alert>
                    </Grow>
                  )}
                </AnimatedCard>
              </Box>
            </Fade>
          );
        } else {
          // For inbound, this step is Select Agent
          return renderAgentSelection();
        }

      case 2: // Select Agent (Outbound) or Set Goal (Inbound)
        if (campaignType === 'outbound') {
          return renderAgentSelection();
        } else {
          return renderGoalSetting();
        }

      case 3: // Set Goal (Outbound) or Review & Create (Inbound)
        if (campaignType === 'outbound') {
          return renderGoalSetting();
        } else {
          return renderReview();
        }

      case 4: // Review & Create (Outbound only)
        return renderReview();

      default:
        return null;
    }
  };

  const renderAgentSelection = () => (
    <Fade in timeout={500}>
      <Box sx={{ maxWidth: 900, mx: 'auto', width: '100%' }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Box sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
            boxShadow: '0 8px 24px rgba(34, 211, 238, 0.3)'
          }}>
            <SmartToy sx={{ fontSize: 40, color: '#ffffff' }} />
          </Box>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              mb: 2
            }}
          >
            Select Your AI Agent
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, maxWidth: 600, mx: 'auto' }}>
            Choose a pre-configured custom agent for this campaign
          </Typography>
        </Box>

        {customAgents.length === 0 ? (
          <AnimatedCard glassEffect sx={{ p: 5, textAlign: 'center' }}>
            <AutoAwesome sx={{ fontSize: 60, color: '#6366f1', mb: 2 }} />
            <Typography variant="h6" sx={{ color: theme.palette.text.primary, mb: 2, fontWeight: 700 }}>
              No custom agents available
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
              Create your first custom agent to use in campaigns
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push('/agent-settings/create')}
              startIcon={<SmartToy />}
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                color: '#ffffff',
                fontWeight: 700,
                px: 4,
                py: 1.5,
                '&:hover': {
                  background: 'linear-gradient(135deg, #5558e3 0%, #9333ea 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)'
                }
              }}
            >
              Create New Agent
            </Button>
          </AnimatedCard>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <AnimatedCard
              selected={customAgentId === null}
              onClick={() => setCustomAgentId(null)}
              gradient="linear-gradient(135deg, #6b7280 0%, #4b5563 100%)"
              sx={{ p: 3 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <SmartToy sx={{ fontSize: 32, color: '#ffffff' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Default Agent
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Use the system's default agent configuration
                  </Typography>
                </Box>
              </Box>
            </AnimatedCard>

            {customAgents.map((agent) => (
              <AnimatedCard
                key={agent.id}
                selected={customAgentId === agent.id}
                onClick={() => setCustomAgentId(agent.id)}
                gradient="linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)"
                sx={{ p: 3 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <SmartToy sx={{ fontSize: 32, color: '#ffffff' }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {agent.name}
                      </Typography>
                      <Chip
                        label={agent.personality}
                        size="small"
                        sx={{
                          background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                          color: '#ffffff',
                          fontWeight: 600,
                          textTransform: 'capitalize'
                        }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                      {agent.description || 'No description'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        icon={<Psychology sx={{ fontSize: 16 }} />}
                        label={agent.llm_provider}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(99, 102, 241, 0.1)',
                          color: '#6366f1',
                          fontWeight: 600,
                          textTransform: 'capitalize'
                        }}
                      />
                      <Chip
                        icon={<RecordVoiceOver sx={{ fontSize: 16 }} />}
                        label={agent.tts_provider}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(236, 72, 153, 0.1)',
                          color: '#ec4899',
                          fontWeight: 600,
                          textTransform: 'capitalize'
                        }}
                      />
                      <Chip
                        icon={<Hearing sx={{ fontSize: 16 }} />}
                        label={agent.stt_provider}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(34, 197, 94, 0.1)',
                          color: '#22c55e',
                          fontWeight: 600,
                          textTransform: 'capitalize'
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </AnimatedCard>
            ))}
          </Box>
        )}
      </Box>
    </Fade>
  );

  const renderGoalSetting = () => (
    <Fade in timeout={500}>
      <Box sx={{ maxWidth: 900, mx: 'auto', width: '100%' }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Box sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)'
          }}>
            <TrendingUp sx={{ fontSize: 40, color: '#ffffff' }} />
          </Box>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              mb: 2
            }}
          >
            Goal & Qualification Criteria
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, maxWidth: 700, mx: 'auto' }}>
            Define what you're selling and who your ideal customer is. The AI agent will use this to qualify leads intelligently.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Campaign Goal */}
          <AnimatedCard glassEffect sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TrendingUp sx={{ fontSize: 24, color: '#ffffff' }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Campaign Goal
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  What do you want to achieve?
                </Typography>
              </Box>
            </Box>
            <TextField
              fullWidth
              variant="outlined"
              multiline
              rows={4}
              value={campaignGoal}
              onChange={(e) => setCampaignGoal(e.target.value)}
              placeholder="Example: Qualify people who are interested to buy Rich Dad Poor Dad book"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#f59e0b',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#f59e0b',
                    borderWidth: 2
                  },
                },
              }}
            />
            <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                Be clear and specific about what you're selling
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: campaignGoal.length > 20 ? '#10b981' : theme.palette.text.secondary,
                  fontWeight: 600
                }}
              >
                {campaignGoal.length} characters
              </Typography>
            </Box>
          </AnimatedCard>

          {/* Ideal Customer Description */}
          <AnimatedCard glassEffect sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Groups sx={{ fontSize: 24, color: '#ffffff' }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Define Ideal Customer
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  Who are you targeting?
                </Typography>
              </Box>
            </Box>
            <TextField
              fullWidth
              variant="outlined"
              multiline
              rows={4}
              value={idealCustomerDescription}
              onChange={(e) => setIdealCustomerDescription(e.target.value)}
              placeholder="Example: People who are interested in reading books, and want to know about Rich Dad Poor Dad"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#8b5cf6',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#8b5cf6',
                    borderWidth: 2
                  },
                },
              }}
            />
            <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                Describe your ideal customer's interests, needs, or characteristics
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: idealCustomerDescription.length > 20 ? '#10b981' : theme.palette.text.secondary,
                  fontWeight: 600
                }}
              >
                {idealCustomerDescription.length} characters
              </Typography>
            </Box>
          </AnimatedCard>

          {/* Helper Card */}
          <AnimatedCard sx={{
            p: 3,
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.2)'
          }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <AutoAwesome sx={{ color: '#6366f1', fontSize: 28 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#6366f1' }}>
                  💡 AI Agent will use this to:
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2.5, '& li': { mb: 0.5 } }}>
                  <Typography component="li" variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Ask relevant qualifying questions
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Identify if the lead matches your ideal customer
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Score leads based on fit (1-10)
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Transfer qualified leads or schedule callbacks
                  </Typography>
                </Box>
              </Box>
            </Box>
          </AnimatedCard>
        </Box>
      </Box>
    </Fade>
  );

  const renderReview = () => (
    <Fade in timeout={500}>
      <Box sx={{ maxWidth: 900, mx: 'auto', width: '100%' }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Box sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)'
          }}>
            <CheckCircle sx={{ fontSize: 40, color: '#ffffff' }} />
          </Box>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontWeight: 800,
              color: theme.palette.text.primary,
              mb: 2
            }}
          >
            Review Your Call Session
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, maxWidth: 600, mx: 'auto' }}>
            Double-check everything before launching
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <AnimatedCard glassEffect sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Typography sx={{ color: '#ffffff', fontSize: '0.875rem', fontWeight: 700 }}>1</Typography>
                </Box>
                Call Session Details
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', fontWeight: 600 }}>
                    Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {campaignName || 'Not set'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', fontWeight: 600 }}>
                    Type
                  </Typography>
                  <Chip
                    label={campaignType}
                    size="small"
                    sx={{
                      background: campaignType === 'outbound'
                        ? 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'
                        : 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)',
                      color: '#ffffff',
                      fontWeight: 700,
                      textTransform: 'capitalize',
                      mt: 0.5
                    }}
                  />
                </Box>
                {campaignType === 'outbound' && (
                  <Box>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', fontWeight: 600 }}>
                      Leads
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                      {leads.length > 0 ? `${leads.length} leads uploaded` : 'No leads uploaded'}
                    </Typography>
                    {leads.length > 0 && (
                      <Paper variant="outlined" sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>
                        <List dense>
                          {leads.slice(0, 5).map((lead, index) => (
                            <ListItem key={index} divider={index !== leads.length - 1 && index !== 4}>
                              <ListItemText
                                primary={lead.name || 'Unknown Name'}
                                secondary={lead.phone}
                                primaryTypographyProps={{ fontWeight: 500, fontSize: '0.875rem' }}
                                secondaryTypographyProps={{ fontSize: '0.75rem' }}
                              />
                            </ListItem>
                          ))}
                          {leads.length > 5 && (
                            <ListItem>
                              <ListItemText
                                secondary={`...and ${leads.length - 5} more`}
                                secondaryTypographyProps={{ align: 'center', fontStyle: 'italic' }}
                              />
                            </ListItem>
                          )}
                        </List>
                      </Paper>
                    )}
                  </Box>
                )}
              </Box>
            </AnimatedCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <AnimatedCard glassEffect sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Typography sx={{ color: '#ffffff', fontSize: '0.875rem', fontWeight: 700 }}>2</Typography>
                </Box>
                AI Configuration
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', fontWeight: 600 }}>
                    Agent
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {customAgentId
                      ? customAgents.find(a => a.id === customAgentId)?.name || 'Selected Agent'
                      : 'Default Agent'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', fontWeight: 600, mb: 1, display: 'block' }}>
                    Goal
                  </Typography>
                  <Paper sx={{
                    p: 2,
                    bgcolor: 'rgba(99, 102, 241, 0.05)',
                    border: '1px solid rgba(99, 102, 241, 0.1)',
                    maxHeight: 150,
                    overflow: 'auto'
                  }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {campaignGoal || 'Not set'}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            </AnimatedCard>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );

  // Show loading spinner while checking authentication
  if (!authChecked) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor={theme.palette.background.default}>
        <CircularProgress sx={{ color: '#6366f1' }} />
      </Box>
    );
  }

  // Show login redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor={theme.palette.background.default}>
        <CircularProgress sx={{ color: '#6366f1' }} />
      </Box>
    );
  }

  // Error Categories and Parsing
  const analyzeError = (errorMsg: string) => {
    const msg = errorMsg.toLowerCase();

    if (msg.includes('active in call session')) {
      return {
        type: 'AGENT_BUSY',
        title: 'Agent Already Active',
        description: 'This agent is currently assigned to another active Call Session. An agent can only handle one active session at a time.',
        cta: {
          label: 'Create New Agent',
          action: () => router.push('/agent-settings/create'),
          icon: <SmartToy />
        }
      };
    }

    if (msg.includes('phone number assigned')) {
      return {
        type: 'MISSING_PHONE',
        title: 'Missing Phone Number',
        description: 'This agent doesn\'t have a phone number assigned. A phone number is required for outbound calls.',
        cta: {
          label: 'Assign Number',
          action: () => router.push(`/agent-settings/${customAgentId}/edit`),
          icon: <CallMade />
        }
      };
    }

    if (msg.includes('knowledge base training')) {
      return {
        type: 'MISSING_TRAINING',
        title: 'Training Required',
        description: 'This agent hasn\'t been trained on any documents. Please upload knowledge base resources first.',
        cta: {
          label: 'Train Agent',
          action: () => router.push(`/knowledge-base?agent_id=${customAgentId}`),
          icon: <Psychology />
        }
      };
    }

    return {
      type: 'generic',
      title: 'Configuration Error',
      description: errorMsg,
      cta: null
    };
  };

  const errorDetails = error ? analyzeError(error) : null;

  return (
    <NavigationLayout>
      <Box sx={{
        p: 4,
        background: '#f5f5f5',
        minHeight: '100vh',
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
        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 1400, mx: 'auto' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 5 }}>
            <IconButton
              onClick={() => router.back()}
              sx={{
                color: theme.palette.text.primary,
                mr: 2,
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)'
                }
              }}
            >
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 800,
                  mb: 1,
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                Create {campaignType === 'outbound' ? 'Outbound' : 'Inbound'} Call Session
              </Typography>
              <Typography variant="h6" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                Set up your AI-powered call session in minutes
              </Typography>
            </Box>
          </Box>


          {/* Stepper */}
          <AnimatedCard glassEffect sx={{ p: 4, mb: 4 }}>
            <WizardStepper steps={steps} activeStep={activeStep} />
          </AnimatedCard>

          {/* Step Content */}
          <Box sx={{ mb: 4 }}>
            {renderStepContent()}
          </Box>

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', maxWidth: 900, mx: 'auto' }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
              startIcon={<ArrowBack />}
              sx={{
                color: theme.palette.text.primary,
                borderColor: 'rgba(99, 102, 241, 0.3)',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                '&:hover': {
                  borderColor: '#6366f1',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)'
                },
                '&:disabled': {
                  borderColor: 'rgba(0, 0, 0, 0.12)'
                }
              }}
            >
              Back
            </Button>

            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleFinish}
                disabled={loading}
                endIcon={loading ? <CircularProgress size={20} sx={{ color: '#ffffff' }} /> : <CheckCircle />}
                sx={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  color: '#ffffff',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5558e3 0%, #9333ea 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)'
                  },
                  '&:disabled': {
                    background: 'rgba(0, 0, 0, 0.12)'
                  }
                }}
              >
                {loading ? 'Creating...' : 'Create Call Session'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading}
                endIcon={loading ? <CircularProgress size={20} sx={{ color: '#ffffff' }} /> : <ArrowForward />}
                sx={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  color: '#ffffff',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5558e3 0%, #9333ea 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)'
                  },
                  '&:disabled': {
                    background: 'rgba(0, 0, 0, 0.12)'
                  }
                }}
              >
                {loading ? 'Processing...' : 'Next Step'}
              </Button>
            )}
          </Box>
        </Box>

        {/* Start: New Error Modal Implementation */}
        <Dialog
          open={!!error}
          onClose={() => setError('')}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
              overflow: 'hidden'
            }
          }}
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
            sx: {
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(255, 255, 255, 0.4)'
            }
          }}
          TransitionComponent={Grow}
        >
          <Box sx={{
            p: 3,
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(255, 255, 255, 1) 100%)',
            borderBottom: '1px solid rgba(239, 68, 68, 0.1)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                bgcolor: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography variant="h4">⚠️</Typography>
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#ef4444' }}>
                  {errorDetails?.title || 'Error'}
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Action Required
                </Typography>
              </Box>
            </Box>
          </Box>

          <DialogContent sx={{ p: 4 }}>
            <Typography variant="body1" sx={{ color: '#374151', lineHeight: 1.6, mb: 1 }}>
              {errorDetails?.description}
            </Typography>
            {/* Fallback to show raw error if generic */}
            {errorDetails?.type === 'generic' && (
              <Typography variant="body2" sx={{ mt: 2, p: 2, bgcolor: '#f3f4f6', borderRadius: 2, fontFamily: 'monospace', fontSize: '0.875rem' }}>
                {error}
              </Typography>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 3, bgcolor: '#f9fafb', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              onClick={() => setError('')}
              variant="text"
              sx={{
                color: '#6b7280',
                fontWeight: 600,
                textTransform: 'none'
              }}
            >
              Close
            </Button>
            {errorDetails?.cta && (
              <Button
                onClick={errorDetails.cta.action}
                variant="contained"
                startIcon={errorDetails.cta.icon}
                sx={{
                  bgcolor: '#3b82f6', // Warm blue
                  color: '#ffffff',
                  fontWeight: 700,
                  boxShadow: '0 4px 6px rgba(59, 130, 246, 0.25)',
                  textTransform: 'none',
                  px: 3,
                  '&:hover': {
                    bgcolor: '#2563eb',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 12px rgba(59, 130, 246, 0.3)'
                  }
                }}
              >
                {errorDetails.cta.label}
              </Button>
            )}
          </DialogActions>
        </Dialog>
        {/* End: New Error Modal Implementation */}

      </Box>
    </NavigationLayout>
  );
}

