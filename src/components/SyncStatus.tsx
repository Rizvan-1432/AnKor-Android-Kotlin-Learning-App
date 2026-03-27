import React, { useEffect, useState } from 'react'
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material'
import {
  Sync as SyncIcon,
  CloudOff as OfflineIcon,
  CloudDone as OnlineIcon,
  Error as ErrorIcon
} from '@mui/icons-material'
import { useAppStore } from '@/store'
import { offlineManager } from '@/services/offlineManager'

const SyncStatus: React.FC = () => {
  const { 
    loading, 
    error, 
    isOnline, 
    lastSync, 
    syncWithServer 
  } = useAppStore()
  
  const [offlineActions, setOfflineActions] = useState(0)
  const [showSyncSuccess, setShowSyncSuccess] = useState(false)

  // Проверяем офлайн действия
  useEffect(() => {
    const checkOfflineActions = () => {
      setOfflineActions(offlineManager.getActions().length)
    }
    
    checkOfflineActions()
    const interval = setInterval(checkOfflineActions, 5000)
    
    return () => clearInterval(interval)
  }, [])

  // Обработка синхронизации
  const handleSync = async () => {
    try {
      await syncWithServer()
      setShowSyncSuccess(true)
      setOfflineActions(0)
    } catch (error) {
      console.error('Ошибка синхронизации:', error)
    }
  }

  // Форматирование времени последней синхронизации
  const formatLastSync = (timestamp: string | null) => {
    if (!timestamp) return 'Никогда'
    
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'Только что'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч назад`
    return date.toLocaleDateString()
  }

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Статус подключения */}
        <Tooltip title={isOnline ? 'Онлайн' : 'Офлайн'}>
          <Chip
            icon={isOnline ? <OnlineIcon /> : <OfflineIcon />}
            label={isOnline ? 'Онлайн' : 'Офлайн'}
            color={isOnline ? 'success' : 'default'}
            size="small"
            variant="outlined"
          />
        </Tooltip>

        {/* Офлайн действия */}
        {offlineActions > 0 && (
          <Tooltip title={`${offlineActions} действий ожидают синхронизации`}>
            <Chip
              label={`${offlineActions} в очереди`}
              color="warning"
              size="small"
              variant="filled"
            />
          </Tooltip>
        )}

        {/* Кнопка синхронизации */}
        <Tooltip title="Синхронизировать с сервером">
          <IconButton
            onClick={handleSync}
            disabled={loading || !isOnline}
            size="small"
            color="primary"
          >
            {loading ? (
              <CircularProgress size={20} />
            ) : (
              <SyncIcon />
            )}
          </IconButton>
        </Tooltip>

        {/* Время последней синхронизации */}
        {lastSync && (
          <Tooltip title={`Последняя синхронизация: ${formatLastSync(lastSync)}`}>
            <Chip
              label={formatLastSync(lastSync)}
              size="small"
              variant="outlined"
              color="info"
            />
          </Tooltip>
        )}

        {/* Ошибка */}
        {error && (
          <Tooltip title={error}>
            <Chip
              icon={<ErrorIcon />}
              label="Ошибка"
              color="error"
              size="small"
              variant="filled"
            />
          </Tooltip>
        )}
      </Box>

      {/* Уведомления */}
      <Snackbar
        open={showSyncSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSyncSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setShowSyncSuccess(false)}>
          Данные успешно синхронизированы!
        </Alert>
      </Snackbar>

      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={5000}
          onClose={() => useAppStore.setState({ error: null })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="error" onClose={() => useAppStore.setState({ error: null })}>
            {error}
          </Alert>
        </Snackbar>
      )}
    </>
  )
}

export default SyncStatus
