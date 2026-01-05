'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField,
  Card,
  CardContent,
  Alert,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';

const UploadArea = styled('div')(({ theme }) => ({
  border: '2px dashed #ccc',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
}));

interface RAGUploadZoneProps {
  onFileUpload: (file: File) => void;
  onUrlUpload: (url: string) => void;
  loading?: boolean;
}

export function RAGUploadZone({ onFileUpload, onUrlUpload, loading }: RAGUploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.docx')) {
        onFileUpload(file);
      } else {
        setError('Only PDF and DOCX files are supported');
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.docx')) {
        onFileUpload(file);
      } else {
        setError('Only PDF and DOCX files are supported');
      }
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      onUrlUpload(url);
      setUrl('');
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Upload Documents for RAG
          </Typography>
          
          <UploadArea
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <Typography variant="body1" gutterBottom>
              Drag and drop PDF or DOCX files here
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              or
            </Typography>
            <Button
              variant="outlined"
              component="label"
              disabled={loading}
            >
              Browse Files
              <input
                type="file"
                hidden
                accept=".pdf,.docx"
                onChange={handleFileInput}
              />
            </Button>
          </UploadArea>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Or Upload from URL
            </Typography>
            <Box component="form" onSubmit={handleUrlSubmit} display="flex" gap={2}>
              <TextField
                fullWidth
                label="Enter URL"
                variant="outlined"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={loading || !url}
              >
                {loading ? <CircularProgress size={24} /> : 'Upload'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}