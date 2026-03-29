import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Container, Typography, Box, CardActionArea,
  LinearProgress, Tabs, Tab, Button
} from '@mui/material'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../store'
import { QuestionCategory, QuestionLevel } from '../types'
import { TRACKS } from './QuestionsPage'

const LEVELS: { id: QuestionLevel; name: string; icon: string; color: string; description: string }[] = [
  { id: 'junior',    name: 'Junior',    icon: '🌱', color: '#10b981', description: 'Базовые концепции' },
  { id: 'middle',    name: 'Middle',    icon: '🌿', color: '#3b82f6', description: 'Архитектура и Jetpack' },
  { id: 'senior',    name: 'Senior',    icon: '🌳', color: '#8b5cf6', description: 'Оптимизация и DI' },
  { id: 'lead',      name: 'Lead',      icon: '🏆', color: '#f59e0b', description: 'Проектирование' },
  { id: 'architect', name: 'Architect', icon: '🏗️', color: '#ef4444', description: 'Системная архитектура' },
  { id: 'expert',    name: 'Expert',    icon: '🎯', color: '#6366f1', description: 'Экспертные паттерны' },
]

const TOPICS: { id: string; name: string; icon: string; color: string; categories: QuestionCategory[] }[] = [
  { id: 'sdk',      name: 'Android SDK',       icon: '📱', color: '#3b82f6', categories: ['android-sdk', 'ui-ux'] },
  { id: 'kotlin',   name: 'Kotlin & Coroutines',icon: '🟠', color: '#f59e0b', categories: ['kotlin', 'multithreading'] },
  { id: 'jetpack',  name: 'Jetpack',            icon: '🚀', color: '#8b5cf6', categories: ['jetpack'] },
  { id: 'arch',     name: 'Архитектура & DI',   icon: '🏛', color: '#6366f1', categories: ['architecture', 'dependency-injection'] },
  { id: 'network',  name: 'Сеть и данные',      icon: '🌐', color: '#10b981', categories: ['networking', 'databases'] },
  { id: 'quality',  name: 'Качество кода',      icon: '⚡', color: '#ef4444', categories: ['performance', 'security', 'testing'] },
  { id: 'devops',   name: 'CI/CD и публикация', icon: '📦', color: '#64748b', categories: ['ci-cd', 'publishing'] },
  { id: 'career',   name: 'Карьера',            icon: '💼', color: '#0ea5e9', categories: ['system', 'behavioral'] },
]

