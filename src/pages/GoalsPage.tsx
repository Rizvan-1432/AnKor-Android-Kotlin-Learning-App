import React, { useState } from 'react'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Chip,
  LinearProgress,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  useTheme
} from '@mui/material'
import { motion } from 'framer-motion'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { useAppStore } from '../store'
import { Goal } from '../types'

const GoalsPage: React.FC = () => {
  const theme = useTheme()
  const { goals, addGoal, updateGoal, deleteGoal, questions, stats } = useAppStore()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '' })
  
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetCount: 10,
    type: 'questions' as 'questions' | 'correct' | 'studied'
  })

  const handleAddGoal = () => {
    if (!newGoal.title.trim()) {
      setSnackbar({ open: true, message: 'Введите название цели' })
      return
    }

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title.trim(),
      description: newGoal.description.trim(),
      target: newGoal.targetCount,
      targetCount: newGoal.targetCount,
      current: 0,
      currentCount: 0,
      type: newGoal.type,
      completed: false,
      createdAt: new Date().toISOString()
    }

    addGoal(goal)
    setSnackbar({ open: true, message: 'Цель успешно добавлена!' })
    setNewGoal({ title: '', description: '', targetCount: 10, type: 'questions' })
    setShowAddDialog(false)
  }

  const handleUpdateGoal = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return

    let currentCount = 0
    switch (goal.type) {
      case 'questions':
        currentCount = questions.length
        break
      case 'studied':
        currentCount = questions.filter(q => q.studied).length
        break
      case 'correct':
        currentCount = questions.reduce((sum, q) => sum + q.correct, 0)
        break
    }

    const targetVal = goal.targetCount ?? goal.target
    const isCompleted = currentCount >= targetVal
    updateGoal(goalId, { currentCount, current: currentCount, completed: isCompleted })
  }

  const handleDeleteGoal = (goalId: string) => {
    deleteGoal(goalId)
    setSnackbar({ open: true, message: 'Цель удалена' })
  }

  const getGoalProgress = (goal: Goal) => {
    let currentCount = 0
    switch (goal.type) {
      case 'questions':
        currentCount = questions.length
        break
      case 'studied':
        currentCount = questions.filter(q => q.studied).length
        break
      case 'correct':
        currentCount = questions.reduce((sum, q) => sum + q.correct, 0)
        break
    }

    const targetVal = goal.targetCount ?? goal.target
    const progress = Math.min((currentCount / targetVal) * 100, 100)
    return { currentCount, progress }
  }

  const getGoalTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      questions: 'Вопросов добавлено',
      studied: 'Вопросов изучено',
      correct: 'Правильных ответов'
    }
    return labels[type] || type
  }

  const getGoalTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      questions: 'primary',
      studied: 'success',
      correct: 'info'
    }
    return colors[type] || 'default'
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Заголовок */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
            borderRadius: 3,
            p: { xs: 2, sm: 3 },
            mb: 3,
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 2,
          }}
        >
          <Box>
            <Typography
              component="h1"
              fontWeight="bold"
              sx={{ fontSize: { xs: '1.3rem', sm: '1.8rem' }, lineHeight: 1.2, mb: 0.5 }}
            >
              🎯 Цели и достижения
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, fontSize: { xs: '0.78rem', sm: '0.9rem' } }}>
              Ставьте цели и отслеживайте прогресс
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowAddDialog(true)}
            sx={{
              whiteSpace: 'nowrap',
              flexShrink: 0,
              backgroundColor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              fontWeight: 'bold',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
            }}
          >
            Добавить цель
          </Button>
        </Box>
      </motion.div>

      {/* Текущие цели */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 'bold' }}>
          Текущие цели
        </Typography>
        
        {goals.length === 0 ? (
          <Card sx={{ borderRadius: 3, boxShadow: 3, textAlign: 'center', p: { xs: 3, sm: 4 } }}>
            <Typography variant="h2" sx={{ mb: 1 }}>🎯</Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              У вас пока нет целей
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Добавьте первую цель, чтобы отслеживать прогресс
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowAddDialog(true)}
              color="success"
            >
              Добавить цель
            </Button>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {goals.map((goal, index) => {
              const { currentCount, progress } = getGoalProgress(goal)
              
              return (
                <Grid item xs={12} md={6} key={goal.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <Card sx={{ borderRadius: 3, boxShadow: 3, height: '100%' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" gutterBottom>
                              {goal.title}
                            </Typography>
                            {goal.description && (
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {goal.description}
                              </Typography>
                            )}
                          </Box>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteGoal(goal.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Chip
                              label={getGoalTypeLabel(goal.type)}
                              size="small"
                              color={getGoalTypeColor(goal.type) as any}
                              variant="outlined"
                            />
                            <Typography variant="body2" fontWeight="bold">
                              {currentCount}/{goal.targetCount ?? goal.target}
                            </Typography>
                          </Box>
                          
                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: 'rgba(0,0,0,0.1)',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: goal.completed ? '#4caf50' : '#3b82f6',
                                borderRadius: 4
                              }
                            }}
                          />
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {Math.round(progress)}% выполнено
                            </Typography>
                            {goal.completed && (
                              <Chip
                                label="Выполнено! 🎉"
                                size="small"
                                color="success"
                                sx={{ fontWeight: 'bold' }}
                              />
                            )}
                          </Box>
                        </Box>

                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleUpdateGoal(goal.id)}
                          fullWidth
                        >
                          Обновить прогресс
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              )
            })}
          </Grid>
        )}
      </motion.div>

      {/* Диалог добавления цели */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Добавить новую цель</DialogTitle>
        <DialogContent>
          <TextField
            label="Название цели *"
            value={newGoal.title}
            onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
            fullWidth
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            label="Описание"
            value={newGoal.description}
            onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
            fullWidth
            multiline
            rows={2}
            sx={{ mb: 2 }}
          />
          <TextField
            select
            id="goal-type-select"
            label="Тип цели"
            value={newGoal.type}
            onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value as any })}
            fullWidth
            sx={{ mb: 2 }}
            SelectProps={{ native: true, inputProps: { id: 'goal-type-select', name: 'goal-type' } }}
          >
            <option value="questions">Вопросов добавлено</option>
            <option value="studied">Вопросов изучено</option>
            <option value="correct">Правильных ответов</option>
          </TextField>
          <TextField
            label="Целевое количество"
            type="number"
            value={newGoal.targetCount}
            onChange={(e) => setNewGoal({ ...newGoal, targetCount: parseInt(e.target.value) || 0 })}
            fullWidth
            inputProps={{ min: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>Отмена</Button>
          <Button onClick={handleAddGoal} variant="contained">
            Добавить
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

export default GoalsPage
