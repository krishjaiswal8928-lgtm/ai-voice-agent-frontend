// src/hooks/useVoice.ts
import { useState, useEffect, useRef } from 'react';
import { voiceAPI } from '@/lib/api';

export interface ActiveCall {
  call_sid: string;
  start_time: number;
  duration: number;
  last_activity: number;
  conversation_turns: number;
}

// Global state for active calls to prevent multiple polling
let globalActiveCalls: ActiveCall[] = [];
let globalLoading = false;
let globalError: string | null = null;
const listeners: ((calls: ActiveCall[], loading: boolean, error: string | null) => void)[] = [];

export function useVoice() {
  const [activeCalls, setActiveCalls] = useState<ActiveCall[]>(globalActiveCalls);
  const [loading, setLoading] = useState(globalLoading);
  const [error, setError] = useState<string | null>(globalError);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  const updateListeners = (calls: ActiveCall[], loading: boolean, error: string | null) => {
    globalActiveCalls = calls;
    globalLoading = loading;
    globalError = error;
    listeners.forEach(listener => listener(calls, loading, error));
  };

  const fetchActiveCalls = async () => {
    try {
      setLoading(true);
      updateListeners(globalActiveCalls, true, null);
      const response = await voiceAPI.getActiveCalls();
      setActiveCalls(response.data);
      updateListeners(response.data, false, null);
      return response.data;
    } catch (err) {
      const errorMsg = 'Failed to fetch active calls';
      setError(errorMsg);
      updateListeners(globalActiveCalls, false, errorMsg);
      console.error('Error fetching active calls:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCallInfo = async (callSid: string) => {
    try {
      const response = await voiceAPI.getCallInfo(callSid);
      return response.data;
    } catch (err) {
      setError('Failed to get call info');
      console.error('Error getting call info:', err);
      throw err;
    }
  };

  const endCall = async (callSid: string) => {
    try {
      await voiceAPI.endCall(callSid);
      // Remove call from active calls
      const updatedCalls = globalActiveCalls.filter(call => call.call_sid !== callSid);
      setActiveCalls(updatedCalls);
      updateListeners(updatedCalls, false, null);
    } catch (err) {
      setError('Failed to end call');
      console.error('Error ending call:', err);
      throw err;
    }
  };

  const healthCheck = async () => {
    try {
      await voiceAPI.healthCheck();
      return true;
    } catch (err) {
      setError('Voice service unavailable');
      console.error('Voice service health check failed:', err);
      return false;
    }
  };

  // Subscribe to global state changes
  useEffect(() => {
    const listener = (calls: ActiveCall[], loading: boolean, error: string | null) => {
      setActiveCalls(calls);
      setLoading(loading);
      setError(error);
    };
    
    listeners.push(listener);
    
    // Initialize with current global state
    listener(globalActiveCalls, globalLoading, globalError);
    
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  // Poll for active calls every 10 seconds instead of 5
  useEffect(() => {
    // Only start polling if there are listeners
    if (listeners.length > 0 && !pollInterval.current) {
      pollInterval.current = setInterval(() => {
        if (!loading) {
          fetchActiveCalls();
        }
      }, 10000); // Increased from 5s to 10s
    }

    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
        pollInterval.current = null;
      }
    };
  }, [loading]);

  return {
    activeCalls,
    loading,
    error,
    fetchActiveCalls,
    getCallInfo,
    endCall,
    healthCheck
  };
}