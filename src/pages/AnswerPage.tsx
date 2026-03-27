import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper
} from '@mui/material'
import { motion } from 'framer-motion'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useAppStore } from '../store'
import { Question, QuestionLevel } from '../types'

const AnswerPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { questions, markCorrect, markIncorrect } = useAppStore()
  
  const questionId = searchParams.get('id')
  const [question, setQuestion] = useState<Question | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (questionId) {
      const foundQuestion = questions.find(q => q.id === questionId)
      if (foundQuestion) {
        setQuestion(foundQuestion)
      }
      setLoading(false)
    } else {
      navigate('/questions')
    }
  }, [questionId, questions, navigate])

  const handleAnswer = (isCorrect: boolean) => {
    if (question) {
      if (isCorrect) {
        markCorrect(question.id)
      } else {
        markIncorrect(question.id)
      }
    }
  }

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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Загрузка ответа...
        </Typography>
      </Container>
    )
  }

  if (!question) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Вопрос не найден
        </Alert>
        <Button variant="contained" onClick={() => navigate('/questions')}>
          Вернуться к выбору уровня
        </Button>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Заголовок */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Ответ на вопрос
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Chip
                label={getLevelName(question.level)}
                size="small"
                sx={{ 
                  backgroundColor: getLevelColor(question.level),
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
              <Chip
                label={question.category}
                size="small"
                variant="outlined"
                sx={{ borderColor: getLevelColor(question.level), color: getLevelColor(question.level) }}
              />
            </Box>
          </Box>
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
            sx={{ borderColor: getLevelColor(question.level), color: getLevelColor(question.level) }}
          >
            ← Назад
          </Button>
        </Box>
      </motion.div>

      {/* Вопрос */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
              {question.question}
            </Typography>
          </CardContent>
        </Card>
      </motion.div>

      {/* Ответы */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        {/* Краткий ответ */}
        <Accordion defaultExpanded sx={{ mb: 2, borderRadius: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" color="primary" fontWeight="bold">
              📝 Краткий ответ
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
              {question.answer}
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Расширенный ответ */}
        {question.detailedAnswer && (
          <Accordion sx={{ mb: 2, borderRadius: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" color="success.main" fontWeight="bold">
                📚 Расширенный ответ
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                {question.detailedAnswer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Код с комментариями */}
        {question.codeExample && (
          <Accordion sx={{ mb: 3, borderRadius: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" color="warning.main" fontWeight="bold">
                💻 Код с комментариями
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: '#1e1e1e',
                  color: '#d4d4d4',
                  borderRadius: 2,
                  overflow: 'auto',
                  fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace',
                  fontSize: '0.9rem',
                  lineHeight: 1.5
                }}
              >
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {question.codeExample}
                </pre>
              </Paper>
            </AccordionDetails>
          </Accordion>
        )}
      </motion.div>

      {/* Действия */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
          <CardContent sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Как вы оцениваете свой ответ?
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mt: 2 }}>
              <Button
                variant="contained"
                color="success"
                size="large"
                onClick={() => handleAnswer(true)}
                disabled={question.answered}
                sx={{ minWidth: 150 }}
              >
                ✅ Правильно
              </Button>
              <Button
                variant="contained"
                color="error"
                size="large"
                onClick={() => handleAnswer(false)}
                disabled={question.answered}
                sx={{ minWidth: 150 }}
              >
                ❌ Неправильно
              </Button>
            </Box>
            
            {/* Статистика вопроса */}
            {question.studied && (
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Правильных: {question.correct}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Неправильных: {question.incorrect}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  )
}

export default AnswerPage
