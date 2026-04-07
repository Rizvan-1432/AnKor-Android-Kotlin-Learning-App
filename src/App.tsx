import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Box } from '@mui/material'
import { createAppTheme } from './theme/createAppTheme'

// Pages
import HomePage from './pages/HomePage'
import QuestionsPage from './pages/QuestionsPage'
import StudyPage from './pages/StudyPage'
import StatsPage from './pages/StatsPage'
import GoalsPage from './pages/GoalsPage'
import SettingsPage from './pages/SettingsPage'
import AnswerPage from './pages/AnswerPage'
import TrackPage from './pages/TrackPage'

// Components
import BottomNavigation from './components/BottomNavigation'
import NotificationProvider from './components/NotificationProvider'

// Hooks
import { useAppStore } from './store'
import { useRefreshQuestionsOnReturn } from './hooks/useRefreshQuestionsOnReturn'

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
  useRefreshQuestionsOnReturn()
  const systemDark = useSystemDarkMode()

  // Определяем реальный режим темы с учётом 'auto'
  const resolvedDark =
    settings.theme === 'dark' ||
    (settings.theme === 'auto' && systemDark)

  const fontSize =
    settings.fontScale === 'large' ? 17 : settings.fontScale === 'xlarge' ? 19 : 15

  const theme = useMemo(
    () =>
      createAppTheme({
        isDark: resolvedDark,
        fontSize,
        highContrast: settings.highContrast,
      }),
    [resolvedDark, fontSize, settings.highContrast]
  )

  useEffect(() => {
    document.body.className = `theme-${resolvedDark ? 'dark' : 'light'}`
    
    const gradients = {
      light: {
        blue: 'linear-gradient(168deg, #e8edf6 0%, #e2eef9 28%, #d6e1f7 55%, #c8d7f2 100%)',
        orange: 'linear-gradient(168deg, #fff8f1 0%, #ffedd5 38%, #fed7aa 100%)',
        purple: 'linear-gradient(168deg, #f7f5ff 0%, #ede9fe 45%, #e0e7ff 100%)',
        green: 'linear-gradient(168deg, #f0fdf7 0%, #d1fae5 42%, #a7f3d0 100%)',
      },
      dark: {
        blue: 'linear-gradient(168deg, #07080d 0%, #0c1018 25%, #121a2a 52%, #1a2332 100%)',
        orange: 'linear-gradient(168deg, #0a0908 0%, #1c1917 35%, #292524 70%, #3f3a36 100%)',
        purple: 'linear-gradient(168deg, #08070c 0%, #15122a 38%, #1b1740 72%, #252047 100%)',
        green: 'linear-gradient(168deg, #050a08 0%, #0f2922 35%, #134e3f 70%, #166534 100%)',
        black: 'linear-gradient(168deg, #08070a 0%, #12141a 40%, #1a1d26 100%)',
        'dark-blue': 'linear-gradient(168deg, #07080c 0%, #0f1419 45%, #161a22 100%)',
        'dark-gray': 'linear-gradient(168deg, #09090b 0%, #141416 45%, #1f1f1f 100%)',
      },
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
      document.body.style.color = '#f4f4f5'
      document.body.style.colorScheme = 'dark'
    } else {
      document.body.style.color = '#0f172a'
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
            pb: { xs: 8, sm: 0 }, // Нижняя панель выше из‑за крупных подписей
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
                <Route path="/lists" element={<Navigate to="/goals" replace />} />
                <Route path="/settings" element={<SettingsPage />} />
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
