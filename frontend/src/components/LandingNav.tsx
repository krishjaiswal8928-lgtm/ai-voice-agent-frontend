'use client';

import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Box, Button, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Container, Menu, MenuItem as MuiMenuItem } from '@mui/material';
import { Menu as MenuIcon, Close, KeyboardArrowDown } from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';

export function LandingNav() {
    const router = useRouter();
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [productAnchor, setProductAnchor] = useState<null | HTMLElement>(null);

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

    const handleProductClick = (event: React.MouseEvent<HTMLElement>) => {
        setProductAnchor(event.currentTarget);
    };

    const handleProductClose = () => {
        setProductAnchor(null);
    };

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', bgcolor: '#ffffff', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid #e5e7eb' }}>
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
                                bgcolor: pathname === item.path ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                py: 2
                            }}
                        >
                            <ListItemText
                                primary={item.label}
                                sx={{
                                    color: pathname === item.path ? '#6366f1' : '#000000',
                                    fontWeight: pathname === item.path ? 600 : 500
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
                <ListItem disablePadding>
                    <ListItemButton onClick={() => router.push('/auth/login')} sx={{ textAlign: 'center', py: 2 }}>
                        <ListItemText primary="Login" sx={{ fontWeight: 500 }} />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding sx={{ px: 2, mt: 1 }}>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={() => router.push('/auth/register')}
                        sx={{
                            bgcolor: '#000000',
                            color: '#ffffff',
                            fontWeight: 600,
                            py: 1.5,
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontSize: '0.95rem',
                            '&:hover': { bgcolor: '#1a1a1a' }
                        }}
                    >
                        Try For Free
                    </Button>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <>
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    bgcolor: scrolled ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: scrolled ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    boxShadow: scrolled ? '0 2px 12px rgba(0,0,0,0.04)' : 'none'
                }}
            >
                <Container maxWidth="xl">
                    <Toolbar sx={{ justifyContent: 'space-between', py: 1.5, px: { xs: 2, sm: 3 } }}>
                        {/* Logo */}
                        <Box
                            onClick={() => router.push('/')}
                            sx={{
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontSize: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                fontFamily: 'inherit',
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'scale(1.02)' }
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
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
                            {/* Product Dropdown */}
                            <Button
                                onClick={handleProductClick}
                                endIcon={<KeyboardArrowDown sx={{ fontSize: 18 }} />}
                                sx={{
                                    color: '#374151',
                                    fontWeight: 500,
                                    px: 2,
                                    py: 1,
                                    textTransform: 'none',
                                    fontSize: '0.95rem',
                                    borderRadius: '8px',
                                    '&:hover': {
                                        bgcolor: 'rgba(0, 0, 0, 0.04)'
                                    }
                                }}
                            >
                                Product
                            </Button>
                            <Menu
                                anchorEl={productAnchor}
                                open={Boolean(productAnchor)}
                                onClose={handleProductClose}
                                sx={{
                                    '& .MuiPaper-root': {
                                        borderRadius: '12px',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                        mt: 1,
                                        minWidth: 200
                                    }
                                }}
                            >
                                <MuiMenuItem onClick={() => { router.push('/'); handleProductClose(); }} sx={{ py: 1.5, fontSize: '0.95rem' }}>
                                    Overview
                                </MuiMenuItem>
                                <MuiMenuItem onClick={() => { router.push('/pricing'); handleProductClose(); }} sx={{ py: 1.5, fontSize: '0.95rem' }}>
                                    Pricing
                                </MuiMenuItem>
                            </Menu>

                            {navItems.slice(1).map((item) => (
                                <Button
                                    key={item.path}
                                    onClick={() => router.push(item.path)}
                                    sx={{
                                        color: pathname === item.path ? '#6366f1' : '#374151',
                                        fontWeight: pathname === item.path ? 600 : 500,
                                        px: 2,
                                        py: 1,
                                        textTransform: 'none',
                                        fontSize: '0.95rem',
                                        borderRadius: '8px',
                                        position: 'relative',
                                        '&::after': pathname === item.path ? {
                                            content: '""',
                                            position: 'absolute',
                                            bottom: 4,
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            width: '24px',
                                            height: '2px',
                                            bgcolor: '#6366f1',
                                            borderRadius: '2px'
                                        } : {},
                                        '&:hover': {
                                            bgcolor: 'rgba(0, 0, 0, 0.04)'
                                        }
                                    }}
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </Box>

                        {/* Right side buttons */}
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.5 }}>
                            <Button
                                onClick={() => router.push('/auth/login')}
                                sx={{
                                    color: '#374151',
                                    fontWeight: 500,
                                    px: 2.5,
                                    py: 1,
                                    textTransform: 'none',
                                    fontSize: '0.95rem',
                                    borderRadius: '8px',
                                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                                }}
                            >
                                Login
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => router.push('/auth/register')}
                                sx={{
                                    bgcolor: '#000000',
                                    color: '#ffffff',
                                    fontWeight: 600,
                                    px: 3,
                                    py: 1.25,
                                    textTransform: 'none',
                                    fontSize: '0.95rem',
                                    borderRadius: '8px',
                                    boxShadow: 'none',
                                    '&:hover': {
                                        bgcolor: '#1a1a1a',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                        transform: 'translateY(-1px)'
                                    },
                                    transition: 'all 0.2s'
                                }}
                            >
                                Try For Free
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
