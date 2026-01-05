'use client';

import React from 'react';
import { 
  Box, 
  Typography, 
  LinearProgress 
} from '@mui/material';

interface ProgressBarProps {
  progress: number;
  label?: string;
}

export function ProgressBar({ progress, label }: ProgressBarProps) {
  return (
    <Box sx={{ width: '100%' }}>
      {label && (
        <Typography variant="body2" gutterBottom>
          {label}
        </Typography>
      )}
      <LinearProgress 
        variant="determinate" 
        value={progress} 
        sx={{ mb: 1 }} 
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="body2" color="textSecondary">
          {Math.round(progress)}%
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Complete
        </Typography>
      </Box>
    </Box>
  );
}