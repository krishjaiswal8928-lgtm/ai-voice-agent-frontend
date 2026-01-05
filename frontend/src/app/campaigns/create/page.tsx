'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CreateCampaignRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignType = searchParams.get('type') || 'outbound';

  useEffect(() => {
    // Redirect to the wizard version
    router.push(`/campaigns/create/wizard?type=${campaignType}`);
  }, [campaignType, router]);

  return (
    <div>
      <p>Redirecting to campaign creation wizard...</p>
    </div>
  );
}
