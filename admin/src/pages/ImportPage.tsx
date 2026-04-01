import React, { useState } from 'react'
import {
  Box, Typography, Card, CardContent, Button, TextField,
  Alert, CircularProgress, Divider, Chip, List, ListItem, ListItemText
} from '@mui/material'
import UploadIcon from '@mui/icons-material/Upload'
import LinkIcon from '@mui/icons-material/Link'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DownloadIcon from '@mui/icons-material/Download'
import { motion } from 'framer-motion'
import { useAdminStore } from '../store'
import { Question } from '../types'

const EXAMPLE_CSV = `question,answer,detailedAnswer,codeExample,level,category
Что такое ViewModel?,ViewModel хранит UI-состояние при ротации,Подробное объяснение...,class MyVM : ViewModel() {},junior,jetpack
Что такое Coroutine?,Корутины — лёгкие потоки Kotlin,,fun main() = runBlocking {},middle,kotlin`

const ImportPage: React.FC = () => {
  const { bulkCreate, loadQuestions } = useAdminStore()

  const [sheetsUrl, setSheetsUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [exportBusy, setExportBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [preview, setPreview] = useState<Partial<Question>[]>([])

  const reset = () => { setError(''); setSuccess(''); setPreview([]) }

  // Импорт из JSON файла
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    reset()
    const reader = new FileReader()
    reader.onload = async ev => {
      try {
        const text = ev.target?.result as string
        let data: any[]

        if (file.name.endsWith('.csv')) {
          data = parseCsv(text)
        } else {
          data = JSON.parse(text)
          if (!Array.isArray(data)) throw new Error('JSON должен быть массивом')
        }

        setPreview(data.slice(0, 5))
        setLoading(true)
        const count = await bulkCreate(data)
        setSuccess(`✅ Импортировано ${count} вопросов!`)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка парсинга файла')
      } finally {
        setLoading(false)
        e.target.value = ''
      }
    }
    reader.readAsText(file)
  }

  const handleExportJson = async () => {
    setExportBusy(true)
    setError('')
    try {
      await loadQuestions()
      const rows = useAdminStore.getState().questions
      const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' })
      const a = document.createElement('a')
      const url = URL.createObjectURL(blob)
      a.href = url
      a.download = `ankor-export-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      setSuccess('Файл JSON скачан (резервная копия каталога)')
    } catch {
      setError('Не удалось выгрузить вопросы')
    } finally {
      setExportBusy(false)
    }
  }

  // Импорт из Google Sheets
  const handleSheetsImport = async () => {
    if (!sheetsUrl.trim()) return
    reset()
    setLoading(true)
    try {
      const res = await fetch(sheetsUrl)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (!Array.isArray(data)) throw new Error('Google Sheets вернул неверный формат')
      setPreview(data.slice(0, 5))
      const count = await bulkCreate(data)
      setSuccess(`✅ Импортировано ${count} вопросов из Google Sheets!`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка импорта из Google Sheets')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">Импорт вопросов</Typography>
            <Typography color="text.secondary" variant="body2">Загрузите вопросы из JSON, CSV или Google Sheets</Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={exportBusy ? <CircularProgress size={16} /> : <DownloadIcon />}
            disabled={exportBusy}
            onClick={handleExportJson}
            sx={{ borderRadius: 2 }}
          >
            Экспорт JSON (бэкап)
          </Button>
        </Box>

        {error   && <Alert severity="error"   sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}

        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { md: '1fr 1fr' } }}>
          {/* JSON / CSV файл */}
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>📁 JSON / CSV файл</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Загрузите файл с вопросами. Поддерживаются форматы JSON (массив) и CSV.
              </Typography>
              <Button
                component="label"
                variant="outlined"
                startIcon={loading ? <CircularProgress size={16} /> : <UploadIcon />}
                disabled={loading}
                fullWidth
                sx={{ py: 1.5, borderRadius: 2, borderStyle: 'dashed' }}
              >
                Выбрать файл (.json / .csv)
                <input type="file" accept=".json,.csv" hidden onChange={handleFileImport} />
              </Button>
            </CardContent>
          </Card>

          {/* Google Sheets */}
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>📊 Google Sheets</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Вставьте URL вашего Google Apps Script (веб-приложение).
              </Typography>
              <TextField
                fullWidth size="small"
                label="URL Google Apps Script"
                value={sheetsUrl}
                onChange={e => setSheetsUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                sx={{ mb: 2 }}
                InputProps={{ startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} /> }}
              />
              <Button
                variant="contained"
                fullWidth
                onClick={handleSheetsImport}
                disabled={loading || !sheetsUrl.trim()}
                sx={{ borderRadius: 2 }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Импортировать из Sheets'}
              </Button>
            </CardContent>
          </Card>
        </Box>

        {/* Превью */}
        {preview.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card sx={{ borderRadius: 3, mt: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Превью (первые {preview.length})
                </Typography>
                <List dense>
                  {preview.map((q, i) => (
                    <React.Fragment key={i}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary={q.question || 'Без вопроса'}
                          secondary={
                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                              {q.level && <Chip label={q.level} size="small" sx={{ height: 18, fontSize: '0.62rem' }} />}
                              {q.category && <Chip label={q.category} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.62rem' }} />}
                            </Box>
                          }
                        />
                      </ListItem>
                      {i < preview.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Формат данных */}
        <Card sx={{ borderRadius: 3, mt: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>📋 Формат CSV</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Первая строка — заголовки. Обязательные поля: <code>question</code>, <code>answer</code>, <code>level</code>, <code>category</code>
            </Typography>
            <Box sx={{
              p: 2, bgcolor: '#1e293b', color: '#94a3b8', borderRadius: 2,
              fontFamily: 'monospace', fontSize: '0.78rem', overflow: 'auto',
              whiteSpace: 'pre',
            }}>
              {EXAMPLE_CSV}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Уровни: junior | middle | senior | lead | architect | expert
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  )
}

function parseCsv(text: string): any[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) throw new Error('CSV должен содержать заголовки и хотя бы одну строку')
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
    const obj: any = {}
    headers.forEach((h, i) => { obj[h] = vals[i] || '' })
    return obj
  })
}

export default ImportPage
