'use client';

import React from 'react';
import { Button as MuiButton, ButtonProps } from '@mui/material';

interface CustomButtonProps extends ButtonProps {
  loading?: boolean;
}

export function Button({ loading, children, ...props }: CustomButtonProps) {
  return (
    <MuiButton 
      {...props}
      disabled={props.disabled || loading}
    >
      {loading ? 'Loading...' : children}
    </MuiButton>
  );
}