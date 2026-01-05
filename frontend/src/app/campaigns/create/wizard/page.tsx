import React from 'react';
import WizardClient from './WizardClient';

// Force dynamic rendering to support useSearchParams in the client component
export const dynamic = 'force-dynamic';

export default function CampaignWizardPage() {
    return <WizardClient />;
}
