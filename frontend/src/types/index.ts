// src/types/index.ts

export interface User {
  id: number;
  username: string;
  email: string;
  is_active: number;
  created_at: string;
  updated_at?: string;
}

export interface Campaign {
  id: number;
  user_id: number;
  name: string;
  type: 'outbound' | 'inbound';
  status: 'draft' | 'active' | 'paused' | 'completed';
  goal?: string;
  rag_document_id?: number;
  created_at: string;
  updated_at?: string;
}

export interface Lead {
  id: number;
  campaign_id: number;
  name: string;
  phone: string;
  email?: string;
  status: string;
  created_at: string;
}

export interface RAGDocument {
  id: number;
  campaign_id: number;
  filename: string;
  content: string;
  file_type: string;
  created_at: string;
}

export interface Conversation {
  id: number;
  client_id: number;
  lead_id?: number;
  goal_id?: number;
  campaign_id?: number;
  transcript?: string;
  ai_response?: string;
  audio_url?: string;
  duration?: number;
  status: string;
  created_at: string;
}

export interface ActiveCall {
  call_sid: string;
  start_time: number;
  duration: number;
  last_activity: number;
  conversation_turns: number;
}