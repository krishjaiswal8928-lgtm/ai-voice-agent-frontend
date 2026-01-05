// src/hooks/useCallSessions.ts
import { useState, useEffect } from 'react';
import { callSessionAPI } from '@/lib/api';

export interface CallSession {
  id: string;  // Changed from number to string to match Firestore IDs
  name: string;
  type: 'outbound' | 'inbound';
  status: 'draft' | 'active' | 'paused' | 'completed';
  goal?: string;
  created_at: string;
  updated_at?: string;
}

export function useCallSessions(campaignType: string | null = null) {
  const [callSessions, setCallSessions] = useState<CallSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCallSessions();
  }, [campaignType]);

  const fetchCallSessions = async () => {
    try {
      setLoading(true);
      console.log('Fetching call sessions with type filter:', campaignType);
      const response = await callSessionAPI.getAll(0, 100, campaignType);
      console.log('Call Sessions API response:', response);
      setCallSessions(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching call sessions:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch call sessions';
      setError(`Error loading call sessions: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const createCallSession = async (data: Omit<CallSession, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await callSessionAPI.create(data);
      setCallSessions(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError('Failed to create call session');
      console.error('Error creating call session:', err);
      throw err;
    }
  };

  const updateCallSession = async (id: string, data: Partial<CallSession>) => {
    try {
      const response = await callSessionAPI.update(id, data);
      setCallSessions(prev => prev.map(callSession =>
        callSession.id === id ? { ...callSession, ...response.data } : callSession
      ));
      return response.data;
    } catch (err) {
      setError('Failed to update call session');
      console.error('Error updating call session:', err);
      throw err;
    }
  };

  const deleteCallSession = async (id: string) => {
    try {
      await callSessionAPI.delete(id);
      setCallSessions(prev => prev.filter(callSession => callSession.id !== id));
    } catch (err) {
      setError('Failed to delete call session');
      console.error('Error deleting call session:', err);
      throw err;
    }
  };

  const startCallSession = async (id: string) => {
    try {
      const response = await callSessionAPI.start(id);
      setCallSessions(prev => prev.map(callSession =>
        callSession.id === id ? { ...callSession, ...response.data } : callSession
      ));
      return response.data;
    } catch (err) {
      setError('Failed to start call session');
      console.error('Error starting call session:', err);
      throw err;
    }
  };

  const stopCallSession = async (id: string) => {
    try {
      const response = await callSessionAPI.stop(id);
      setCallSessions(prev => prev.map(callSession =>
        callSession.id === id ? { ...callSession, ...response.data } : callSession
      ));
      return response.data;
    } catch (err) {
      setError('Failed to stop call session');
      console.error('Error stopping call session:', err);
      throw err;
    }
  };

  return {
    callSessions,
    loading,
    error,
    fetchCallSessions,
    createCallSession,
    updateCallSession,
    deleteCallSession,
    startCallSession,
    stopCallSession
  };
}