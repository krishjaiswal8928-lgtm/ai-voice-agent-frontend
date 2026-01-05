'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    Alert,
    Snackbar
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    Delete as DeleteIcon,
    CloudUpload as CloudUploadIcon,
    Link as LinkIcon,
    Language as LanguageIcon
} from '@mui/icons-material';

interface Document {
    id: number;
    title: string;
    filename: string;
    file_type: string;
    chunks_extracted: number;
    created_at: string;
}

interface KnowledgeBaseDashboardProps {
    agentId: number;
}

export function KnowledgeBaseDashboard({ agentId }: KnowledgeBaseDashboardProps) {
    const [activeTab, setActiveTab] = useState(0);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // URL upload state
    const [urlDialogOpen, setUrlDialogOpen] = useState(false);
    const [url, setUrl] = useState('');
    const [urlLoading, setUrlLoading] = useState(false);

    // Domain crawl state
    const [crawlDialogOpen, setCrawlDialogOpen] = useState(false);
    const [domainUrl, setDomainUrl] = useState('');
    const [maxPages, setMaxPages] = useState(50);
    const [crawlLoading, setCrawlLoading] = useState(false);

    // Context review state
    const [contextDialogOpen, setContextDialogOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<any>(null);
    const [contextLoading, setContextLoading] = useState(false);

    useEffect(() => {
        fetchDocuments();
    }, [agentId, activeTab]);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const fileType = activeTab === 1 ? 'pdf,docx' : activeTab === 2 ? 'url' : undefined;
            const response = await fetch(
                `/api/rag/documents/agent/${agentId}${fileType ? `?file_type=${fileType}` : ''}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (!response.ok) throw new Error('Failed to fetch documents');

            const data = await response.json();
            setDocuments(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        try {
            const endpoint = file.name.endsWith('.pdf') ? 'upload-pdf' : 'upload-docx';
            const response = await fetch(`/api/rag/${endpoint}/0?agent_id=${agentId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Failed to upload file');

            setSuccess('File uploaded successfully');
            fetchDocuments();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUrlUpload = async () => {
        if (!url) return;

        setUrlLoading(true);
        try {
            const formData = new FormData();
            formData.append('url', url);
            formData.append('agent_id', agentId.toString());

            const response = await fetch(`/api/rag/upload-url/0`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Failed to upload URL');

            setSuccess('URL processed successfully');
            setUrl('');
            setUrlDialogOpen(false);
            fetchDocuments();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUrlLoading(false);
        }
    };

    const handleDomainCrawl = async () => {
        if (!domainUrl) return;

        setCrawlLoading(true);
        try {
            const formData = new FormData();
            formData.append('url', domainUrl);
            formData.append('agent_id', agentId.toString());
            formData.append('max_pages', maxPages.toString());

            const response = await fetch(`/api/rag/crawl-domain/0`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Failed to crawl domain');

            const result = await response.json();
            setSuccess(result.message);
            setDomainUrl('');
            setCrawlDialogOpen(false);
            fetchDocuments();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setCrawlLoading(false);
        }
    };

    const handleViewContext = async (documentId: number) => {
        setContextLoading(true);
        setContextDialogOpen(true);
        try {
            const response = await fetch(`/api/rag/document/${documentId}/content`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch document content');

            const data = await response.json();
            setSelectedDocument(data);
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
            const response = await fetch(`/api/rag/document/${documentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete document');

            setSuccess('Document deleted successfully');
            fetchDocuments();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const filteredDocuments = documents.filter(doc => {
        if (activeTab === 0) return true; // All
        if (activeTab === 1) return doc.file_type === 'pdf' || doc.file_type === 'docx'; // Files
        if (activeTab === 2) return doc.file_type === 'url'; // URLs
        return true;
    });

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">Knowledge Base</Typography>
                <Box display="flex" gap={2}>
                    <Button
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        component="label"
                    >
                        Upload File
                        <input
                            type="file"
                            hidden
                            accept=".pdf,.docx"
                            onChange={handleFileUpload}
                        />
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<LinkIcon />}
                        onClick={() => setUrlDialogOpen(true)}
                    >
                        Add URL
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<LanguageIcon />}
                        onClick={() => setCrawlDialogOpen(true)}
                    >
                        Crawl Domain
                    </Button>
                </Box>
            </Box>

            <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
                <Tab label="All Documents" />
                <Tab label="Files" />
                <Tab label="URL Library" />
            </Tabs>

            {loading ? (
                <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Title</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Chunks</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredDocuments.map((doc) => (
                                <TableRow key={doc.id}>
                                    <TableCell>{doc.title}</TableCell>
                                    <TableCell>
                                        <Chip label={doc.file_type.toUpperCase()} size="small" />
                                    </TableCell>
                                    <TableCell>{doc.chunks_extracted}</TableCell>
                                    <TableCell>{new Date(doc.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleViewContext(doc.id)} size="small">
                                            <VisibilityIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(doc.id)} size="small" color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* URL Upload Dialog */}
            <Dialog open={urlDialogOpen} onClose={() => setUrlDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add URL</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="URL"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        margin="normal"
                        placeholder="https://example.com/page"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUrlDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleUrlUpload} variant="contained" disabled={urlLoading || !url}>
                        {urlLoading ? <CircularProgress size={24} /> : 'Upload'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Domain Crawl Dialog */}
            <Dialog open={crawlDialogOpen} onClose={() => setCrawlDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Crawl Domain</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Domain URL"
                        value={domainUrl}
                        onChange={(e) => setDomainUrl(e.target.value)}
                        margin="normal"
                        placeholder="https://example.com"
                    />
                    <TextField
                        fullWidth
                        label="Max Pages"
                        type="number"
                        value={maxPages}
                        onChange={(e) => setMaxPages(parseInt(e.target.value))}
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCrawlDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDomainCrawl} variant="contained" disabled={crawlLoading || !domainUrl}>
                        {crawlLoading ? <CircularProgress size={24} /> : 'Crawl'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Context Review Dialog */}
            <Dialog open={contextDialogOpen} onClose={() => setContextDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    {selectedDocument?.title || 'Document Content'}
                </DialogTitle>
                <DialogContent>
                    {contextLoading ? (
                        <Box display="flex" justifyContent="center" p={4}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Box>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                Chunks Extracted: {selectedDocument?.chunks_extracted}
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 2, mt: 2, maxHeight: 400, overflow: 'auto' }}>
                                <Typography variant="body2" whiteSpace="pre-wrap">
                                    {selectedDocument?.content}
                                </Typography>
                            </Paper>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setContextDialogOpen(false)}>Close</Button>
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
    );
}