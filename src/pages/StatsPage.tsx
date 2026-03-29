import React, { useState } from 'react'
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  useTheme
} from '@mui/material'
import { motion } from 'framer-motion'
import { useAppStore } from '../store'
import { QuestionLevel } from '../types'

const StatsPage: React.FC = () => {
  const theme = useTheme()
  const { questions, resetStats } = useAppStore()
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '' })

  const getLevelStats = () => {
    const levelStats: Record<QuestionLevel, { total: number; studied: number; correct: number }> = {
      junior: { total: 0, studied: 0, correct: 0 },
      middle: { total: 0, studied: 0, correct: 0 },
      senior: { total: 0, studied: 0, correct: 0 },
      lead: { total: 0, studied: 0, correct: 0 },
      architect: { total: 0, studied: 0, correct: 0 },
      expert: { total: 0, studied: 0, correct: 0 }
    }

    questions.forEach(question => {
      levelStats[question.level].total++
      if (question.studied) {
        levelStats[question.level].studied++
        levelStats[question.level].correct += question.correct
      }
    })

    return levelStats
  }

  const getCategoryStats = () => {
    const categoryStats: Record<string, number> = {}
    
    questions.forEach(question => {
      categoryStats[question.category] = (categoryStats[question.category] || 0) + 1
    })

    return Object.entries(categoryStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
  }

  const levelStats = getLevelStats()
  const categoryStats = getCategoryStats()
  const totalQuestions = questions.length
  const studiedQuestions = questions.filter(q => q.studied).length
  const correctAnswers = questions.reduce((sum, q) => sum + q.correct, 0)
  const incorrectAnswers = questions.reduce((sum, q) => sum + q.incorrect, 0)
  const accuracy = correctAnswers + incorrectAnswers > 0 
    ? Math.round((correctAnswers / (correctAnswers + incorrectAnswers)) * 100) 
    : 0

  const getLevelName = (level: QuestionLevel) => {
    const names: Record<QuestionLevel, string> = {
      junior: 'Junior',
      middle: 'Middle',
      senior: 'Senior',
      lead: 'Lead',
      architect: 'Architect',
      expert: 'Expert'
    }
    return names[level] || level
  }

  const getLevelColor = (level: QuestionLevel) => {
    const colors: Record<QuestionLevel, string> = {
      junior: '#10b981',
      middle: '#3b82f6',
      senior: '#8b5cf6',
      lead: '#f59e0b',
      architect: '#ef4444',
      expert: '#6366f1'
    }
    return colors[level] || '#6b7280'
  }

  const handleResetStats = () => {
    resetStats()
    setShowResetDialog(false)
    setSnackbar({ open: true, message: 'Статистика сброшена!' })
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Заголовок */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.info.dark} 0%, ${theme.palette.primary.main} 100%)`,
            borderRadius: 3,
            p: { xs: 2, sm: 3 },
            mb: 3,
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 2,
          }}
        >
          <Box>
            <Typography
              component="h1"
              fontWeight="bold"
              sx={{ fontSize: { xs: '1.3rem', sm: '1.8rem' }, lineHeight: 1.2, mb: 0.5 }}
            >
              📊 Статистика
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, fontSize: { xs: '0.78rem', sm: '0.9rem' } }}>
              Отслеживайте свой прогресс в изучении
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => setShowResetDialog(true)}
            sx={{
              whiteSpace: 'nowrap',
              flexShrink: 0,
              backgroundColor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              fontWeight: 'bold',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
            }}
          >
            Сбросить все
          </Button>
        </Box>
      </motion.div>

      {/* Общая статистика — компактная сетка 2×2 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 1.5,
            mb: 3,
          }}
        >
          {[
            { value: totalQuestions, label: 'Вопросов', color: theme.palette.primary.main, bg: `${theme.palette.primary.main}18` },
            { value: studiedQuestions, label: 'Изучено', color: theme.palette.success.main, bg: `${theme.palette.success.main}18` },
            { value: correctAnswers, label: 'Правильно', color: theme.palette.info.main, bg: `${theme.palette.info.main}18` },
            { value: `${accuracy}%`, label: 'Точность', color: theme.palette.warning.main, bg: `${theme.palette.warning.main}18` },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * i, duration: 0.4 }}
            >
              <Box
                sx={{
                  background: item.bg,
                  border: `1px solid ${item.color}33`,
                  borderRadius: 3,
                  p: { xs: 1.5, sm: 2 },
                  textAlign: 'center',
                }}
              >
                <Typography
                  fontWeight="bold"
                  sx={{ color: item.color, fontSize: { xs: '1.6rem', sm: '2rem' }, lineHeight: 1.1 }}
                >
                  {item.value}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                  {item.label}
                </Typography>
              </Box>
            </motion.div>
          ))}
        </Box>
      </motion.div>

      <Grid container spacing={3}>
        {/* Статистика по уровням */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Card sx={{ borderRadius: 3, boxShadow: 3, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  📊 Прогресс по уровням
                </Typography>
                {Object.entries(levelStats).map(([level, stats]) => (
                  <Box key={level} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body1" fontWeight="bold">
                        {getLevelName(level as QuestionLevel)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stats.studied}/{stats.total}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={stats.total > 0 ? (stats.studied / stats.total) * 100 : 0}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getLevelColor(level as QuestionLevel),
                          borderRadius: 4
                        }
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Правильных: {stats.correct}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {stats.total > 0 ? Math.round((stats.studied / stats.total) * 100) : 0}% изучено
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Статистика по категориям */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Card sx={{ borderRadius: 3, boxShadow: 3, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  🏷️ Популярные категории
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {categoryStats.map(([category, count]) => (
                    <Box key={category} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Chip
                        label={category}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                      <Typography variant="body2" fontWeight="bold">
                        {count}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Диалог подтверждения сброса */}
      <Dialog open={showResetDialog} onClose={() => setShowResetDialog(false)}>
        <DialogTitle>Подтверждение сброса</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите сбросить всю статистику? Это действие нельзя отменить.
            Все вопросы будут помечены как не изученные, а счетчики правильных и неправильных ответов обнулятся.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResetDialog(false)}>
            Отмена
          </Button>
          <Button onClick={handleResetStats} color="error" variant="contained">
            Сбросить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar для уведомлений */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Container>
  )
}

export default StatsPage
