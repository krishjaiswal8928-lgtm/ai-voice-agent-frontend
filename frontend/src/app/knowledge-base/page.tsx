'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Checkbox,
    CircularProgress,
    Alert,
    Snackbar,
    Tabs,
    Tab,
    LinearProgress,
    Tooltip
} from '@mui/material';
import {
    CloudUpload,
    Link as LinkIcon,
    Language,
    Delete,
    Visibility,
    PlayArrow,
    CheckCircle,
    Error as ErrorIcon,
    HourglassEmpty,
    Search,
    FilterList,
    MenuBook
} from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { NavigationLayout } from '@/components/NavigationLayout';
import { voiceAPI, ragAPI } from '@/lib/api';
import api from '@/lib/api'; // Import the default api instance
import { useTheme } from '@mui/material/styles';

interface Document {
    id: number;
    title: string;
    filename: string;
    file_type: string;
    chunks_extracted: number;
    created_at: string;
    agent_id?: number;
    agent_name?: string;
    status: 'indexed' | 'processing' | 'failed';
}

interface Agent {
    id: number;
    name: string;
    description: string;
}

export default function KnowledgeBasePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState(0);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [selectedAgent, setSelectedAgent] = useState<number | ''>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedDocs, setSelectedDocs] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');

    // URL Dialog
    const [urlDialogOpen, setUrlDialogOpen] = useState(false);
    const [url, setUrl] = useState('');
    const [urlLoading, setUrlLoading] = useState(false);

    // Domain Crawl Dialog
    const [crawlDialogOpen, setCrawlDialogOpen] = useState(false);
    const [domainUrl, setDomainUrl] = useState('');
    const [maxPages, setMaxPages] = useState(50);
    const [crawlLoading, setCrawlLoading] = useState(false);
    const [crawlProgress, setCrawlProgress] = useState(0);

    // Context Dialog
    const [contextDialogOpen, setContextDialogOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<any>(null);
    const [contextLoading, setContextLoading] = useState(false);

    // Assign Agent Dialog
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [assignAgentId, setAssignAgentId] = useState<number | ''>('');

    useEffect(() => {
        fetchAgents();
    }, []);

    // Effect to handle URL query param for agent_id
    useEffect(() => {
        const agentIdParam = searchParams.get('agent_id');
        if (agentIdParam && agents.length > 0) {
            const agentId = parseInt(agentIdParam);
            // Verify the agent exists in the fetched list
            if (agents.some(a => a.id === agentId)) {
                setSelectedAgent(agentId);
            }
        }
    }, [searchParams, agents]);

    useEffect(() => {
        fetchDocuments();
    }, [selectedAgent]);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            // If no agent is selected, clear the documents list
            if (!selectedAgent) {
                setDocuments([]);
                setLoading(false);
                return;
            }

            // Fetch documents for the selected agent
            const response = await ragAPI.getAgentDocuments(selectedAgent as number);
            if (response.status === 200) {
                // Transform the data to match our Document interface and add agent info
                const documentsData = response.data.map((doc: any) => ({
                    id: doc.id,
                    title: doc.title || doc.filename,
                    filename: doc.filename,
                    file_type: doc.file_type,
                    chunks_extracted: doc.chunks_extracted || 0,
                    created_at: doc.created_at,
                    agent_id: selectedAgent,
                    agent_name: agents.find(agent => agent.id === selectedAgent)?.name || 'Unknown Agent',
                    status: doc.status || 'indexed'
                }));
                setDocuments(documentsData);
            }
        } catch (err: any) {
            console.error('Error fetching documents:', err);
            setError(`Failed to fetch documents: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchAgents = async () => {
        try {
            console.log('Fetching agents from /api/agents...');
            const response = await voiceAPI.getCustomAgents();
            console.log('Fetched agents raw response:', response);

            if (Array.isArray(response.data)) {
                console.log('Setting agents state:', response.data);
                setAgents(response.data);
            } else {
                console.error('Agents data is not an array:', response.data);
                setAgents([]);
                setError('Received invalid data format for agents');
            }
        } catch (err: any) {
            console.error('Error fetching agents:', err);
            setError(`Failed to load agents: ${err.message}. Please refresh the page.`);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        if (!selectedAgent) {
            setError('Please select an agent first');
            return;
        }

        setLoading(true);
        try {
            const uploadedFiles: string[] = [];

            for (const file of Array.from(files)) {
                // Use the updated ragAPI service with agentId parameter
                const response = file.name.endsWith('.pdf')
                    ? await ragAPI.uploadPDF('0', file, selectedAgent as number)
                    : await ragAPI.uploadDOCX('0', file, selectedAgent as number);

                if (response.status !== 200) throw new Error(`Failed to upload ${file.name}`);
                uploadedFiles.push(file.name);
            }

            setSuccess(`Successfully uploaded: ${uploadedFiles.join(', ')}`);
            fetchDocuments(); // Refresh the documents table

            // Clear the file input
            if (event.target) {
                event.target.value = '';
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUrlUpload = async () => {
        if (!url || !selectedAgent) {
            setError('Please provide URL and select an agent');
            return;
        }

        setUrlLoading(true);
        try {
            // Use the updated ragAPI service with agentId parameter
            // Pass 0 as campaignId since we're using agent-based operations
            const response = await ragAPI.uploadURL('0', url, selectedAgent as number);

            if (response.status !== 200) throw new Error('Failed to process URL');

            setSuccess(`Successfully processed URL: ${url}`);
            setUrl('');
            setUrlDialogOpen(false);
            fetchDocuments(); // Refresh the documents table
        } catch (err: any) {
            // Improved error handling to show more details
            console.error('URL Upload Error:', err);
            if (err.response) {
                // Server responded with error status
                let errorMessage = `Request failed with status ${err.response.status}`;
                if (err.response.data) {
                    if (typeof err.response.data === 'string') {
                        errorMessage += `: ${err.response.data}`;
                    } else if (err.response.data.detail) {
                        errorMessage += `: ${err.response.data.detail}`;
                    } else {
                        errorMessage += `: ${JSON.stringify(err.response.data)}`;
                    }
                }
                setError(errorMessage);
            } else if (err.request) {
                // Request was made but no response received
                setError('No response received from server. Please check your connection.');
            } else {
                // Something else happened
                setError(err.message || 'Failed to process URL');
            }
        } finally {
            setUrlLoading(false);
        }
    };

    const handleViewContext = async (documentId: number) => {
        setContextLoading(true);
        setContextDialogOpen(true);
        try {
            // Use ragAPI service instead of direct fetch
            const response = await api.get(`/rag/document/${documentId}/content`);
            if (response.status === 200) {
                setSelectedDocument(response.data);
            } else {
                throw new Error('Failed to fetch document content');
            }
        } catch (err: any) {
            setError(err.message);
            setContextDialogOpen(false);
        } finally {
            setContextLoading(false);
        }
    };

    const handleDelete = async (documentId: number) => {
        if (!confirm('Are you sure you want to delete this document?')) return;

        try {
            // Use ragAPI service instead of direct fetch
            const response = await api.delete(`/rag/document/${documentId}`);

            if (response.status === 200) {
                setSuccess('Document deleted successfully');
                fetchDocuments();
            } else {
                throw new Error('Failed to delete document');
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedDocs.length === 0) return;
        if (!confirm(`Delete ${selectedDocs.length} selected document(s)?`)) return;

        try {
            // Use ragAPI service instead of direct fetch
            const deletePromises = selectedDocs.map(id =>
                api.delete(`/rag/document/${id}`)
            );

            await Promise.all(deletePromises);

            setSuccess(`Deleted ${selectedDocs.length} document(s)`);
            setSelectedDocs([]);
            fetchDocuments();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDomainCrawl = async () => {
        if (!domainUrl || !selectedAgent) {
            setError('Please provide domain URL and select an agent');
            return;
        }

        // Validate URL format
        let formattedUrl = domainUrl.trim();
        if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
            formattedUrl = 'https://' + formattedUrl;
        }

        console.log('Crawling domain with agent ID:', selectedAgent);
        console.log('Agent type:', typeof selectedAgent);

        setCrawlLoading(true);
        setCrawlProgress(0);

        try {
            // Use the ragAPI service with agentId parameter
            // Create form data
            const formData = new FormData();
            formData.append('url', formattedUrl);
            // Set max_pages to a high value to crawl all pages
            formData.append('max_pages', '1000');

            console.log('Sending request to:', `/rag/crawl-domain-agent/${selectedAgent}`);

            // Use the new agent-specific endpoint through the ragAPI service
            const response = await ragAPI.crawlDomainAgent(selectedAgent as number, formattedUrl, 1000);

            if (response.status !== 200) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const result = response.data;
            setSuccess(`Successfully crawled domain: ${domainUrl}. Processed ${result.total_pages} pages.`);
            setDomainUrl('');
            setCrawlDialogOpen(false);
            fetchDocuments(); // Refresh the documents table
        } catch (err: any) {
            console.error('Crawl error:', err);
            // Improved error handling to show more details
            if (err.response) {
                // Server responded with error status
                let errorMessage = `Request failed with status ${err.response.status}`;
                if (err.response.data) {
                    if (typeof err.response.data === 'string') {
                        errorMessage += `: ${err.response.data}`;
                    } else if (err.response.data.detail) {
                        errorMessage += `: ${err.response.data.detail}`;
                    } else {
                        errorMessage += `: ${JSON.stringify(err.response.data)}`;
                    }
                }
                setError(errorMessage);
            } else if (err.request) {
                // Request was made but no response received
                setError('No response received from server. Please check your connection.');
            } else {
                // Something else happened
                setError(err.message || 'Failed to crawl domain');
            }
        } finally {
            setCrawlLoading(false);
            setCrawlProgress(0);
        }
    };

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.filename.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || doc.file_type === filterType;
        const matchesTab = activeTab === 0 ||
            (activeTab === 1 && (doc.file_type === 'pdf' || doc.file_type === 'docx')) ||
            (activeTab === 2 && doc.file_type === 'url');
        return matchesSearch && matchesType && matchesTab;
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'indexed': return <CheckCircle sx={{ color: '#4caf50' }} />;
            case 'processing': return <HourglassEmpty sx={{ color: '#ff9800' }} />;
            case 'failed': return <ErrorIcon sx={{ color: '#f44336' }} />;
            default: return <CheckCircle sx={{ color: '#4caf50' }} />;
        }
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
                <Box sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <MenuBook sx={{ fontSize: 40, mr: 2, color: '#6366f1' }} />
                        <Typography variant="h3" component="h1" sx={{ fontWeight: 700, color: '#111827' }}>
                            Knowledge Base
                        </Typography>
                    </Box>
                </Box>

                {/* Agent Selection */}
                <Card sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', mb: 3, boxShadow: '0 1px 3px rgba(99,102,241,0.1)', '&:hover': { boxShadow: '0 4px 12px rgba(99,102,241,0.15)' }, position: 'relative', zIndex: 1 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ color: '#111827', fontWeight: 700 }}>
                            Select Agent for Training
                        </Typography>
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel sx={{ color: '#000000' }}>Agent</InputLabel>
                            <Select
                                value={selectedAgent}
                                onChange={(e) => setSelectedAgent(e.target.value as number | '')}
                                label="Agent"
                                sx={{
                                    color: '#000000',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#e0e0e0'
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#6366f1'
                                    }
                                }}
                            >
                                <MenuItem value="">
                                    <em>Select an agent</em>
                                </MenuItem>
                                {agents.map((agent) => (
                                    <MenuItem key={agent.id} value={agent.id} sx={{ color: '#000000' }}>
                                        {agent.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {agents.length === 0 && (
                            <Alert severity="warning" sx={{ mt: 2 }}>
                                No agents found. Please create an agent first in Agent Settings.
                            </Alert>
                        )}
                        {agents.length > 0 && (
                            <Typography variant="body2" sx={{ mt: 2, color: '#6b7280' }}>
                                {agents.length} agent(s) available
                            </Typography>
                        )}
                        {!selectedAgent && agents.length > 0 && (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                Please select an agent to upload documents or process URLs
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<CloudUpload />}
                        component="label"
                        disabled={!selectedAgent || loading}
                        sx={{
                            color: '#6366f1',
                            borderColor: '#6366f1',
                            '&:hover': {
                                borderColor: '#4f46e5',
                                backgroundColor: 'rgba(99,102,241,0.05)'
                            }
                        }}
                    >
                        Upload Files
                        <input
                            type="file"
                            hidden
                            multiple
                            accept=".pdf,.docx,.txt"
                            onChange={handleFileUpload}
                        />
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<LinkIcon />}
                        onClick={() => setUrlDialogOpen(true)}
                        disabled={!selectedAgent || urlLoading}
                        sx={{
                            color: '#6366f1',
                            borderColor: '#6366f1',
                            '&:hover': {
                                borderColor: '#4f46e5',
                                backgroundColor: 'rgba(99,102,241,0.05)'
                            }
                        }}
                    >
                        Add URL
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Language />}
                        onClick={() => setCrawlDialogOpen(true)}
                        disabled={!selectedAgent || crawlLoading}
                        sx={{
                            bgcolor: '#6366f1',
                            color: '#ffffff',
                            '&:hover': {
                                bgcolor: '#4f46e5'
                            }
                        }}
                    >
                        Crawl Domain
                    </Button>
                    {selectedDocs.length > 0 && (
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<Delete />}
                            onClick={handleBulkDelete}
                            sx={{
                                color: '#f44336',
                                borderColor: '#f44336',
                                '&:hover': {
                                    borderColor: '#f44336',
                                    backgroundColor: 'rgba(244, 67, 54, 0.1)'
                                }
                            }}
                        >
                            Delete Selected ({selectedDocs.length})
                        </Button>
                    )}
                </Box>

                {/* Search and Filter */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <TextField
                        placeholder="Search documents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: <Search sx={{ mr: 1, color: '#888888' }} />
                        }}
                        sx={{
                            flex: 1,
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: '#e0e0e0',
                                },
                                '&:hover fieldset': {
                                    borderColor: '#000000',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#000000',
                                },
                            },
                            '& .MuiInputLabel-root': {
                                color: '#000000',
                            },
                            '& .MuiInputBase-input': {
                                color: '#000000',
                            }
                        }}
                    />
                    <FormControl sx={{ minWidth: 150 }}>
                        <InputLabel sx={{ color: '#000000' }}>Filter Type</InputLabel>
                        <Select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            label="Filter Type"
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
                            <MenuItem value="all">All Types</MenuItem>
                            <MenuItem value="pdf">PDF</MenuItem>
                            <MenuItem value="docx">DOCX</MenuItem>
                            <MenuItem value="txt">TXT</MenuItem>
                            <MenuItem value="url">URL</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                {/* Tabs */}
                <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
                    <Tab label="All Documents" />
                    <Tab label="Files" />
                    <Tab label="URLs" />
                </Tabs>

                {/* Documents Table */}
                {loading ? (
                    <Box display="flex" justifyContent="center" p={4}>
                        <CircularProgress sx={{ color: '#000000' }} />
                    </Box>
                ) : (
                    <TableContainer component={Paper} sx={{ bgcolor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(99,102,241,0.1)', position: 'relative', zIndex: 1 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selectedDocs.length === filteredDocuments.length && filteredDocuments.length > 0}
                                            indeterminate={selectedDocs.length > 0 && selectedDocs.length < filteredDocuments.length}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedDocs(filteredDocuments.map(d => d.id));
                                                } else {
                                                    setSelectedDocs([]);
                                                }
                                            }}
                                            sx={{
                                                color: '#6366f1',
                                                '&.Mui-checked': {
                                                    color: '#6366f1',
                                                },
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ color: '#000000', fontWeight: 700 }}>Status</TableCell>
                                    <TableCell sx={{ color: '#000000', fontWeight: 700 }}>Title</TableCell>
                                    <TableCell sx={{ color: '#000000', fontWeight: 700 }}>Type</TableCell>
                                    <TableCell sx={{ color: '#000000', fontWeight: 700 }}>Chunks</TableCell>
                                    <TableCell sx={{ color: '#000000', fontWeight: 700 }}>Agent</TableCell>
                                    <TableCell sx={{ color: '#000000', fontWeight: 700 }}>Date</TableCell>
                                    <TableCell sx={{ color: '#000000', fontWeight: 700 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredDocuments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                            <Typography sx={{ color: '#555555' }}>
                                                No documents found. Upload files or add URLs to get started.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredDocuments.map((doc) => (
                                        <TableRow
                                            key={doc.id}
                                            sx={{
                                                '&:hover': {
                                                    backgroundColor: 'rgba(0,0,0,0.03)'
                                                }
                                            }}
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={selectedDocs.includes(doc.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedDocs([...selectedDocs, doc.id]);
                                                        } else {
                                                            setSelectedDocs(selectedDocs.filter(id => id !== doc.id));
                                                        }
                                                    }}
                                                    sx={{
                                                        color: '#000000',
                                                        '&.Mui-checked': {
                                                            color: '#000000',
                                                        },
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title={doc.status || 'indexed'}>
                                                    {getStatusIcon(doc.status || 'indexed')}
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell sx={{ color: '#000000' }}>{doc.title || doc.filename}</TableCell>
                                            <TableCell>
                                                <Chip label={doc.file_type.toUpperCase()} size="small" sx={{ bgcolor: '#f5f5f5', color: '#000000' }} />
                                            </TableCell>
                                            <TableCell sx={{ color: '#000000' }}>{doc.chunks_extracted || 0}</TableCell>
                                            <TableCell>
                                                {doc.agent_name ? (
                                                    <Chip label={doc.agent_name} size="small" sx={{ bgcolor: '#6366f1', color: '#ffffff' }} />
                                                ) : (
                                                    <Chip label="Unassigned" size="small" variant="outlined" sx={{ borderColor: '#000000', color: '#000000' }} />
                                                )}
                                            </TableCell>
                                            <TableCell sx={{ color: '#000000' }}>{new Date(doc.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <IconButton onClick={() => handleViewContext(doc.id)} size="small" sx={{ color: '#6366f1', '&:hover': { bgcolor: 'rgba(99,102,241,0.1)' } }}>
                                                    <Visibility />
                                                </IconButton>
                                                <IconButton onClick={() => handleDelete(doc.id)} size="small" sx={{ color: '#f44336' }}>
                                                    <Delete />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* URL Upload Dialog */}
                <Dialog open={urlDialogOpen} onClose={() => setUrlDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ color: '#000000', fontWeight: 700 }}>Add URL</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            label="URL"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            margin="normal"
                            placeholder="https://example.com/page"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: '#e0e0e0',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#000000',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#000000',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: '#000000',
                                },
                                '& .MuiInputBase-input': {
                                    color: '#000000',
                                }
                            }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setUrlDialogOpen(false)} sx={{ color: '#000000' }}>Cancel</Button>
                        <Button
                            onClick={handleUrlUpload}
                            variant="contained"
                            disabled={urlLoading || !url}
                            sx={{
                                bgcolor: '#000000',
                                color: '#ffffff',
                                '&:hover': {
                                    bgcolor: '#333333'
                                }
                            }}
                        >
                            {urlLoading ? <CircularProgress size={24} sx={{ color: '#ffffff' }} /> : 'Process URL'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Domain Crawl Dialog */}
                <Dialog open={crawlDialogOpen} onClose={() => !crawlLoading && setCrawlDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ color: '#000000', fontWeight: 700 }}>Crawl Domain</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            label="Domain URL"
                            value={domainUrl}
                            onChange={(e) => setDomainUrl(e.target.value)}
                            margin="normal"
                            placeholder="https://example.com"
                            disabled={crawlLoading}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: '#e0e0e0',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#000000',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#000000',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: '#000000',
                                },
                                '& .MuiInputBase-input': {
                                    color: '#000000',
                                }
                            }}
                        />
                        {crawlLoading && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" gutterBottom sx={{ color: '#000000' }}>
                                    Crawling domain... {crawlProgress}%
                                </Typography>
                                <LinearProgress variant="determinate" value={crawlProgress} sx={{ bgcolor: '#e0e0e0', '& .MuiLinearProgress-bar': { bgcolor: '#000000' } }} />
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setCrawlDialogOpen(false)} disabled={crawlLoading} sx={{ color: '#000000' }}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDomainCrawl}
                            variant="contained"
                            disabled={crawlLoading || !domainUrl}
                            sx={{
                                bgcolor: '#000000',
                                color: '#ffffff',
                                '&:hover': {
                                    bgcolor: '#333333'
                                }
                            }}
                        >
                            {crawlLoading ? <CircularProgress size={24} sx={{ color: '#ffffff' }} /> : 'Start Crawling'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Context Review Dialog */}
                <Dialog open={contextDialogOpen} onClose={() => setContextDialogOpen(false)} maxWidth="md" fullWidth>
                    <DialogTitle sx={{ color: '#000000', fontWeight: 700 }}>
                        {selectedDocument?.title || 'Document Content'}
                    </DialogTitle>
                    <DialogContent>
                        {contextLoading ? (
                            <Box display="flex" justifyContent="center" p={4}>
                                <CircularProgress sx={{ color: '#000000' }} />
                            </Box>
                        ) : (
                            <Box>
                                <Typography variant="body2" sx={{ color: '#555555', mb: 2 }}>
                                    Chunks Extracted: {selectedDocument?.chunks_extracted}
                                </Typography>
                                <Paper variant="outlined" sx={{ p: 2, mt: 2, maxHeight: 400, overflow: 'auto', bgcolor: '#ffffff', borderColor: '#e0e0e0' }}>
                                    <Typography variant="body2" whiteSpace="pre-wrap" sx={{ color: '#000000' }}>
                                        {selectedDocument?.content}
                                    </Typography>
                                </Paper>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setContextDialogOpen(false)} sx={{ color: '#000000' }}>Close</Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar for notifications */}
                <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
                    <Alert severity="error" onClose={() => setError('')}>
                        {error}
                    </Alert>
                </Snackbar>
                <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess('')}>
                    <Alert severity="success" onClose={() => setSuccess('')}>
                        {success}
                    </Alert>
                </Snackbar>
            </Box>
        </NavigationLayout>
    );
}