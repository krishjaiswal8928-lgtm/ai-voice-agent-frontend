import React from 'react';
import { TextField, Box, Typography, Link } from '@mui/material';

interface TwilioFormProps {
    data: any;
    onChange: (data: any) => void;
}

export function TwilioForm({ data, onChange }: TwilioFormProps) {
    const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...data, [field]: event.target.value });
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="subtitle2" color="textSecondary">
                Enter your Twilio account credentials. You can find these in your{' '}
                <Link href="https://console.twilio.com/" target="_blank" rel="noopener">
                    Twilio Console
                </Link>.
            </Typography>

            <TextField
                label="Twilio Phone Number"
                placeholder="e.g., +1234567890"
                value={data.phone_number || ''}
                onChange={handleChange('phone_number')}
                fullWidth
                required
                helperText="The phone number purchased from Twilio (E.164 format)"
            />

            <TextField
                label="Account SID"
                value={data.account_sid || ''}
                onChange={handleChange('account_sid')}
                fullWidth
                required
            />

            <TextField
                label="Auth Token"
                value={data.auth_token || ''}
                onChange={handleChange('auth_token')}
                fullWidth
                required
                type="password"
            />
        </Box>
    );
}
