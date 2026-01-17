'use client';

import React from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Avatar,
  Tooltip,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Dashboard,
  PhoneInTalk,
  Phone,
  Analytics,
  Logout,
  SmartToy,
  Settings,
  MenuBook,
  Extension,
  CreditCard,
  Support,
  FavoriteBorder,
  Upgrade,
  CardGiftcard,
  ExpandMore,
  ExpandLess,
  ChevronLeft,
  ChevronRight,
  FlashOn,
  CallSplit,
  Schedule
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '@mui/material/styles';
import { authAPI } from '@/lib/api';

const drawerWidth = 240;
const collapsedDrawerWidth = 70;

export function NavigationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [userMenuAnchor, setUserMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [userData, setUserData] = React.useState<{ username: string; email: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [sidebarWidth, setSidebarWidth] = React.useState(drawerWidth);
  const [isResizing, setIsResizing] = React.useState(false);
  const [actionsOpen, setActionsOpen] = React.useState(false);
  const sidebarRef = React.useRef<HTMLDivElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/auth/login');
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  // Fetch user data on component mount
  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await authAPI.getCurrentUser();
        setUserData(response.data);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        // Fallback to default if fetch fails
        setUserData({ username: 'User', email: 'user@example.com' });
      }
    };

    fetchUserData();
  }, []);

  // Get user initials from username
  const getUserInitials = (username: string) => {
    if (!username) return 'U';
    const parts = username.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    if (!sidebarOpen) {
      setSidebarWidth(drawerWidth);
    }
  };

  // Handle mouse down on resize handle
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  // Handle mouse move for resizing
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !sidebarOpen) return;

      const newWidth = e.clientX;
      // Set min and max width constraints
      if (newWidth >= 200 && newWidth <= 400) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, sidebarOpen]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* Top AppBar */}
        <AppBar
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            bgcolor: '#ffffff',
            borderBottom: '1px solid #e0e0e0',

            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
        >
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                onClick={() => router.push('/')}
                sx={{
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '1.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  fontFamily: 'inherit'
                }}
              >
                <span style={{ color: '#1c2e91ff' }}>Spe</span>
                <span style={{ color: '#007f90ff' }}>a</span>
                <span style={{ color: '#00bcd4ff' }}>k</span>
                <span style={{ color: '#e91e63' }}>Synt</span>
                <span style={{ color: '#e98e1eff' }}>h</span>
                <span style={{ color: '#000000' }}> AI</span>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Sidebar Navigation - Modern AI Theme */}
        <Box
          ref={sidebarRef}
          component="nav"
          sx={{
            width: { sm: sidebarOpen ? `${sidebarWidth}px` : `${collapsedDrawerWidth}px` },
            flexShrink: { sm: 0 },
            background: '#f5f5f5',
            borderRight: '1px solid rgba(0,0,0,0.1)',
            height: '100vh',
            position: 'fixed',
            mt: '64px',
            transition: isResizing ? 'none' : 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
              pointerEvents: 'none'
            }
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto', pt: 1, position: 'relative', zIndex: 1, height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
            {/* Toggle Button at Top of Sidebar */}
            <Box sx={{
              display: 'flex',
              justifyContent: sidebarOpen ? 'flex-end' : 'center',
              px: sidebarOpen ? 2 : 1,
              mb: 2
            }}>
              <IconButton
                onClick={toggleSidebar}
                sx={{
                  color: '#6366f1',
                  bgcolor: 'rgba(99, 102, 241, 0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(99, 102, 241, 0.2)'
                  }
                }}
              >
                {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
              </IconButton>
            </Box>

            <MenuItem
              onClick={() => handleNavigation('/')}
              className={pathname === '/' ? 'active' : ''}
              sx={{
                py: 2,
                px: sidebarOpen ? 3 : 2,
                mx: sidebarOpen ? 1.5 : 1,
                mb: 1,
                borderRadius: '12px',
                color: '#ffffff',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                display: 'flex',
                alignItems: 'center',
                ...(pathname === '/' && {
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.4) 0%, rgba(168, 85, 247, 0.4) 100%)',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '4px',
                    height: '60%',
                    background: 'linear-gradient(180deg, #6366f1 0%, #a855f7 100%)',
                    borderRadius: '0 4px 4px 0',
                    boxShadow: '0 0 12px rgba(99, 102, 241, 0.8)'
                  }
                }),
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease'
                },
                '&:hover': {
                  bgcolor: 'rgba(99, 102, 241, 0.15)',
                  transform: 'translateX(4px)',
                  '&::before': {
                    opacity: 1
                  },
                  '& .MuiSvgIcon-root': {
                    transform: 'scale(1.1) rotate(5deg)',
                    filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.6))'
                  }
                }
              }}
            >
              <Dashboard sx={{
                mr: sidebarOpen ? 2 : 0,
                fontSize: '1.75rem',
                color: '#6366f1',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: 'drop-shadow(0 0 4px rgba(99, 102, 241, 0.3))'
              }} />
              {sidebarOpen && <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', position: 'relative', zIndex: 1, color: '#000000' }}>Dashboard</Typography>}
            </MenuItem>
            <MenuItem
              onClick={() => handleNavigation('/campaigns')}
              className={pathname === '/campaigns' ? 'active' : ''}
              sx={{
                py: 2,
                px: sidebarOpen ? 3 : 2,
                mx: sidebarOpen ? 1.5 : 1,
                mb: 1,
                borderRadius: '12px',
                color: '#ffffff',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                display: 'flex',
                alignItems: 'center',
                ...(pathname === '/campaigns' && {
                  background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.4) 0%, rgba(239, 68, 68, 0.4) 100%)',
                  boxShadow: '0 4px 12px rgba(236, 72, 153, 0.4)',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '4px',
                    height: '60%',
                    background: 'linear-gradient(180deg, #ec4899 0%, #ef4444 100%)',
                    borderRadius: '0 4px 4px 0',
                    boxShadow: '0 0 12px rgba(236, 72, 153, 0.8)'
                  }
                }),
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(239, 68, 68, 0.2) 100%)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease'
                },
                '&:hover': {
                  bgcolor: 'rgba(236, 72, 153, 0.15)',
                  transform: 'translateX(4px)',
                  '&::before': {
                    opacity: 1
                  },
                  '& .MuiSvgIcon-root': {
                    transform: 'scale(1.1) rotate(5deg)',
                    filter: 'drop-shadow(0 0 8px rgba(236, 72, 153, 0.6))'
                  }
                }
              }}
            >
              <PhoneInTalk sx={{
                mr: sidebarOpen ? 2 : 0,
                fontSize: '1.75rem', color: '#ec4899',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: 'drop-shadow(0 0 4px rgba(236, 72, 153, 0.3))'
              }} />
              {sidebarOpen && <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', position: 'relative', zIndex: 1, color: '#000000' }}>Call Sessions</Typography>}
            </MenuItem>
            <MenuItem
              onClick={() => handleNavigation('/agent-settings')}
              className={pathname === '/agent-settings' ? 'active' : ''}
              sx={{
                py: 2,
                px: sidebarOpen ? 3 : 2,
                mx: sidebarOpen ? 1.5 : 1,
                mb: 1,
                borderRadius: '12px',
                color: '#ffffff',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                display: 'flex',
                alignItems: 'center',
                ...(pathname === '/agent-settings' && {
                  background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.4) 0%, rgba(59, 130, 246, 0.4) 100%)',
                  boxShadow: '0 4px 12px rgba(34, 211, 238, 0.4)',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '4px',
                    height: '60%',
                    background: 'linear-gradient(180deg, #22d3ee 0%, #3b82f6 100%)',
                    borderRadius: '0 4px 4px 0',
                    boxShadow: '0 0 12px rgba(34, 211, 238, 0.8)'
                  }
                }),
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease'
                },
                '&:hover': {
                  bgcolor: 'rgba(34, 211, 238, 0.15)',
                  transform: 'translateX(4px)',
                  '&::before': {
                    opacity: 1
                  },
                  '& .MuiSvgIcon-root': {
                    transform: 'scale(1.1) rotate(-5deg)',
                    filter: 'drop-shadow(0 0 8px rgba(34, 211, 238, 0.6))'
                  }
                }
              }}
            >
              <SmartToy sx={{
                mr: sidebarOpen ? 2 : 0,
                color: '#22d3ee',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: 'drop-shadow(0 0 4px rgba(34, 211, 238, 0.3))'
              }} />
              {sidebarOpen && <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', position: 'relative', zIndex: 1, color: '#000000' }}>Agent</Typography>}
            </MenuItem>
            <MenuItem
              onClick={() => handleNavigation('/knowledge-base')}
              className={pathname === '/knowledge-base' ? 'active' : ''}
              sx={{
                py: 2,
                px: sidebarOpen ? 3 : 2,
                mx: sidebarOpen ? 1.5 : 1,
                mb: 1,
                borderRadius: '12px',
                color: '#ffffff',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                display: 'flex',
                alignItems: 'center',
                ...(pathname === '/knowledge-base' && {
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(217, 70, 239, 0.4) 100%)',
                  boxShadow: '0 4px 12px rgba(168, 85, 247, 0.4)',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '4px',
                    height: '60%',
                    background: 'linear-gradient(180deg, #a855f7 0%, #d946ef 100%)',
                    borderRadius: '0 4px 4px 0',
                    boxShadow: '0 0 12px rgba(168, 85, 247, 0.8)'
                  }
                }),
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(217, 70, 239, 0.2) 100%)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease'
                },
                '&:hover': {
                  bgcolor: 'rgba(168, 85, 247, 0.15)',
                  transform: 'translateX(4px)',
                  '&::before': {
                    opacity: 1
                  },
                  '& .MuiSvgIcon-root': {
                    transform: 'scale(1.1) rotate(5deg)',
                    filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.6))'
                  }
                }
              }}
            >
              <MenuBook sx={{
                mr: sidebarOpen ? 2 : 0,
                color: '#a855f7',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: 'drop-shadow(0 0 4px rgba(168, 85, 247, 0.3))'
              }} />
              {sidebarOpen && <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', position: 'relative', zIndex: 1, color: '#000000' }}>Knowledge Base</Typography>}
            </MenuItem>
            <MenuItem
              onClick={() => handleNavigation('/phone-numbers')}
              className={pathname === '/phone-numbers' ? 'active' : ''}
              sx={{
                py: 2,
                px: sidebarOpen ? 3 : 2,
                mx: sidebarOpen ? 1.5 : 1,
                mb: 1,
                borderRadius: '12px',
                color: '#ffffff',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                display: 'flex',
                alignItems: 'center',
                ...(pathname === '/phone-numbers' && {
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.4) 0%, rgba(16, 185, 129, 0.4) 100%)',
                  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '4px',
                    height: '60%',
                    background: 'linear-gradient(180deg, #22c55e 0%, #10b981 100%)',
                    borderRadius: '0 4px 4px 0',
                    boxShadow: '0 0 12px rgba(34, 197, 94, 0.8)'
                  }
                }),
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease'
                },
                '&:hover': {
                  bgcolor: 'rgba(34, 197, 94, 0.15)',
                  transform: 'translateX(4px)',
                  '&::before': {
                    opacity: 1
                  },
                  '& .MuiSvgIcon-root': {
                    transform: 'scale(1.1) rotate(-5deg)',
                    filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.6))'
                  }
                }
              }}
            >
              <Phone sx={{
                mr: sidebarOpen ? 2 : 0,
                color: '#22c55e',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.3))'
              }} />
              {sidebarOpen && <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', position: 'relative', zIndex: 1, color: '#000000' }}>Phone Numbers</Typography>}
            </MenuItem>
            <MenuItem
              onClick={() => handleNavigation('/integrations')}
              className={pathname?.startsWith('/integrations') ? 'active' : ''}
              sx={{
                py: 2,
                px: sidebarOpen ? 3 : 2,
                mx: sidebarOpen ? 1.5 : 1,
                mb: 1,
                borderRadius: '12px',
                color: '#ffffff',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                display: 'flex',
                alignItems: 'center',
                ...(pathname?.startsWith('/integrations') && {
                  background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.4) 0%, rgba(249, 115, 22, 0.4) 100%)',
                  boxShadow: '0 4px 12px rgba(251, 146, 60, 0.4)',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '4px',
                    height: '60%',
                    background: 'linear-gradient(180deg, #fb923c 0%, #f97316 100%)',
                    borderRadius: '0 4px 4px 0',
                    boxShadow: '0 0 12px rgba(251, 146, 60, 0.8)'
                  }
                }),
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.2) 0%, rgba(249, 115, 22, 0.2) 100%)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease'
                },
                '&:hover': {
                  bgcolor: 'rgba(251, 146, 60, 0.15)',
                  transform: 'translateX(4px)',
                  '&::before': {
                    opacity: 1
                  },
                  '& .MuiSvgIcon-root': {
                    transform: 'scale(1.1) rotate(5deg)',
                    filter: 'drop-shadow(0 0 8px rgba(251, 146, 60, 0.6))'
                  }
                }
              }}
            >
              <Extension sx={{
                mr: sidebarOpen ? 2 : 0,
                color: '#fb923c',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: 'drop-shadow(0 0 4px rgba(251, 146, 60, 0.3))'
              }} />
              {sidebarOpen && <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', position: 'relative', zIndex: 1, color: '#000000' }}>Integrations</Typography>}
            </MenuItem>
            <MenuItem
              onClick={() => handleNavigation('/reports')}
              className={pathname === '/reports' ? 'active' : ''}
              sx={{
                py: 2,
                px: sidebarOpen ? 3 : 2,
                mx: sidebarOpen ? 1.5 : 1,
                mb: 1,
                borderRadius: '12px',
                color: '#ffffff',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                display: 'flex',
                alignItems: 'center',
                ...(pathname === '/reports' && {
                  background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.4) 0%, rgba(59, 130, 246, 0.4) 100%)',
                  boxShadow: '0 4px 12px rgba(14, 165, 233, 0.4)',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '4px',
                    height: '60%',
                    background: 'linear-gradient(180deg, #0ea5e9 0%, #3b82f6 100%)',
                    borderRadius: '0 4px 4px 0',
                    boxShadow: '0 0 12px rgba(14, 165, 233, 0.8)'
                  }
                }),
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease'
                },
                '&:hover': {
                  bgcolor: 'rgba(14, 165, 233, 0.15)',
                  transform: 'translateX(4px)',
                  '&::before': {
                    opacity: 1
                  },
                  '& .MuiSvgIcon-root': {
                    transform: 'scale(1.1) rotate(-5deg)',
                    filter: 'drop-shadow(0 0 8px rgba(14, 165, 233, 0.6))'
                  }
                }
              }}
            >
              <Analytics sx={{
                mr: sidebarOpen ? 2 : 0,
                color: '#0ea5e9',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: 'drop-shadow(0 0 4px rgba(14, 165, 233, 0.3))'
              }} />
              {sidebarOpen && <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', position: 'relative', zIndex: 1, color: '#000000' }}>Reports</Typography>}
            </MenuItem>

            {/* Actions Section with Collapsible Sub-menu */}
            <MenuItem
              onClick={() => setActionsOpen(!actionsOpen)}
              sx={{
                py: 2,
                px: sidebarOpen ? 3 : 2,
                mx: sidebarOpen ? 1.5 : 1,
                mb: 1,
                borderRadius: '12px',
                color: '#ffffff',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                justifyContent: sidebarOpen ? 'space-between' : 'center',
                display: 'flex',
                alignItems: 'center',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(124, 58, 237, 0.2) 100%)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease'
                },
                '&:hover': {
                  bgcolor: 'rgba(139, 92, 246, 0.2)',
                  transform: 'translateX(4px)',
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                  '&::before': {
                    opacity: 1
                  },
                  '& .MuiSvgIcon-root': {
                    transform: 'scale(1.1)',
                    filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.6))'
                  }
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FlashOn sx={{
                  mr: sidebarOpen ? 2 : 0,
                  color: '#8b5cf6',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  filter: 'drop-shadow(0 0 4px rgba(139, 92, 246, 0.3))'
                }} />
                {sidebarOpen && <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', position: 'relative', zIndex: 1, color: '#000000' }}>Actions</Typography>}
              </Box>
              {sidebarOpen && (actionsOpen ? <ExpandLess sx={{ color: '#8b5cf6' }} /> : <ExpandMore sx={{ color: '#8b5cf6' }} />)}
            </MenuItem>

            {/* Actions Sub-menu */}
            {actionsOpen && sidebarOpen && (
              <Box sx={{ pl: 2 }}>
                <MenuItem
                  onClick={() => handleNavigation('/transfers')}
                  className={pathname === '/transfers' ? 'active' : ''}
                  sx={{
                    py: 1.5,
                    px: 3,
                    mx: 1.5,
                    mb: 0.5,
                    borderRadius: '10px',
                    color: '#ffffff',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    justifyContent: 'flex-start',
                    display: 'flex',
                    alignItems: 'center',
                    ...(pathname === '/transfers' && {
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(124, 58, 237, 0.3) 100%)',
                      boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
                    }),
                    '&:hover': {
                      bgcolor: 'rgba(139, 92, 246, 0.1)',
                      transform: 'translateX(4px)',
                    }
                  }}
                >
                  <CallSplit sx={{
                    mr: 2,
                    fontSize: '1.25rem',
                    color: '#8b5cf6',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }} />
                  <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: '#000000' }}>Call Transfers</Typography>
                </MenuItem>

                <MenuItem
                  onClick={() => handleNavigation('/scheduled-calls')}
                  className={pathname === '/scheduled-calls' ? 'active' : ''}
                  sx={{
                    py: 1.5,
                    px: 3,
                    mx: 1.5,
                    mb: 1,
                    borderRadius: '10px',
                    color: '#ffffff',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    justifyContent: 'flex-start',
                    display: 'flex',
                    alignItems: 'center',
                    ...(pathname === '/scheduled-calls' && {
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(124, 58, 237, 0.3) 100%)',
                      boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
                    }),
                    '&:hover': {
                      bgcolor: 'rgba(139, 92, 246, 0.1)',
                      transform: 'translateX(4px)',
                    }
                  }}
                >
                  <Schedule sx={{
                    mr: 2,
                    fontSize: '1.25rem',
                    color: '#8b5cf6',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }} />
                  <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: '#000000' }}>Scheduled Calls</Typography>
                </MenuItem>
              </Box>
            )}

            <Divider sx={{
              bgcolor: 'rgba(255,255,255,0.1)',
              my: 2,
              mx: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }} />
            <MenuItem
              onClick={() => handleNavigation('/pricing')}
              className={pathname === '/pricing' ? 'active' : ''}
              sx={{
                py: 2,
                px: sidebarOpen ? 3 : 2,
                mx: sidebarOpen ? 1.5 : 1,
                mb: 1,
                borderRadius: '12px',
                color: '#ffffff',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                display: 'flex',
                alignItems: 'center',
                background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(202, 138, 4, 0.15) 100%)',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                ...(pathname === '/pricing' && {
                  background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.5) 0%, rgba(202, 138, 4, 0.5) 100%)',
                  boxShadow: '0 4px 12px rgba(234, 179, 8, 0.5)',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '4px',
                    height: '60%',
                    background: 'linear-gradient(180deg, #eab308 0%, #ca8a04 100%)',
                    borderRadius: '0 4px 4px 0',
                    boxShadow: '0 0 12px rgba(234, 179, 8, 0.8)'
                  }
                }),
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.3) 0%, rgba(202, 138, 4, 0.3) 100%)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease'
                },
                '&:hover': {
                  bgcolor: 'rgba(234, 179, 8, 0.2)',
                  transform: 'translateX(4px)',
                  boxShadow: '0 4px 12px rgba(234, 179, 8, 0.3)',
                  '&::before': {
                    opacity: 1
                  },
                  '& .MuiSvgIcon-root': {
                    transform: 'scale(1.1) rotate(5deg)',
                    filter: 'drop-shadow(0 0 8px rgba(234, 179, 8, 0.6))'
                  }
                }
              }}
            >
              <CreditCard sx={{
                mr: sidebarOpen ? 2 : 0,
                color: '#eab308',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: 'drop-shadow(0 0 4px rgba(234, 179, 8, 0.3))'
              }} />
              {sidebarOpen && <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', position: 'relative', zIndex: 1, color: '#000000' }}>Pricing</Typography>}
            </MenuItem>

            {/* User Profile at Bottom of Sidebar */}
            <Box sx={{
              mt: 2,
              pt: 2,
              borderTop: '1px solid rgba(0,0,0,0.1)'
            }}>
              <Box
                onClick={handleUserMenuOpen}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  mx: sidebarOpen ? 1.5 : 1,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  '&:hover': {
                    bgcolor: 'rgba(99, 102, 241, 0.1)'
                  }
                }}
              >
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: '#6366f1',
                    fontSize: '1rem',
                    fontWeight: 700
                  }}
                >
                  {userData ? getUserInitials(userData.username) : 'U'}
                </Avatar>
                {sidebarOpen && (
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      color: '#111827',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {userData?.username || 'Loading...'}
                    </Typography>
                    <Typography sx={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {userData?.email || 'Loading...'}
                    </Typography>
                  </Box>
                )}
              </Box>

              <Menu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={handleUserMenuClose}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                PaperProps={{
                  sx: {
                    mb: 1,
                    ml: 1,
                    minWidth: 220,
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    border: '1px solid rgba(0,0,0,0.1)'
                  }
                }}
              >
                <MenuItem onClick={() => { handleUserMenuClose(); handleNavigation('/account'); }} sx={{ py: 2 }}>
                  <ListItemIcon>
                    <AccountCircle sx={{ color: '#6366f1' }} />
                  </ListItemIcon>
                  <ListItemText>Account</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => { handleUserMenuClose(); handleNavigation('/support'); }} sx={{ py: 2 }}>
                  <ListItemIcon>
                    <Support sx={{ color: '#6366f1' }} />
                  </ListItemIcon>
                  <ListItemText>Support</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => { handleUserMenuClose(); handleNavigation('/pricing'); }} sx={{ py: 2 }}>
                  <ListItemIcon>
                    <Upgrade sx={{ color: '#6366f1' }} />
                  </ListItemIcon>
                  <ListItemText>Upgrade Account</ListItemText>
                </MenuItem>
                <Divider sx={{ my: 1 }} />
                <MenuItem onClick={() => { handleUserMenuClose(); handleLogout(); }} sx={{ py: 2, color: '#ef4444' }}>
                  <ListItemIcon>
                    <Logout sx={{ color: '#ef4444' }} />
                  </ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </MenuItem>
              </Menu>
            </Box>

            {/* Spacer to push menu items up */}
            <Box sx={{ flexGrow: 1 }} />
          </Box>

          {/* Resize Handle */}
          {sidebarOpen && (
            <Box
              onMouseDown={handleMouseDown}
              sx={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: '6px',
                cursor: 'ew-resize',
                zIndex: 1000,
                transition: 'background-color 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(99, 102, 241, 0.3)',
                },
                '&:active': {
                  backgroundColor: 'rgba(99, 102, 241, 0.5)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '2px',
                  height: '40px',
                  backgroundColor: 'rgba(99, 102, 241, 0.4)',
                  borderRadius: '2px',
                  opacity: 0,
                  transition: 'opacity 0.2s ease',
                },
                '&:hover::before': {
                  opacity: 1,
                }
              }}
            />
          )}
        </Box>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 0,
            width: { sm: `calc(100% - ${sidebarOpen ? sidebarWidth : collapsedDrawerWidth}px)` },
            ml: { sm: `${sidebarOpen ? sidebarWidth : collapsedDrawerWidth}px` },
            mt: '64px',
            minHeight: 'calc(100vh - 64px)',
            transition: isResizing ? 'none' : 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}









