'use client';

import React from 'react';
import { 
  Box, 
  Typography, 
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { Lead } from '@/hooks/useLeads';

interface CampaignLeadsListProps {
  leads: Lead[];
}

export function CampaignLeadsList({ leads }: CampaignLeadsListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'default';
      case 'in_progress': return 'primary';
      case 'completed': return 'success';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  if (leads.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography color="textSecondary">
          No leads uploaded yet
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>{lead.name}</TableCell>
              <TableCell>{lead.phone}</TableCell>
              <TableCell>{lead.email || '-'}</TableCell>
              <TableCell>
                <Chip 
                  label={lead.status.replace('_', ' ')} 
                  size="small" 
                  color={getStatusColor(lead.status)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}