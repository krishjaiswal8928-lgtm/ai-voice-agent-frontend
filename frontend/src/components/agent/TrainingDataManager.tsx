'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button,
  Paper,
  TextField,
  Chip,
  IconButton,
  CircularProgress
} from '@mui/material';
import { 
  Upload, 
  Link, 
  Delete, 
  Description, 
  Web
} from '@mui/icons-material';

interface TrainingDataManagerProps {
  websiteUrls: string[];
  onUrlsChange: (urls: string[]) => void;
  onFileUpload?: (file: File) => void;
}

export function TrainingDataManager({ 
  websiteUrls, 
  onUrlsChange,
  onFileUpload
}: TrainingDataManagerProps) {
  const [newUrl, setNewUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleAddUrl = () => {
    if (newUrl && !websiteUrls.includes(newUrl)) {
      onUrlsChange([...websiteUrls, newUrl]);
      setNewUrl('');
    }
  };

  const handleRemoveUrl = (url: string) => {
    onUrlsChange(websiteUrls.filter(u => u !== url));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onFileUpload) {
      setUploading(true);
      try {
        onFileUpload(e.target.files[0]);
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Training Data Sources
      </Typography>
      
      {/* Website URLs */}
      <Paper sx={{ p: 2, bgcolor: '#222', mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          <Web sx={{ mr: 1, verticalAlign: 'middle' }} />
          Website Training
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="Website URL"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://example.com"
            size="small"
          />
          <Button 
            variant="contained" 
            onClick={handleAddUrl}
            disabled={!newUrl}
            size="small"
          >
            Add
          </Button>
        </Box>
        
        {websiteUrls.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {websiteUrls.map((url, index) => (
              <Chip
                key={index}
                label={url}
                onDelete={() => handleRemoveUrl(url)}
                icon={<Link />}
                deleteIcon={<Delete />}
                sx={{ bgcolor: '#333', color: '#fff' }}
              />
            ))}
          </Box>
        )}
      </Paper>
      
      {/* File Uploads */}
      <Paper sx={{ p: 2, bgcolor: '#222' }}>
        <Typography variant="subtitle1" gutterBottom>
          <Description sx={{ mr: 1, verticalAlign: 'middle' }} />
          Document Training
        </Typography>
        
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Upload sx={{ fontSize: 48, color: '#555', mb: 2 }} />
          <Typography variant="body2" sx={{ color: '#aaa', mb: 2 }}>
            Upload PDF, DOCX, or TXT files to train your agent
          </Typography>
          
          <Button 
            variant="outlined" 
            component="label"
            disabled={uploading}
            size="small"
          >
            {uploading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Uploading...
              </>
            ) : (
              'Choose Files'
            )}
            <input 
              type="file" 
              hidden 
              multiple 
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
            />
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}