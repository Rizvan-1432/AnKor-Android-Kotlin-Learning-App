import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Box, Typography, Card, CardContent, Button, TextField, Select,
  MenuItem, FormControl, InputLabel, Chip, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, Alert, Tooltip,
  CircularProgress, InputAdornment, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SearchIcon from '@mui/icons-material/Search'
import { motion } from 'framer-motion'
import { useAdminStore } from '../store'
import { LEVEL_OPTIONS, CATEGORY_OPTIONS, LEVEL_COLORS, QuestionLevel, QuestionCategory } from '../types'

const QuestionsPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { questions, loadQuestions, deleteQuestion, loading, error } = useAdminStore()

  const [search, setSearch] = useState('')
  const [filterLevel, setFilterLevel] = useState<QuestionLevel | ''>((searchParams.get('level') as QuestionLevel) || '')
  const [filterCategory, setFilterCategory] = useState<QuestionCategory | ''>((searchParams.get('category') as QuestionCategory) || '')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [snackMsg, setSnackMsg] = useState('')

  useEffect(() => { loadQuestions() }, [])

  const filtered = questions.filter(q => {
    const matchSearch = !search || q.question.toLowerCase().includes(search.toLowerCase()) || q.answer.toLowerCase().includes(search.toLowerCase())
    const matchLevel = !filterLevel || q.level === filterLevel
    const matchCat = !filterCategory || q.category === filterCategory
    return matchSearch && matchLevel && matchCat
  })

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteQuestion(deleteId)
    setDeleteId(null)
    setSnackMsg('Вопрос удалён')
    setTimeout(() => setSnackMsg(''), 3000)
  }

  const getCategoryLabel = (cat: string) => CATEGORY_OPTIONS.find(c => c.value === cat)?.label ?? cat

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        {/* Заголовок */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">Вопросы</Typography>
            <Typography color="text.secondary" variant="body2">{filtered.length} из {questions.length}</Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/questions/new')}
            sx={{ borderRadius: 2, fontWeight: 'bold' }}>
            Добавить
          </Button>
        </Box>

        {snackMsg && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{snackMsg}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        {/* Фильтры */}
        <Card sx={{ borderRadius: 3, mb: 3 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                placeholder="Поиск по тексту..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                size="small"
                sx={{ flex: 1, minWidth: 200 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
              />
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Уровень</InputLabel>
                <Select value={filterLevel} onChange={e => setFilterLevel(e.target.value as any)} label="Уровень">
                  <MenuItem value="">Все</MenuItem>
                  {LEVEL_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Категория</InputLabel>
                <Select value={filterCategory} onChange={e => setFilterCategory(e.target.value as any)} label="Категория">
                  <MenuItem value="">Все</MenuItem>
                  {CATEGORY_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </Select>
              </FormControl>
              {(search || filterLevel || filterCategory) && (
                <Button size="small" onClick={() => { setSearch(''); setFilterLevel(''); setFilterCategory('') }}>
                  Сбросить
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Таблица */}
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>Вопрос</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Уровень</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Категория</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">✅/❌</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      Вопросы не найдены
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map(q => (
                    <TableRow key={q.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{
                          overflow: 'hidden', textOverflow: 'ellipsis',
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                          lineHeight: 1.4, maxWidth: 400,
                        }}>
                          {q.question}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={q.level} size="small"
                          sx={{ bgcolor: `${LEVEL_COLORS[q.level as QuestionLevel]}22`, color: LEVEL_COLORS[q.level as QuestionLevel], fontWeight: 'bold', height: 20, fontSize: '0.68rem' }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">{getCategoryLabel(q.category)}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="caption" color="text.secondary">{q.correct}/{q.incorrect}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Редактировать">
                          <IconButton size="small" onClick={() => navigate(`/questions/${q.id}/edit`)} color="primary">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Удалить">
                          <IconButton size="small" onClick={() => setDeleteId(q.id)} color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </motion.div>

      {/* Диалог удаления */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Удалить вопрос?</DialogTitle>
        <DialogContent>
          <Alert severity="warning">Это действие нельзя отменить.</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Отмена</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Удалить</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default QuestionsPage
