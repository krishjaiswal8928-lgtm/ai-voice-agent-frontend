'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Alert,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { UploadFile } from '@mui/icons-material';

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

interface Lead {
  name: string;
  phone: string;
  email?: string;
}

interface LeadCSVUploaderProps {
  onFileUpload: (file: File) => void;
  leads: Lead[];
  loading?: boolean;
}

export function LeadCSVUploader({ onFileUpload, leads, loading }: LeadCSVUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
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
      if (file.name.endsWith('.csv')) {
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          setError('File size exceeds 10MB limit');
          return;
        }
        onFileUpload(file);
      } else {
        setError('Only CSV files are supported');
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith('.csv')) {
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          setError('File size exceeds 10MB limit');
          return;
        }
        onFileUpload(file);
      } else {
        setError('Only CSV files are supported');
      }
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Upload Leads from CSV
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Upload a CSV file containing your leads (Max 10MB)
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <UploadArea
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <UploadFile sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" gutterBottom>
            Drag and drop CSV file here
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
              accept=".csv"
              onChange={handleFileInput}
            />
          </Button>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            CSV must contain a 'phone' column (other columns are optional)
          </Typography>
          {loading && (
            <Box sx={{ mt: 2 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Uploading leads...
              </Typography>
            </Box>
          )}
        </UploadArea>
        
        {leads.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Preview ({leads.length} leads)
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Email</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leads.slice(0, 5).map((lead, index) => (
                    <TableRow key={index}>
                      <TableCell>{lead.name || '-'}</TableCell>
                      <TableCell>{lead.phone}</TableCell>
                      <TableCell>{lead.email || '-'}</TableCell>
                    </TableRow>
                  ))}
                  {leads.length > 5 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        ... and {leads.length - 5} more
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}