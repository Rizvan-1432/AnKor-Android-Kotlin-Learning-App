import React, { useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  BottomNavigation as MuiBottomNavigation,
  BottomNavigationAction,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  SpaceDashboardRounded,
  PsychologyRounded,
  InsightsRounded,
  EmojiEventsRounded,
  TuneRounded,
} from '@mui/icons-material'
import { useAppStore } from '../store'

/** Множитель под «Размер шрифта» в настройках */
function fontScaleMultiplier(scale: string): number {
  switch (scale) {
    case 'large':
      return 1.07
    case 'xlarge':
      return 1.14
    default:
      return 1
  }
}

const BottomNavigation: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { settings } = useAppStore()

  const m = fontScaleMultiplier(settings.fontScale)

  /** Плавный размер под ширину экрана (узкие телефоны → широкие до sm) + учёт fontScale */
  const sizes = useMemo(() => {
    const px = (n: number) => theme.typography.pxToRem(n)
    return {
      // Короткие подписи вкладок — крупнее читаемый текст
      label: `clamp(${px(10.5 * m)}, ${px(8.25 * m)} + 1.5vw, ${px(14 * m)})`,
      icon: `clamp(${px(21 * m)}, ${px(18 * m)} + 1.15vw, ${px(28 * m)})`,
      actionPadY: `clamp(${px(5)}, ${px(4)} + 0.4vw, ${px(9)})`,
      actionPadX: `clamp(${px(1)}, 0.2vw + ${px(1)}, ${px(5)})`,
    }
  }, [theme, m])

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
    if (path === '/lists' || path === '/goals') return 3
    
    // Настройки
    if (path === '/settings') return 4
    
    // По умолчанию - главная
    return 0
  }

  /** Короткие подписи под узкие экраны; где сократили — полное имя в aria-label */
  const navigationItems: Array<{
    label: string
    ariaLabel?: string
    Icon: typeof SpaceDashboardRounded
    path: string
  }> = [
    { label: 'Главная', Icon: SpaceDashboardRounded, path: '/' },
    { label: 'Вопросы', Icon: PsychologyRounded, path: '/questions' },
    { label: 'Отчёты', ariaLabel: 'Статистика', Icon: InsightsRounded, path: '/stats' },
    { label: 'Цели', Icon: EmojiEventsRounded, path: '/goals' },
    { label: 'Опции', ariaLabel: 'Настройки', Icon: TuneRounded, path: '/settings' },
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
            minWidth: 0,
            flex: 1,
            maxWidth: '100%',
            padding: `${sizes.actionPadY} ${sizes.actionPadX}`,
            '&.Mui-selected': {
              color: theme.palette.primary.main,
            },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: sizes.label,
            fontWeight: 500,
            lineHeight: 1.2,
            letterSpacing: 0,
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            px: 0,
            '&.Mui-selected': {
              fontWeight: 600,
            },
          },
        }}
      >
        {navigationItems.map((item) => {
          const Icon = item.Icon
          return (
            <BottomNavigationAction
              key={item.path}
              label={item.label}
              {...(item.ariaLabel ? { 'aria-label': item.ariaLabel } : {})}
              icon={<Icon sx={{ fontSize: sizes.icon }} />}
            />
          )
        })}
      </MuiBottomNavigation>
    </Paper>
  )
}

export default BottomNavigation
