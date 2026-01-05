'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Analytics,
  Download,
  BarChart,
  PieChart,
  Timeline,
  Phone,
  CheckCircle
} from '@mui/icons-material';
import { NavigationLayout } from '@/components/NavigationLayout';

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [reportType, setReportType] = useState('summary');

  // Mock data for campaigns
  const campaigns = [
    { id: 1, name: 'Product Demo Campaign' },
    { id: 2, name: 'Lead Qualification' },
    { id: 3, name: 'Appointment Booking' }
  ];

  // Mock data for reports
  const reportData = [
    { id: 1, campaign: 'Product Demo Campaign', calls: 120, completed: 95, successRate: '79%', duration: '2:34' },
    { id: 2, campaign: 'Lead Qualification', calls: 85, completed: 68, successRate: '80%', duration: '1:45' },
    { id: 3, campaign: 'Appointment Booking', calls: 210, completed: 167, successRate: '79%', duration: '3:12' }
  ];

  const handleDownloadReport = () => {
    setLoading(true);
    // Simulate download
    setTimeout(() => {
      setLoading(false);
      // In a real app, this would trigger a file download
      alert('Report downloaded successfully!');
    }, 1500);
  };

  return (
    <NavigationLayout>
      <Box sx={{
        p: 3,
        background: '#f5f5f5',
        minHeight: '100vh',
        color: '#000000',
        width: '100%',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          opacity: 0.3,
          pointerEvents: 'none',
          zIndex: 0
        }
      }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, position: 'relative', zIndex: 1 }}>
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1, color: '#111827' }}>
              Reports & Analytics
            </Typography>
            <Typography variant="h6" sx={{ color: '#6b7280' }}>
              Analyze campaign performance and download reports
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} sx={{ color: '#ffffff' }} /> : <Download />}
            onClick={handleDownloadReport}
            disabled={loading}
            sx={{
              bgcolor: '#6366f1',
              color: '#ffffff',
              fontWeight: 700,
              px: 3,
              '&:hover': {
                bgcolor: '#4f46e5'
              }
            }}
          >
            Download Report
          </Button>
        </Box>

        {/* Filters */}
        <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', mb: 4, boxShadow: '0 1px 3px rgba(99,102,241,0.1)', position: 'relative', zIndex: 1 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#000000' }}>Campaign</InputLabel>
                  <Select
                    value={selectedCampaign}
                    label="Campaign"
                    onChange={(e) => setSelectedCampaign(e.target.value)}
                    sx={{
                      color: '#000000',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e0e0e0'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#000000'
                      }
                    }}
                  >
                    <MenuItem value="all" sx={{ color: '#000000' }}>All Campaigns</MenuItem>
                    {campaigns.map(campaign => (
                      <MenuItem key={campaign.id} value={campaign.id} sx={{ color: '#000000' }}>{campaign.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#000000' }}>Report Type</InputLabel>
                  <Select
                    value={reportType}
                    label="Report Type"
                    onChange={(e) => setReportType(e.target.value)}
                    sx={{
                      color: '#000000',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e0e0e0'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#000000'
                      }
                    }}
                  >
                    <MenuItem value="summary" sx={{ color: '#000000' }}>Summary Report</MenuItem>
                    <MenuItem value="detailed" sx={{ color: '#000000' }}>Detailed Report</MenuItem>
                    <MenuItem value="calls" sx={{ color: '#000000' }}>Call Details</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{
                    height: '100%',
                    color: '#6366f1',
                    borderColor: '#6366f1',
                    '&:hover': {
                      borderColor: '#4f46e5',
                      backgroundColor: 'rgba(99,102,241,0.05)'
                    }
                  }}
                >
                  Apply Filters
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', height: '100%', boxShadow: '0 1px 3px rgba(99,102,241,0.1)', '&:hover': { boxShadow: '0 4px 12px rgba(99,102,241,0.15)' } }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#555555', mb: 1 }}>
                      Total Calls
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#000000' }}>
                      415
                    </Typography>
                  </Box>
                  <Phone sx={{ fontSize: 40, color: '#2196f3' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e0e0e0', height: '100%', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#555555', mb: 1 }}>
                      Success Rate
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#000000' }}>
                      79%
                    </Typography>
                  </Box>
                  <CheckCircle sx={{ fontSize: 40, color: '#4caf50' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e0e0e0', height: '100%', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#555555', mb: 1 }}>
                      Avg. Duration
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#000000' }}>
                      2:20
                    </Typography>
                  </Box>
                  <Timeline sx={{ fontSize: 40, color: '#ff9800' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e0e0e0', height: '100%', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#555555', mb: 1 }}>
                      Conversion Rate
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#000000' }}>
                      65%
                    </Typography>
                  </Box>
                  <BarChart sx={{ fontSize: 40, color: '#9c27b0' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Report Data */}
        <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e0e0e0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#000000' }}>
                Campaign Performance
              </Typography>
              <Chip
                label="Last 30 days"
                size="small"
                sx={{ bgcolor: '#6366f1', color: '#ffffff' }}
              />
            </Box>

            <TableContainer component={Paper} sx={{ bgcolor: '#ffffff', border: '1px solid #e0e0e0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#000000', fontWeight: 700, borderBottom: '1px solid #e0e0e0' }}>Campaign</TableCell>
                    <TableCell sx={{ color: '#000000', fontWeight: 700, borderBottom: '1px solid #e0e0e0' }}>Total Calls</TableCell>
                    <TableCell sx={{ color: '#000000', fontWeight: 700, borderBottom: '1px solid #e0e0e0' }}>Completed</TableCell>
                    <TableCell sx={{ color: '#000000', fontWeight: 700, borderBottom: '1px solid #e0e0e0' }}>Success Rate</TableCell>
                    <TableCell sx={{ color: '#000000', fontWeight: 700, borderBottom: '1px solid #e0e0e0' }}>Avg. Duration</TableCell>
                    <TableCell sx={{ color: '#000000', fontWeight: 700, borderBottom: '1px solid #e0e0e0' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.map((row) => (
                    <TableRow
                      key={row.id}
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.03)' }
                      }}
                    >
                      <TableCell sx={{ color: '#000000', borderBottom: '1px solid #e0e0e0' }}>
                        {row.campaign}
                      </TableCell>
                      <TableCell sx={{ color: '#000000', borderBottom: '1px solid #e0e0e0' }}>
                        {row.calls}
                      </TableCell>
                      <TableCell sx={{ color: '#000000', borderBottom: '1px solid #e0e0e0' }}>
                        {row.completed}
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                        <Chip
                          label={row.successRate}
                          size="small"
                          sx={{
                            bgcolor: '#6366f1',
                            color: '#ffffff'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#000000', borderBottom: '1px solid #e0e0e0' }}>
                        {row.duration}
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                        <Button
                          size="small"
                          startIcon={<Analytics />}
                          sx={{
                            color: '#6366f1',
                            borderColor: '#6366f1',
                            '&:hover': {
                              borderColor: '#4f46e5',
                              backgroundColor: 'rgba(99,102,241,0.05)'
                            }
                          }}
                          variant="outlined"
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </NavigationLayout>
  );
}