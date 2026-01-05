// src/lib/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Log the API base URL for debugging
console.log('API Base URL:', API_BASE_URL);

// Create axios instance with timeout
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // Increased timeout to 120 seconds
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  // Only access localStorage on client side
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No authentication token found for request:', config.url);
    }
  }
  return config;
}, (error) => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Better error logging
    if (error.response) {
      // Server responded with error status
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('API Network Error:', {
        message: error.message,
        url: error.config?.url,
        baseURL: error.config?.baseURL
      });
    } else {
      // Something else happened
      console.error('API Error:', error.message);
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      // Clear token and redirect to login (only on client side)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),

  register: (username: string, email: string, password: string) =>
    api.post('/auth/register', { username, email, password }),

  googleAuth: (idToken: string) =>
    api.post('/auth/google', { id_token: idToken }),

  refreshToken: () =>
    api.post('/auth/refresh'),

  getCurrentUser: () =>
    api.get('/users/me'),
};

// Call Session endpoints
export const callSessionAPI = {
  getAll: (skip = 0, limit = 100, campaignType = null) => {
    let url = `/campaigns?skip=${skip}&limit=${limit}`;
    // Don't send 'all' as a filter value, only send specific types
    if (campaignType && campaignType !== 'all') {
      url += `&campaign_type=${campaignType}`;
    }
    return api.get(url);
  },

  getById: (id: string) =>  // Changed from number to string
    api.get(`/campaigns/${id}`),

  create: (data: any) =>
    api.post('/campaigns', data),

  update: (id: string, data: any) =>  // Changed from number to string
    api.put(`/campaigns/${id}`, data),

  delete: (id: string) =>  // Changed from number to string
    api.delete(`/campaigns/${id}`),

  start: (id: string) =>  // Changed from number to string
    api.post(`/campaigns/${id}/start`),

  stop: (id: string) =>  // Changed from number to string
    api.post(`/campaigns/${id}/stop`),

  // New endpoint for uploading leads
  uploadLeads: (campaignId: string, file: File) => {  // Changed from number to string
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/campaigns/${campaignId}/upload-leads`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // Increased timeout to 120 seconds for file uploads
    });
  },
};


// RAG endpoints
export const ragAPI = {
  uploadPDF: (campaignId: string, file: File, agentId?: number) => {  // Changed from number to string
    const formData = new FormData();
    formData.append('file', file);
    if (agentId) {
      formData.append('agent_id', agentId.toString());
    }

    // For agent-based operations, we still pass campaignId as 0 but include agent_id in form data
    return api.post(`/rag/upload-pdf/${campaignId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // Increased timeout to 120 seconds for document processing
    });
  },

  uploadDOCX: (campaignId: string, file: File, agentId?: number) => {  // Changed from number to string
    const formData = new FormData();
    formData.append('file', file);
    if (agentId) {
      formData.append('agent_id', agentId.toString());
    }

    return api.post(`/rag/upload-docx/${campaignId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // Increased timeout to 120 seconds for document processing
    });
  },

  uploadURL: (campaignId: string, url: string, agentId?: number) => {  // Changed from number to string
    const formData = new FormData();
    formData.append('url', url);
    if (agentId) {
      formData.append('agent_id', agentId.toString());
    }

    return api.post(`/rag/upload-url/${campaignId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // Increased timeout to 120 seconds for URL processing
    });
  },

  crawlDomainAgent: (agentId: number, url: string, maxPages: number = 1000) => {
    const formData = new FormData();
    formData.append('url', url);
    formData.append('max_pages', maxPages.toString());

    return api.post(`/rag/crawl-domain-agent/${agentId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 600000, // Increased timeout to 10 minutes for domain crawling
    });
  },

  getDocuments: (campaignId: string) =>  // Changed from number to string
    api.get(`/rag/documents/${campaignId}`),

  getAgentDocuments: (agentId: number) =>
    api.get(`/rag/documents/agent/${agentId}`),
};

// Lead endpoints
export const leadAPI = {
  uploadCSV: (campaignId: string, file: File) => {  // Changed from number to string
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/leads/upload-csv/${campaignId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // Increased timeout to 120 seconds for file uploads
    });
  },

  getAll: (campaignId: string, skip = 0, limit = 100) =>  // Changed from number to string
    api.get(`/leads/${campaignId}?skip=${skip}&limit=${limit}`),

  getById: (id: number) =>
    api.get(`/leads/${id}`),
};

// Voice endpoints
export const voiceAPI = {
  getActiveCalls: () =>
    api.get('/voice/active-calls'),

  getCallInfo: (callSid: string) =>
    api.get(`/voice/call/${callSid}`),

  endCall: (callSid: string) =>
    api.post(`/voice/call/${callSid}/end`),

  healthCheck: () =>
    api.get('/voice/health'),

  // Custom agent endpoints - Fixed the route to match backend
  getCustomAgents: () =>
    api.get('/agents'),

  getCustomAgent: (id: string) =>
    api.get(`/agents/${id}`),

  createCustomAgent: (data: any) =>
    api.post('/agents', data),

  updateCustomAgent: (id: string, data: any) =>
    api.put(`/agents/${id}`, data),

  deleteCustomAgent: (id: string) =>
    api.delete(`/agents/${id}`),
};

// Report endpoints
export const reportAPI = {
  exportCallSessionResults: (campaignId: string) =>  // Changed from number to string
    api.get(`/reports/export-campaign/${campaignId}`),

  exportConversations: (campaignId: string) =>  // Changed from number to string
    api.get(`/reports/export-conversations/${campaignId}`),

  getAll: () =>
    api.get('/reports'),

  getCallSessionConversations: (campaignId: string) =>  // Changed from number to string
    api.get(`/reports/campaign/${campaignId}/conversations`),
};

// Phone Number endpoints
export const phoneNumberAPI = {
  getAll: () =>
    api.get('/phone-numbers'),

  getById: (id: string) =>
    api.get(`/phone-numbers/${id}`),

  create: (data: any) =>
    api.post('/phone-numbers', data),

  update: (id: string, data: any) =>
    api.put(`/phone-numbers/${id}`, data),

  delete: (id: string) =>
    api.delete(`/phone-numbers/${id}`),

  assignAgent: (phoneId: string, agentId: string) =>
    api.post(`/phone-numbers/${phoneId}/assign/${agentId}`),

  unassignAgent: (phoneId: string, agentId: string) =>
    api.delete(`/phone-numbers/${phoneId}/assign/${agentId}`),
};

// Integration endpoints
export const integrationAPI = {
  getAll: () =>
    api.get('/integrations'),

  getById: (id: string) =>
    api.get(`/integrations/${id}`),

  connect: (data: { provider: string, credentials: any }) =>
    api.post('/integrations', data),

  disconnect: (id: string) =>
    api.delete(`/integrations/${id}`),

  fetchPhoneNumbers: (id: string) =>
    api.get(`/integrations/${id}/phone-numbers`),

  importPhoneNumber: (integrationId: string, data: { phone_number_sid: string, agent_id?: string, display_name?: string }) =>
    api.post(`/integrations/${integrationId}/import`, data),
};

export default api;