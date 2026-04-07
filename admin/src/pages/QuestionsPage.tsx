import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import {
  Box, Typography, Card, CardContent, Button, TextField, Select,
  MenuItem, FormControl, InputLabel, Chip, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, Alert, Tooltip,
  CircularProgress, InputAdornment, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Checkbox, Menu
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SearchIcon from '@mui/icons-material/Search'
import TuneIcon from '@mui/icons-material/Tune'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { motion } from 'framer-motion'
import { useAdminStore } from '../store'
import { ANDROID_CATEGORY_SET, FRONTEND_CATEGORY_SET } from '../constants/tracks'
import { DIRECTIONS_HUB } from '../constants/directionsHub'
import { LEVEL_OPTIONS, CATEGORY_OPTIONS, LEVEL_COLORS, QuestionLevel, QuestionCategory, Question } from '../types'

type TrackMode = 'android' | 'frontend' | null

const QuestionsPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { questions, loadQuestions, deleteQuestion, batchUpdateQuestions, bulkDeleteQuestions, loading, error } = useAdminStore()

  const trackMode: TrackMode = useMemo(() => {
    if (location.pathname.endsWith('/questions/android')) return 'android'
    if (location.pathname.endsWith('/questions/frontend')) return 'frontend'
    return null
  }, [location.pathname])

  const pathNoTrail = location.pathname.replace(/\/$/, '') || '/'
  const showDirectionsHub = trackMode === null && pathNoTrail === '/questions'

  const [search, setSearch] = useState('')
  const [filterLevel, setFilterLevel] = useState<QuestionLevel | ''>((searchParams.get('level') as QuestionLevel) || '')
  const [filterCategory, setFilterCategory] = useState<QuestionCategory | ''>((searchParams.get('category') as QuestionCategory) || '')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[] | null>(null)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [snackMsg, setSnackMsg] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [batchMenu, setBatchMenu] = useState<null | 'level' | 'category'>(null)
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  /** Ключи категорий с развёрнутым списком вопросов (по умолчанию все свёрнуты) */
  const [expandedCategoryKeys, setExpandedCategoryKeys] = useState<Set<string>>(() => new Set())

  useEffect(() => { loadQuestions() }, [])

  const categoryOptionsForTrack = useMemo(() => {
    if (trackMode === 'android') return CATEGORY_OPTIONS.filter(c => ANDROID_CATEGORY_SET.has(c.value))
    if (trackMode === 'frontend') return CATEGORY_OPTIONS.filter(c => FRONTEND_CATEGORY_SET.has(c.value))
    return CATEGORY_OPTIONS
  }, [trackMode])

  const trackFilteredQuestions = useMemo(() => {
    if (trackMode === 'android') return questions.filter(q => ANDROID_CATEGORY_SET.has(q.category))
    if (trackMode === 'frontend') return questions.filter(q => FRONTEND_CATEGORY_SET.has(q.category))
    return questions
  }, [questions, trackMode])

  const androidHubCount = useMemo(
    () => questions.filter(q => ANDROID_CATEGORY_SET.has(q.category)).length,
    [questions]
  )
  const frontendHubCount = useMemo(
    () => questions.filter(q => FRONTEND_CATEGORY_SET.has(q.category)).length,
    [questions]
  )

  useEffect(() => {
    if (!filterCategory) return
    if (trackMode === 'android' && !ANDROID_CATEGORY_SET.has(filterCategory)) setFilterCategory('')
    if (trackMode === 'frontend' && !FRONTEND_CATEGORY_SET.has(filterCategory)) setFilterCategory('')
  }, [trackMode, filterCategory])

  const filtered = trackFilteredQuestions.filter(q => {
    const matchSearch = !search || q.question.toLowerCase().includes(search.toLowerCase()) || q.answer.toLowerCase().includes(search.toLowerCase())
    const matchLevel = !filterLevel || q.level === filterLevel
    const matchCat = !filterCategory || q.category === filterCategory
    return matchSearch && matchLevel && matchCat
  })

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteQuestion(deleteId)
      setDeleteId(null)
      setSelected(s => s.filter(id => id !== deleteId))
      setSnackMsg('Вопрос удалён')
      setTimeout(() => setSnackMsg(''), 3000)
    } catch {
      setSnackMsg('Не удалось удалить вопрос')
      setTimeout(() => setSnackMsg(''), 4000)
    }
  }

  const openBulkDeleteDialog = () => {
    if (selected.length === 0) return
    setBulkDeleteIds([...selected])
  }

  const handleBulkDelete = async () => {
    if (!bulkDeleteIds?.length) return
    setBulkDeleting(true)
    try {
      const n = await bulkDeleteQuestions(bulkDeleteIds)
      setBulkDeleteIds(null)
      setSelected([])
      setSnackMsg(`Удалено вопросов: ${n}`)
      setTimeout(() => setSnackMsg(''), 3000)
    } catch {
      setSnackMsg('Не удалось выполнить массовое удаление')
      setTimeout(() => setSnackMsg(''), 4000)
    } finally {
      setBulkDeleting(false)
    }
  }

  const questionToDelete = deleteId ? questions.find(q => q.id === deleteId) : undefined

  const getCategoryLabel = (cat: string) => CATEGORY_OPTIONS.find(c => c.value === cat)?.label ?? cat

  /**
   * Все категории из справочника для текущего режима (все / Android / Frontend) — как в UI на скрине:
   * каждая строка-заголовок есть всегда, даже при 0 вопросов; порядок как в `CATEGORY_OPTIONS`.
   * Вопросы с неизвестной категорией добавляются в конец.
   */
  const groupedByCategory = useMemo(() => {
    const labelOf = (cat: string) => CATEGORY_OPTIONS.find(c => c.value === cat)?.label ?? cat

    const map = new Map<string, Question[]>()
    for (const q of filtered) {
      const key = q.category || 'unknown'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(q)
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    }

    const order = categoryOptionsForTrack.map(o => o.value)
    const seen = new Set<string>()
    const groups: { categoryKey: string; label: string; items: Question[] }[] = []

    for (const key of order) {
      seen.add(key)
      groups.push({
        categoryKey: key,
        label: labelOf(key),
        items: map.get(key) ?? [],
      })
    }

    const orphans = [...map.keys()].filter(k => !seen.has(k)).sort((a, b) =>
      labelOf(a).localeCompare(labelOf(b), 'ru')
    )
    for (const key of orphans) {
      groups.push({
        categoryKey: key,
        label: labelOf(key),
        items: map.get(key)!,
      })
    }

    return groups
  }, [filtered, categoryOptionsForTrack])

  const filteredIds = filtered.map(q => q.id)
  const allSelected = filteredIds.length > 0 && filteredIds.every(id => selected.includes(id))
  const toggleAll = () => {
    if (allSelected) {
      setSelected(s => s.filter(id => !filteredIds.includes(id)))
    } else {
      setSelected(s => [...new Set([...s, ...filteredIds])])
    }
  }
  const toggleOne = (id: string) => {
    setSelected(s => (s.includes(id) ? s.filter(x => x !== id) : [...s, id]))
  }

  const toggleCategoryGroup = (categoryKey: string) => {
    setExpandedCategoryKeys(prev => {
      const next = new Set(prev)
      if (next.has(categoryKey)) next.delete(categoryKey)
      else next.add(categoryKey)
      return next
    })
  }

  const runBatchLevel = async (lvl: QuestionLevel) => {
    const n = selected.length
    await batchUpdateQuestions(selected, { level: lvl })
    setSelected([])
    setBatchMenu(null)
    setMenuAnchor(null)
    setSnackMsg(`Уровень обновлён (${n})`)
    setTimeout(() => setSnackMsg(''), 3000)
  }
  const runBatchCategory = async (cat: QuestionCategory) => {
    const n = selected.length
    await batchUpdateQuestions(selected, { category: cat })
    setSelected([])
    setBatchMenu(null)
    setMenuAnchor(null)
    setSnackMsg(`Категория обновлена (${n})`)
    setTimeout(() => setSnackMsg(''), 3000)
  }

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        {/* Заголовок */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            {trackMode && (
              <Button
                size="small"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/questions')}
                sx={{ mb: 1, textTransform: 'none' }}
              >
                Все направления
              </Button>
            )}
            <Typography variant="h4" fontWeight="bold">
              {trackMode === 'android' && 'Вопросы — Android (SDK и др.)'}
              {trackMode === 'frontend' && 'Вопросы — Frontend'}
              {!trackMode && 'Вопросы'}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {filtered.length} из {trackMode ? trackFilteredQuestions.length : questions.length}
              {trackMode ? ` · всего в каталоге: ${questions.length}` : ''}
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/questions/new')}
            sx={{ borderRadius: 2, fontWeight: 'bold' }}>
            Добавить
          </Button>
        </Box>

        {snackMsg && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{snackMsg}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        {showDirectionsHub && (
          <Card
            elevation={0}
            sx={{ mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                Направления
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                  gap: 1.5,
                }}
              >
                {DIRECTIONS_HUB.map(d => {
                  const count =
                    d.id === 'android' ? androidHubCount : d.id === 'frontend' ? frontendHubCount : null
                  return (
                    <Paper
                      key={d.id}
                      variant="outlined"
                      onClick={() => !d.soon && d.adminPath && navigate(d.adminPath)}
                      sx={{
                        p: 1.75,
                        borderRadius: 2,
                        cursor: d.soon ? 'default' : 'pointer',
                        opacity: d.soon ? 0.75 : 1,
                        borderColor: d.soon ? 'divider' : `${d.color}44`,
                        transition: 'box-shadow 0.15s, background-color 0.15s',
                        ...(!d.soon && {
                          '&:hover': { bgcolor: 'action.hover', boxShadow: 2 },
                        }),
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
                        <Typography sx={{ fontSize: '1.75rem', lineHeight: 1 }} aria-hidden>
                          {d.icon}
                        </Typography>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ color: d.color }}>
                              {d.name}
                            </Typography>
                            {d.soon && (
                              <Chip label="Скоро" size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                            )}
                            {count !== null && (
                              <Chip
                                label={`${count} вопросов`}
                                size="small"
                                sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold' }}
                              />
                            )}
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.45, fontSize: '0.8rem' }}>
                            {d.description}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  )
                })}
              </Box>
            </CardContent>
          </Card>
        )}

        {!showDirectionsHub && selected.length > 0 && (
          <Card sx={{ borderRadius: 2, mb: 2, bgcolor: 'action.selected' }}>
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="body2" fontWeight="bold">Выбрано: {selected.length}</Typography>
                <Button
                  size="small"
                  startIcon={<TuneIcon />}
                  variant="outlined"
                  onClick={e => {
                    setMenuAnchor(e.currentTarget)
                    setBatchMenu('level')
                  }}
                >
                  Уровень
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={e => {
                    setMenuAnchor(e.currentTarget)
                    setBatchMenu('category')
                  }}
                >
                  Категория
                </Button>
                <Button
                  size="small"
                  color="error"
                  variant="contained"
                  startIcon={<DeleteIcon />}
                  onClick={openBulkDeleteDialog}
                >
                  Удалить выбранные
                </Button>
                <Button size="small" onClick={() => setSelected([])}>Снять выбор</Button>
              </Box>
              <Menu
                anchorEl={menuAnchor}
                open={batchMenu !== null}
                onClose={() => {
                  setBatchMenu(null)
                  setMenuAnchor(null)
                }}
              >
                {batchMenu === 'level' &&
                  LEVEL_OPTIONS.map(o => (
                    <MenuItem key={o.value} onClick={() => runBatchLevel(o.value)}>{o.label}</MenuItem>
                  ))}
                {batchMenu === 'category' &&
                  categoryOptionsForTrack.map(o => (
                    <MenuItem key={o.value} onClick={() => runBatchCategory(o.value)}>{o.label}</MenuItem>
                  ))}
              </Menu>
            </CardContent>
          </Card>
        )}

        {!showDirectionsHub && (
        <>
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
                  {categoryOptionsForTrack.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
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
                  <TableCell padding="checkbox" sx={{ width: 48 }}>
                    <Checkbox
                      size="small"
                      indeterminate={selected.length > 0 && !allSelected}
                      checked={allSelected}
                      onChange={toggleAll}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>Вопрос</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Уровень</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Категория</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">✅/❌</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groupedByCategory.map(group => {
                    const expanded = expandedCategoryKeys.has(group.categoryKey)
                    return (
                    <React.Fragment key={group.categoryKey}>
                      <TableRow
                        sx={{
                          bgcolor: 'action.hover',
                          '& .MuiTableCell-root': { borderBottom: '1px solid', borderColor: 'divider' },
                        }}
                      >
                        <TableCell colSpan={6} sx={{ py: 1, px: 1 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              flexWrap: 'wrap',
                              cursor: 'pointer',
                              userSelect: 'none',
                              py: 0.25,
                            }}
                            onClick={() => toggleCategoryGroup(group.categoryKey)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={e => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                toggleCategoryGroup(group.categoryKey)
                              }
                            }}
                          >
                            <Tooltip title={expanded ? 'Свернуть вопросы' : 'Развернуть вопросы'}>
                              <IconButton
                                size="small"
                                aria-expanded={expanded}
                                aria-label={expanded ? 'Свернуть вопросы' : 'Развернуть вопросы'}
                                onClick={e => {
                                  e.stopPropagation()
                                  toggleCategoryGroup(group.categoryKey)
                                }}
                                sx={{
                                  p: 0.25,
                                  transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                                  transition: 'transform 0.2s ease',
                                }}
                              >
                                <ExpandMoreIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Typography variant="subtitle2" fontWeight="bold" color="primary">
                              {group.label}
                            </Typography>
                            <Chip
                              label={`${group.items.length} шт.`}
                              size="small"
                              sx={{ height: 22, fontSize: '0.7rem', fontWeight: 'bold' }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                              {group.categoryKey}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                      {expanded && group.items.map(q => (
                        <TableRow key={q.id} hover selected={selected.includes(q.id)}>
                          <TableCell padding="checkbox">
                            <Checkbox size="small" checked={selected.includes(q.id)} onChange={() => toggleOne(q.id)} />
                          </TableCell>
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
                      ))}
                    </React.Fragment>
                    )
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        </>
        )}
      </motion.div>

      {/* Диалог удаления одного */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Удалить вопрос?</DialogTitle>
        <DialogContent>
          {questionToDelete && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.5 }}>
              {questionToDelete.question.length > 220
                ? `${questionToDelete.question.slice(0, 220)}…`
                : questionToDelete.question}
            </Typography>
          )}
          <Alert severity="warning">Это действие нельзя отменить.</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Отмена</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог массового удаления */}
      <Dialog open={bulkDeleteIds !== null} onClose={() => !bulkDeleting && setBulkDeleteIds(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Удалить выбранные вопросы?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Будет удалено записей: <strong>{bulkDeleteIds?.length ?? 0}</strong>
          </Typography>
          <Alert severity="warning">Это действие нельзя отменить.</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDeleteIds(null)} disabled={bulkDeleting}>Отмена</Button>
          <Button
            onClick={handleBulkDelete}
            color="error"
            variant="contained"
            disabled={bulkDeleting}
            startIcon={bulkDeleting ? undefined : <DeleteIcon />}
          >
            {bulkDeleting ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={18} color="inherit" />
                Удаление…
              </Box>
            ) : (
              'Удалить все'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default QuestionsPage
