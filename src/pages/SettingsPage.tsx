import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Alert,
  Snackbar,
  Chip,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
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

const DARK_ONLY_GRADIENTS = ['black', 'dark-blue', 'dark-gray']

const SettingsPage: React.FC = () => {
  const navigate = useNavigate()
  const { settings, updateSettings, addQuestion, questions, exportData, importData, resetAllData } = useAppStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '' })

  // Если сохранён тёмный градиент, но тема светлая — сбросить на blue
  useEffect(() => {
    if (settings.theme === 'light' && DARK_ONLY_GRADIENTS.includes(settings.backgroundGradient)) {
      updateSettings({ backgroundGradient: 'blue' })
    }
  }, [settings.theme, settings.backgroundGradient]) // eslint-disable-line react-hooks/exhaustive-deps
  
  // Форма добавления вопроса
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    answer: '',
    detailedAnswer: '',
    codeExample: '',
    level: 'junior' as QuestionLevel,
    category: 'android-sdk' as QuestionCategory
  })

  const handleExport = () => {
    const json = exportData()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ankor-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setSnackbar({ open: true, message: 'Данные экспортированы!' })
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        importData(ev.target?.result as string)
        setSnackbar({ open: true, message: 'Данные успешно импортированы!' })
      } catch {
        setSnackbar({ open: true, message: 'Ошибка: неверный формат файла' })
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleResetAll = () => {
    resetAllData()
    setShowResetDialog(false)
    setSnackbar({ open: true, message: 'Все данные сброшены' })
  }

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    updateSettings({
      ...settings,
      theme: newTheme,
      backgroundGradient: newTheme === 'dark' ? 'black' : 'blue'
    })
  }

  const handleReminderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({
      ...settings,
      studyReminders: event.target.checked
    })
  }

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({
      ...settings,
      reminderTime: event.target.value
    })
  }

  const handleGradientChange = (event: any) => {
    updateSettings({
      ...settings,
      backgroundGradient: event.target.value
    })
  }

  const handleAddQuestion = () => {
    if (!newQuestion.question.trim() || !newQuestion.answer.trim()) {
      setSnackbar({ open: true, message: 'Заполните обязательные поля' })
      return
    }

    const question: Question = {
      id: Date.now().toString(),
      question: newQuestion.question.trim(),
      answer: newQuestion.answer.trim(),
      detailedAnswer: newQuestion.detailedAnswer.trim() || undefined,
      codeExample: newQuestion.codeExample.trim() || undefined,
      level: newQuestion.level,
      category: newQuestion.category,
      studied: false,
      correct: 0,
      incorrect: 0,
      answered: false,
      createdAt: new Date().toISOString()
    }

    addQuestion(question)
    setSnackbar({ open: true, message: 'Вопрос успешно добавлен!' })
    setNewQuestion({
      question: '',
      answer: '',
      detailedAnswer: '',
      codeExample: '',
      level: 'junior' as QuestionLevel,
      category: 'android-sdk' as QuestionCategory
    })
    setShowAddForm(false)
  }

  const getLevelStats = () => {
    const stats: Record<QuestionLevel, number> = {
      junior: 0,
      middle: 0,
      senior: 0,
      lead: 0,
      architect: 0,
      expert: 0
    }
    
    questions.forEach(q => {
      stats[q.level]++
    })
    
    return stats
  }

  const levelStats = getLevelStats()

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Заголовок */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Настройки
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Управление настройками приложения и добавление вопросов
        </Typography>
      </motion.div>

      <Grid container spacing={3}>
        {/* Основные настройки */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  🎨 Внешний вид
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Тема
                </Typography>
                <ToggleButtonGroup
                  value={settings.theme}
                  exclusive
                  onChange={(_, val) => val && handleThemeChange(val)}
                  size="small"
                  sx={{ mb: 2 }}
                >
                  <ToggleButton value="light">☀️ Светлая</ToggleButton>
                  <ToggleButton value="dark">🌙 Тёмная</ToggleButton>
                  <ToggleButton value="auto">🖥️ Системная</ToggleButton>
                </ToggleButtonGroup>
                
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Цвет фона</InputLabel>
                  <Select
                    value={settings.backgroundGradient}
                    onChange={handleGradientChange}
                    label="Цвет фона"
                  >
                    <MenuItem value="blue">🔵 Синий</MenuItem>
                    <MenuItem value="orange">🟠 Оранжевый</MenuItem>
                    <MenuItem value="purple">🟣 Фиолетовый</MenuItem>
                    <MenuItem value="green">🟢 Зеленый</MenuItem>
                    <MenuItem value="black" disabled={settings.theme === 'light'}>⚫ Черный (тёмная)</MenuItem>
                    <MenuItem value="dark-blue" disabled={settings.theme === 'light'}>🔵 Темно-синий (тёмная)</MenuItem>
                    <MenuItem value="dark-gray" disabled={settings.theme === 'light'}>⚫ Темно-серый (тёмная)</MenuItem>
                    <MenuItem value="random">🎲 Случайный</MenuItem>
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Card sx={{ mt: 3, borderRadius: 3, boxShadow: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  🔔 Уведомления
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.studyReminders}
                      onChange={handleReminderChange}
                      color="primary"
                    />
                  }
                  label="Напоминания об изучении"
                />
                {settings.studyReminders && (
                  <TextField
                    type="time"
                    label="Время напоминания"
                    value={settings.reminderTime}
                    onChange={handleTimeChange}
                    fullWidth
                    sx={{ mt: 2 }}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Статистика */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  📊 Статистика вопросов
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                  {Object.entries(levelStats).map(([level, count]) => (
                    <Chip
                      key={level}
                      label={`${level}: ${count}`}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  ))}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Всего вопросов: {questions.length}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Управление вопросами */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    ✏️ Управление вопросами
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/manage-questions')}
                    sx={{ minWidth: 200 }}
                  >
                    Управлять вопросами
                  </Button>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Просматривайте, редактируйте и удаляйте существующие вопросы
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Добавление вопроса */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    ➕ Добавить вопрос
                  </Typography>
                  <Button
                    variant={showAddForm ? "outlined" : "contained"}
                    onClick={() => setShowAddForm(!showAddForm)}
                  >
                    {showAddForm ? 'Скрыть форму' : 'Показать форму'}
                  </Button>
                </Box>

                {showAddForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          label="Вопрос *"
                          value={newQuestion.question}
                          onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                          fullWidth
                          multiline
                          rows={2}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Краткий ответ *"
                          value={newQuestion.answer}
                          onChange={(e) => setNewQuestion({ ...newQuestion, answer: e.target.value })}
                          fullWidth
                          multiline
                          rows={2}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Расширенный ответ"
                          value={newQuestion.detailedAnswer}
                          onChange={(e) => setNewQuestion({ ...newQuestion, detailedAnswer: e.target.value })}
                          fullWidth
                          multiline
                          rows={3}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Код с комментариями"
                          value={newQuestion.codeExample}
                          onChange={(e) => setNewQuestion({ ...newQuestion, codeExample: e.target.value })}
                          fullWidth
                          multiline
                          rows={4}
                          placeholder="class Example { ... }"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          select
                          id="add-question-level"
                          label="Уровень"
                          value={newQuestion.level}
                          onChange={(e) => setNewQuestion({ ...newQuestion, level: e.target.value as QuestionLevel })}
                          fullWidth
                          SelectProps={{ native: true, inputProps: { id: 'add-question-level', name: 'level' } }}
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
                            value={newQuestion.category}
                            onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value as QuestionCategory })}
                            label="Категория"
                          >
                            {CATEGORY_OPTIONS.map(opt => (
                              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                          <Button
                            variant="outlined"
                            onClick={() => setShowAddForm(false)}
                          >
                            Отмена
                          </Button>
                          <Button
                            variant="contained"
                            onClick={handleAddQuestion}
                          >
                            Добавить вопрос
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Экспорт / Импорт / Сброс */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  💾 Данные приложения
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Экспортируйте данные для резервной копии или перенесите их на другое устройство
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button variant="contained" color="primary" onClick={handleExport}>
                    ⬇️ Экспортировать
                  </Button>
                  <Button variant="outlined" color="primary" component="label" htmlFor="import-file-input">
                    ⬆️ Импортировать
                    <input
                      id="import-file-input"
                      name="import-file"
                      type="file"
                      accept=".json"
                      hidden
                      onChange={handleImport}
                    />
                  </Button>
                  <Button variant="outlined" color="error" onClick={() => setShowResetDialog(true)}>
                    🗑️ Сбросить все данные
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Диалог подтверждения полного сброса */}
      <Dialog open={showResetDialog} onClose={() => setShowResetDialog(false)}>
        <DialogTitle>Сбросить все данные?</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            Это действие удалит все вопросы, статистику, цели и настройки. Отменить нельзя.
          </Alert>
          <Typography>Рекомендуем сначала сделать экспорт данных.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResetDialog(false)}>Отмена</Button>
          <Button onClick={handleResetAll} color="error" variant="contained">Сбросить всё</Button>
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

export default SettingsPage
