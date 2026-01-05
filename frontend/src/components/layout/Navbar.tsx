'use client';

import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import { AccountCircle, Menu as MenuIcon } from '@mui/icons-material';

interface NavbarProps {
  onMenuToggle?: () => void;
  onLogout?: () => void;
}

export function Navbar({ onMenuToggle, onLogout }: NavbarProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        {onMenuToggle && (
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={onMenuToggle}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          AI Voice Agent
        </Typography>
        
        <div>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>Profile</MenuItem>
            <MenuItem onClick={handleClose}>My account</MenuItem>
            {onLogout && <MenuItem onClick={onLogout}>Logout</MenuItem>}
          </Menu>
        </div>
      </Toolbar>
    </AppBar>
  );
}