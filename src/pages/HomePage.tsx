import React, { useEffect, useState } from 'react'
import {
  Container,
  Typography,
  Box,
  CardActionArea,
  Paper,
  useTheme,
  CircularProgress
} from '@mui/material'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store'
import SyncStatus from '../components/SyncStatus'
import apiService from '../services/api'

const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const { questions, loadQuestions, settings } = useAppStore()
  const [serverMeta, setServerMeta] = useState<{
    questionCount: number
    lastUpdated: string | null
  } | null>(null)

  // Загружаем вопросы при каждом монтировании — store делает merge,
  // прогресс существующих вопросов сохраняется, новые добавляются
  useEffect(() => {
    loadQuestions()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await apiService.getMeta()
        if (!cancelled && res.success && res.data) setServerMeta(res.data)
      } catch {
        if (!cancelled) setServerMeta(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [questions.length])

  const today = new Date().toDateString()
  const studiedToday = questions.filter(q => {
    if (!q.studiedAt) return false
    return new Date(q.studiedAt).toDateString() === today
  }).length

  const dailyGoal = Math.max(1, settings.dailyGoal ?? 10)
  const dailyPct = Math.min(100, (studiedToday / dailyGoal) * 100)

  // Считаем напрямую из questions — так же как StatsPage, не перезаписывается сервером
  const totalQuestions = questions.length
  const correctAnswers = questions.reduce((sum, q) => sum + q.correct, 0)

  const quickActions = [
    {
      title: 'Выбрать уровень',
      description: 'Junior, Middle, Senior и другие',
      icon: '📋',
      path: '/questions',
      color: theme.palette.primary.main
    },
    {
      title: 'Статистика',
      description: 'Отслеживайте прогресс',
      icon: '📊',
      path: '/stats',
      color: theme.palette.secondary.main
    },
    {
      title: 'Цели',
      description: 'Ставьте и достигайте цели',
      icon: '🎯',
      path: '/goals',
      color: theme.palette.success.main
    },
    {
      title: 'Настройки',
      description: 'Тема, оформление, синхронизация',
      icon: '⚙️',
      path: '/settings',
      color: theme.palette.info?.main ?? '#0ea5e9'
    }
  ]

  const statsData = [
    { label: 'Вопросов', value: totalQuestions, icon: '📚' },
    { label: 'Сегодня', value: studiedToday, icon: '✅' },
    { label: 'Правильно', value: correctAnswers, icon: '🎯' }
  ]

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Paper
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            color: 'white',
            p: { xs: 2, sm: 3 },
            mb: 3,
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography
              component="h1"
              fontWeight="bold"
              sx={{ fontSize: { xs: '1.3rem', sm: '1.8rem' }, lineHeight: 1.2, mb: 0.5 }}
            >
              Добро пожаловать в AnKor! 🚀
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1.5, fontSize: { xs: '0.8rem', sm: '1rem' } }}>
              💡 Каждый эксперт когда-то был новичком. Твоя мечта стать Android-разработчиком — это не фантазия, а план, который мы воплотим вместе!
            </Typography>

            {/* Цель на сегодня */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 2,
                flexWrap: 'wrap',
              }}
            >
              <Box sx={{ position: 'relative', width: 72, height: 72 }}>
                <CircularProgress
                  variant="determinate"
                  value={dailyPct}
                  size={72}
                  thickness={5}
                  sx={{
                    color: 'white',
                    opacity: 0.95,
                    '& .MuiCircularProgress-circle': { strokeLinecap: 'round' },
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                  }}
                >
                  <Typography sx={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1 }}>
                    {studiedToday}/{dailyGoal}
                  </Typography>
                  <Typography sx={{ fontSize: '0.6rem', opacity: 0.85 }}>сегодня</Typography>
                </Box>
              </Box>
              <Box sx={{ flex: 1, minWidth: 140 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Цель дня</Typography>
                <Typography sx={{ fontSize: '0.72rem', opacity: 0.88, mt: 0.3 }}>
                  Отметьте «Знаю» или «Не знаю» по карточкам. Настройка лимита — в разделе «Настройки».
                </Typography>
              </Box>
            </Box>

            {serverMeta && (
              <Typography sx={{ fontSize: '0.68rem', opacity: 0.8, mb: 1 }}>
                Сервер: {serverMeta.questionCount} вопросов в базе
                {serverMeta.lastUpdated &&
                  ` · последнее добавление ${new Date(serverMeta.lastUpdated).toLocaleDateString('ru-RU')}`}
              </Typography>
            )}
            
            {/* Stats Row — компактная горизонтальная строка */}
            <Box
              sx={{
                mt: 2,
                display: 'flex',
                gap: 1,
                flexWrap: 'nowrap',
                overflowX: 'auto',
              }}
            >
              {statsData.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  style={{ flex: 1, minWidth: 0 }}
                >
                  <Box
                    sx={{
                      background: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 2,
                      px: 1.5,
                      py: 1.2,
                      textAlign: 'center',
                      color: 'white',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontSize: '1.1rem' }}>
                      {stat.icon}
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2, fontSize: { xs: '1.1rem', sm: '1.4rem' } }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                      {stat.label}
                    </Typography>
                  </Box>
                </motion.div>
              ))}
            </Box>
          </Box>
        </Paper>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1.5, opacity: 0.8 }}>
          Быстрые действия
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, minmax(0, 1fr))',
              xl: 'repeat(4, minmax(0, 1fr))',
            },
            gap: 1.5,
          }}
        >
          {quickActions.map((action, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 350 }}
            >
              <CardActionArea
                onClick={() => navigate(action.path)}
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  background: `linear-gradient(135deg, ${action.color}22 0%, ${action.color}11 100%)`,
                  border: `1px solid ${action.color}44`,
                  p: { xs: 1.5, sm: 2 },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  minHeight: { xs: 98, sm: 108 },
                }}
              >
                <Box
                  sx={{
                    width: { xs: 38, sm: 44 },
                    height: { xs: 38, sm: 44 },
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${action.color} 0%, ${action.color}BB 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: '1.1rem', sm: '1.3rem' },
                      lineHeight: 1,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {action.icon}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography fontWeight="bold" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' }, lineHeight: 1.15 }}>
                    {action.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.65rem', sm: '0.72rem' }, lineHeight: 1.15, mt: 0.35 }}
                  >
                    {action.description}
                  </Typography>
                </Box>
              </CardActionArea>
            </motion.div>
          ))}
        </Box>
      </motion.div>

      {/* Motivation Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <Paper
          sx={{
            background: `linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)`,
            p: 4,
            mt: 4,
            borderRadius: 3,
            textAlign: 'center'
          }}
        >
          <Typography variant="h4" sx={{ color: '#8b4513', mb: 1 }}>
            💪 Продолжайте изучать!
          </Typography>
          <Typography variant="h6" sx={{ color: '#8b4513', opacity: 0.8 }}>
            Каждый изученный вопрос приближает вас к успешному собеседованию
          </Typography>
        </Paper>
      </motion.div>

      {/* Sync Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <SyncStatus />
        </Box>
      </motion.div>
    </Container>
  )
}

export default HomePage
