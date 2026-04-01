import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box, Typography, Card, CardContent, Button, TextField,
  Select, MenuItem, FormControl, InputLabel, Grid, Alert,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Chip
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { motion } from 'framer-motion'
import { useAdminStore } from '../store'
import { LEVEL_OPTIONS, CATEGORY_OPTIONS, QuestionLevel, QuestionCategory } from '../types'
import { questionsApi } from '../services/api'

const EMPTY = {
  question: '', answer: '', detailedAnswer: '', codeExample: '',
  level: 'junior' as QuestionLevel,
  category: 'android-sdk' as QuestionCategory,
}

const QuestionFormPage: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { createQuestion, updateQuestion } = useAdminStore()
  const isEdit = !!id

  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    setFetching(true)
    questionsApi.getOne(id)
      .then(res => {
        const q = res.data
        setForm({
          question: q.question,
          answer: q.answer,
          detailedAnswer: q.detailedAnswer || '',
          codeExample: q.codeExample || '',
          level: q.level,
          category: q.category,
        })
      })
      .catch(() => setError('Не удалось загрузить вопрос'))
      .finally(() => setFetching(false))
  }, [id])

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.question.trim() || !form.answer.trim()) {
      setError('Заполните обязательные поля: Вопрос и Краткий ответ')
      return
    }
    setLoading(true)
    setError('')
    try {
      const payload = {
        question: form.question.trim(),
        answer: form.answer.trim(),
        detailedAnswer: form.detailedAnswer.trim() || undefined,
        codeExample: form.codeExample.trim() || undefined,
        level: form.level,
        category: form.category,
      }
      if (isEdit && id) {
        await updateQuestion(id, payload)
        setSuccess('Вопрос обновлён!')
      } else {
        await createQuestion(payload)
        setSuccess('Вопрос добавлен!')
        setForm(EMPTY)
      }
      setTimeout(() => navigate('/questions'), 1200)
    } catch {
      setError('Ошибка сохранения')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Box>

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/questions')} variant="outlined" size="small">
            Назад
          </Button>
          <Button
            startIcon={<VisibilityIcon />}
            variant="outlined"
            size="small"
            onClick={() => setPreviewOpen(true)}
            disabled={!form.question.trim() && !form.answer.trim()}
          >
            Превью как в приложении
          </Button>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {isEdit ? 'Редактировать вопрос' : 'Новый вопрос'}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {isEdit ? 'Измените данные и сохраните' : 'Заполните форму и нажмите Сохранить'}
            </Typography>
          </Box>
        </Box>

        {error   && <Alert severity="error"   sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}

        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2.5}>
                {/* Уровень и категория */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Уровень *</InputLabel>
                    <Select value={form.level} onChange={e => set('level', e.target.value)} label="Уровень *">
                      {LEVEL_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Категория *</InputLabel>
                    <Select value={form.category} onChange={e => set('category', e.target.value)} label="Категория *">
                      {CATEGORY_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Вопрос */}
                <Grid item xs={12}>
                  <TextField
                    label="Вопрос *" fullWidth multiline rows={3}
                    value={form.question} onChange={e => set('question', e.target.value)}
                    required placeholder="Например: Что такое ViewModel в Android?"
                  />
                </Grid>

                {/* Краткий ответ */}
                <Grid item xs={12}>
                  <TextField
                    label="Краткий ответ *" fullWidth multiline rows={3}
                    value={form.answer} onChange={e => set('answer', e.target.value)}
                    required placeholder="Краткое и чёткое определение..."
                  />
                </Grid>

                {/* Подробный ответ */}
                <Grid item xs={12}>
                  <TextField
                    label="Подробный ответ" fullWidth multiline rows={5}
                    value={form.detailedAnswer} onChange={e => set('detailedAnswer', e.target.value)}
                    placeholder="Развёрнутое объяснение с примерами использования..."
                    helperText="Необязательно — раскрывается по кнопке в приложении"
                  />
                </Grid>

                {/* Код */}
                <Grid item xs={12}>
                  <TextField
                    label="Пример кода" fullWidth multiline rows={6}
                    value={form.codeExample} onChange={e => set('codeExample', e.target.value)}
                    placeholder={'class MyViewModel : ViewModel() {\n    ...\n}'}
                    helperText="Необязательно — Kotlin/Java код"
                    InputProps={{ sx: { fontFamily: 'monospace', fontSize: '0.85rem' } }}
                  />
                </Grid>

                {/* Кнопки */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button variant="outlined" onClick={() => navigate('/questions')}>Отмена</Button>
                    <Button
                      type="submit" variant="contained" startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                      disabled={loading}
                      sx={{ px: 4, fontWeight: 'bold' }}
                    >
                      {isEdit ? 'Сохранить' : 'Добавить'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Превью карточки</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip label={LEVEL_OPTIONS.find(o => o.value === form.level)?.label ?? form.level} size="small" color="primary" />
            <Chip label={CATEGORY_OPTIONS.find(o => o.value === form.category)?.label ?? form.category} size="small" variant="outlined" />
          </Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>Вопрос</Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.5 }}>{form.question || '—'}</Typography>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>Краткий ответ</Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>{form.answer || '—'}</Typography>
          {form.detailedAnswer?.trim() && (
            <>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }} gutterBottom>Подробно</Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.6 }}>{form.detailedAnswer}</Typography>
            </>
          )}
          {form.codeExample?.trim() && (
            <Box component="pre" sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: 'action.hover', fontSize: '0.75rem', overflow: 'auto' }}>
              {form.codeExample}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default QuestionFormPage
