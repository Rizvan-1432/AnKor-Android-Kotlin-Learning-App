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
  Snackbar,
  Chip,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material'
import { motion } from 'framer-motion'
import { useAppStore } from '../store'
import { QuestionLevel } from '../types'

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
  const { settings, updateSettings, questions } = useAppStore()
  const [snackbar, setSnackbar] = useState({ open: false, message: '' })

  // Если сохранён тёмный градиент, но тема светлая — сбросить на blue
  useEffect(() => {
    if (settings.theme === 'light' && DARK_ONLY_GRADIENTS.includes(settings.backgroundGradient)) {
      updateSettings({ backgroundGradient: 'blue' })
    }
  }, [settings.theme, settings.backgroundGradient]) // eslint-disable-line react-hooks/exhaustive-deps

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

      </Grid>

      {/* Экспорт / Импорт / Сброс */}

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
