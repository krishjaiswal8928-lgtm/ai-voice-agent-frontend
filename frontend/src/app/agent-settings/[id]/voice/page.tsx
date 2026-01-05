'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  TextField,
  Paper,
  IconButton,
  Grid,
  Chip
} from '@mui/material';
import {
  ArrowBack,
  SmartToy,
  RecordVoiceOver,
  Hearing,
  Psychology
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { NavigationLayout } from '@/components/NavigationLayout';

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

export const dynamicParams = false;

export default function VoiceBehaviorSetupPage() {
  const router = useRouter();
  const params = useParams();
  const agentId = params.id as string;

  const [agentConfig, setAgentConfig] = useState({
    llm_provider: 'gemini',
    tts_provider: 'aws_polly',
    stt_provider: 'deepgram',
    personality: 'professional',
    tone: 'formal',
    response_style: 'concise',
    politeness_level: 5,
    sales_aggressiveness: 5,
    confidence_level: 5,
    system_prompt: ''
  });

  const handleChange = (field: string, value: any) => {
    setAgentConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Save configuration logic would go here
    console.log('Saving configuration:', agentConfig);
  };

  return (
    <NavigationLayout>
      <Box sx={{ p: 3, bgcolor: '#ffffff', minHeight: '100vh', color: '#000000', width: '100%' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton
            onClick={() => router.push('/agent-settings')}
            sx={{ color: '#000000', mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1, color: '#000000' }}>
              Voice & Behavior Setup
            </Typography>
            <Typography variant="h6" sx={{ color: '#555555' }}>
              Configure your agent's voice and conversational behavior
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e0e0e0', mb: 3 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  AI Service Configuration
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>LLM Provider</InputLabel>
                      <Select
                        value={agentConfig.llm_provider}
                        onChange={(e) => handleChange('llm_provider', e.target.value)}
                        label="LLM Provider"
                      >
                        {llmProviders.map(provider => (
                          <MenuItem key={provider.value} value={provider.value}>
                            {provider.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>TTS Provider</InputLabel>
                      <Select
                        value={agentConfig.tts_provider}
                        onChange={(e) => handleChange('tts_provider', e.target.value)}
                        label="TTS Provider"
                      >
                        {ttsProviders.map(provider => (
                          <MenuItem key={provider.value} value={provider.value}>
                            {provider.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>STT Provider</InputLabel>
                      <Select
                        value={agentConfig.stt_provider}
                        onChange={(e) => handleChange('stt_provider', e.target.value)}
                        label="STT Provider"
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
                <Typography variant="h5" gutterBottom>
                  Behavior & Personality
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Personality</InputLabel>
                      <Select
                        value={agentConfig.personality}
                        onChange={(e) => handleChange('personality', e.target.value)}
                        label="Personality"
                      >
                        {personalities.map(personality => (
                          <MenuItem key={personality.value} value={personality.value}>
                            {personality.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Tone"
                      value={agentConfig.tone}
                      onChange={(e) => handleChange('tone', e.target.value)}
                      placeholder="e.g., formal, informal, persuasive"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Response Style"
                      value={agentConfig.response_style}
                      onChange={(e) => handleChange('response_style', e.target.value)}
                      placeholder="e.g., concise, detailed, conversational"
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Typography gutterBottom>Politeness Level</Typography>
                    <Slider
                      value={agentConfig.politeness_level}
                      onChange={(e, value) => handleChange('politeness_level', value as number)}
                      min={1}
                      max={10}
                      valueLabelDisplay="auto"
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Typography gutterBottom>Sales Aggressiveness</Typography>
                    <Slider
                      value={agentConfig.sales_aggressiveness}
                      onChange={(e, value) => handleChange('sales_aggressiveness', value as number)}
                      min={1}
                      max={10}
                      valueLabelDisplay="auto"
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Typography gutterBottom>Confidence Level</Typography>
                    <Slider
                      value={agentConfig.confidence_level}
                      onChange={(e, value) => handleChange('confidence_level', value as number)}
                      min={1}
                      max={10}
                      valueLabelDisplay="auto"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Custom System Prompt (Optional)"
                      value={agentConfig.system_prompt}
                      onChange={(e) => handleChange('system_prompt', e.target.value)}
                      placeholder="Override the default system prompt"
                      multiline
                      rows={4}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e0e0e0', position: 'sticky', top: 80 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#000000' }}>
                  Voice & Behavior Preview
                </Typography>

                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <SmartToy sx={{ fontSize: 60, color: '#2196f3', mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 1, color: '#000000' }}>
                    Agent Configuration
                  </Typography>
                  <Chip
                    label={agentConfig.personality}
                    size="small"
                    sx={{
                      bgcolor: '#e0e0e0',
                      color: '#000000',
                      textTransform: 'capitalize',
                      mb: 2
                    }}
                  />

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ color: '#aaa', mb: 1 }}>
                      <Psychology sx={{ mr: 1, verticalAlign: 'middle' }} />
                      LLM: {llmProviders.find(p => p.value === agentConfig.llm_provider)?.label}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#aaa', mb: 1 }}>
                      <RecordVoiceOver sx={{ mr: 1, verticalAlign: 'middle' }} />
                      TTS: {ttsProviders.find(p => p.value === agentConfig.tts_provider)?.label}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#555555' }}>
                      <Hearing sx={{ mr: 1, verticalAlign: 'middle' }} />
                      STT: {sttProviders.find(p => p.value === agentConfig.stt_provider)?.label}
                    </Typography>
                  </Box>
                </Box>

                <Paper sx={{ p: 2, bgcolor: '#f5f5f5', mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Behavior Settings:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#aaa', mb: 1 }}>
                    Tone: {agentConfig.tone}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#aaa', mb: 1 }}>
                    Response Style: {agentConfig.response_style}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#555555' }}>
                    Politeness: {agentConfig.politeness_level}/10
                  </Typography>
                </Paper>

                <Box sx={{ mt: 3 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSave}
                    sx={{
                      backgroundColor: '#000000',
                      color: '#ffffff',
                      fontWeight: 700,
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: '#333333'
                      }
                    }}
                  >
                    Save Configuration
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </NavigationLayout>
  );
}