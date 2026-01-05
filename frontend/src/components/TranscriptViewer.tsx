'use client';

import React, { useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  CircularProgress
} from '@mui/material';

interface TranscriptViewerProps {
  transcript: string;
  loading?: boolean;
}

export function TranscriptViewer({ transcript, loading }: TranscriptViewerProps) {
  const transcriptEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when transcript updates
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!transcript) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="textSecondary">
          No transcript available yet
        </Typography>
      </Box>
    );
  }

  // Parse transcript into speaker segments
  const segments = transcript
    .split('\n')
    .filter(line => line.trim() !== '')
    .map((line, index) => {
      if (line.startsWith('AI Agent:')) {
        return {
          id: index,
          speaker: 'AI Agent',
          text: line.replace('AI Agent:', '').trim(),
          isAgent: true
        };
      } else if (line.startsWith('Lead:') || line.startsWith('Caller:')) {
        return {
          id: index,
          speaker: line.startsWith('Lead:') ? 'Lead' : 'Caller',
          text: line.replace(/^(Lead|Caller):/, '').trim(),
          isAgent: false
        };
      }
      return {
        id: index,
        speaker: 'Unknown',
        text: line,
        isAgent: false
      };
    });

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        maxHeight: 400, 
        overflow: 'auto', 
        p: 2, 
        bgcolor: 'grey.50' 
      }}
    >
      {segments.map((segment) => (
        <Box 
          key={segment.id} 
          sx={{ 
            mb: 2,
            textAlign: segment.isAgent ? 'left' : 'right'
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block', 
              fontWeight: 'bold',
              color: segment.isAgent ? 'primary.main' : 'secondary.main'
            }}
          >
            {segment.speaker}
          </Typography>
          <Typography
            sx={{
              display: 'inline-block',
              p: 1,
              borderRadius: 1,
              bgcolor: segment.isAgent ? 'primary.light' : 'secondary.light',
              color: segment.isAgent ? 'primary.contrastText' : 'secondary.contrastText',
              textAlign: 'left',
              maxWidth: '80%'
            }}
          >
            {segment.text}
          </Typography>
        </Box>
      ))}
      <div ref={transcriptEndRef} />
    </Paper>
  );
}