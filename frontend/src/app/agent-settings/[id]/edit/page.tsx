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
  Psychology,
  RecordVoiceOver,
  Hearing,
  Link,
  Delete
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { NavigationLayout } from '@/components/NavigationLayout';
import { voiceAPI } from '@/lib/api';

interface AgentData {
  id: string;  // Changed from number to string
  name: string;
  description: string;
  llm_provider: string;
  tts_provider: string;
  stt_provider: string;
  personality: string;
  tone: string;
  response_style: string;
  politeness_level: number;
  sales_aggressiveness: number;
  confidence_level: number;
  system_prompt: string;
  website_urls: string[];
  trained_documents: string[];
  phone_number_id?: string;  // Phone number assignment
  created_at: string;
}

interface PhoneNumber {
  id: string;
  phone_number: string;
  provider: string;
}

const llmProviders = [
  { value: 'openai', label: 'OpenAI GPT' },
  { value: 'deepseek', label: 'DeepSeek' },
  { value: 'gemini', label: 'Gemini' }
];

const ttsProviders = [
  { value: 'openai', label: 'OpenAI TTS' },
  { value: 'aws_polly', label: 'AWS Polly' },
  { value: 'gemini', label: 'Gemini TTS' }
];

const sttProviders = [
  { value: 'deepgram', label: 'Deepgram' },
  { value: 'openai', label: 'OpenAI Whisper' },
  { value: 'aws', label: 'AWS Transcribe' },
  { value: 'google', label: 'Google Speech-to-Text' }
];

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
        llm_provider: agentData.llm_provider,
        tts_provider: agentData.tts_provider,
        stt_provider: agentData.stt_provider,
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
            <Typography variant="h4">
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
      <Box sx={{ p: 3, bgcolor: '#ffffff', minHeight: '100vh', color: '#000000' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton
            onClick={() => router.back()}
            sx={{ color: '#000000', mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h4">
            Edit Agent: {agentData.name}
          </Typography>
        </Box>

        {error && (
          <Box sx={{ mb: 3 }}>
            <Typography color="error">
              {error}
            </Typography>
          </Box>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e0e0e0', mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                  Basic Information
                </Typography>

                <TextField
                  fullWidth
                  label="Agent Name"
                  value={agentData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  margin="normal"
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Description"
                  value={agentData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  multiline
                  rows={3}
                  margin="normal"
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="System Prompt"
                  value={agentData.system_prompt}
                  onChange={(e) => handleChange('system_prompt', e.target.value)}
                  multiline
                  rows={4}
                  margin="normal"
                  sx={{ mb: 2 }}
                />
              </CardContent>
            </Card>

            <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e0e0e0', mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                  📞 Phone Number Assignment
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Assign a phone number to this agent for both inbound and outbound calls.
                </Typography>

                <FormControl fullWidth margin="normal">
                  <InputLabel>Phone Number</InputLabel>
                  <Select
                    value={agentData.phone_number_id || ''}
                    onChange={(e) => handleChange('phone_number_id', e.target.value)}
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

            <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e0e0e0', mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                  AI Provider Settings
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>LLM Provider</InputLabel>
                      <Select
                        value={agentData.llm_provider}
                        onChange={(e) => handleChange('llm_provider', e.target.value)}
                      >
                        {llmProviders.map(provider => (
                          <MenuItem key={provider.value} value={provider.value}>
                            {provider.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>TTS Provider</InputLabel>
                      <Select
                        value={agentData.tts_provider}
                        onChange={(e) => handleChange('tts_provider', e.target.value)}
                      >
                        {ttsProviders.map(provider => (
                          <MenuItem key={provider.value} value={provider.value}>
                            {provider.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>STT Provider</InputLabel>
                      <Select
                        value={agentData.stt_provider}
                        onChange={(e) => handleChange('stt_provider', e.target.value)}
                      >
                        {sttProviders.map(provider => (
                          <MenuItem key={provider.value} value={provider.value}>
                            {provider.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e0e0e0', mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                  Personality & Tone
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Personality</InputLabel>
                      <Select
                        value={agentData.personality}
                        onChange={(e) => handleChange('personality', e.target.value)}
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
                      <InputLabel>Tone</InputLabel>
                      <Select
                        value={agentData.tone}
                        onChange={(e) => handleChange('tone', e.target.value)}
                      >
                        <MenuItem value="formal">Formal</MenuItem>
                        <MenuItem value="casual">Casual</MenuItem>
                        <MenuItem value="professional">Professional</MenuItem>
                        <MenuItem value="friendly">Friendly</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Politeness Level: {agentData.politeness_level}
                    </Typography>
                    <Slider
                      value={agentData.politeness_level}
                      onChange={(_, value) => handleChange('politeness_level', value)}
                      min={1}
                      max={10}
                      step={1}
                      marks={[
                        { value: 1, label: '1' },
                        { value: 5, label: '5' },
                        { value: 10, label: '10' }
                      ]}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Sales Aggressiveness: {agentData.sales_aggressiveness}
                    </Typography>
                    <Slider
                      value={agentData.sales_aggressiveness}
                      onChange={(_, value) => handleChange('sales_aggressiveness', value)}
                      min={1}
                      max={10}
                      step={1}
                      marks={[
                        { value: 1, label: '1' },
                        { value: 5, label: '5' },
                        { value: 10, label: '10' }
                      ]}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Confidence Level: {agentData.confidence_level}
                    </Typography>
                    <Slider
                      value={agentData.confidence_level}
                      onChange={(_, value) => handleChange('confidence_level', value)}
                      min={1}
                      max={10}
                      step={1}
                      marks={[
                        { value: 1, label: '1' },
                        { value: 5, label: '5' },
                        { value: 10, label: '10' }
                      ]}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                  Training Data Sources
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Website URLs
                  </Typography>

                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <TextField
                      fullWidth
                      placeholder="https://example.com"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      sx={{ mr: 1 }}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleAddUrl}
                      sx={{
                        color: '#000000',
                        borderColor: '#000000',
                        '&:hover': {
                          borderColor: '#333333',
                          bgcolor: '#f5f5f5'
                        }
                      }}
                    >
                      Add
                    </Button>
                  </Box>

                  {agentData.website_urls.map((url, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1,
                        mb: 1,
                        bgcolor: '#f5f5f5',
                        borderRadius: 1
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
            <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e0e0e0', position: 'sticky', top: 20 }}>
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <SmartToy sx={{ fontSize: 60, color: '#2196f3', mb: 2 }} />
                  <Typography variant="h6">
                    {agentData.name}
                  </Typography>
                  <Chip
                    label={agentData.personality}
                    size="small"
                    sx={{
                      bgcolor: '#f5f5f5',
                      color: '#000000',
                      textTransform: 'capitalize',
                      mt: 1
                    }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                    AI Providers
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Psychology sx={{ fontSize: 20, color: '#2196f3', mr: 1 }} />
                    <Typography variant="body2">
                      {llmProviders.find(p => p.value === agentData.llm_provider)?.label || agentData.llm_provider}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <RecordVoiceOver sx={{ fontSize: 20, color: '#4caf50', mr: 1 }} />
                    <Typography variant="body2">
                      {ttsProviders.find(p => p.value === agentData.tts_provider)?.label || agentData.tts_provider}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Hearing sx={{ fontSize: 20, color: '#ff9800', mr: 1 }} />
                    <Typography variant="body2">
                      {sttProviders.find(p => p.value === agentData.stt_provider)?.label || agentData.stt_provider}
                    </Typography>
                  </Box>
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
                  onClick={() => router.push(`/agent-settings/${agentData.id}/train`)}
                  sx={{
                    mt: 2,
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