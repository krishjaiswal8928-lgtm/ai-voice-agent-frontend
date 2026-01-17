'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  TrendingUp,
  Phone,
  CheckCircle,
  SwapHoriz,
  Schedule
} from '@mui/icons-material';
import { NavigationLayout } from '@/components/NavigationLayout';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';

export default function ReportsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [analytics, setAnalytics] = useState<any>(null);
  const [dispositionData, setDispositionData] = useState<any>(null);
  const [transferAnalytics, setTransferAnalytics] = useState<any>(null);
  const [callbackAnalytics, setCallbackAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (selectedCampaign) {
      fetchAnalytics();
    }
  }, [selectedCampaign]);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get('/api/campaigns/');
      setCampaigns(response.data);
      if (response.data.length > 0) {
        setSelectedCampaign(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [analyticsRes, dispositionRes, transferRes, callbackRes] = await Promise.all([
        axios.get(`/api/analytics/campaign/${selectedCampaign}`),
        axios.get(`/api/analytics/campaign/${selectedCampaign}/disposition`),
        axios.get(`/api/analytics/campaign/${selectedCampaign}/transfers`),
        axios.get(`/api/analytics/campaign/${selectedCampaign}/callbacks`)
      ]);

      setAnalytics(analyticsRes.data);
      setDispositionData(dispositionRes.data);
      setTransferAnalytics(transferRes.data);
      setCallbackAnalytics(callbackRes.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const dispositionChartData = dispositionData ?
    Object.entries(dispositionData).map(([name, data]: [string, any]) => ({
      name,
      value: data.count
    })) : [];

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
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>
              Analytics & Reports
            </Typography>
            <Typography variant="body1" sx={{ color: '#6b7280', mt: 1 }}>
              Comprehensive campaign performance analytics
            </Typography>
          </Box>
          <FormControl sx={{ minWidth: 250, bgcolor: '#ffffff' }}>
            <InputLabel>Select Campaign</InputLabel>
            <Select
              value={selectedCampaign}
              label="Select Campaign"
              onChange={(e) => setSelectedCampaign(e.target.value)}
            >
              {campaigns.map((campaign) => (
                <MenuItem key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#6366f1' }} />
          </Box>
        ) : analytics ? (
          <>
            {/* Key Metrics */}
            <Grid container spacing={3} sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(99,102,241,0.1)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h6" sx={{ color: '#6b7280', mb: 1, fontWeight: 600, fontSize: '0.9rem' }}>
                          Total Leads
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: '#111827' }}>
                          {analytics.total_leads}
                        </Typography>
                      </Box>
                      <Phone sx={{ fontSize: 48, color: '#6366f1' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(99,102,241,0.1)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h6" sx={{ color: '#6b7280', mb: 1, fontWeight: 600, fontSize: '0.9rem' }}>
                          Connection Rate
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: '#22c55e' }}>
                          {analytics.connection_rate}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={analytics.connection_rate}
                          sx={{ mt: 1, bgcolor: '#e5e7eb', '& .MuiLinearProgress-bar': { bgcolor: '#22c55e' } }}
                        />
                      </Box>
                      <CheckCircle sx={{ fontSize: 48, color: '#22c55e' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(99,102,241,0.1)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h6" sx={{ color: '#6b7280', mb: 1, fontWeight: 600, fontSize: '0.9rem' }}>
                          Qualification Rate
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: '#6366f1' }}>
                          {analytics.qualification_rate}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={analytics.qualification_rate}
                          sx={{ mt: 1, bgcolor: '#e5e7eb', '& .MuiLinearProgress-bar': { bgcolor: '#6366f1' } }}
                        />
                      </Box>
                      <TrendingUp sx={{ fontSize: 48, color: '#6366f1' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(99,102,241,0.1)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h6" sx={{ color: '#6b7280', mb: 1, fontWeight: 600, fontSize: '0.9rem' }}>
                          Avg Lead Score
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: '#111827' }}>
                          {analytics.average_lead_score}/10
                        </Typography>
                      </Box>
                      <TrendingUp sx={{ fontSize: 48, color: '#f59e0b' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Detailed Stats */}
            <Grid container spacing={3} sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(99,102,241,0.1)' }}>
                  <CardContent>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                      Qualified Leads
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#22c55e' }}>
                      {analytics.leads_qualified}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(99,102,241,0.1)' }}>
                  <CardContent>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                      Warm Leads
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#f59e0b' }}>
                      {analytics.leads_warm}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(99,102,241,0.1)' }}>
                  <CardContent>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                      Transfers
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#6366f1' }}>
                      {analytics.total_transfers}
                    </Typography>
                    <Chip label={`${analytics.transfer_rate}%`} size="small" sx={{ mt: 0.5, bgcolor: '#6366f1', color: '#ffffff' }} />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(99,102,241,0.1)' }}>
                  <CardContent>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                      Callbacks
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#8b5cf6' }}>
                      {analytics.total_callbacks_scheduled}
                    </Typography>
                    <Chip label={`${analytics.callback_rate}%`} size="small" sx={{ mt: 0.5, bgcolor: '#8b5cf6', color: '#ffffff' }} />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(99,102,241,0.1)' }}>
                  <CardContent>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                      Avg Call Duration
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>
                      {Math.floor(analytics.average_call_duration / 60)}m
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>
                      {analytics.average_call_duration}s
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={3} sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
              <Grid item xs={12} md={6}>
                <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(99,102,241,0.1)' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#111827' }}>
                      Disposition Breakdown
                    </Typography>
                    {dispositionChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={dispositionChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {dispositionChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <Typography sx={{ textAlign: 'center', py: 4, color: '#6b7280' }}>
                        No disposition data available
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(99,102,241,0.1)' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#111827' }}>
                      Performance Metrics
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>Transfer Success Rate</Typography>
                        <Typography variant="body2" sx={{ color: '#111827', fontWeight: 600 }}>
                          {analytics.transfer_success_rate}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={analytics.transfer_success_rate}
                        sx={{ bgcolor: '#e5e7eb', '& .MuiLinearProgress-bar': { bgcolor: '#22c55e' } }}
                      />
                    </Box>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>Callback Completion Rate</Typography>
                        <Typography variant="body2" sx={{ color: '#111827', fontWeight: 600 }}>
                          {analytics.callback_completion_rate}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={analytics.callback_completion_rate}
                        sx={{ bgcolor: '#e5e7eb', '& .MuiLinearProgress-bar': { bgcolor: '#8b5cf6' } }}
                      />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>Connection Rate</Typography>
                        <Typography variant="body2" sx={{ color: '#111827', fontWeight: 600 }}>
                          {analytics.connection_rate}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={analytics.connection_rate}
                        sx={{ bgcolor: '#e5e7eb', '& .MuiLinearProgress-bar': { bgcolor: '#6366f1' } }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" sx={{ color: '#6b7280' }}>
              Select a campaign to view analytics
            </Typography>
          </Box>
        )}
      </Box>
    </NavigationLayout>
  );
}