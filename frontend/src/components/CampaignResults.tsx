'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert
} from '@mui/material';
import { Download, CheckCircle, Error, HourglassEmpty } from '@mui/icons-material';
import { reportAPI } from '@/lib/api';

interface CampaignResult {
  id: number;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  goal: string;
  createdAt: string;
  completedAt?: string;
  successRate: number;
  totalCalls: number;
  completedCalls: number;
}

interface ResultData {
  name: string;
  phone: string;
  goalStatus: string;
  [key: string]: string | number;
}

export function CampaignResults({ campaignId }: { campaignId: number }) {
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [campaign, setCampaign] = useState<CampaignResult | null>(null);
  const [results, setResults] = useState<ResultData[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCampaignResults();
  }, [campaignId]);

  const fetchCampaignResults = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch actual campaign data
      // For now, we'll use mock data
      const mockCampaign: CampaignResult = {
        id: campaignId,
        name: 'Product Demo Campaign',
        status: 'completed',
        goal: 'Collect appointment bookings for product demo',
        createdAt: '2023-05-15T10:30:00Z',
        completedAt: '2023-05-15T14:45:00Z',
        successRate: 72,
        totalCalls: 120,
        completedCalls: 120
      };

      const mockResults: ResultData[] = [
        { name: 'John Smith', phone: '+1234567890', goalStatus: 'Booked', appointmentDate: '2023-05-20', email: 'john@example.com' },
        { name: 'Jane Doe', phone: '+1234567891', goalStatus: 'Interested', notes: 'Requested more info', email: 'jane@example.com' },
        { name: 'Robert Johnson', phone: '+1234567892', goalStatus: 'Booked', appointmentDate: '2023-05-18', email: 'robert@example.com' },
        { name: 'Emily Wilson', phone: '+1234567893', goalStatus: 'Not Interested', notes: 'Already has similar product' },
        { name: 'Michael Brown', phone: '+1234567894', goalStatus: 'Booked', appointmentDate: '2023-05-22', email: 'michael@example.com' }
      ];

      setCampaign(mockCampaign);
      setResults(mockResults);
    } catch (err) {
      setError('Failed to load campaign results');
      console.error('Error fetching campaign results:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadResults = async () => {
    try {
      setDownloading(true);
      // In a real implementation, this would download the actual CSV
      // For now, we'll simulate the download
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create a mock CSV content
      const csvContent = [
        ['Name', 'Phone', 'Goal Status', 'Appointment Date', 'Email', 'Notes'],
        ['John Smith', '+1234567890', 'Booked', '2023-05-20', 'john@example.com', ''],
        ['Jane Doe', '+1234567891', 'Interested', '', 'jane@example.com', 'Requested more info'],
        ['Robert Johnson', '+1234567892', 'Booked', '2023-05-18', 'robert@example.com', ''],
        ['Emily Wilson', '+1234567893', 'Not Interested', '', '', 'Already has similar product'],
        ['Michael Brown', '+1234567894', 'Booked', '2023-05-22', 'michael@example.com', '']
      ].map(row => row.join(',')).join('\n');

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `campaign-${campaignId}-results.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download results');
      console.error('Error downloading results:', err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!campaign) {
    return (
      <Alert severity="info">
        No results available for this campaign yet.
      </Alert>
    );
  }

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                {campaign.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Chip
                  icon={campaign.status === 'completed' ? <CheckCircle /> : campaign.status === 'failed' ? <Error /> : <HourglassEmpty />}
                  label={
                    campaign.status === 'pending' ? 'Pending' :
                      campaign.status === 'in_progress' ? 'In Progress' :
                        campaign.status === 'completed' ? 'Completed' : 'Failed'
                  }
                  color={
                    campaign.status === 'pending' ? 'default' :
                      campaign.status === 'in_progress' ? 'primary' :
                        campaign.status === 'completed' ? 'success' : 'error'
                  }
                />
                <Typography variant="body2" sx={{ color: '#777' }}>
                  Created: {new Date(campaign.createdAt).toLocaleDateString()}
                </Typography>
                {campaign.completedAt && (
                  <Typography variant="body2" sx={{ color: '#777' }}>
                    Completed: {new Date(campaign.completedAt).toLocaleDateString()}
                  </Typography>
                )}
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={downloading ? <CircularProgress size={20} /> : <Download />}
              onClick={handleDownloadResults}
              disabled={downloading || campaign.status !== 'completed'}
              sx={{
                bgcolor: '#000',
                color: '#fff',
                '&:hover': {
                  bgcolor: '#333'
                },
                '&:disabled': {
                  bgcolor: '#555',
                  color: '#999'
                }
              }}
            >
              Download Results
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 4, mt: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {campaign.successRate}%
              </Typography>
              <Typography variant="body2" sx={{ color: '#777' }}>
                Success Rate
              </Typography>
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {campaign.completedCalls}/{campaign.totalCalls}
              </Typography>
              <Typography variant="body2" sx={{ color: '#777' }}>
                Calls Completed
              </Typography>
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {Math.floor((campaign.completedCalls / campaign.totalCalls) * 100)}%
              </Typography>
              <Typography variant="body2" sx={{ color: '#777' }}>
                Completion Rate
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Campaign Results
          </Typography>

          {results.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" sx={{ color: '#777' }}>
                No results available yet. Results will appear here after calls are completed.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Goal Status</TableCell>
                    {Object.keys(results[0]).filter(key => !['name', 'phone', 'goalStatus'].includes(key)).map((key) => (
                      <TableCell key={key} sx={{ fontWeight: 700 }}>
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((row, index) => (
                    <TableRow
                      key={index}
                      sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}
                    >
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.phone}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.goalStatus}
                          size="small"
                          color={
                            row.goalStatus === 'Booked' ? 'success' :
                              row.goalStatus === 'Interested' ? 'primary' :
                                row.goalStatus === 'Not Interested' ? 'default' : 'default'
                          }
                        />
                      </TableCell>
                      {Object.keys(row).filter(key => !['name', 'phone', 'goalStatus'].includes(key)).map((key) => (
                        <TableCell key={key}>{row[key] || '-'}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}