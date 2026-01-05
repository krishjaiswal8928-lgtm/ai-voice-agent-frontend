'use client';

import React from 'react';
import CampaignHistoryContent from './CampaignHistoryContent';

export const dynamicParams = false;

export default function CampaignHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use()
  const resolvedParams = React.use(params);
  const campaignId = resolvedParams.id;

  return (
    <CampaignHistoryContent campaignId={campaignId} />
  );
}