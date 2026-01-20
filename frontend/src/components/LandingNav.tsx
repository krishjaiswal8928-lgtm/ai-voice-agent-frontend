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
                            borderRadius: '12px',
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
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1100,
                    px: { xs: 2, sm: 3, md: 4 },
                    pt: { xs: 2, sm: 2.5, md: 3 },
                    pointerEvents: 'none'
                }}
            >
                <Box
                    sx={{
                        maxWidth: '1400px',
                        mx: 'auto',
                        bgcolor: scrolled
                            ? 'rgba(255, 255, 255, 0.95)'
                            : 'rgba(255, 255, 255, 0.85)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: { xs: '16px', md: '20px' },
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: scrolled
                            ? '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)'
                            : '0 4px 24px rgba(0, 0, 0, 0.08)',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        pointerEvents: 'auto',
                        animation: 'slideDown 0.6s ease-out',
                        '@keyframes slideDown': {
                            from: {
                                opacity: 0,
                                transform: 'translateY(-20px)'
                            },
                            to: {
                                opacity: 1,
                                transform: 'translateY(0)'
                            }
                        },
                        '&:hover': {
                            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)',
                            transform: 'translateY(-1px)'
                        }
                    }}
                >
                    <Toolbar sx={{ justifyContent: 'space-between', py: { xs: 1.5, md: 2 }, px: { xs: 2, md: 3 } }}>
                        {/* Logo */}
                        <Box
                            onClick={() => router.push('/')}
                            sx={{
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontSize: { xs: '1.3rem', md: '1.5rem' },
                                display: 'flex',
                                alignItems: 'center',
                                fontFamily: 'inherit',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                    filter: 'brightness(1.1)'
                                }
                            }}
                        >
                            <span style={{ color: '#1c2e91ff', transition: 'all 0.3s' }}>Spe</span>
                            <span style={{ color: '#007f90ff', transition: 'all 0.3s' }}>a</span>
                            <span style={{ color: '#00bcd4ff', transition: 'all 0.3s' }}>k</span>
                            <span style={{ color: '#e91e63', transition: 'all 0.3s' }}>Synt</span>
                            <span style={{ color: '#e98e1eff', transition: 'all 0.3s' }}>h</span>
                            <span style={{ color: '#000000', transition: 'all 0.3s' }}> AI</span>
                        </Box>

                        {/* Desktop Navigation */}
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
                            {/* Product Dropdown */}
                            <Button
                                onClick={handleProductClick}
                                endIcon={<KeyboardArrowDown
                                    sx={{
                                        fontSize: 18,
                                        transition: 'transform 0.3s',
                                        transform: Boolean(productAnchor) ? 'rotate(180deg)' : 'rotate(0deg)'
                                    }}
                                />}
                                sx={{
                                    color: '#374151',
                                    fontWeight: 500,
                                    px: 2.5,
                                    py: 1.2,
                                    textTransform: 'none',
                                    fontSize: '0.95rem',
                                    borderRadius: '12px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: '-100%',
                                        width: '100%',
                                        height: '100%',
                                        background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.1), transparent)',
                                        transition: 'left 0.5s'
                                    },
                                    '&:hover::before': {
                                        left: '100%'
                                    },
                                    '&:hover': {
                                        bgcolor: 'rgba(99, 102, 241, 0.08)',
                                        transform: 'translateY(-2px)'
                                    },
                                    transition: 'all 0.3s ease'
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
                                        borderRadius: '16px',
                                        boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                                        mt: 1,
                                        minWidth: 220,
                                        border: '1px solid rgba(0,0,0,0.08)',
                                        overflow: 'hidden'
                                    }
                                }}
                                TransitionProps={{
                                    timeout: 300
                                }}
                            >
                                <MuiMenuItem
                                    onClick={() => { router.push('/'); handleProductClose(); }}
                                    sx={{
                                        py: 1.5,
                                        px: 2.5,
                                        fontSize: '0.95rem',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            bgcolor: 'rgba(99, 102, 241, 0.08)',
                                            pl: 3
                                        }
                                    }}
                                >
                                    Overview
                                </MuiMenuItem>
                                <MuiMenuItem
                                    onClick={() => { router.push('/pricing'); handleProductClose(); }}
                                    sx={{
                                        py: 1.5,
                                        px: 2.5,
                                        fontSize: '0.95rem',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            bgcolor: 'rgba(99, 102, 241, 0.08)',
                                            pl: 3
                                        }
                                    }}
                                >
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
                                        px: 2.5,
                                        py: 1.2,
                                        textTransform: 'none',
                                        fontSize: '0.95rem',
                                        borderRadius: '12px',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        '&::before': pathname !== item.path ? {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: '-100%',
                                            width: '100%',
                                            height: '100%',
                                            background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.1), transparent)',
                                            transition: 'left 0.5s'
                                        } : {},
                                        '&:hover::before': {
                                            left: '100%'
                                        },
                                        '&::after': pathname === item.path ? {
                                            content: '""',
                                            position: 'absolute',
                                            bottom: 8,
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            width: '32px',
                                            height: '3px',
                                            bgcolor: '#6366f1',
                                            borderRadius: '2px',
                                            animation: 'expandWidth 0.3s ease-out'
                                        } : {},
                                        '@keyframes expandWidth': {
                                            from: { width: '0px' },
                                            to: { width: '32px' }
                                        },
                                        '&:hover': {
                                            bgcolor: pathname === item.path ? 'rgba(99, 102, 241, 0.12)' : 'rgba(99, 102, 241, 0.08)',
                                            transform: 'translateY(-2px)'
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </Box>

                        {/* Right side buttons */}
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
                            <Button
                                onClick={() => router.push('/auth/login')}
                                sx={{
                                    color: '#374151',
                                    fontWeight: 500,
                                    px: 3,
                                    py: 1.2,
                                    textTransform: 'none',
                                    fontSize: '0.95rem',
                                    borderRadius: '12px',
                                    border: '1.5px solid transparent',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                                        border: '1.5px solid rgba(0, 0, 0, 0.1)',
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                            >
                                Login
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => router.push('/auth/register')}
                                sx={{
                                    background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                                    color: '#ffffff',
                                    fontWeight: 600,
                                    px: 3.5,
                                    py: 1.4,
                                    textTransform: 'none',
                                    fontSize: '0.95rem',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: '-100%',
                                        width: '100%',
                                        height: '100%',
                                        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                                        transition: 'left 0.6s'
                                    },
                                    '&:hover::before': {
                                        left: '100%'
                                    },
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                                        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.35)',
                                        transform: 'translateY(-3px) scale(1.02)'
                                    },
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
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
                            sx={{
                                display: { md: 'none' },
                                color: '#000000',
                                transition: 'all 0.3s',
                                '&:hover': {
                                    bgcolor: 'rgba(99, 102, 241, 0.1)',
                                    transform: 'rotate(90deg)'
                                }
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                    </Toolbar>
                </Box>
            </Box>

            {/* Mobile drawer */}
            <Drawer
                variant="temporary"
                anchor="right"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: 280,
                        borderRadius: '20px 0 0 20px'
                    }
                }}
            >
                {drawer}
            </Drawer>

            {/* Spacer for content below */}
            <Box sx={{ height: { xs: '80px', md: '100px' } }} />
        </>
    );
}
