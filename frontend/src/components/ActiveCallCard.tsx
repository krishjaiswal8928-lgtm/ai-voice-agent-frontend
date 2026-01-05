'use client';

import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Chip,
  Box
} from '@mui/material';

interface Call {
  id: string;
  leadName?: string;
  callerName?: string;
  phoneNumber: string;
  status: 'ringing' | 'in-progress' | 'completed' | 'failed';
  duration: number;
}

interface ActiveCallCardProps {
  call: Call;
  onEndCall: (callId: string) => void;
}

export function ActiveCallCard({ call, onEndCall }: ActiveCallCardProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: Call['status']) => {
    switch (status) {
      case 'ringing': return 'warning';
      case 'in-progress': return 'success';
      case 'completed': return 'default';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6">
              {call.leadName || call.callerName || 'Unknown'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {call.phoneNumber}
            </Typography>
          </Box>
          <Chip 
            label={call.status} 
            color={getStatusColor(call.status)} 
            size="small"
          />
        </Box>
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
          <Typography variant="body2">
            Duration: {formatDuration(call.duration)}
          </Typography>
          {call.status !== 'completed' && call.status !== 'failed' && (
            <Button 
              variant="outlined" 
              color="secondary" 
              size="small"
              onClick={() => onEndCall(call.id)}
            >
              End Call
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}