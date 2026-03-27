import React, { useState } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, IconButton, Avatar, Divider,
  useTheme, Tooltip, Chip
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import QuizIcon from '@mui/icons-material/Quiz'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import UploadIcon from '@mui/icons-material/Upload'
import LogoutIcon from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'

const DRAWER_WIDTH = 240

const NAV = [
  { path: '/',          label: 'Дашборд',         icon: <DashboardIcon /> },
  { path: '/questions', label: 'Вопросы',          icon: <QuizIcon /> },
  { path: '/questions/new', label: 'Добавить',     icon: <AddCircleIcon /> },
  { path: '/import',    label: 'Импорт',           icon: <UploadIcon /> },
]

const Layout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    navigate('/login')
  }

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box sx={{
        p: 2.5,
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        display: 'flex', alignItems: 'center', gap: 1.5
      }}>
        <Avatar sx={{ bgcolor: '#3b82f6', width: 36, height: 36, fontSize: '1rem', fontWeight: 'bold' }}>A</Avatar>
        <Box>
          <Typography fontWeight="bold" color="white" sx={{ lineHeight: 1.2, fontSize: '0.95rem' }}>
            AnKor Admin
          </Typography>
          <Chip label="v1.0" size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: '#3b82f633', color: '#93c5fd', mt: 0.3 }} />
        </Box>
      </Box>

      <Divider />

      <List sx={{ flex: 1, px: 1, pt: 1 }}>
        {NAV.map(item => {
          const active = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path) && !(item.path === '/questions' && location.pathname === '/questions/new')
          return (
            <ListItemButton
              key={item.path}
              onClick={() => { navigate(item.path); setMobileOpen(false) }}
              sx={{
                borderRadius: 2, mb: 0.5,
                bgcolor: active ? '#3b82f620' : 'transparent',
                color: active ? '#3b82f6' : 'text.primary',
                '& .MuiListItemIcon-root': { color: active ? '#3b82f6' : 'text.secondary', minWidth: 36 },
                '&:hover': { bgcolor: '#3b82f610' },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: active ? 600 : 400 }} />
            </ListItemButton>
          )
        })}
      </List>

      <Divider />
      <Box sx={{ p: 1 }}>
        <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, color: 'error.main', '& .MuiListItemIcon-root': { color: 'error.main', minWidth: 36 } }}>
          <ListItemIcon><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Выйти" primaryTypographyProps={{ fontSize: '0.875rem' }} />
        </ListItemButton>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile AppBar */}
      <AppBar position="fixed" sx={{ display: { sm: 'none' }, zIndex: theme.zIndex.drawer + 1, bgcolor: '#1e293b' }}>
        <Toolbar>
          <IconButton color="inherit" onClick={() => setMobileOpen(!mobileOpen)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" fontWeight="bold" sx={{ ml: 1 }}>AnKor Admin</Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box component="nav" sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box component="main" sx={{
        flexGrow: 1,
        p: { xs: 2, sm: 3 },
        mt: { xs: 7, sm: 0 },
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}>
        <Outlet />
      </Box>
    </Box>
  )
}

export default Layout
