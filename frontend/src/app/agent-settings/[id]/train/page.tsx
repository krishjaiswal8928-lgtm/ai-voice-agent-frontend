'use client';

import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { NavigationLayout } from '@/components/NavigationLayout';
import { KnowledgeBaseDashboard } from '@/components/KnowledgeBaseDashboard';

export default function AgentTrainingPage() {
  const router = useRouter();
  const params = useParams();
  const agentId = parseInt(params.id as string);

  return (
    <NavigationLayout>
      <Box sx={{ p: 3, bgcolor: '#ffffff', minHeight: '100vh', color: '#000000', width: '100%' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton
            onClick={() => router.push('/agent-settings')}
            sx={{ color: '#000000', mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1, color: '#000000' }}>
              Knowledge Base
            </Typography>
            <Typography variant="h6" sx={{ color: '#555555' }}>
              Train your agent with documents and websites
            </Typography>
          </Box>
        </Box>

        {/* Knowledge Base Dashboard */}
        <KnowledgeBaseDashboard agentId={agentId} />
        {/* Add some padding at the bottom for better UX */}
        <Box sx={{ height: 32 }} />
      </Box>
    </NavigationLayout>
  );
}