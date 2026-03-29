import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Box } from '@mui/material'

// Pages
import HomePage from './pages/HomePage'
import QuestionsPage from './pages/QuestionsPage'
import StudyPage from './pages/StudyPage'
import StatsPage from './pages/StatsPage'
import GoalsPage from './pages/GoalsPage'
import SettingsPage from './pages/SettingsPage'
import AnswerPage from './pages/AnswerPage'
import ManageQuestionsPage from './pages/ManageQuestionsPage'
import TrackPage from './pages/TrackPage'

// Components
import BottomNavigation from './components/BottomNavigation'
import NotificationProvider from './components/NotificationProvider'

// Hooks
import { useAppStore } from './store'

function useSystemDarkMode() {
  const [isDark, setIsDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isDark
}

function App() {
  const { settings } = useAppStore()
  const systemDark = useSystemDarkMode()

  // Определяем реальный режим темы с учётом 'auto'
  const resolvedDark =
    settings.theme === 'dark' ||
    (settings.theme === 'auto' && systemDark)

  const theme = createTheme({
    palette: {
      mode: resolvedDark ? 'dark' : 'light',
      primary: {
        main: resolvedDark ? '#60a5fa' : '#3b82f6',
      },
      secondary: {
        main: resolvedDark ? '#9ca3af' : '#6b7280',
      },
      background: {
        default: resolvedDark ? '#000000' : '#ffffff',
        paper: resolvedDark ? '#111111' : '#ffffff',
      },
      text: {
        primary: resolvedDark ? '#ffffff' : '#000000',
        secondary: resolvedDark ? '#d1d5db' : '#6b7280',
      },
    },
    typography: {
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
  })

  useEffect(() => {
    document.body.className = `theme-${resolvedDark ? 'dark' : 'light'}`
    
    const gradients = {
      light: {
        blue: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #bae6fd 50%, #7dd3fc 75%, #38bdf8 100%)',
        orange: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 25%, #fcd34d 50%, #f59e0b 75%, #d97706 100%)',
        purple: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 25%, #c4b5fd 50%, #a78bfa 75%, #8b5cf6 100%)',
        green: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 25%, #a7f3d0 50%, #6ee7b7 75%, #34d399 100%)',
      },
      dark: {
        blue: 'linear-gradient(135deg, #000000 0%, #0f172a 25%, #1e293b 50%, #334155 75%, #475569 100%)',
        orange: 'linear-gradient(135deg, #000000 0%, #1c1917 25%, #292524 50%, #44403c 75%, #57534e 100%)',
        purple: 'linear-gradient(135deg, #000000 0%, #1e1b4b 25%, #312e81 50%, #4c1d95 75%, #6b21a8 100%)',
        green: 'linear-gradient(135deg, #000000 0%, #064e3b 25%, #065f46 50%, #047857 75%, #059669 100%)',
        black: 'linear-gradient(135deg, #000000 0%, #111111 25%, #1a1a1a 50%, #2a2a2a 75%, #404040 100%)',
        'dark-blue': 'linear-gradient(135deg, #000000 0%, #0c0a09 25%, #1e1b16 50%, #292524 75%, #44403c 100%)',
        'dark-gray': 'linear-gradient(135deg, #000000 0%, #0f0f0f 25%, #1a1a1a 50%, #262626 75%, #404040 100%)',
      }
    }
    
    const themeKey = resolvedDark ? 'dark' : 'light'
    const themeGradients = gradients[themeKey]
    let selectedGradient: string
    
    if (settings.backgroundGradient === 'random') {
      const gradientKeys = Object.keys(themeGradients) as Array<keyof typeof themeGradients>
      const randomKey = gradientKeys[Math.floor(Math.random() * gradientKeys.length)]
      selectedGradient = themeGradients[randomKey]
    } else if (settings.backgroundGradient in themeGradients) {
      selectedGradient = themeGradients[settings.backgroundGradient as keyof typeof themeGradients]
    } else {
      selectedGradient = resolvedDark
        ? (themeGradients as typeof gradients.dark).black
        : themeGradients.blue
    }
    
    document.body.style.background = selectedGradient
    document.body.style.minHeight = '100vh'
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    
    if (resolvedDark) {
      document.body.style.color = '#ffffff'
      document.body.style.colorScheme = 'dark'
    } else {
      document.body.style.color = '#000000'
      document.body.style.colorScheme = 'light'
    }
  }, [resolvedDark, settings.backgroundGradient])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Box sx={{ 
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            pb: { xs: 7, sm: 0 }, // Отступ для мобильной навигации
            background: 'transparent',
            position: 'relative'
          }}>
            <Box component="main" sx={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/questions" element={<QuestionsPage />} />
                <Route path="/study" element={<StudyPage />} />
                <Route path="/answer" element={<AnswerPage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="/goals" element={<GoalsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/manage-questions" element={<ManageQuestionsPage />} />
                <Route path="/track/:trackId" element={<TrackPage />} />
              </Routes>
            </Box>
            
            <BottomNavigation />
          </Box>
        </Router>
      </NotificationProvider>
    </ThemeProvider>
  )
}

export default App
