'use client';

import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Button,
  Typography,
  Alert
} from '@mui/material';

interface CampaignFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  loading?: boolean;
}

export function CampaignForm({ onSubmit, initialData, loading }: CampaignFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState(initialData?.type || 'outbound');
  const [goal, setGoal] = useState(initialData?.goal || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('Campaign name is required');
      return;
    }
    
    onSubmit({ name, type, goal });
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <TextField
        fullWidth
        label="Campaign Name"
        variant="outlined"
        margin="normal"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      
      <FormControl fullWidth margin="normal">
        <InputLabel>Campaign Type</InputLabel>
        <Select
          value={type}
          label="Campaign Type"
          onChange={(e) => setType(e.target.value as string)}
        >
          <MenuItem value="outbound">Outbound</MenuItem>
          <MenuItem value="inbound">Inbound</MenuItem>
        </Select>
      </FormControl>
      
      <TextField
        fullWidth
        label="Campaign Goal"
        variant="outlined"
        margin="normal"
        multiline
        rows={4}
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        helperText="Describe what you want the AI agent to achieve in this campaign"
      />
      
      <Button
        type="submit"
        variant="contained"
        disabled={loading}
        sx={{ 
          mt: 3,
          bgcolor: '#000000',
          color: '#ffffff',
          '&:hover': {
            bgcolor: '#333333'
          }
        }}
      >
        {loading ? 'Saving...' : 'Save Campaign'}
      </Button>
    </Box>
  );
}