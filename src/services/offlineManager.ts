import { Question, UserStats, Goal, Settings } from '@/types'

interface OfflineAction {
  id: string
  type: 'CREATE_QUESTION' | 'UPDATE_QUESTION' | 'DELETE_QUESTION' | 'UPDATE_STATS' | 'CREATE_GOAL' | 'UPDATE_GOAL' | 'DELETE_GOAL' | 'UPDATE_SETTINGS'
  data: any
  timestamp: number
}

class OfflineManager {
  private readonly STORAGE_KEY = 'ankor_offline_actions'
  private readonly SYNC_INTERVAL = 30000 // 30 секунд
  private syncTimer: NodeJS.Timeout | null = null

  constructor() {
    this.startSyncTimer()
  }

  // Добавить действие в очередь
  addAction(action: Omit<OfflineAction, 'id' | 'timestamp'>): void {
    const offlineAction: OfflineAction = {
      ...action,
      id: this.generateId(),
      timestamp: Date.now()
    }

    const actions = this.getActions()
    actions.push(offlineAction)
    this.saveActions(actions)
  }

  // Получить все действия
  getActions(): OfflineAction[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  // Очистить действия
  clearActions(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }

  // Очистить старые действия (старше 7 дней)
  clearOldActions(): void {
    const actions = this.getActions()
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
    const recentActions = actions.filter(action => action.timestamp > weekAgo)
    this.saveActions(recentActions)
  }

  // Проверить есть ли офлайн данные
  hasOfflineData(): boolean {
    return this.getActions().length > 0
  }

  // Получить офлайн данные для синхронизации
  getOfflineData(): {
    questions: Question[]
    stats: UserStats | null
    goals: Goal[]
    settings: Settings | null
  } {
    const actions = this.getActions()
    const result = {
      questions: [] as Question[],
      stats: null as UserStats | null,
      goals: [] as Goal[],
      settings: null as Settings | null
    }

    // Применяем действия в хронологическом порядке
    actions.forEach(action => {
      switch (action.type) {
        case 'CREATE_QUESTION':
        case 'UPDATE_QUESTION':
          const existingIndex = result.questions.findIndex(q => q.id === action.data.id)
          if (existingIndex >= 0) {
            result.questions[existingIndex] = { ...result.questions[existingIndex], ...action.data }
          } else {
            result.questions.push(action.data)
          }
          break

        case 'DELETE_QUESTION':
          result.questions = result.questions.filter(q => q.id !== action.data.id)
          break

        case 'UPDATE_STATS':
          result.stats = { ...result.stats, ...action.data }
          break

        case 'CREATE_GOAL':
        case 'UPDATE_GOAL':
          const goalIndex = result.goals.findIndex(g => g.id === action.data.id)
          if (goalIndex >= 0) {
            result.goals[goalIndex] = { ...result.goals[goalIndex], ...action.data }
          } else {
            result.goals.push(action.data)
          }
          break

        case 'DELETE_GOAL':
          result.goals = result.goals.filter(g => g.id !== action.data.id)
          break

        case 'UPDATE_SETTINGS':
          result.settings = { ...result.settings, ...action.data }
          break
      }
    })

    return result
  }

  // Запустить таймер синхронизации
  private startSyncTimer(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
    }

    this.syncTimer = setInterval(() => {
      this.syncIfOnline()
    }, this.SYNC_INTERVAL)
  }

  // Синхронизировать если онлайн
  private async syncIfOnline(): Promise<void> {
    if (!navigator.onLine || !this.hasOfflineData()) {
      return
    }

    try {
      // Импортируем API сервис динамически чтобы избежать циклических зависимостей
      const { apiService } = await import('./api')
      
      const offlineData = this.getOfflineData()
      
      // Синхронизируем данные
      if (offlineData.questions.length > 0) {
        await apiService.syncQuestions(offlineData.questions)
      }
      
      if (offlineData.stats) {
        await apiService.syncStats(offlineData.stats)
      }

      // Очищаем синхронизированные действия
      this.clearActions()
      
      console.log('✅ Офлайн данные синхронизированы')
    } catch (error) {
      console.warn('❌ Ошибка синхронизации:', error)
    }
  }

  // Принудительная синхронизация
  async forceSync(): Promise<boolean> {
    if (!navigator.onLine) {
      throw new Error('Нет подключения к интернету')
    }

    try {
      await this.syncIfOnline()
      return true
    } catch (error) {
      console.error('Ошибка принудительной синхронизации:', error)
      return false
    }
  }

  // Остановить таймер
  destroy(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
      this.syncTimer = null
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
  }

  private saveActions(actions: OfflineAction[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(actions))
    } catch (error) {
      console.warn('Не удалось сохранить офлайн действия:', error)
    }
  }
}

// Экспортируем singleton
export const offlineManager = new OfflineManager()
export default offlineManager
