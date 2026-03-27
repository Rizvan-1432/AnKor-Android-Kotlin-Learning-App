import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Grid, Card, CardContent, CardActionArea,
  LinearProgress, Chip
} from '@mui/material'
import { motion } from 'framer-motion'
import { useAdminStore } from '../store'
import { LEVEL_COLORS, QuestionLevel, QuestionCategory, CATEGORY_OPTIONS } from '../types'

const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { questions, loadQuestions, loading } = useAdminStore()

  useEffect(() => { loadQuestions() }, [])

  const levels: QuestionLevel[] = ['junior', 'middle', 'senior', 'lead', 'architect', 'expert']

  const levelStats = levels.map(lvl => {
    const qs = questions.filter(q => q.level === lvl)
    const studied = qs.filter(q => q.studied).length
    return { level: lvl, total: qs.length, studied }
  })

  const catStats = CATEGORY_OPTIONS.map(opt => ({
    ...opt,
    count: questions.filter(q => q.category === opt.value).length,
  })).filter(c => c.count > 0).sort((a, b) => b.count - a.count)

  const totalStudied = questions.filter(q => q.studied).length
  const accuracy = questions.reduce((s, q) => s + q.correct + q.incorrect, 0) > 0
    ? Math.round(questions.reduce((s, q) => s + q.correct, 0) / questions.reduce((s, q) => s + q.correct + q.incorrect, 0) * 100)
    : 0

  const summaryCards = [
    { label: 'Всего вопросов', value: questions.length, color: '#3b82f6', bg: '#3b82f615' },
    { label: 'Изучено',        value: totalStudied,      color: '#10b981', bg: '#10b98115' },
    { label: 'Правильных',     value: questions.reduce((s, q) => s + q.correct, 0), color: '#8b5cf6', bg: '#8b5cf615' },
    { label: 'Точность',       value: `${accuracy}%`,    color: '#f59e0b', bg: '#f59e0b15' },
  ]

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight="bold">Дашборд</Typography>
          <Typography color="text.secondary" variant="body2">Общая статистика базы вопросов</Typography>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

        {/* Summary */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {summaryCards.map((c, i) => (
            <Grid item xs={6} md={3} key={i}>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                <Card sx={{ borderRadius: 3, border: `1px solid ${c.color}33` }}>
                  <CardContent sx={{ p: 2.5, bgcolor: c.bg }}>
                    <Typography variant="h4" fontWeight="bold" sx={{ color: c.color }}>
                      {c.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{c.label}</Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* По уровням */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>По уровням</Typography>
                {levelStats.map(({ level, total, studied }) => {
                  const color = LEVEL_COLORS[level]
                  const pct = total > 0 ? Math.round((studied / total) * 100) : 0
                  return (
                    <Box key={level} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Chip label={level.charAt(0).toUpperCase() + level.slice(1)} size="small"
                          sx={{ bgcolor: `${color}22`, color, fontWeight: 'bold', height: 20, fontSize: '0.68rem' }} />
                        <Typography variant="caption" color="text.secondary">{studied}/{total} · {pct}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={pct} sx={{
                        height: 6, borderRadius: 3,
                        bgcolor: `${color}20`,
                        '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 },
                      }} />
                    </Box>
                  )
                })}
              </CardContent>
            </Card>
          </Grid>

          {/* По категориям */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">По категориям</Typography>
                  <CardActionArea onClick={() => navigate('/questions')}
                    sx={{ width: 'auto', px: 1.5, py: 0.5, borderRadius: 2, bgcolor: '#3b82f615', color: '#3b82f6' }}>
                    <Typography variant="caption" fontWeight="bold">Все →</Typography>
                  </CardActionArea>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {catStats.map(c => (
                    <Chip key={c.value} label={`${c.label} · ${c.count}`} size="small" variant="outlined"
                      onClick={() => navigate(`/questions?category=${c.value}`)}
                      sx={{ cursor: 'pointer', fontSize: '0.72rem' }} />
                  ))}
                  {catStats.length === 0 && (
                    <Typography variant="body2" color="text.secondary">Нет данных</Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Быстрые действия */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Быстрые действия</Typography>
                <Grid container spacing={2}>
                  {[
                    { label: '➕ Добавить вопрос', path: '/questions/new', color: '#10b981' },
                    { label: '📋 Все вопросы',     path: '/questions',     color: '#3b82f6' },
                    { label: '⬆️ Импорт CSV/JSON', path: '/import',        color: '#8b5cf6' },
                  ].map(a => (
                    <Grid item xs={12} sm={4} key={a.path}>
                      <CardActionArea onClick={() => navigate(a.path)}
                        sx={{
                          p: 2, borderRadius: 3, border: `1.5px solid ${a.color}44`,
                          bgcolor: `${a.color}10`, color: a.color, fontWeight: 'bold',
                          textAlign: 'center', display: 'block',
                          '&:hover': { bgcolor: `${a.color}20` },
                        }}>
                        <Typography fontWeight="bold">{a.label}</Typography>
                      </CardActionArea>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  )
}

export default DashboardPage
