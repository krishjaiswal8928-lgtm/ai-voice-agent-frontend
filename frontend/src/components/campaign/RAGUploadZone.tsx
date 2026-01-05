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
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { UploadFile, Link } from '@mui/icons-material';

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
  onFileUpload: (file: File, fileType: string) => void;
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
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      
      // Determine file type from file extension
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      const isValidFileType = fileExtension === 'pdf' || fileExtension === 'docx';
      
      if (validTypes.includes(file.type) || isValidFileType) {
        // Pass the actual file type based on extension
        onFileUpload(file, fileExtension);
      } else {
        setError('Only PDF and DOCX files are supported');
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      
      // Determine file type from file extension
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      const isValidFileType = fileExtension === 'pdf' || fileExtension === 'docx';
      
      if (validTypes.includes(file.type) || isValidFileType) {
        // Pass the actual file type based on extension
        onFileUpload(file, fileExtension);
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
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Upload Documents for RAG
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Provide context for your AI agent with relevant documents
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<UploadFile />}
            onClick={() => document.getElementById('file-input')?.click()}
            disabled={loading}
          >
            Upload File
          </Button>
          
          <input
            id="file-input"
            type="file"
            hidden
            accept=".pdf,.docx"
            onChange={handleFileInput}
          />
        </Box>
        
        <UploadArea
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <UploadFile sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" gutterBottom>
            Drag and drop PDF or DOCX files here
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            or click the Upload File button above
          </Typography>
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
              placeholder="https://example.com/document.pdf"
            />
            <Button
              type="submit"
              variant="contained"
              startIcon={<Link />}
              disabled={loading || !url}
            >
              {loading ? <CircularProgress size={24} /> : 'Upload'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}