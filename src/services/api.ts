import { API_CONFIG, ApiResponse, PaginatedResponse, ApiError, HttpMethod } from '@/config/api'
import { Question, QuestionLevel, UserStats, Goal, Settings } from '@/types'

class ApiService {
  private baseURL: string
  private timeout: number

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL
    this.timeout = API_CONFIG.TIMEOUT
  }

  // Базовый метод для HTTP запросов
  private async request<T>(
    endpoint: string,
    method: HttpMethod = 'GET',
    data?: any,
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(this.timeout)
    }

    if (data && method !== 'GET') {
      config.body = JSON.stringify(data)
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          await response.json().catch(() => null)
        )
      }

      const result = await response.json()
      return result
    } catch (error) {
      // Retry логика
      if (retryCount < API_CONFIG.MAX_RETRIES && this.shouldRetry(error)) {
        await this.delay(API_CONFIG.RETRY_DELAY * (retryCount + 1))
        return this.request<T>(endpoint, method, data, retryCount + 1)
      }

      if (error instanceof ApiError) {
        throw error
      }

      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0
      )
    }
  }

  private shouldRetry(error: any): boolean {
    if (error instanceof ApiError) {
      return error.status >= 500 || error.status === 0
    }
    return true
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Questions API
  async getQuestions(level?: QuestionLevel): Promise<ApiResponse<Question[]>> {
    const endpoint = level 
      ? `${API_CONFIG.ENDPOINTS.QUESTIONS}?level=${level}`
      : API_CONFIG.ENDPOINTS.QUESTIONS
    return this.request<Question[]>(endpoint)
  }

  async getQuestion(id: string): Promise<ApiResponse<Question>> {
    return this.request<Question>(`${API_CONFIG.ENDPOINTS.QUESTIONS}/${id}`)
  }

  async createQuestion(question: Omit<Question, 'id'>): Promise<ApiResponse<Question>> {
    return this.request<Question>(API_CONFIG.ENDPOINTS.QUESTIONS, 'POST', question)
  }

  async updateQuestion(id: string, question: Partial<Question>): Promise<ApiResponse<Question>> {
    return this.request<Question>(`${API_CONFIG.ENDPOINTS.QUESTIONS}/${id}`, 'PUT', question)
  }

  async deleteQuestion(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`${API_CONFIG.ENDPOINTS.QUESTIONS}/${id}`, 'DELETE')
  }

  // Stats API
  async getStats(): Promise<ApiResponse<UserStats>> {
    return this.request<UserStats>(API_CONFIG.ENDPOINTS.STATS)
  }

  async updateStats(stats: Partial<UserStats>): Promise<ApiResponse<UserStats>> {
    return this.request<UserStats>(API_CONFIG.ENDPOINTS.STATS, 'PUT', stats)
  }

  // Goals API
  async getGoals(): Promise<ApiResponse<Goal[]>> {
    return this.request<Goal[]>(API_CONFIG.ENDPOINTS.GOALS)
  }

  async createGoal(goal: Omit<Goal, 'id'>): Promise<ApiResponse<Goal>> {
    return this.request<Goal>(API_CONFIG.ENDPOINTS.GOALS, 'POST', goal)
  }

  async updateGoal(id: string, goal: Partial<Goal>): Promise<ApiResponse<Goal>> {
    return this.request<Goal>(`${API_CONFIG.ENDPOINTS.GOALS}/${id}`, 'PUT', goal)
  }

  async deleteGoal(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`${API_CONFIG.ENDPOINTS.GOALS}/${id}`, 'DELETE')
  }

  // Settings API
  async getSettings(): Promise<ApiResponse<Settings>> {
    return this.request<Settings>(API_CONFIG.ENDPOINTS.SETTINGS)
  }

  async updateSettings(settings: Partial<Settings>): Promise<ApiResponse<Settings>> {
    return this.request<Settings>(API_CONFIG.ENDPOINTS.SETTINGS, 'PUT', settings)
  }

  // Batch operations для офлайн синхронизации
  async syncQuestions(questions: Question[]): Promise<ApiResponse<Question[]>> {
    return this.request<Question[]>(`${API_CONFIG.ENDPOINTS.QUESTIONS}/sync`, 'POST', { questions })
  }

  async syncStats(stats: UserStats): Promise<ApiResponse<UserStats>> {
    return this.request<UserStats>(`${API_CONFIG.ENDPOINTS.STATS}/sync`, 'POST', stats)
  }
}

// Экспортируем singleton
export const apiService = new ApiService()
export default apiService
