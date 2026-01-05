'use client';

import { createTheme } from '@mui/material/styles';

export const aiWorkspaceTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000',
    },
    secondary: {
      main: '#555555',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#555555',
    },
    success: {
      main: '#4caf50',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#2196f3',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 700,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          border: '1px solid #e0e0e0',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '8px',
        },
        contained: {
          backgroundColor: '#000000',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#333333',
          },
        },
        outlined: {
          borderColor: '#000000',
          color: '#000000',
          '&:hover': {
            borderColor: '#333333',
            backgroundColor: 'rgba(0,0,0,0.03)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
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
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
  },
});