import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  BottomNavigation as MuiBottomNavigation,
  BottomNavigationAction,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  Home as HomeIcon,
  Quiz as QuizIcon,
  BarChart as BarChartIcon,
  Flag as FlagIcon,
  Settings as SettingsIcon
} from '@mui/icons-material'

const BottomNavigation: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const getCurrentValue = () => {
    const path = location.pathname
    
    // Главная страница
    if (path === '/') return 0
    
    // Страницы вопросов (включая изучение и направления)
    if (path.startsWith('/questions') || path.startsWith('/study') || path.startsWith('/answer') || path.startsWith('/track')) {
      return 1
    }
    
    // Статистика
    if (path === '/stats') return 2
    
    // Цели
    if (path === '/goals') return 3
    
    // Настройки
    if (path === '/settings') return 4
    
    // По умолчанию - главная
    return 0
  }

  const navigationItems = [
    {
      label: 'Главная',
      icon: <HomeIcon />,
      path: '/'
    },
    {
      label: 'Вопросы',
      icon: <QuizIcon />,
      path: '/questions'
    },
    {
      label: 'Статистика',
      icon: <BarChartIcon />,
      path: '/stats'
    },
    {
      label: 'Цели',
      icon: <FlagIcon />,
      path: '/goals'
    },
    {
      label: 'Настройки',
      icon: <SettingsIcon />,
      path: '/settings'
    }
  ]

  if (!isMobile) {
    return null // Скрываем на десктопе
  }

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderTop: `1px solid ${theme.palette.divider}`
      }}
      elevation={3}
    >
      <MuiBottomNavigation
        value={getCurrentValue()}
        onChange={(_, newValue) => {
          const item = navigationItems[newValue]
          if (item) {
            navigate(item.path)
          }
        }}
        showLabels
        sx={{
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            padding: '6px 0 8px',
            '&.Mui-selected': {
              color: theme.palette.primary.main
            }
          }
        }}
      >
        {navigationItems.map((item, index) => (
          <BottomNavigationAction
            key={index}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </MuiBottomNavigation>
    </Paper>
  )
}

export default BottomNavigation
