'use client';

import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Collapse,
  ListItemButton,
} from '@mui/material';
import {
  Dashboard,
  PhoneInTalk,
  History,
  Upload,
  People,
  Settings,
  CreditCard,
  SupportAgent,
  ExpandLess,
  ExpandMore,
  CallSplit,
  Schedule,
  FlashOn,
} from '@mui/icons-material';

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/' },
  { text: 'Call Sessions', icon: <PhoneInTalk />, path: '/campaigns' },
  { text: 'Call History', icon: <History />, path: '/history' },
  { text: 'Leads', icon: <People />, path: '/leads' },
  { text: 'Human Agents', icon: <SupportAgent />, path: '/human-agents' },
  { text: 'Documents', icon: <Upload />, path: '/documents' },
  { text: 'Pricing', icon: <CreditCard />, path: '/pricing' },
  { text: 'Settings', icon: <Settings />, path: '/settings' },
];

const actionsSubMenu = [
  { text: 'Call Transfers', icon: <CallSplit />, path: '/transfers' },
  { text: 'Scheduled Calls', icon: <Schedule />, path: '/scheduled-calls' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export function Sidebar({ open, onClose, onNavigate }: SidebarProps) {
  const [actionsOpen, setActionsOpen] = useState(false);

  const handleActionsClick = () => {
    setActionsOpen(!actionsOpen);
  };

  const handleNavigate = (path: string) => {
    onNavigate(path);
    onClose();
  };

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
              onClick={() => handleNavigate(item.path)}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}

          {/* Actions Section with Sub-menu */}
          <ListItemButton onClick={handleActionsClick}>
            <ListItemIcon>
              <FlashOn />
            </ListItemIcon>
            <ListItemText primary="Actions" />
            {actionsOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={actionsOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {actionsSubMenu.map((item) => (
                <ListItemButton
                  key={item.text}
                  sx={{ pl: 4 }}
                  onClick={() => handleNavigate(item.path)}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              ))}
            </List>
          </Collapse>
        </List>
      </Box>
    </Drawer>
  );
}