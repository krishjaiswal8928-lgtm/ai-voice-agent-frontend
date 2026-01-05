// src/hooks/useWebSocket.ts
import { useState, useEffect, useRef } from 'react';

interface WebSocketMessage {
  event: string;
  [key: string]: any;
}

export function useWebSocket(url: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!url) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setLastMessage(message);
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    ws.onerror = (err) => {
      setError('WebSocket error');
      console.error('WebSocket error:', err);
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [url]);

  const sendMessage = (message: WebSocketMessage) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  const closeConnection = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
  };

  return {
    isConnected,
    lastMessage,
    error,
    sendMessage,
    closeConnection
  };
}