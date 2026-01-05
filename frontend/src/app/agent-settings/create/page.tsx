'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Slider,
  Grid,
  IconButton,
  Alert,
  CircularProgress,
  Paper,
  Fade,
  Grow
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  SmartToy,
  AccountCircle,
  Description,
  EmojiPeople,
  Face,
  VolumeUp,
  Chat,
  Tune,
  CheckCircle,
  AutoAwesome,
  Psychology,
  RecordVoiceOver,
  Hearing,
  TrendingUp
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { NavigationLayout } from '@/components/NavigationLayout';
import { WizardStepper } from '@/components/WizardStepper';
import { AnimatedCard } from '@/components/AnimatedCard';
import { voiceAPI } from '@/lib/api';

interface AgentData {
  name: string;
  description: string;
  company_name: string;
  personality: string;
  tone: string;
  response_style: string;
  politeness_level: number;
  sales_aggressiveness: number;
  confidence_level: number;
  system_prompt: string;
}

const personalities = [
  {
    value: 'professional',
    label: 'Professional',
    description: 'Best for Finance, Legal, Enterprise',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
    icon: '💼'
  },
  {
    value: 'friendly',
    label: 'Friendly',
    description: 'Perfect for E-commerce, Retail',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    icon: '😊'
  },
  {
    value: 'persuasive',
    label: 'Persuasive',
    description: 'Ideal for Sales, Marketing',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    icon: '🎯'
  },
  {
    value: 'supportive',
    label: 'Supportive',
    description: 'Great for Healthcare, Support',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    icon: '🤝'
  }
];

