'use client';

import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
}

export function LoadingSpinner({ message, size = 40 }: LoadingSpinnerProps) {
  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      minHeight="200px"
    >
      <CircularProgress size={size} />
      {message && (
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          {message}
        </Typography>
      )}
    </Box>
  );
}