const TrackPage: React.FC = () => {
  const { trackId } = useParams<{ trackId: string }>()
  const navigate = useNavigate()
  const { questions } = useAppStore()
  const [tab, setTab] = useState(0)

  const track = TRACKS.find(t => t.id === trackId)

  if (!track) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Typography>Направление не найдено</Typography>
        <Button onClick={() => navigate('/questions')}>← Назад</Button>
      </Container>
    )
  }

  const trackQuestions = questions.filter(q => track.categories.includes(q.category))
  const studied = trackQuestions.filter(q => q.studied).length
  const progress = trackQuestions.length > 0 ? Math.round((studied / trackQuestions.length) * 100) : 0

  const getLevelStats = (levelId: string) => {
    const lq = trackQuestions.filter(q => q.level === levelId)
    const s = lq.filter(q => q.studied).length
    return { total: lq.length, studied: s }
  }

  const getTopicStats = (cats: QuestionCategory[]) => {
    const tq = questions.filter(q => cats.includes(q.category))
    const s = tq.filter(q => q.studied).length
    return { total: tq.length, studied: s }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Шапка направления */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Box
          sx={{
            background: `linear-gradient(135deg, ${track.color}dd 0%, ${track.color}99 100%)`,
            borderRadius: 3,
            p: { xs: 2, sm: 3 },
            mb: 2,
            color: 'white',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography sx={{ fontSize: { xs: '2rem', sm: '2.5rem' }, flexShrink: 0 }}>{track.icon}</Typography>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography component="h1" fontWeight="bold" noWrap
                sx={{ fontSize: { xs: '1.2rem', sm: '1.6rem' }, lineHeight: 1.2 }}>
                {track.name}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85, fontSize: { xs: '0.75rem', sm: '0.85rem' }, mt: 0.3 }}>
                {track.description}
              </Typography>
            </Box>
          </Box>

          {/* Общий прогресс */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.7rem' }}>
                {studied} из {trackQuestions.length} вопросов изучено
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}>
                {progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6, borderRadius: 3,
                backgroundColor: 'rgba(255,255,255,0.25)',
                '& .MuiLinearProgress-bar': { backgroundColor: 'white', borderRadius: 3 },
              }}
            />
          </Box>

        </Box>
      </motion.div>

      {/* Табы */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 2, minHeight: 36 }}
        TabIndicatorProps={{ style: { height: 3, borderRadius: 2, backgroundColor: track.color } }}
      >
        <Tab label="По уровню" sx={{ minHeight: 36, fontSize: { xs: '0.75rem', sm: '0.875rem' }, textTransform: 'none', fontWeight: 'bold' }} />
        <Tab label="По теме" sx={{ minHeight: 36, fontSize: { xs: '0.75rem', sm: '0.875rem' }, textTransform: 'none', fontWeight: 'bold' }} />
      </Tabs>

      <AnimatePresence mode="wait">
        {tab === 0 ? (
          /* ── ПО УРОВНЮ ── */
          <motion.div key="levels"
            initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 14 }} transition={{ duration: 0.22 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              {LEVELS.map((level, index) => {
                const { total, studied: s } = getLevelStats(level.id)
                const pct = total > 0 ? Math.round((s / total) * 100) : 0
                return (
                  <motion.div key={level.id}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <CardActionArea
                      onClick={() => navigate(`/study?level=${level.id}`)}
                      sx={{
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${level.color}20 0%, ${level.color}0a 100%)`,
                        border: `1.5px solid ${level.color}55`,
                        p: { xs: 1.5, sm: 2 },
                        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1, height: '100%',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                          width: { xs: 34, sm: 40 }, height: { xs: 34, sm: 40 }, borderRadius: 2, flexShrink: 0,
                          background: `linear-gradient(135deg, ${level.color} 0%, ${level.color}BB 100%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: { xs: '1rem', sm: '1.2rem' },
                        }}>
                          {level.icon}
                        </Box>
                        <Box>
                          <Typography fontWeight="bold" sx={{ color: level.color, fontSize: { xs: '0.85rem', sm: '1rem' }, lineHeight: 1.1 }}>
                            {level.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary"
                            sx={{ fontSize: { xs: '0.62rem', sm: '0.7rem' }, display: 'block' }}>
                            {level.description}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                            {s}/{total} изучено
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.6rem', color: level.color, fontWeight: 'bold' }}>
                            {pct}%
                          </Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={pct} sx={{
                          height: 4, borderRadius: 2,
                          backgroundColor: `${level.color}22`,
                          '& .MuiLinearProgress-bar': { backgroundColor: level.color, borderRadius: 2 },
                        }} />
                      </Box>
                    </CardActionArea>
                  </motion.div>
                )
              })}
            </Box>
          </motion.div>
        ) : (
          /* ── ПО ТЕМЕ ── */
          <motion.div key="topics"
            initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.22 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              {TOPICS.map((topic, index) => {
                const { total, studied: s } = getTopicStats(topic.categories)
                const pct = total > 0 ? Math.round((s / total) * 100) : 0
                const url = `/study?categories=${topic.categories.join(',')}&trackName=${encodeURIComponent(topic.name)}`
                return (
                  <motion.div key={topic.id}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <CardActionArea
                      onClick={() => navigate(url)}
                      sx={{
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${topic.color}20 0%, ${topic.color}0a 100%)`,
                        border: `1.5px solid ${topic.color}55`,
                        p: { xs: 1.5, sm: 2 },
                        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1, height: '100%',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                          width: { xs: 34, sm: 40 }, height: { xs: 34, sm: 40 }, borderRadius: 2, flexShrink: 0,
                          background: `linear-gradient(135deg, ${topic.color} 0%, ${topic.color}BB 100%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: { xs: '1rem', sm: '1.2rem' },
                        }}>
                          {topic.icon}
                        </Box>
                        <Box>
                          <Typography fontWeight="bold" sx={{ color: topic.color, fontSize: { xs: '0.8rem', sm: '0.95rem' }, lineHeight: 1.1 }}>
                            {topic.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary"
                            sx={{ fontSize: { xs: '0.6rem', sm: '0.68rem' }, display: 'block' }}>
                            {total} вопросов
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                            {s}/{total} изучено
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.6rem', color: topic.color, fontWeight: 'bold' }}>
                            {pct}%
                          </Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={pct} sx={{
                          height: 4, borderRadius: 2,
                          backgroundColor: `${topic.color}22`,
                          '& .MuiLinearProgress-bar': { backgroundColor: topic.color, borderRadius: 2 },
                        }} />
                      </Box>
                    </CardActionArea>
                  </motion.div>
                )
              })}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Отступ снизу */}
      <Box sx={{ height: 96 }} />

      {/* Красивая кнопка Назад внизу по центру */}
      <Box sx={{
        position: 'fixed',
        bottom: { xs: 70, sm: 24 },
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        zIndex: 999,
        pointerEvents: 'none',
      }}>
        <motion.div
          whileHover={{ scale: 1.06, y: -2 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400 }}
          style={{ pointerEvents: 'all' }}
        >
          <Button
            onClick={() => navigate('/questions')}
            startIcon={<ArrowBackIosNewIcon sx={{ fontSize: '0.8rem !important' }} />}
            sx={{
              background: `linear-gradient(135deg, ${track.color} 0%, ${track.color}BB 100%)`,
              color: 'white',
              fontWeight: 700,
              fontSize: '0.9rem',
              letterSpacing: '0.03em',
              px: 4,
              py: 1.2,
              borderRadius: '50px',
              boxShadow: `0 6px 24px ${track.color}55, 0 2px 8px rgba(0,0,0,0.2)`,
              border: '1.5px solid rgba(255,255,255,0.25)',
              backdropFilter: 'blur(12px)',
              textTransform: 'none',
              '&:hover': {
                background: `linear-gradient(135deg, ${track.color} 0%, ${track.color}BB 100%)`,
                boxShadow: `0 8px 32px ${track.color}77, 0 4px 12px rgba(0,0,0,0.25)`,
              }
            }}
          >
            Назад
          </Button>
        </motion.div>
      </Box>
    </Container>
  )
}

export default TrackPage
