import React from 'react';
import ClientRedirect from './ClientRedirect';

// Force dynamic rendering to support useSearchParams in the client component
export const dynamic = 'force-dynamic';

export default function CreateCampaignPage() {
  return <ClientRedirect />;
}