export default function CreateAgentWizard() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [agentData, setAgentData] = useState<AgentData>({
    name: '',
    description: '',
    company_name: '',
    personality: 'professional',
    tone: 'formal',
    response_style: 'concise',
    politeness_level: 5,
    sales_aggressiveness: 5,
    confidence_level: 5,
    system_prompt: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    'Agent Identity',
    'Behavior & Personality',
    'Review & Create'
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleChange = (field: keyof AgentData, value: any) => {
    setAgentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      await voiceAPI.createCustomAgent(agentData);
      router.push('/agent-settings');
    } catch (err) {
      setError('Failed to create agent. Please try again.');
      console.error('Error creating agent:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // Agent Identity
        return (
          <Fade in timeout={500}>
            <Box sx={{ maxWidth: 800, mx: 'auto', width: '100%' }}>
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
                  <AccountCircle sx={{ fontSize: 40, color: '#ffffff' }} />
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
                  Agent Identity
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
                  Give your AI agent a unique identity and purpose
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <AnimatedCard glassEffect sx={{ p: 3 }}>
                    <TextField
                      fullWidth
                      label="Agent Name"
                      value={agentData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="e.g., Rahul for Sales, Support Assistant, Credit Eligibility Bot"
                      required
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
                </Grid>
                <Grid item xs={12}>
                  <AnimatedCard glassEffect sx={{ p: 3 }}>
                    <TextField
                      fullWidth
                      label="Description"
                      value={agentData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="Describe what this agent is for"
                      multiline
                      rows={3}
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
                </Grid>
                <Grid item xs={12}>
                  <AnimatedCard glassEffect sx={{ p: 3 }}>
                    <TextField
                      fullWidth
                      label="Company Name (Optional)"
                      value={agentData.company_name}
                      onChange={(e) => handleChange('company_name', e.target.value)}
                      placeholder="e.g., XYZ Solutions, ABC Company"
                      helperText="Agent will introduce itself as 'Hello, I am assistant of [Company Name]'"
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
                </Grid>
              </Grid>
            </Box>
          </Fade>
        );

      case 1: // Behavior & Personality
        return (
          <Fade in timeout={500}>
            <Box sx={{ maxWidth: 900, mx: 'auto', width: '100%' }}>
              <Box sx={{ textAlign: 'center', mb: 5 }}>
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
                  <EmojiPeople sx={{ fontSize: 40, color: '#ffffff' }} />
                </Box>
                <Typography
                  variant="h4"
                  gutterBottom
                  sx={{
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    mb: 2
                  }}
                >
                  Behavior & Personality
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
                  Configure how your agent communicates and behaves
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    Choose Personality Type
                  </Typography>
                  <Grid container spacing={2}>
                    {personalities.map((personality) => (
                      <Grid item xs={12} sm={6} key={personality.value}>
                        <AnimatedCard
                          selected={agentData.personality === personality.value}
                          onClick={() => handleChange('personality', personality.value)}
                          gradient={personality.gradient}
                          sx={{ p: 3, height: '100%' }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{
                              width: 56,
                              height: 56,
                              borderRadius: '12px',
                              background: personality.gradient,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '2rem'
                            }}>
                              {personality.icon}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                                {personality.label}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {personality.description}
                              </Typography>
                            </Box>
                          </Box>
                        </AnimatedCard>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>

                <Grid item xs={12} md={6}>
                  <AnimatedCard glassEffect sx={{ p: 3 }}>
                    <TextField
                      fullWidth
                      label="Tone"
                      value={agentData.tone}
                      onChange={(e) => handleChange('tone', e.target.value)}
                      placeholder="e.g., formal, informal, persuasive"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: '#ec4899',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#ec4899',
                            borderWidth: 2
                          },
                        },
                      }}
                    />
                  </AnimatedCard>
                </Grid>

                <Grid item xs={12} md={6}>
                  <AnimatedCard glassEffect sx={{ p: 3 }}>
                    <TextField
                      fullWidth
                      label="Response Style"
                      value={agentData.response_style}
                      onChange={(e) => handleChange('response_style', e.target.value)}
                      placeholder="e.g., concise, detailed, conversational"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: '#ec4899',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#ec4899',
                            borderWidth: 2
                          },
                        },
                      }}
                    />
                  </AnimatedCard>
                </Grid>

                <Grid item xs={12}>
                  <AnimatedCard glassEffect sx={{ p: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                      Fine-tune Behavior
                    </Typography>
                    <Grid container spacing={4}>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Face sx={{ color: '#6366f1' }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Politeness Level
                          </Typography>
                        </Box>
                        <Slider
                          value={agentData.politeness_level}
                          onChange={(e, value) => handleChange('politeness_level', value as number)}
                          min={1}
                          max={10}
                          valueLabelDisplay="auto"
                          marks
                          sx={{
                            color: '#6366f1',
                            '& .MuiSlider-thumb': {
                              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
                            }
                          }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Casual</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Very Polite</Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <TrendingUp sx={{ color: '#f59e0b' }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Sales Aggressiveness
                          </Typography>
                        </Box>
                        <Slider
                          value={agentData.sales_aggressiveness}
                          onChange={(e, value) => handleChange('sales_aggressiveness', value as number)}
                          min={1}
                          max={10}
                          valueLabelDisplay="auto"
                          marks
                          sx={{
                            color: '#f59e0b',
                            '& .MuiSlider-thumb': {
                              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)'
                            }
                          }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Passive</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Aggressive</Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <AutoAwesome sx={{ color: '#ec4899' }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Confidence Level
                          </Typography>
                        </Box>
                        <Slider
                          value={agentData.confidence_level}
                          onChange={(e, value) => handleChange('confidence_level', value as number)}
                          min={1}
                          max={10}
                          valueLabelDisplay="auto"
                          marks
                          sx={{
                            color: '#ec4899',
                            '& .MuiSlider-thumb': {
                              boxShadow: '0 4px 12px rgba(236, 72, 153, 0.4)'
                            }
                          }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Humble</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Confident</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </AnimatedCard>
                </Grid>

                <Grid item xs={12}>
                  <AnimatedCard glassEffect sx={{ p: 3 }}>
                    <TextField
                      fullWidth
                      label="Custom System Prompt (Optional)"
                      value={agentData.system_prompt}
                      onChange={(e) => handleChange('system_prompt', e.target.value)}
                      placeholder="Override the default system prompt with your custom instructions"
                      multiline
                      rows={4}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontFamily: 'monospace',
                          '&:hover fieldset': {
                            borderColor: '#ec4899',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#ec4899',
                            borderWidth: 2
                          },
                        },
                      }}
                    />
                  </AnimatedCard>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        );

      case 2: // Review & Create
        return (
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
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    mb: 2
                  }}
                >
                  Review Your Agent
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
                  Verify all settings before creating your AI agent
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <AnimatedCard glassEffect sx={{ p: 3, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2
                      }}>
                        <AccountCircle sx={{ color: '#ffffff', fontSize: 28 }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Identity
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600 }}>
                          Name
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {agentData.name || 'Not set'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600 }}>
                          Description
                        </Typography>
                        <Typography variant="body2">
                          {agentData.description || 'No description provided'}
                        </Typography>
                      </Box>
                      {agentData.company_name && (
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600 }}>
                            Company
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {agentData.company_name}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </AnimatedCard>
                </Grid>

                <Grid item xs={12} md={6}>
                  <AnimatedCard glassEffect sx={{ p: 3, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2
                      }}>
                        <EmojiPeople sx={{ color: '#ffffff', fontSize: 28 }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Personality
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Face sx={{ color: '#9c27b0', fontSize: 20 }} />
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                              Type
                            </Typography>
                            <Chip
                              label={agentData.personality}
                              size="small"
                              sx={{
                                background: personalities.find(p => p.value === agentData.personality)?.gradient,
                                color: '#ffffff',
                                fontWeight: 600,
                                textTransform: 'capitalize'
                              }}
                            />
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <VolumeUp sx={{ color: '#3f51b5', fontSize: 20 }} />
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                              Tone
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {agentData.tone}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chat sx={{ color: '#009688', fontSize: 20 }} />
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                              Style
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {agentData.response_style}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Tune sx={{ color: '#ff5722', fontSize: 20 }} />
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                              Prompt
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {agentData.system_prompt ? 'Custom' : 'Default'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </AnimatedCard>
                </Grid>

                <Grid item xs={12}>
                  <AnimatedCard glassEffect sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                      Behavior Settings
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600 }}>
                            Politeness
                          </Typography>
                          <Box sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            my: 2,
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                          }}>
                            <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 700 }}>
                              {agentData.politeness_level}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600 }}>
                            Sales Drive
                          </Typography>
                          <Box sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            my: 2,
                            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                          }}>
                            <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 700 }}>
                              {agentData.sales_aggressiveness}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600 }}>
                            Confidence
                          </Typography>
                          <Box sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            my: 2,
                            boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
                          }}>
                            <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 700 }}>
                              {agentData.confidence_level}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </AnimatedCard>
                </Grid>

                <Grid item xs={12}>
                  <Alert
                    severity="info"
                    icon={<AutoAwesome />}
                    sx={{
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
                      border: '1px solid rgba(99, 102, 241, 0.2)'
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Training Data
                    </Typography>
                    <Typography variant="body2">
                      Training data can be added after agent creation in the Knowledge Base section.
                    </Typography>
                  </Alert>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        );

      default:
        return null;
    }
  };

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
                color: 'text.primary',
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
                Create New Agent
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Configure your custom autonomous AI agent
              </Typography>
            </Box>
          </Box>

          {error && (
            <Fade in>
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
                }}
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            </Fade>
          )}

          {/* Stepper */}
          <AnimatedCard glassEffect sx={{ p: 4, mb: 4 }}>
            <WizardStepper steps={steps} activeStep={activeStep} />
          </AnimatedCard>

          {/* Step Content */}
          <Box sx={{ mb: 4 }}>
            {renderStepContent(activeStep)}
          </Box>

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', maxWidth: 900, mx: 'auto' }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
              startIcon={<ArrowBack />}
              sx={{
                color: 'text.primary',
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
                onClick={handleSubmit}
                disabled={loading || !agentData.name}
                endIcon={loading ? <CircularProgress size={20} sx={{ color: '#ffffff' }} /> : <SmartToy />}
                sx={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)'
                  },
                  '&:disabled': {
                    background: 'rgba(0, 0, 0, 0.12)'
                  }
                }}
              >
                {loading ? 'Creating Agent...' : 'Create Agent'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!agentData.name && activeStep === 0}
                endIcon={<ArrowForward />}
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
                Next Step
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </NavigationLayout>
  );
}