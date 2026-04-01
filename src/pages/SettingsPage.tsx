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
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Divider,
  Paper,
  Stack,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { motion } from 'framer-motion'
import { useAppStore } from '../store'
import { QuestionLevel, FontScale } from '../types'

const DARK_ONLY_GRADIENTS = ['black', 'dark-blue', 'dark-gray']

const LEVEL_COLORS: Record<QuestionLevel, string> = {
  junior: '#10b981',
  middle: '#3b82f6',
  senior: '#8b5cf6',
  lead: '#f59e0b',
  architect: '#ef4444',
  expert: '#6366f1',
}

type SectionProps = {
  icon: string
  title: string
  subtitle: string
  delay?: number
  children: React.ReactNode
}

const SettingsSectionCard: React.FC<SectionProps> = ({ icon, title, subtitle, delay = 0, children }) => {
  const theme = useTheme()
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.2 : 0.12)}`,
          bgcolor:
            theme.palette.mode === 'dark'
              ? alpha(theme.palette.background.paper, 0.45)
              : alpha(theme.palette.background.paper, 0.92),
          backdropFilter: 'blur(14px)',
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 12px 40px rgba(0,0,0,0.35)'
              : '0 8px 32px rgba(15, 23, 42, 0.06)',
        }}
      >
        <Box
          sx={{
            height: 3,
            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.secondary.main, 0.85)} 55%, ${alpha(theme.palette.info?.main ?? theme.palette.primary.light, 0.6)} 100%)`,
          }}
        />
        <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2.5, alignItems: 'flex-start' }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 2.5,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.45rem',
                background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.06)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.12)}`,
              }}
            >
              {icon}
            </Box>
            <Box sx={{ minWidth: 0, pt: 0.25 }}>
              <Typography variant="h6" fontWeight={800} sx={{ fontSize: '1.05rem', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35, lineHeight: 1.45, fontSize: '0.8125rem' }}>
                {subtitle}
              </Typography>
            </Box>
          </Box>
          {children}
        </CardContent>
      </Card>
    </motion.div>
  )
}

const SettingsPage: React.FC = () => {
  const theme = useTheme()
  const { settings, updateSettings, questions } = useAppStore()
  const [snackbar, setSnackbar] = useState({ open: false, message: '' })

  useEffect(() => {
    if (settings.theme === 'light' && DARK_ONLY_GRADIENTS.includes(settings.backgroundGradient)) {
      updateSettings({ backgroundGradient: 'blue' })
    }
  }, [settings.theme, settings.backgroundGradient]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    updateSettings({
      ...settings,
      theme: newTheme,
      backgroundGradient: newTheme === 'dark' ? 'black' : 'blue',
    })
  }

  const handleReminderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ ...settings, studyReminders: event.target.checked })
  }

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ ...settings, reminderTime: event.target.value })
  }

  const handleGradientChange = (event: { target: { value: string } }) => {
    updateSettings({ ...settings, backgroundGradient: event.target.value as typeof settings.backgroundGradient })
  }

  const getLevelStats = () => {
    const stats: Record<QuestionLevel, number> = {
      junior: 0,
      middle: 0,
      senior: 0,
      lead: 0,
      architect: 0,
      expert: 0,
    }
    questions.forEach(q => {
      stats[q.level]++
    })
    return stats
  }

  const levelStats = getLevelStats()

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2.5, sm: 4 }, pb: { xs: 10, sm: 6 } }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3 },
            mb: 3,
            borderRadius: 3,
            overflow: 'hidden',
            position: 'relative',
            background: `linear-gradient(125deg, ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.12)} 0%, ${alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.14 : 0.08)} 50%, ${alpha(theme.palette.primary.main, 0.04)} 100%)`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            fontWeight={800}
            sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' }, letterSpacing: '-0.03em' }}
          >
            Настройки
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 480, lineHeight: 1.55 }}>
            Тема, чтение и напоминания — всё в одном месте. Изменения сохраняются на этом устройстве.
          </Typography>
        </Paper>
      </motion.div>

      <Stack spacing={2.5}>
        <SettingsSectionCard
          icon="🎨"
          title="Внешний вид"
          subtitle="Тема интерфейса и фон приложения"
          delay={0.05}
        >
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1, letterSpacing: '0.06em' }}>
            ТЕМА
          </Typography>
          <ToggleButtonGroup
            value={settings.theme}
            exclusive
            onChange={(_, val) => val && handleThemeChange(val)}
            size="small"
            fullWidth
            sx={{
              mb: 2.5,
              display: 'flex',
              gap: { xs: 0.75, sm: 1 },
              '& .MuiToggleButtonGroup-grouped': {
                margin: '0 !important',
                borderRadius: '10px !important',
              },
              '& .MuiToggleButton-root': {
                flex: 1,
                py: 1,
                fontWeight: 600,
                fontSize: '0.8rem',
                borderRadius: '10px !important',
                border: `1px solid ${alpha(theme.palette.divider, 0.5)} !important`,
              },
            }}
          >
            <ToggleButton value="light">☀️ Светлая</ToggleButton>
            <ToggleButton value="dark">🌙 Тёмная</ToggleButton>
            <ToggleButton value="auto">🖥️ Авто</ToggleButton>
          </ToggleButtonGroup>

          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1, letterSpacing: '0.06em' }}>
            ФОН
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel>Градиент фона</InputLabel>
            <Select value={settings.backgroundGradient} onChange={handleGradientChange} label="Градиент фона">
              <MenuItem value="blue">🔵 Синий</MenuItem>
              <MenuItem value="orange">🟠 Оранжевый</MenuItem>
              <MenuItem value="purple">🟣 Фиолетовый</MenuItem>
              <MenuItem value="green">🟢 Зелёный</MenuItem>
              <MenuItem value="black" disabled={settings.theme === 'light'}>
                ⚫ Чёрный (тёмная тема)
              </MenuItem>
              <MenuItem value="dark-blue" disabled={settings.theme === 'light'}>
                🔵 Тёмно-синий
              </MenuItem>
              <MenuItem value="dark-gray" disabled={settings.theme === 'light'}>
                ◼ Тёмно-серый
              </MenuItem>
              <MenuItem value="random">🎲 Случайный</MenuItem>
            </Select>
          </FormControl>
        </SettingsSectionCard>

        <SettingsSectionCard
          icon="🎯"
          title="Цель и доступность"
          subtitle="Ежедневная цель на главной и комфорт чтения"
          delay={0.1}
        >
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1, letterSpacing: '0.06em' }}>
            КАРТОЧЕК ЗА СЕГОДНЯ
          </Typography>
          <Slider
            value={settings.dailyGoal ?? 10}
            onChange={(_, v) => updateSettings({ dailyGoal: v as number })}
            min={5}
            max={50}
            step={5}
            marks
            valueLabelDisplay="auto"
            sx={{
              mb: 2,
              '& .MuiSlider-thumb': { width: 18, height: 18 },
            }}
          />

          <Divider sx={{ my: 2, borderColor: alpha(theme.palette.divider, 0.6) }} />

          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1, letterSpacing: '0.06em' }}>
            РАЗМЕР ТЕКСТА
          </Typography>
          <ToggleButtonGroup
            value={settings.fontScale ?? 'normal'}
            exclusive
            size="small"
            fullWidth
            onChange={(_, val) => val && updateSettings({ fontScale: val as FontScale })}
            sx={{
              mb: 2,
              '& .MuiToggleButton-root': { flex: 1, py: 0.9, fontWeight: 600, fontSize: '0.78rem' },
            }}
          >
            <ToggleButton value="normal">Обычный</ToggleButton>
            <ToggleButton value="large">Крупный</ToggleButton>
            <ToggleButton value="xlarge">Очень крупный</ToggleButton>
          </ToggleButtonGroup>

          <Stack spacing={0.5}>
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                borderRadius: 2,
                borderColor: alpha(theme.palette.divider, 0.5),
                bgcolor: alpha(theme.palette.action.hover, 0.35),
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={!!settings.highContrast}
                    onChange={e => updateSettings({ highContrast: e.target.checked })}
                    color="primary"
                  />
                }
                label={<Typography variant="body2">Повышенный контраст</Typography>}
                sx={{ m: 0, width: '100%', justifyContent: 'space-between' }}
              />
            </Paper>
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                borderRadius: 2,
                borderColor: alpha(theme.palette.divider, 0.5),
                bgcolor: alpha(theme.palette.action.hover, 0.35),
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={!!settings.analyticsConsent}
                    onChange={e => updateSettings({ analyticsConsent: e.target.checked })}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2">Анонимная аналитика</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Plausible, если задан VITE_PLAUSIBLE_DOMAIN
                    </Typography>
                  </Box>
                }
                sx={{ m: 0, alignItems: 'flex-start', width: '100%' }}
              />
            </Paper>
          </Stack>
        </SettingsSectionCard>

        <SettingsSectionCard icon="🔔" title="Уведомления" subtitle="Напоминания о занятиях" delay={0.14}>
          <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              borderRadius: 2,
              borderColor: alpha(theme.palette.divider, 0.5),
              bgcolor: alpha(theme.palette.action.hover, 0.35),
            }}
          >
            <FormControlLabel
              control={
                <Switch checked={settings.studyReminders} onChange={handleReminderChange} color="primary" />
              }
              label={<Typography variant="body2">Напоминания об изучении</Typography>}
              sx={{ m: 0, width: '100%', justifyContent: 'space-between' }}
            />
          </Paper>
          {settings.studyReminders && (
            <TextField
              type="time"
              label="Время"
              value={settings.reminderTime}
              onChange={handleTimeChange}
              fullWidth
              size="small"
              sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }}
            />
          )}
        </SettingsSectionCard>

        <SettingsSectionCard icon="📊" title="Каталог" subtitle="Распределение вопросов по уровням" delay={0.18}>
          <Grid container spacing={1.25}>
            {(Object.entries(levelStats) as [QuestionLevel, number][]).map(([level, count]) => (
              <Grid item xs={6} sm={4} key={level}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${alpha(LEVEL_COLORS[level], 0.22)} 0%, ${alpha(LEVEL_COLORS[level], 0.06)} 100%)`,
                    border: `1px solid ${alpha(LEVEL_COLORS[level], 0.35)}`,
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'capitalize', fontSize: '0.65rem' }}>
                    {level}
                  </Typography>
                  <Typography variant="h6" fontWeight={800} sx={{ color: LEVEL_COLORS[level], mt: 0.25 }}>
                    {count}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center', fontWeight: 500 }}>
            Всего вопросов: <strong>{questions.length}</strong>
          </Typography>
        </SettingsSectionCard>
      </Stack>

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
