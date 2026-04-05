import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Container, Typography, Box, Card, CardContent, Button,
  Chip, Pagination, Alert, CircularProgress,
  Dialog, DialogContent, DialogActions, IconButton,
  Accordion, AccordionSummary, AccordionDetails, Paper, Divider
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import { motion, AnimatePresence } from 'framer-motion'
import Prism from 'prismjs'
import 'prismjs/components/prism-kotlin'
import 'prismjs/themes/prism-tomorrow.css'
import { useAppStore } from '../store'
import { Question, QuestionLevel } from '../types'

const CATEGORY_LABELS: Record<string, string> = {
  'kotlin':                'Kotlin',
  'android-sdk':           'Android SDK',
  'ui-ux':                 'UI/UX',
  'architecture':          'Архитектура',
  'jetpack':               'Jetpack',
  'dependency-injection':  'DI',
  'networking':            'Сеть',
  'databases':             'Базы данных',
  'performance':           'Производительность',
  'multithreading':        'Многопоточность',
  'security':              'Безопасность',
  'testing':               'Тестирование',
  'ci-cd':                 'CI/CD',
  'system':                'Системные',
  'behavioral':            'Поведенческие',
  'publishing':            'Публикация',
}

const LEVEL_COLORS: Record<QuestionLevel, string> = {
  junior:    '#10b981',
  middle:    '#3b82f6',
  senior:    '#8b5cf6',
  lead:      '#f59e0b',
  architect: '#ef4444',
  expert:    '#6366f1',
}
const LEVEL_NAMES: Record<QuestionLevel, string> = {
  junior: 'Junior', middle: 'Middle', senior: 'Senior',
  lead: 'Lead', architect: 'Architect', expert: 'Expert',
}

const highlightCode = (code: string) => {
  const grammar = Prism.languages.kotlin || Prism.languages.clike
  return Prism.highlight(code, grammar, 'kotlin')
}

/** Режимы: ошибки, слабые темы, интервальное повторение; лимит карточек за сессию */
function applyStudyModeAndLimit(
  list: Question[],
  mode: string | null,
  limit: number | null
): Question[] {
  let arr = [...list]
  if (mode === 'mistakes') {
    arr = arr.filter(q => q.incorrect > 0)
    arr.sort((a, b) => b.incorrect - a.incorrect || b.correct - a.correct)
  } else if (mode === 'weak') {
    arr = arr.filter(q => q.correct + q.incorrect > 0)
    arr.sort((a, b) => {
      const ra = a.incorrect / (a.correct + a.incorrect + 0.001)
      const rb = b.incorrect / (b.correct + b.incorrect + 0.001)
      return rb - ra
    })
  } else if (mode === 'srs') {
    arr.sort((a, b) => {
      if (!a.studiedAt && !b.studiedAt) return b.incorrect - a.incorrect
      if (!a.studiedAt) return -1
      if (!b.studiedAt) return 1
      return new Date(a.studiedAt).getTime() - new Date(b.studiedAt).getTime()
    })
  }
  if (limit != null && limit > 0) {
    arr = arr.slice(0, limit)
  }
  return arr
}

const StudyPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { questions, markCorrect, markIncorrect, loadQuestions, error: loadError } = useAppStore()

  const level = searchParams.get('level') as QuestionLevel
  const categoriesParam = searchParams.get('categories')
  const trackName = searchParams.get('trackName')
  const mode = searchParams.get('mode')
  const limitRaw = searchParams.get('limit')
  const sessionLimit = (() => {
    if (!limitRaw) return null
    const n = parseInt(limitRaw, 10)
    return !Number.isNaN(n) && n > 0 ? n : null
  })()

  const [currentPage, setCurrentPage] = useState(1)
  const [levelQuestions, setLevelQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  // Модальное окно ответа
  const [modalQuestion, setModalQuestion] = useState<Question | null>(null)

  const questionsPerPage = 5

  useEffect(() => {
    let isMounted = true

    const initQuestions = async () => {
      if (!level && !categoriesParam) {
        navigate('/questions')
        return
      }

      // При прямом открытии /study после refresh store может быть пустым.
      // Догружаем вопросы с API и только потом фильтруем.
      if (questions.length === 0) {
        setLoading(true)
        await loadQuestions()
        if (!isMounted) return
        // Важно: при ошибке API questions остаётся [] и ссылка не меняется —
        // эффект не перезапустится, если здесь не выставить loading и список.
        const qs = useAppStore.getState().questions
        let base: Question[] = []
        if (level) {
          base = qs.filter(q => q.level === level)
        } else if (categoriesParam) {
          const cats = categoriesParam.split(',')
          base = qs.filter(q => cats.includes(q.category))
        }
        setLevelQuestions(applyStudyModeAndLimit(base, mode, sessionLimit))
        setLoading(false)
        return
      }

      if (!isMounted) return

      let base: Question[] = []
      if (level) {
        base = questions.filter(q => q.level === level)
      } else if (categoriesParam) {
        const cats = categoriesParam.split(',')
        base = questions.filter(q => cats.includes(q.category))
      }
      setLevelQuestions(applyStudyModeAndLimit(base, mode, sessionLimit))
      setLoading(false)
    }

    void initQuestions()

    return () => {
      isMounted = false
    }
  }, [level, categoriesParam, questions, navigate, loadQuestions, mode, sessionLimit])

  // Синхронизируем modalQuestion с актуальными данными из store
  useEffect(() => {
    if (modalQuestion) {
      const updated = questions.find(q => q.id === modalQuestion.id)
      if (updated) setModalQuestion(updated)
    }
  }, [questions])

  const totalPages = Math.ceil(levelQuestions.length / questionsPerPage)
  const startIndex = (currentPage - 1) * questionsPerPage
  const currentQuestions = levelQuestions.slice(startIndex, startIndex + questionsPerPage)

  const accentColor = level ? (LEVEL_COLORS[level] ?? '#3b82f6') : '#3b82f6'

  const handleAnswer = useCallback((questionId: string, isCorrect: boolean) => {
    if (isCorrect) markCorrect(questionId)
    else markIncorrect(questionId)
  }, [markCorrect, markIncorrect])

  // Горячие клавиши: 1/Знаю, 2/Не знаю, Пробел/Enter — ответ (первый неотвеченный на странице)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return
      const el = e.target as HTMLElement | null
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) return
      if (modalQuestion) {
        if (e.key === 'Escape') {
          e.preventDefault()
          setModalQuestion(null)
        }
        return
      }
      const first = currentQuestions.find(q => !q.answered)
      if (!first) return
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        setModalQuestion(first)
        return
      }
      if (e.key === '1' || e.key === 'y' || e.key === 'Y' || e.key === 'z') {
        e.preventDefault()
        handleAnswer(first.id, true)
      }
      if (e.key === '2' || e.key === 'n' || e.key === 'N' || e.key === 'x') {
        e.preventDefault()
        handleAnswer(first.id, false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [currentQuestions, modalQuestion, handleAnswer])

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Загрузка вопросов...</Typography>
      </Container>
    )
  }

  if ((!level && !categoriesParam) || levelQuestions.length === 0) {
    const showApiError = !!loadError && questions.length === 0
    const catalogTotallyEmpty = questions.length === 0 && !showApiError
    const emptyForFilter =
      !catalogTotallyEmpty && !showApiError && levelQuestions.length === 0

    let emptyMessage = ''
    if (showApiError) {
      emptyMessage = 'Каталог не загрузился — список карточек пуст.'
    } else if (catalogTotallyEmpty) {
      emptyMessage =
        'В каталоге пока нет ни одного вопроса. Добавьте карточки в админ-панели или импортируйте данные — после этого обновите страницу.'
    } else if (trackName) {
      emptyMessage = `По теме «${trackName}» сейчас нет вопросов с учётом фильтров.`
    } else if (categoriesParam) {
      emptyMessage =
        'Для выбранных категорий нет вопросов. Попробуйте другой трек или уровень.'
    } else {
      emptyMessage = `Для уровня «${LEVEL_NAMES[level] ?? level}» нет вопросов в каталоге.`
    }

    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {showApiError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {loadError}
            <Typography variant="body2" sx={{ mt: 1 }}>
              Проверьте, что запущен сервер API (например <code style={{ fontSize: '0.85em' }}>npm run server</code>) и что фронт ходит на него через прокси <code style={{ fontSize: '0.85em' }}>/api</code> в режиме разработки.
            </Typography>
          </Alert>
        )}
        <Alert severity={catalogTotallyEmpty || emptyForFilter ? 'info' : 'warning'} sx={{ mb: 3 }}>
          {emptyMessage}
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Box sx={{ mb: 3 }}>
          <Typography component="h1" fontWeight="bold" noWrap
            sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem' }, lineHeight: 1.3 }}>
            {trackName ? `📚 ${trackName}` : `Изучение — ${LEVEL_NAMES[level] ?? level}`}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: { xs: '0.74rem', sm: '0.88rem' }, fontWeight: 700, letterSpacing: '0.01em' }}
          >
            {levelQuestions.length} вопроса • страница {currentPage}/{totalPages}
            {mode === 'mistakes' && ' • только с ошибками'}
            {mode === 'weak' && ' • слабые темы'}
            {mode === 'srs' && ' • повторение (SRS)'}
            {sessionLimit != null && ` • сессия до ${sessionLimit} шт.`}
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 0.5, opacity: 0.75, fontSize: '0.68rem' }}>
            ⌨️ 1 — Знаю · 2 — Не знаю · Пробел — ответ · Esc — закрыть окно
          </Typography>
        </Box>
      </motion.div>

      {/* Список вопросов */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}>
        {currentQuestions.map((question, index) => (
          <motion.div key={question.id}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.4 }}>
            <Card sx={{ mb: 2.5, borderRadius: 3, boxShadow: 2, border: `1px solid ${accentColor}22` }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                {/* Метки */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                  <Chip label={`# ${startIndex + index + 1}`} size="small"
                    sx={{ bgcolor: accentColor, color: 'white', fontWeight: 'bold', height: 22, fontSize: '0.7rem' }} />
                  <Chip label={CATEGORY_LABELS[question.category] ?? question.category} size="small" variant="outlined"
                    sx={{ borderColor: accentColor, color: accentColor, height: 22, fontSize: '0.7rem' }} />
                </Box>

                {/* Текст вопроса */}
                <Typography variant="body1" fontWeight="medium" sx={{ mb: 2.5, lineHeight: 1.5 }}>
                  {question.question}
                </Typography>

                {/* Кнопки */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button variant="contained" color="success" size="small"
                    onClick={() => handleAnswer(question.id, true)}
                    disabled={question.answered}
                    sx={{ flex: 1, minWidth: 100, fontSize: { xs: '0.72rem', sm: '0.875rem' } }}>
                    <Box component="span" sx={{ mr: 0.7, display: 'inline-flex' }}>✅</Box>
                    Знаю
                  </Button>
                  <Button variant="contained" size="small"
                    onClick={() => handleAnswer(question.id, false)}
                    disabled={question.answered}
                    sx={{
                      flex: 1,
                      minWidth: 100,
                      fontSize: { xs: '0.72rem', sm: '0.875rem' },
                      bgcolor: '#e11d48',
                      color: '#ffffff',
                      border: '1px solid rgba(255,255,255,0.55)',
                      boxShadow: '0 4px 12px rgba(225, 29, 72, 0.4)',
                      '&:hover': { bgcolor: '#be123c', boxShadow: '0 6px 16px rgba(190, 18, 60, 0.5)' },
                    }}>
                    <Box component="span" sx={{ mr: 0.7, display: 'inline-flex', color: '#ffffff', fontWeight: 800 }}>✕</Box>
                    Не знаю
                  </Button>
                  <Button variant="outlined" size="small"
                    onClick={() => setModalQuestion(question)}
                    sx={{ flex: 1, minWidth: 100, borderColor: accentColor, color: accentColor, fontSize: { xs: '0.72rem', sm: '0.875rem' } }}>
                    📖 Ответ
                  </Button>
                </Box>

                {/* Статистика */}
                {question.studied && (
                  <Box sx={{ mt: 1.5, display: 'flex', gap: 2 }}>
                    <Typography variant="caption" color="text.secondary">✅ {question.correct}</Typography>
                    <Typography variant="caption" color="text.secondary">❌ {question.incorrect}</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination count={totalPages} page={currentPage}
            onChange={(_, p) => setCurrentPage(p)} color="primary" size="medium" />
        </Box>
      )}

      {/* ───── МОДАЛЬНОЕ ОКНО ОТВЕТА ───── */}
      <AnimatePresence>
        {modalQuestion && (
          <Dialog
            open={!!modalQuestion}
            onClose={() => setModalQuestion(null)}
            maxWidth="sm"
            fullWidth
            fullScreen={false}
            sx={{ zIndex: (theme) => theme.zIndex.modal + 10 }}
            BackdropProps={{
              sx: {
                backgroundColor: 'rgba(0, 0, 0, 0.68)',
              }
            }}
            PaperProps={{
              sx: {
                borderRadius: 3,
                mx: { xs: 1.5, sm: 3 },
                maxHeight: '90vh',
              }
            }}
          >
            {/* Цветная шапка */}
            <Box sx={{
              background: `linear-gradient(135deg, ${accentColor}dd 0%, ${accentColor}99 100%)`,
              p: { xs: 2, sm: 2.5 },
              color: 'white',
              position: 'relative',
            }}>
              <IconButton
                onClick={() => setModalQuestion(null)}
                size="small"
                sx={{ position: 'absolute', top: 8, right: 8, color: 'white', bgcolor: 'rgba(255,255,255,0.15)' }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>

              <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                {level && (
                  <Chip label={LEVEL_NAMES[level]} size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', height: 20, fontSize: '0.65rem' }} />
                )}
                <Chip label={CATEGORY_LABELS[modalQuestion.category] ?? modalQuestion.category} size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', height: 20, fontSize: '0.65rem' }} />
              </Box>

              <Typography fontWeight="bold" sx={{ fontSize: { xs: '0.95rem', sm: '1.1rem' }, lineHeight: 1.4, pr: 4 }}>
                {modalQuestion.question}
              </Typography>
            </Box>

            <DialogContent sx={{ p: 0, overflowY: 'auto' }}>
              {/* Краткий ответ */}
              <Box sx={{ p: { xs: 2, sm: 2.5 }, pb: 0 }}>
                <Box
                  sx={{
                    p: { xs: 1.5, sm: 1.75 },
                    borderRadius: 2,
                    border: '1px solid rgba(59,130,246,0.22)',
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.10) 0%, rgba(59,130,246,0.04) 100%)',
                  }}
                >
                  <Typography variant="overline" color="primary" sx={{ fontSize: '0.65rem', fontWeight: 'bold' }}>
                    📝 Краткий ответ
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.6 }}>
                    {modalQuestion.answer}
                  </Typography>
                </Box>
              </Box>

              {/* Подробный ответ */}
              {modalQuestion.detailedAnswer && (
                <>
                  <Divider sx={{ mx: 2, my: 1.5 }} />
                  <Accordion disableGutters elevation={0}
                    sx={{ px: { xs: 1, sm: 1.5 }, '&:before': { display: 'none' } }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 36, py: 0 }}>
                      <Typography variant="overline" color="success.main" sx={{ fontSize: '0.65rem', fontWeight: 'bold' }}>
                        📚 Подробный ответ
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                      <Box
                        sx={{
                          p: { xs: 1.25, sm: 1.5 },
                          borderRadius: 2,
                          border: '1px solid rgba(16,185,129,0.22)',
                          background: 'linear-gradient(135deg, rgba(16,185,129,0.10) 0%, rgba(16,185,129,0.04) 100%)',
                        }}
                      >
                        <Typography variant="body2" sx={{ lineHeight: 1.65 }}>
                          {modalQuestion.detailedAnswer}
                        </Typography>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </>
              )}

              {/* Код */}
              {modalQuestion.codeExample && (
                <>
                  <Divider sx={{ mx: 2, my: 1 }} />
                  <Accordion disableGutters elevation={0}
                    sx={{
                      px: { xs: 1, sm: 1.5 },
                      borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                      '&:before': { display: 'none' }
                    }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 36, py: 0 }}>
                      <Typography variant="overline" color="warning.main" sx={{ fontSize: '0.65rem', fontWeight: 'bold' }}>
                        💻 Пример кода
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                      <Paper sx={{
                        p: 1.5, bgcolor: '#1e1e1e', color: '#d4d4d4',
                        borderRadius: 2, overflow: 'auto',
                        fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace',
                        fontSize: '0.78rem', lineHeight: 1.5,
                      }}>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                          <code
                            className="language-kotlin"
                            dangerouslySetInnerHTML={{ __html: highlightCode(modalQuestion.codeExample) }}
                          />
                        </pre>
                      </Paper>
                    </AccordionDetails>
                  </Accordion>
                </>
              )}

              <Box sx={{ height: 8 }} />
            </DialogContent>

            {/* Кнопки оценки */}
            <DialogActions sx={{ p: { xs: 1.5, sm: 2 }, pt: 0, gap: 1 }}>
              {modalQuestion.answered ? (
                <Typography variant="caption" color="text.secondary" sx={{ flex: 1, textAlign: 'center' }}>
                  ✅ Ответ уже оценён
                </Typography>
              ) : (
                <>
                  <Button fullWidth variant="contained" color="success" size="small"
                    onClick={() => { handleAnswer(modalQuestion.id, true); setModalQuestion(null) }}
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    <Box component="span" sx={{ mr: 0.7, display: 'inline-flex' }}>✅</Box>
                    Знаю
                  </Button>
                  <Button fullWidth variant="contained" size="small"
                    onClick={() => { handleAnswer(modalQuestion.id, false); setModalQuestion(null) }}
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      bgcolor: '#e11d48',
                      color: '#ffffff',
                      border: '1px solid rgba(255,255,255,0.55)',
                      boxShadow: '0 4px 12px rgba(225, 29, 72, 0.4)',
                      '&:hover': { bgcolor: '#be123c', boxShadow: '0 6px 16px rgba(190, 18, 60, 0.5)' },
                    }}>
                    <Box component="span" sx={{ mr: 0.7, display: 'inline-flex', color: '#ffffff', fontWeight: 800 }}>✕</Box>
                    Не знаю
                  </Button>
                </>
              )}
            </DialogActions>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Отступ чтобы контент не перекрывался кнопкой */}
      <Box sx={{ height: 96 }} />

      {/* Красивая кнопка Назад внизу по центру */}
      <Box sx={{
        position: 'fixed',
        bottom: { xs: 70, sm: 24 },
        left: 0, right: 0,
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
            onClick={() => navigate(-1)}
            startIcon={<ArrowBackIosNewIcon sx={{ fontSize: '0.8rem !important' }} />}
            sx={{
              background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}BB 100%)`,
              color: 'white',
              fontWeight: 700,
              fontSize: '0.9rem',
              letterSpacing: '0.03em',
              px: 4,
              py: 1.2,
              borderRadius: '50px',
              boxShadow: `0 6px 24px ${accentColor}55, 0 2px 8px rgba(0,0,0,0.2)`,
              border: '1.5px solid rgba(255,255,255,0.25)',
              textTransform: 'none',
              '&:hover': {
                background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}BB 100%)`,
                boxShadow: `0 8px 32px ${accentColor}77, 0 4px 12px rgba(0,0,0,0.25)`,
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

export default StudyPage
