'use client';

import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography
} from '@mui/material';
import {
  Dashboard,
  PhoneInTalk,
  History,
  Upload,
  People,
  Settings,
  CreditCard
} from '@mui/icons-material';

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/' },
  { text: 'Call Sessions', icon: <PhoneInTalk />, path: '/campaigns' },
  { text: 'Call History', icon: <History />, path: '/history' },
  { text: 'Leads', icon: <People />, path: '/leads' },
  { text: 'Documents', icon: <Upload />, path: '/documents' },
  { text: 'Pricing', icon: <CreditCard />, path: '/pricing' },
  { text: 'Settings', icon: <Settings />, path: '/settings' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export function Sidebar({ open, onClose, onNavigate }: SidebarProps) {
  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          backgroundColor: 'white',
        },
      }}
    >
      <Box
        sx={{ width: 250 }}
        role="presentation"
        onClick={onClose}
        onKeyDown={onClose}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" noWrap component="div">
            AI Voice Agent
          </Typography>
        </Box>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => onNavigate(item.path)}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}