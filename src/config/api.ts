// API Configuration
export const API_CONFIG = {
  // Базовый URL API:
  // 1) VITE_API_URL (если задан в окружении)
  // 2) Локальная разработка (DEV)
  // 3) Продакшен сервер Render
  BASE_URL: import.meta.env.VITE_API_URL
    || (import.meta.env.DEV
      ? 'http://localhost:3000/api'
      : 'https://ankor-android-kotlin-learning-app.onrender.com/api'),
  
  // Таймауты
  TIMEOUT: 10000, // 10 секунд
  
  // Retry настройки
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 секунда
  
  // Endpoints
  ENDPOINTS: {
    QUESTIONS: '/questions',
    STATS: '/stats',
    GOALS: '/goals',
    SETTINGS: '/settings',
    AUTH: '/auth',
    META: '/meta',
    HEALTH: '/health',
  }
} as const

// Типы для API ответов
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// HTTP методы
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

// API Error класс
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
