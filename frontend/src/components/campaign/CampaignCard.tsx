'use client';

import React from 'react';
import { 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Button, 
  Chip,
  Box
} from '@mui/material';

interface CampaignCardProps {
  id: number;
  name: string;
  type: 'outbound' | 'inbound';
  status: string;
  goal?: string;
  createdAt: string;
  onEdit: (id: number) => void;
  onStart: (id: number) => void;
  onStop: (id: number) => void;
  onDelete: (id: number) => void;
}

export function CampaignCard({ 
  id, 
  name, 
  type, 
  status, 
  goal, 
  createdAt,
  onEdit,
  onStart,
  onStop,
  onDelete
}: CampaignCardProps) {
  const getTypeColor = (type: string) => {
    return type === 'outbound' ? 'primary' : 'secondary';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'completed': return 'default';
      default: return 'default';
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Typography gutterBottom variant="h6" component="div">
            {name}
          </Typography>
          <Chip 
            label={type} 
            color={getTypeColor(type)} 
            size="small" 
            variant="outlined"
          />
        </Box>
        
        <Box display="flex" gap={1} mb={2}>
          <Chip 
            label={status} 
            color={getStatusColor(status)} 
            size="small" 
          />
        </Box>
        
        {goal && (
          <Typography variant="body2" color="text.secondary" paragraph>
            {goal}
          </Typography>
        )}
        
        <Typography variant="caption" color="text.secondary">
          Created: {new Date(createdAt).toLocaleDateString()}
        </Typography>
      </CardContent>
      
      <CardActions>
        <Button size="small" onClick={() => onEdit(id)}>Edit</Button>
        {status === 'active' ? (
          <Button size="small" onClick={() => onStop(id)}>Stop</Button>
        ) : (
          <Button size="small" onClick={() => onStart(id)}>Start</Button>
        )}
        <Button size="small" color="error" onClick={() => onDelete(id)}>Delete</Button>
      </CardActions>
    </Card>
  );
}