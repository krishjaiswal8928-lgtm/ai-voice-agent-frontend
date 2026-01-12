'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Slider,
  Paper,
  Grid,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack,
  Save,
  SmartToy,
  Delete,
  Add as AddIcon
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { NavigationLayout } from '@/components/NavigationLayout';
import { voiceAPI } from '@/lib/api';

interface AgentData {
  id: string;
  name: string;
  description: string;
  personality: string;
  tone: string;
  response_style: string;
  politeness_level: number;
  sales_aggressiveness: number;
  confidence_level: number;
  system_prompt: string;
  website_urls: string[];
  trained_documents: string[];
  phone_number_id?: string;
  created_at: string;
}

interface PhoneNumber {
  id: string;
  phone_number: string;
  provider: string;
}

const personalities = [
  { value: 'professional', label: 'Professional (Finance, Legal, Enterprise)' },
  { value: 'friendly', label: 'Friendly (E-commerce)' },
  { value: 'persuasive', label: 'Persuasive (Sales)' },
  { value: 'supportive', label: 'Supportive (Healthcare)' }
];

export default function EditAgentPage() {
  const router = useRouter();
  const params = useParams();
  const agentId = params.id as string;

  const [agentData, setAgentData] = useState<AgentData | null>(null);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState('');

  useEffect(() => {
    if (agentId) {
      fetchAgent();
      fetchPhoneNumbers();
    }
  }, [agentId]);

  const fetchPhoneNumbers = async () => {
    try {
      const response = await voiceAPI.getPhoneNumbers();
      setPhoneNumbers(response.data || []);
    } catch (err) {
      console.error('Error fetching phone numbers:', err);
    }
  };

  const fetchAgent = async () => {
    try {
      setLoading(true);
      const response = await voiceAPI.getCustomAgent(agentId);
      setAgentData(response.data);
    } catch (err) {
      setError('Failed to fetch agent details');
      console.error('Error fetching agent:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof AgentData, value: any) => {
    if (agentData) {
      setAgentData(prev => ({
        ...prev!,
        [field]: value
      }));
    }
  };

  const handleAddUrl = () => {
    if (newUrl && agentData && !agentData.website_urls.includes(newUrl)) {
      handleChange('website_urls', [...agentData.website_urls, newUrl]);
      setNewUrl('');
    }
  };

  const handleRemoveUrl = (url: string) => {
    if (agentData) {
      handleChange('website_urls', agentData.website_urls.filter(u => u !== url));
    }
  };

  const handleSave = async () => {
    if (!agentData) return;

    try {
      setSaving(true);
      setError(null);

      // Update the agent
      await voiceAPI.updateCustomAgent(agentData.id, {
        name: agentData.name,
        description: agentData.description,
        personality: agentData.personality,
        tone: agentData.tone,
        response_style: agentData.response_style,
        politeness_level: agentData.politeness_level,
        sales_aggressiveness: agentData.sales_aggressiveness,
        confidence_level: agentData.confidence_level,
        system_prompt: agentData.system_prompt,
        website_urls: agentData.website_urls,
        phone_number_id: agentData.phone_number_id
      });

      // Redirect to agent settings
      router.push('/agent-settings');
    } catch (err) {
      setError('Failed to update agent. Please try again.');
      console.error('Error updating agent:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <NavigationLayout>
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: '#ffffff',
          color: '#000000'
        }}>
          <CircularProgress sx={{ color: '#000000' }} />
        </Box>
      </NavigationLayout>
    );
  }

  if (error || !agentData) {
    return (
      <NavigationLayout>
        <Box sx={{ p: 3, bgcolor: '#ffffff', minHeight: '100vh', color: '#000000' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <IconButton
              onClick={() => router.back()}
              sx={{ color: '#000000', mr: 2 }}
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Edit Agent
            </Typography>
          </Box>

          <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e0e0e0', p: 3 }}>
            <Typography color="error" sx={{ mb: 2 }}>
              {error || 'Agent not found'}
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.back()}
              sx={{
                bgcolor: '#000000',
                color: '#ffffff',
                '&:hover': {
                  bgcolor: '#333333'
                }
              }}
            >
              Back
            </Button>
          </Card>
        </Box>
      </NavigationLayout>
    );
  }

  return (
    <NavigationLayout>
      <Box sx={{
        p: 3,
        bgcolor: '#f5f5f5',
        minHeight: '100vh',
        color: '#000000',
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
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, position: 'relative', zIndex: 1 }}>
          <IconButton
            onClick={() => router.back()}
            sx={{ color: '#000000', mr: 2, bgcolor: '#ffffff', border: '1px solid #e0e0e0', '&:hover': { bgcolor: '#f5f5f5' } }}
          >
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#000000' }}>
              {agentData.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure your agent's personality, knowledge, and capabilities
            </Typography>
          </Box>
        </Box>

        {error && (
          <Box sx={{ mb: 3 }}>
            <Typography color="error">
              {error}
            </Typography>
          </Box>
        )}

        <Grid container spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
          <Grid item xs={12} md={8}>
            <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e0e0e0', mb: 3, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                  <SmartToy sx={{ mr: 1, color: '#000000' }} />
                  Basic Information
                </Typography>

                <TextField
                  fullWidth
                  label="Agent Name"
                  value={agentData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  margin="normal"
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#e0e0e0' },
                      '&:hover fieldset': { borderColor: '#000000' },
                      '&.Mui-focused fieldset': { borderColor: '#000000' }
                    },
                    '& .MuiInputLabel-root': { color: '#666666' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#000000' }
                  }}
                />

                <TextField
                  fullWidth
                  label="Description"
                  value={agentData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  multiline
                  rows={3}
                  margin="normal"
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#e0e0e0' },
                      '&:hover fieldset': { borderColor: '#000000' },
                      '&.Mui-focused fieldset': { borderColor: '#000000' }
                    },
                    '& .MuiInputLabel-root': { color: '#666666' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#000000' }
                  }}
                />

                <TextField
                  fullWidth
                  label="System Prompt"
                  value={agentData.system_prompt}
                  onChange={(e) => handleChange('system_prompt', e.target.value)}
                  multiline
                  rows={6}
                  margin="normal"
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#e0e0e0' },
                      '&:hover fieldset': { borderColor: '#000000' },
                      '&.Mui-focused fieldset': { borderColor: '#000000' }
                    },
                    '& .MuiInputLabel-root': { color: '#666666' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#000000' }
                  }}
                />
              </CardContent>
            </Card>

            <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e0e0e0', mb: 3, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                  📞 Phone Number Assignment
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Assign a phone number to this agent for both inbound and outbound calls.
                </Typography>

                <FormControl fullWidth margin="normal">
                  <InputLabel sx={{ color: '#666666', '&.Mui-focused': { color: '#000000' } }}>
                    Phone Number
                  </InputLabel>
                  <Select
                    value={agentData.phone_number_id || ''}
                    onChange={(e) => handleChange('phone_number_id', e.target.value)}
                    label="Phone Number"
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e0e0' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#000000' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#000000' }
                    }}
                  >
                    <MenuItem value="">
                      <em>No phone number assigned</em>
                    </MenuItem>
                    {phoneNumbers.map((phone) => (
                      <MenuItem key={phone.id} value={phone.id}>
                        {phone.phone_number} ({phone.provider})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {phoneNumbers.length === 0 && (
                  <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                    ⚠️ No phone numbers available. Please import a phone number from Twilio first.
                  </Typography>
                )}
              </CardContent>
            </Card>

            <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e0e0e0', mb: 3, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                  Personality & Tone
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel sx={{ color: '#666666', '&.Mui-focused': { color: '#000000' } }}>Personality</InputLabel>
                      <Select
                        value={agentData.personality}
                        onChange={(e) => handleChange('personality', e.target.value)}
                        label="Personality"
                        sx={{
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e0e0' },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#000000' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#000000' }
                        }}
                      >
                        {personalities.map(personality => (
                          <MenuItem key={personality.value} value={personality.value}>
                            {personality.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel sx={{ color: '#666666', '&.Mui-focused': { color: '#000000' } }}>Tone</InputLabel>
                      <Select
                        value={agentData.tone}
                        onChange={(e) => handleChange('tone', e.target.value)}
                        label="Tone"
                        sx={{
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e0e0' },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#000000' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#000000' }
                        }}
                      >
                        <MenuItem value="formal">Formal</MenuItem>
                        <MenuItem value="casual">Casual</MenuItem>
                        <MenuItem value="professional">Professional</MenuItem>
                        <MenuItem value="friendly">Friendly</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Sliders with Black styling */}
                  {[
                    { label: 'Politeness Level', field: 'politeness_level' },
                    { label: 'Sales Aggressiveness', field: 'sales_aggressiveness' },
                    { label: 'Confidence Level', field: 'confidence_level' }
                  ].map((item) => (
                    <Grid item xs={12} sm={4} key={item.field}>
                      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                        {item.label}: {agentData[item.field as keyof AgentData]}
                      </Typography>
                      <Slider
                        value={agentData[item.field as keyof AgentData] as number}
                        onChange={(_, value) => handleChange(item.field as keyof AgentData, value)}
                        min={1}
                        max={10}
                        step={1}
                        marks={[
                          { value: 1, label: '1' },
                          { value: 5, label: '5' },
                          { value: 10, label: '10' }
                        ]}
                        sx={{
                          color: '#000000',
                          '& .MuiSlider-thumb': {
                            backgroundColor: '#000000',
                          },
                          '& .MuiSlider-track': {
                            backgroundColor: '#000000',
                          },
                          '& .MuiSlider-rail': {
                            backgroundColor: '#cccccc',
                          }
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e0e0e0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                  Training Data Sources
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                    Website URLs
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Add URLs for the agent to learn from.
                  </Typography>

                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <TextField
                      fullWidth
                      placeholder="https://example.com"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      sx={{
                        mr: 1,
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: '#e0e0e0' },
                          '&:hover fieldset': { borderColor: '#000000' },
                          '&.Mui-focused fieldset': { borderColor: '#000000' }
                        }
                      }}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleAddUrl}
                      startIcon={<AddIcon />}
                      sx={{
                        color: '#000000',
                        borderColor: '#000000',
                        whiteSpace: 'nowrap',
                        '&:hover': {
                          borderColor: '#333333',
                          bgcolor: '#f5f5f5'
                        }
                      }}
                    >
                      Add URL
                    </Button>
                  </Box>

                  {agentData.website_urls.map((url, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1.5,
                        mb: 1,
                        bgcolor: '#fafafa',
                        borderRadius: 1,
                        border: '1px solid #f0f0f0'
                      }}
                    >
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                        {url}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveUrl(url)}
                        sx={{ color: '#f44336' }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e0e0e0', position: 'sticky', top: 20, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <SmartToy sx={{ fontSize: 60, color: '#000000', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {agentData.name}
                  </Typography>
                  <Chip
                    label={agentData.personality}
                    size="small"
                    sx={{
                      bgcolor: '#000000',
                      color: '#ffffff',
                      textTransform: 'capitalize',
                      mt: 1,
                      fontWeight: 600
                    }}
                  />
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSave}
                  disabled={saving}
                  sx={{
                    bgcolor: '#000000',
                    color: '#ffffff',
                    fontWeight: 700,
                    py: 1.5,
                    mb: 2,
                    '&:hover': {
                      bgcolor: '#333333'
                    },
                    '&.Mui-disabled': {
                      bgcolor: '#cccccc',
                      color: '#666666'
                    }
                  }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => router.push(`/knowledge-base?agent_id=${agentData.id}`)}
                  sx={{
                    color: '#000000',
                    borderColor: '#000000',
                    fontWeight: 700,
                    py: 1.5,
                    '&:hover': {
                      borderColor: '#333333',
                      bgcolor: '#f5f5f5'
                    }
                  }}
                >
                  Train Agent
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </NavigationLayout>
  );
}