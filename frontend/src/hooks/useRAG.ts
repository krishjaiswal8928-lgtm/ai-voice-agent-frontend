// src/hooks/useRAG.ts
import { useState } from 'react';
import { ragAPI } from '@/lib/api';

export interface RAGDocument {
  id: number;
  campaign_id: number;
  filename: string;
  content: string;
  file_type: string;
  created_at: string;
}

export function useRAG(campaignId: number | null) {
  const [documents, setDocuments] = useState<RAGDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadPDF = async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ragAPI.uploadPDF(campaignId!, file);
      setDocuments(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError('Failed to upload PDF');
      console.error('Error uploading PDF:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadDOCX = async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ragAPI.uploadDOCX(campaignId!, file);
      setDocuments(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError('Failed to upload DOCX');
      console.error('Error uploading DOCX:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadURL = async (url: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ragAPI.uploadURL(campaignId!, url);
      setDocuments(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError('Failed to upload URL');
      console.error('Error uploading URL:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await ragAPI.getDocuments(campaignId!);
      setDocuments(response.data);
    } catch (err) {
      setError('Failed to fetch documents');
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    documents,
    loading,
    error,
    uploadPDF,
    uploadDOCX,
    uploadURL,
    fetchDocuments
  };
}