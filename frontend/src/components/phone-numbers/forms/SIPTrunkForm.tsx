'use client';

import React from 'react';
import {
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    IconButton,
    Button,
    Collapse,
    Alert,
    InputAdornment,
    Tooltip
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    ContentCopy as CopyIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

interface SIPTrunkFormProps {
    data: any;
    onChange: (data: any) => void;
    sipDomain?: string; // Generated SIP domain (shown after creation)
}

export function SIPTrunkForm({ data, onChange, sipDomain }: SIPTrunkFormProps) {
    const [showAuth, setShowAuth] = React.useState(false);
    const [showHeaders, setShowHeaders] = React.useState(false);
    const [customHeaders, setCustomHeaders] = React.useState<Array<{ key: string; value: string }>>(
        data.custom_headers ? Object.entries(data.custom_headers).map(([key, value]) => ({ key, value: value as string })) : []
    );

    const handleChange = (field: string, value: any) => {
        onChange({ ...data, [field]: value });
    };

    const handleHeaderChange = (index: number, field: 'key' | 'value', value: string) => {
        const newHeaders = [...customHeaders];
        newHeaders[index][field] = value;
        setCustomHeaders(newHeaders);

        // Convert to object for API
        const headersObj = newHeaders.reduce((acc, { key, value }) => {
            if (key && value) acc[key] = value;
            return acc;
        }, {} as Record<string, string>);
        handleChange('custom_headers', headersObj);
    };

    const addHeader = () => {
        setCustomHeaders([...customHeaders, { key: '', value: '' }]);
    };

    const removeHeader = (index: number) => {
        const newHeaders = customHeaders.filter((_, i) => i !== index);
        setCustomHeaders(newHeaders);

        const headersObj = newHeaders.reduce((acc, { key, value }) => {
            if (key && value) acc[key] = value;
            return acc;
        }, {} as Record<string, string>);
        handleChange('custom_headers', headersObj);
    };

    const copySIPDomain = () => {
        if (sipDomain) {
            navigator.clipboard.writeText(sipDomain);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Basic Configuration */}
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
                Basic Configuration
            </Typography>

            <TextField
                label="Label / Friendly Name"
                placeholder="e.g., My 3CX Trunk"
                value={data.label || ''}
                onChange={(e) => handleChange('label', e.target.value)}
                fullWidth
                required
                helperText="A descriptive name for this SIP trunk"
            />

            <TextField
                label="Phone Number"
                placeholder="+15551234567"
                value={data.phone_number || ''}
                onChange={(e) => handleChange('phone_number', e.target.value)}
                fullWidth
                required
                helperText="E.164 format (e.g., +15551234567)"
            />

            {/* Transport & Encryption */}
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2', mt: 2 }}>
                Transport & Encryption
            </Typography>

            <FormControl fullWidth>
                <InputLabel>Inbound Transport</InputLabel>
                <Select
                    value={data.inbound_transport || 'tcp'}
                    label="Inbound Transport"
                    onChange={(e) => handleChange('inbound_transport', e.target.value)}
                >
                    <MenuItem value="tcp">TCP (Standard)</MenuItem>
                    <MenuItem value="tls">TLS (Encrypted)</MenuItem>
                </Select>
            </FormControl>

            <FormControl fullWidth>
                <InputLabel>Inbound Media Encryption</InputLabel>
                <Select
                    value={data.inbound_media_encryption || 'disabled'}
                    label="Inbound Media Encryption"
                    onChange={(e) => handleChange('inbound_media_encryption', e.target.value)}
                >
                    <MenuItem value="disabled">Disabled</MenuItem>
                    <MenuItem value="allowed">Allowed</MenuItem>
                    <MenuItem value="required">Required</MenuItem>
                </Select>
            </FormControl>

            {/* Outbound Settings */}
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2', mt: 2 }}>
                Outbound Settings
            </Typography>

            <TextField
                label="Outbound Address"
                placeholder="sip.telnyx.com"
                value={data.outbound_address || ''}
                onChange={(e) => handleChange('outbound_address', e.target.value)}
                fullWidth
                required
                helperText="Your PBX hostname or IP (without sip: prefix)"
            />

            <FormControl fullWidth>
                <InputLabel>Outbound Transport</InputLabel>
                <Select
                    value={data.outbound_transport || 'tcp'}
                    label="Outbound Transport"
                    onChange={(e) => handleChange('outbound_transport', e.target.value)}
                >
                    <MenuItem value="tcp">TCP (Standard)</MenuItem>
                    <MenuItem value="tls">TLS (Encrypted)</MenuItem>
                </Select>
            </FormControl>

            <FormControl fullWidth>
                <InputLabel>Outbound Media Encryption</InputLabel>
                <Select
                    value={data.outbound_media_encryption || 'disabled'}
                    label="Outbound Media Encryption"
                    onChange={(e) => handleChange('outbound_media_encryption', e.target.value)}
                >
                    <MenuItem value="disabled">Disabled</MenuItem>
                    <MenuItem value="allowed">Allowed</MenuItem>
                    <MenuItem value="required">Required</MenuItem>
                </Select>
            </FormControl>

            {/* Authentication (Optional) */}
            <Box>
                <Button
                    onClick={() => setShowAuth(!showAuth)}
                    endIcon={showAuth ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    sx={{ mb: 2 }}
                >
                    Authentication (Optional)
                </Button>
                <Collapse in={showAuth}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pl: 2 }}>
                        <Alert severity="info" sx={{ mb: 1 }}>
                            Digest authentication provides better security. Leave empty to use IP-based ACL authentication.
                        </Alert>
                        <TextField
                            label="Username"
                            value={data.auth_username || ''}
                            onChange={(e) => handleChange('auth_username', e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="Password"
                            type="password"
                            value={data.auth_password || ''}
                            onChange={(e) => handleChange('auth_password', e.target.value)}
                            fullWidth
                        />
                    </Box>
                </Collapse>
            </Box>

            {/* Custom Headers (Optional) */}
            <Box>
                <Button
                    onClick={() => setShowHeaders(!showHeaders)}
                    endIcon={showHeaders ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    sx={{ mb: 2 }}
                >
                    Custom Headers (Optional)
                </Button>
                <Collapse in={showHeaders}>
                    <Box sx={{ pl: 2 }}>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            Add custom SIP headers required by your provider for routing or identification.
                        </Alert>
                        {customHeaders.map((header, index) => (
                            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                <TextField
                                    label="Header Name"
                                    value={header.key}
                                    onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                                    sx={{ flex: 1 }}
                                />
                                <TextField
                                    label="Header Value"
                                    value={header.value}
                                    onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                                    sx={{ flex: 1 }}
                                />
                                <IconButton onClick={() => removeHeader(index)} color="error">
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        ))}
                        <Button
                            startIcon={<AddIcon />}
                            onClick={addHeader}
                            variant="outlined"
                            size="small"
                        >
                            Add Header
                        </Button>
                    </Box>
                </Collapse>
            </Box>

            {/* SIP Domain (Read-only, shown after creation) */}
            {sipDomain && (
                <Box sx={{ mt: 2 }}>
                    <Alert severity="success" sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            Your SIP Domain (Configure this in your PBX):
                        </Typography>
                    </Alert>
                    <TextField
                        label="SIP Domain / Origination URI"
                        value={sipDomain}
                        fullWidth
                        InputProps={{
                            readOnly: true,
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Tooltip title="Copy to clipboard">
                                        <IconButton onClick={copySIPDomain} edge="end">
                                            <CopyIcon />
                                        </IconButton>
                                    </Tooltip>
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            '& .MuiInputBase-root': {
                                bgcolor: '#f5f5f5',
                                fontFamily: 'monospace',
                                fontSize: '1.1rem'
                            }
                        }}
                    />
                </Box>
            )}
        </Box>
    );
}
