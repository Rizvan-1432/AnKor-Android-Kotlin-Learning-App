import React, { useState } from 'react'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  TextField,
  Grid,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Select,
  FormControl,
  InputLabel
} from '@mui/material'
import { motion } from 'framer-motion'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { useAppStore } from '../store'
import { Question, QuestionLevel, QuestionCategory } from '../types'

const CATEGORY_OPTIONS: { value: QuestionCategory; label: string }[] = [
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'android-sdk', label: 'Android SDK' },
  { value: 'ui-ux', label: 'UI/UX' },
  { value: 'architecture', label: 'Архитектура' },
  { value: 'jetpack', label: 'Jetpack' },
  { value: 'dependency-injection', label: 'DI (Hilt/Dagger)' },
  { value: 'networking', label: 'Сеть (Retrofit/OkHttp)' },
  { value: 'databases', label: 'Базы данных (Room)' },
  { value: 'performance', label: 'Производительность' },
  { value: 'multithreading', label: 'Многопоточность (Coroutines)' },
  { value: 'security', label: 'Безопасность' },
  { value: 'testing', label: 'Тестирование' },
  { value: 'ci-cd', label: 'CI/CD' },
  { value: 'system', label: 'Системные вопросы' },
  { value: 'behavioral', label: 'Поведенческие вопросы' },
  { value: 'publishing', label: 'Публикация (Google Play)' },
]

const ManageQuestionsPage: React.FC = () => {
  const { questions, deleteQuestion, updateQuestion } = useAppStore()
  
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '' })
  
  const [editForm, setEditForm] = useState({
    question: '',
    answer: '',
    detailedAnswer: '',
    codeExample: '',
    level: 'junior' as QuestionLevel,
    category: 'android-sdk' as QuestionCategory
  })

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

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, question: Question) => {
    setAnchorEl(event.currentTarget)
    setSelectedQuestion(question)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedQuestion(null)
  }

  const handleEdit = () => {
    if (selectedQuestion) {
      setEditForm({
        question: selectedQuestion.question,
        answer: selectedQuestion.answer,
        detailedAnswer: selectedQuestion.detailedAnswer || '',
        codeExample: selectedQuestion.codeExample || '',
        level: selectedQuestion.level,
        category: selectedQuestion.category
      })
      setShowEditDialog(true)
    }
    setAnchorEl(null) // закрываем меню без сброса selectedQuestion
  }

  const handleDelete = () => {
    setShowDeleteDialog(true)
    setAnchorEl(null) // закрываем меню, selectedQuestion сохраняем
  }

  const confirmDelete = () => {
    if (selectedQuestion) {
      try {
        deleteQuestion(selectedQuestion.id)
        setSnackbar({ open: true, message: 'Вопрос удалён!' })
      } catch {
        setSnackbar({ open: true, message: 'Ошибка при удалении вопроса' })
      }
    }
    setShowDeleteDialog(false)
    setSelectedQuestion(null)
  }

  const handleSaveEdit = () => {
    if (selectedQuestion) {
      updateQuestion(selectedQuestion.id, {
        question: editForm.question.trim(),
        answer: editForm.answer.trim(),
        detailedAnswer: editForm.detailedAnswer.trim() || undefined,
        codeExample: editForm.codeExample.trim() || undefined,
        level: editForm.level,
        category: editForm.category.trim() as QuestionCategory
      })
      setSnackbar({ open: true, message: 'Вопрос обновлен!' })
    }
    setShowEditDialog(false)
    setSelectedQuestion(null)
  }

  const getQuestionStats = (question: Question) => {
    return {
      studied: question.studied ? 'Изучен' : 'Не изучен',
      correct: question.correct,
      incorrect: question.incorrect,
      total: question.correct + question.incorrect
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Заголовок */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Управление вопросами
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Просматривайте, редактируйте и удаляйте вопросы ({questions.length} всего)
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => useAppStore.getState().loadQuestions()}
            sx={{ minWidth: 120 }}
          >
            Обновить
          </Button>
        </Box>
      </motion.div>

      {/* Список вопросов */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        {questions.length === 0 ? (
          <Card sx={{ borderRadius: 3, boxShadow: 3, textAlign: 'center', p: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Вопросы не найдены
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Добавьте первый вопрос в настройках
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {questions.map((question, index) => {
              const stats = getQuestionStats(question)
              
              return (
                <Grid item xs={12} key={question.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box sx={{ flex: 1 }}>
                            {/* Заголовок и метки */}
                            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
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
                              <Chip
                                label={stats.studied}
                                size="small"
                                color={question.studied ? 'success' : 'default'}
                                variant="outlined"
                              />
                            </Box>

                            {/* Текст вопроса */}
                            <Typography variant="h6" component="h3" gutterBottom sx={{ mb: 2 }}>
                              {question.question}
                            </Typography>

                            {/* Краткий ответ */}
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {question.answer}
                            </Typography>

                            {/* Статистика */}
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                              <Typography variant="caption" color="text.secondary">
                                Правильных: {stats.correct}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Неправильных: {stats.incorrect}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Всего ответов: {stats.total}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Меню действий */}
                          <IconButton
                            onClick={(e) => handleMenuClick(e, question)}
                            sx={{ ml: 2 }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              )
            })}
          </Grid>
        )}
      </motion.div>

      {/* Меню действий */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Редактировать</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Удалить</ListItemText>
        </MenuItem>
      </Menu>

      {/* Диалог редактирования */}
      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Редактировать вопрос</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Вопрос *"
                value={editForm.question}
                onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Краткий ответ *"
                value={editForm.answer}
                onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Расширенный ответ"
                value={editForm.detailedAnswer}
                onChange={(e) => setEditForm({ ...editForm, detailedAnswer: e.target.value })}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Код с комментариями"
                value={editForm.codeExample}
                onChange={(e) => setEditForm({ ...editForm, codeExample: e.target.value })}
                fullWidth
                multiline
                rows={4}
                placeholder="class Example { ... }"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                id="edit-question-level"
                label="Уровень"
                value={editForm.level}
                onChange={(e) => setEditForm({ ...editForm, level: e.target.value as QuestionLevel })}
                fullWidth
                SelectProps={{ native: true, inputProps: { id: 'edit-question-level', name: 'level' } }}
              >
                <option value="junior">Junior</option>
                <option value="middle">Middle</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
                <option value="architect">Architect</option>
                <option value="expert">Expert</option>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Категория</InputLabel>
                <Select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value as QuestionCategory })}
                  label="Категория"
                >
                  {CATEGORY_OPTIONS.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Отмена</Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить этот вопрос? Это действие нельзя отменить.
          </Typography>
          {selectedQuestion && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2" fontWeight="bold">
                Вопрос:
              </Typography>
              <Typography variant="body2">
                {selectedQuestion.question}
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>
            Отмена
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Удалить
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

export default ManageQuestionsPage
