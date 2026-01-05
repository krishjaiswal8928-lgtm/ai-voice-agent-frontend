import React from 'react';
import { aiWorkspaceTheme } from '@/styles/theme';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={aiWorkspaceTheme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
