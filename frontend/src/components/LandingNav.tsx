'use client';

import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Box, Button, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Container } from '@mui/material';
import { Menu as MenuIcon, Close } from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';

export function LandingNav() {
    const router = useRouter();
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { label: 'Home', path: '/' },
        { label: 'About Us', path: '/about' },
        { label: 'Contact', path: '/contact' },
        { label: 'Pricing', path: '/pricing' }
    ];

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', bgcolor: '#ffffff', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                <Box sx={{ fontWeight: 700, fontSize: '1.5rem', display: 'flex', alignItems: 'center' }}>
                    <span style={{ color: '#1c2e91ff' }}>Spe</span>
                    <span style={{ color: '#007f90ff' }}>a</span>
                    <span style={{ color: '#00bcd4ff' }}>k</span>
                    <span style={{ color: '#e91e63' }}>Synt</span>
                    <span style={{ color: '#e98e1eff' }}>h</span>
                    <span style={{ color: '#000000' }}> AI</span>
                </Box>
                <IconButton onClick={handleDrawerToggle}>
                    <Close />
                </IconButton>
            </Box>
            <List>
                {navItems.map((item) => (
                    <ListItem key={item.path} disablePadding>
                        <ListItemButton
                            onClick={() => router.push(item.path)}
                            sx={{
                                textAlign: 'center',
                                bgcolor: pathname === item.path ? 'rgba(99, 102, 241, 0.1)' : 'transparent'
                            }}
                        >
                            <ListItemText
                                primary={item.label}
                                sx={{
                                    color: pathname === item.path ? '#6366f1' : '#000000',
                                    fontWeight: pathname === item.path ? 700 : 500
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
                <ListItem disablePadding>
                    <ListItemButton onClick={() => router.push('/auth/login')} sx={{ textAlign: 'center' }}>
                        <ListItemText primary="Login" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding sx={{ px: 2, mt: 1 }}>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={() => router.push('/auth/register')}
                        sx={{
                            bgcolor: '#6366f1',
                            color: '#ffffff',
                            fontWeight: 700,
                            py: 1.5,
                            '&:hover': { bgcolor: '#4f46e5' }
                        }}
                    >
                        Sign Up
                    </Button>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <>
            <AppBar
                position="fixed"
                elevation={scrolled ? 4 : 0}
                sx={{
                    bgcolor: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderBottom: scrolled ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.08)' : 'none'
                }}
            >
                <Container maxWidth="lg">
                    <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
                        {/* Logo */}
                        <Box
                            onClick={() => router.push('/')}
                            sx={{
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontSize: '1.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                fontFamily: 'inherit',
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'scale(1.05)' }
                            }}
                        >
                            <span style={{ color: '#1c2e91ff' }}>Spe</span>
                            <span style={{ color: '#007f90ff' }}>a</span>
                            <span style={{ color: '#00bcd4ff' }}>k</span>
                            <span style={{ color: '#e91e63' }}>Synt</span>
                            <span style={{ color: '#e98e1eff' }}>h</span>
                            <span style={{ color: '#000000' }}> AI</span>
                        </Box>

                        {/* Desktop Navigation */}
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
                            {navItems.map((item) => (
                                <Button
                                    key={item.path}
                                    onClick={() => router.push(item.path)}
                                    sx={{
                                        color: pathname === item.path ? '#6366f1' : '#000000',
                                        fontWeight: pathname === item.path ? 700 : 500,
                                        px: 2,
                                        position: 'relative',
                                        '&::after': pathname === item.path ? {
                                            content: '""',
                                            position: 'absolute',
                                            bottom: 0,
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            width: '60%',
                                            height: '2px',
                                            bgcolor: '#6366f1',
                                            borderRadius: '2px'
                                        } : {},
                                        '&:hover': {
                                            bgcolor: 'rgba(99, 102, 241, 0.05)'
                                        }
                                    }}
                                >
                                    {item.label}
                                </Button>
                            ))}
                            <Button
                                onClick={() => router.push('/auth/login')}
                                sx={{
                                    color: '#000000',
                                    fontWeight: 500,
                                    px: 2,
                                    ml: 2,
                                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.05)' }
                                }}
                            >
                                Login
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => router.push('/auth/register')}
                                sx={{
                                    bgcolor: '#6366f1',
                                    color: '#ffffff',
                                    fontWeight: 700,
                                    px: 3,
                                    py: 1,
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                                    '&:hover': {
                                        bgcolor: '#4f46e5',
                                        boxShadow: '0 6px 16px rgba(99, 102, 241, 0.4)',
                                        transform: 'translateY(-2px)'
                                    },
                                    transition: 'all 0.2s'
                                }}
                            >
                                Sign Up
                            </Button>
                        </Box>

                        {/* Mobile menu button */}
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ display: { md: 'none' }, color: '#000000' }}
                        >
                            <MenuIcon />
                        </IconButton>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* Mobile drawer */}
            <Drawer
                variant="temporary"
                anchor="right"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 }
                }}
            >
                {drawer}
            </Drawer>

            {/* Spacer for fixed AppBar */}
            <Toolbar />
        </>
    );
}
