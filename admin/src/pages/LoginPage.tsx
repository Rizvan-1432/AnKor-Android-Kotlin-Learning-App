import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Card, CardContent, Typography, TextField,
  Button, Alert, InputAdornment, IconButton, CircularProgress
} from '@mui/material'
import LockIcon from '@mui/icons-material/Lock'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { motion } from 'framer-motion'
import { authApi } from '../services/api'
import { useAdminStore } from '../store'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const setAuth = useAdminStore(s => s.setAuth)
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Очищаем невалидный токен при загрузке страницы логина
  React.useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token || token === 'undefined' || token === 'null') {
      localStorage.removeItem('admin_token')
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await authApi.login(password)
      localStorage.setItem('admin_token', res.data.token)
      setAuth(true)
      navigate('/')
    } catch {
      setError('Неверный пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      p: 2,
    }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{ width: 380, borderRadius: 4, boxShadow: '0 25px 50px rgba(0,0,0,0.4)', overflow: 'visible' }}>
          <CardContent sx={{ p: 4 }}>
            {/* Иконка */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box sx={{
                width: 64, height: 64, borderRadius: 3,
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mx: 'auto', mb: 2, boxShadow: '0 8px 24px #3b82f640',
              }}>
                <LockIcon sx={{ color: 'white', fontSize: 30 }} />
              </Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                AnKor Admin
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Введите пароль для входа в панель управления
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="Пароль"
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
                sx={{ mb: 3 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPwd(!showPwd)} edge="end">
                        {showPwd ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || !password.trim()}
                sx={{
                  py: 1.5, borderRadius: 2, fontWeight: 'bold', fontSize: '1rem',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  boxShadow: '0 4px 16px #3b82f640',
                  '&:hover': { boxShadow: '0 6px 20px #3b82f655' },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Войти'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  )
}

export default LoginPage
