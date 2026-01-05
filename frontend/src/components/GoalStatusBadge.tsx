'use client';

import React from 'react';
import { Chip } from '@mui/material';

interface GoalStatusBadgeProps {
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  progress?: number;
}

export function GoalStatusBadge({ status, progress }: GoalStatusBadgeProps) {
  const getStatusInfo = () => {
    switch (status) {
      case 'not_started':
        return { label: 'Not Started', color: 'default' as const };
      case 'in_progress':
        return { label: `In Progress (${progress}%)`, color: 'primary' as const };
      case 'completed':
        return { label: 'Completed', color: 'success' as const };
      case 'failed':
        return { label: 'Failed', color: 'error' as const };
      default:
        return { label: 'Unknown', color: 'default' as const };
    }
  };

  const { label, color } = getStatusInfo();

  return (
    <Chip 
      label={label} 
      color={color} 
      size="small" 
      variant="outlined"
    />
  );
}