// src/hooks/useReports.ts
import { useState } from 'react';
import { reportAPI } from '@/lib/api';

export interface CampaignReport {
  id: number;
  name: string;
  type: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

export function useReports() {
  const [reports, setReports] = useState<CampaignReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await reportAPI.getAll();
      setReports(response.data);
    } catch (err) {
      setError('Failed to fetch reports');
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportCampaignResults = async (campaignId: number) => {
    try {
      setLoading(true);
      const response = await reportAPI.exportCampaignResults(campaignId);
      // In a real app, this would trigger a file download
      return response.data;
    } catch (err) {
      setError('Failed to export campaign results');
      console.error('Error exporting campaign results:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const exportConversations = async (campaignId: number) => {
    try {
      setLoading(true);
      const response = await reportAPI.exportConversations(campaignId);
      // In a real app, this would trigger a file download
      return response.data;
    } catch (err) {
      setError('Failed to export conversations');
      console.error('Error exporting conversations:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    reports,
    loading,
    error,
    fetchReports,
    exportCampaignResults,
    exportConversations
  };
}