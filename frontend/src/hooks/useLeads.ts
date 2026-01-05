// src/hooks/useLeads.ts
import { useState, useEffect, useRef } from 'react';
import { leadAPI } from '@/lib/api';

export interface Lead {
  id: number;
  campaign_id: number;
  name: string;
  phone: string;
  email?: string;
  status: string;
  created_at: string;
}

// Global state for leads to prevent multiple polling
const globalLeadsState: Record<number, { leads: Lead[], loading: boolean, error: string | null }> = {};

export function useLeads(campaignId?: number) {
  const [leads, setLeads] = useState<Lead[]>(campaignId ? globalLeadsState[campaignId]?.leads || [] : []);
  const [loading, setLoading] = useState(campaignId ? globalLeadsState[campaignId]?.loading || false : false);
  const [error, setError] = useState<string | null>(campaignId ? globalLeadsState[campaignId]?.error || null : null);
  const listeners = useRef<((leads: Lead[], loading: boolean, error: string | null) => void)[]>([]);

  // Initialize global state for this campaign
  useEffect(() => {
    if (campaignId && !globalLeadsState[campaignId]) {
      globalLeadsState[campaignId] = {
        leads: [],
        loading: false,
        error: null
      };
    }
  }, [campaignId]);

  const updateGlobalState = (campaignId: number, leads: Lead[], loading: boolean, error: string | null) => {
    if (!globalLeadsState[campaignId]) {
      globalLeadsState[campaignId] = { leads: [], loading: false, error: null };
    }

    globalLeadsState[campaignId] = { leads, loading, error };

    // Notify all listeners for this campaign
    if (listeners.current) {
      listeners.current.forEach(listener => listener(leads, loading, error));
    }
  };

  const fetchLeads = async (campaignIdParam?: number) => {
    const id = campaignIdParam || campaignId;
    if (!id) return [];

    try {
      setLoading(true);
      updateGlobalState(id, globalLeadsState[id]?.leads || [], true, null);
      const response = await leadAPI.getAll(id, 0, 100);
      setLeads(response.data);
      updateGlobalState(id, response.data, false, null);
      return response.data;
    } catch (err) {
      const errorMsg = 'Failed to fetch leads';
      setError(errorMsg);
      updateGlobalState(id, globalLeadsState[id]?.leads || [], false, errorMsg);
      console.error('Error fetching leads:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const uploadCSV = async (campaignIdParam: number, file: File) => {
    const id = campaignIdParam || campaignId;
    if (!id) throw new Error('Campaign ID is required');

    try {
      setLoading(true);
      updateGlobalState(id, globalLeadsState[id]?.leads || [], true, null);
      const response = await leadAPI.uploadCSV(id, file);
      // Refresh leads after upload
      await fetchLeads(id);
      return response.data;
    } catch (err) {
      const errorMsg = 'Failed to upload CSV';
      setError(errorMsg);
      updateGlobalState(id, globalLeadsState[id]?.leads || [], false, errorMsg);
      console.error('Error uploading CSV:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to global state changes for this campaign
  useEffect(() => {
    if (!campaignId) return;

    const listener = (leads: Lead[], loading: boolean, error: string | null) => {
      setLeads(leads);
      setLoading(loading);
      setError(error);
    };

    listeners.current.push(listener);

    // Initialize with current global state
    if (globalLeadsState[campaignId]) {
      listener(
        globalLeadsState[campaignId].leads,
        globalLeadsState[campaignId].loading,
        globalLeadsState[campaignId].error
      );
    }

    return () => {
      const index = listeners.current.indexOf(listener);
      if (index > -1) {
        listeners.current.splice(index, 1);
      }
    };
  }, [campaignId]);

  return {
    leads,
    loading,
    error,
    fetchLeads,
    uploadCSV
  };
}