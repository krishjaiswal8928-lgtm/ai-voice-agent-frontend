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
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent
} from '@mui/material';

interface CreateCampaignFormProps {
  onSubmit: (data: any) => void;
  loading?: boolean;
}

export function CreateCampaignForm({ onSubmit, loading }: CreateCampaignFormProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('outbound');
  const [goal, setGoal] = useState('');
  const [tabValue, setTabValue] = useState(0);
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

  const goalTemplates = [
    "Book a demo appointment by collecting name, email, and preferred date",
    "Sell a product by explaining features and handling objections",
    "Collect customer feedback about our service",
    "Schedule a consultation by gathering requirements",
    "Follow up on a previous interaction"
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Create New Campaign
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
          >
            <Tab label="Basic Info" />
            <Tab label="Goal Setup" />
          </Tabs>
        </Box>
        
        <Box component="form" onSubmit={handleSubmit}>
          {tabValue === 0 && (
            <>
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
            </>
          )}
          
          {tabValue === 1 && (
            <>
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
            </>
          )}
          
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Campaign'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => {
                setName('');
                setType('outbound');
                setGoal('');
                setTabValue(0);
              }}
            >
              Reset
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}