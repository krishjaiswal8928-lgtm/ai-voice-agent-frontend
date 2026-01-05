'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress
} from '@mui/material';
import {
  Edit
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { callSessionAPI } from '@/lib/api';

interface Campaign {
  id: string;
  name: string;
  type: 'outbound' | 'inbound';
  status: 'draft' | 'active' | 'paused' | 'completed';
  goal?: string;
  created_at: string;
  updated_at?: string;
}

export const dynamicParams = false;

export default function CampaignDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();

  // Unwrap params using React.use()
  const resolvedParams = React.use(params);
  const campaignId = resolvedParams.id;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!campaignId) {
          throw new Error('Invalid campaign ID');
        }
        const response = await callSessionAPI.getById(campaignId);
        setCampaign(response.data);
      } catch (err: any) {
        console.error('Error fetching campaign:', err);
        setError('Failed to load campaign details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (campaignId) {
      fetchCampaign();
    } else {
      setLoading(false);
      setError('No campaign ID provided');
    }
  }, [campaignId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress sx={{ color: '#000000' }} />
        <Typography sx={{ ml: 2, color: '#000000' }}>Loading overview...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ color: '#f44336' }}>
          Error: {error}
        </Typography>
      </Box>
    );
  }

  if (!campaign) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ color: '#000000' }}>
          Campaign not found
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, p: 3, bgcolor: '#ffffff', borderRadius: 1, border: '1px solid #e0e0e0' }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: '#000000' }}>
          Campaign Details
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
          <Box>
            <Typography variant="body2" sx={{ color: '#555555', mb: 1 }}>
              Goal
            </Typography>
            <Typography variant="body1" sx={{ color: '#000000' }}>
              {campaign.goal || 'No goal set'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: '#555555', mb: 1 }}>
              Created
            </Typography>
            <Typography variant="body1" sx={{ color: '#000000' }}>
              {new Date(campaign.created_at).toLocaleDateString()}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: '#555555', mb: 1 }}>
              Last Updated
            </Typography>
            <Typography variant="body1" sx={{ color: '#000000' }}>
              {campaign.updated_at ? new Date(campaign.updated_at).toLocaleDateString() : 'Not updated'}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ mb: 4, p: 3, bgcolor: '#ffffff', borderRadius: 1, border: '1px solid #e0e0e0' }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: '#000000' }}>
          Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => router.push(`/campaigns/create?id=${campaign.id}`)}
            sx={{
              color: '#000000',
              borderColor: '#000000',
              '&:hover': {
                borderColor: '#333333',
                backgroundColor: 'rgba(0,0,0,0.03)'
              }
            }}
          >
            Edit Campaign
          </Button>
        </Box>
      </Box>
    </Box>
  );
}