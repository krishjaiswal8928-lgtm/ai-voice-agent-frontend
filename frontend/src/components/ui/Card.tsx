'use client';

import React from 'react';
import { Card as MuiCard, CardContent, CardHeader, CardProps, CardContentProps } from '@mui/material';

interface CustomCardProps extends CardProps {
  title?: string;
  subtitle?: string;
  contentProps?: CardContentProps;
}

export function Card({ title, subtitle, children, contentProps, ...props }: CustomCardProps) {
  return (
    <MuiCard {...props}>
      {title && <CardHeader title={title} subheader={subtitle} />}
      <CardContent {...contentProps}>
        {children}
      </CardContent>
    </MuiCard>
  );
}