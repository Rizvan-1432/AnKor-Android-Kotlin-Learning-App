import React from 'react'
import { Container, Typography, Box, CardActionArea, Chip, useTheme } from '@mui/material'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store'
import { QuestionCategory } from '../types'

export const TRACKS = [
  {
    id: 'android',
    name: 'Android разработка',
    icon: '🤖',
    color: '#3b82f6',
    description: 'Kotlin, SDK, Jetpack, архитектура и всё что нужно Android-разработчику',
    available: true,
    categories: ['android-sdk', 'jetpack', 'ui-ux', 'kotlin', 'multithreading', 'architecture',
      'dependency-injection', 'networking', 'databases', 'performance', 'security',
      'testing', 'ci-cd', 'publishing', 'system', 'behavioral'] as QuestionCategory[],
  },
  {
    id: 'frontend',
    name: 'Frontend разработка',
    icon: '🌐',
    color: '#f59e0b',
    description: 'React, Vue, TypeScript, CSS, браузерные API',
    available: false,
    categories: [] as QuestionCategory[],
  },
  {
    id: 'backend',
    name: 'Backend разработка',
    icon: '⚙️',
    color: '#10b981',
    description: 'Node.js, Python, базы данных, REST, микросервисы',
    available: false,
    categories: [] as QuestionCategory[],
  },
  {
    id: 'ios',
    name: 'iOS разработка',
    icon: '🍎',
    color: '#6366f1',
    description: 'Swift, SwiftUI, UIKit, Xcode',
    available: false,
    categories: [] as QuestionCategory[],
  },
  {
    id: 'devops',
    name: 'DevOps',
    icon: '🚀',
    color: '#ef4444',
    description: 'Docker, Kubernetes, CI/CD, облачные платформы',
    available: false,
    categories: [] as QuestionCategory[],
  },
  {
    id: 'ml',
    name: 'Machine Learning',
    icon: '🧠',
    color: '#8b5cf6',
    description: 'Python, TensorFlow, ML-алгоритмы, нейросети',
    available: false,
    categories: [] as QuestionCategory[],
  },
]

const QuestionsPage: React.FC = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const { questions } = useAppStore()

  const getTrackStats = (cats: QuestionCategory[]) => {
    const tq = questions.filter(q => cats.includes(q.category))
    const studied = tq.filter(q => q.studied).length
    return { total: tq.length, studied }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Шапка */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.secondary.dark ?? '#374151'} 0%, ${theme.palette.secondary.main} 100%)`,
            borderRadius: 3,
            p: { xs: 2, sm: 3 },
            mb: 3,
            color: 'white',
          }}
        >
          <Typography component="h1" fontWeight="bold"
            sx={{ fontSize: { xs: '1.3rem', sm: '1.8rem' }, lineHeight: 1.2, mb: 0.5 }}>
            🎓 Направления
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.85, fontSize: { xs: '0.78rem', sm: '0.9rem' } }}>
            Выберите специализацию и начните готовиться к собеседованию
          </Typography>
        </Box>
      </motion.div>

      {/* Карточки направлений */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {TRACKS.map((track, index) => {
          const { total, studied } = getTrackStats(track.categories)

          return (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07, duration: 0.4 }}
              whileHover={track.available ? { scale: 1.02 } : {}}
              whileTap={track.available ? { scale: 0.98 } : {}}
            >
              <CardActionArea
                onClick={() => track.available && navigate(`/track/${track.id}`)}
                disabled={!track.available}
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  background: track.available
                    ? `linear-gradient(135deg, ${track.color}18 0%, ${track.color}08 100%)`
                    : theme.palette.action.disabledBackground,
                  border: `1.5px solid ${track.available ? track.color + '44' : 'transparent'}`,
                  p: { xs: 2, sm: 2.5 },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  opacity: track.available ? 1 : 0.55,
                }}
              >
                {/* Иконка */}
                <Box
                  sx={{
                    width: { xs: 48, sm: 56 },
                    height: { xs: 48, sm: 56 },
                    borderRadius: 2.5,
                    background: track.available
                      ? `linear-gradient(135deg, ${track.color} 0%, ${track.color}BB 100%)`
                      : '#9ca3af',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: { xs: '1.5rem', sm: '1.8rem' },
                  }}
                >
                  {track.icon}
                </Box>

                {/* Текст */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
                    <Typography
                      fontWeight="bold"
                      sx={{
                        fontSize: { xs: '0.95rem', sm: '1.1rem' },
                        color: track.available ? track.color : 'text.disabled',
                        lineHeight: 1.2,
                      }}
                    >
                      {track.name}
                    </Typography>
                    {!track.available && (
                      <Chip label="Скоро" size="small"
                        sx={{ height: 18, fontSize: '0.6rem', bgcolor: '#f3f4f6', color: '#6b7280' }} />
                    )}
                    {track.available && total > 0 && (
                      <Chip
                        label={`${total} вопросов`}
                        size="small"
                        sx={{ height: 18, fontSize: '0.6rem', bgcolor: `${track.color}22`, color: track.color, fontWeight: 'bold' }}
                      />
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary"
                    sx={{ fontSize: { xs: '0.72rem', sm: '0.8rem' }, lineHeight: 1.3, display: 'block' }}>
                    {track.description}
                  </Typography>
                  {track.available && total > 0 && (
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', color: track.color, mt: 0.3, display: 'block' }}>
                      ✅ {studied} из {total} изучено
                    </Typography>
                  )}
                </Box>

                {/* Стрелка */}
                {track.available && (
                  <Typography sx={{ color: track.color, fontSize: '1.2rem', flexShrink: 0 }}>›</Typography>
                )}
              </CardActionArea>
            </motion.div>
          )
        })}
      </Box>
    </Container>
  )
}

export default QuestionsPage
