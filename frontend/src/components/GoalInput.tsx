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

interface GoalInputProps {
  onSubmit: (goal: string) => void;
  initialGoal?: string;
  loading?: boolean;
}

export function GoalInput({ onSubmit, initialGoal, loading }: GoalInputProps) {
  const [goal, setGoal] = useState(initialGoal || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!goal.trim()) {
      setError('Goal is required');
      return;
    }
    
    onSubmit(goal);
  };

  const goalTemplates = [
    "Book a demo appointment by collecting name, email, and preferred date",
    "Sell a product by explaining features and handling objections",
    "Collect customer feedback about our service",
    "Schedule a consultation by gathering requirements",
    "Follow up on a previous interaction"
  ];

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <TextField
        fullWidth
        label="Campaign Goal"
        variant="outlined"
        margin="normal"
        multiline
        rows={4}
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        placeholder="Describe what you want the AI agent to achieve in this campaign..."
        helperText="Be specific about the desired outcome and any key information to collect"
      />
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Goal Templates:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {goalTemplates.map((template, index) => (
            <Button
              key={index}
              variant="outlined"
              size="small"
              onClick={() => setGoal(template)}
            >
              {template.substring(0, 30)}...
            </Button>
          ))}
        </Box>
      </Box>
      
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={loading}
        sx={{ mt: 3 }}
      >
        {loading ? 'Saving...' : 'Set Goal'}
      </Button>
    </Box>
  );
}