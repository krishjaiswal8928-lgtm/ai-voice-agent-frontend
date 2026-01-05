import React from 'react';
import { TextField, Box, Typography, Link } from '@mui/material';

interface ExotelFormProps {
    data: any;
    onChange: (data: any) => void;
}

export function ExotelForm({ data, onChange }: ExotelFormProps) {
    const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...data, [field]: event.target.value });
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="subtitle2" color="textSecondary">
                Enter your Exotel account credentials. You can find these in your{' '}
                <Link href="https://my.exotel.com/settings/site#api-settings" target="_blank" rel="noopener">
                    Exotel Dashboard
                </Link>.
            </Typography>

            <TextField
                label="Exotel Virtual Number"
                placeholder="e.g., 08012345678"
                value={data.exotel_number || ''}
                onChange={handleChange('exotel_number')}
                fullWidth
                required
                helperText="The virtual phone number assigned to your Exotel account"
            />

            <TextField
                label="API Key"
                value={data.api_key || ''}
                onChange={handleChange('api_key')}
                fullWidth
                required
                type="password"
            />

            <TextField
                label="API Token"
                value={data.api_token || ''}
                onChange={handleChange('api_token')}
                fullWidth
                required
                type="password"
            />

            <TextField
                label="Account SID"
                value={data.account_sid || ''}
                onChange={handleChange('account_sid')}
                fullWidth
                required
                helperText="Your unique Exotel Account SID"
            />

            <TextField
                label="Caller ID (Optional)"
                value={data.caller_id || ''}
                onChange={handleChange('caller_id')}
                fullWidth
                helperText="Default caller ID to use for outbound calls"
            />
        </Box>
    );
}
