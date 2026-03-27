import { Question, QuestionLevel, QuestionCategory } from '../types'

const BASE_URL = '/api'

const getToken = () => localStorage.getItem('admin_token')

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (res.status === 401) {
    localStorage.removeItem('admin_token')
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Server error')
  return data
}

// Auth
export const authApi = {
  login: (password: string) =>
    request<{ success: boolean; data: { token: string }; message: string }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),
}

// Questions
export const questionsApi = {
  getAll: (filters?: { level?: QuestionLevel; category?: QuestionCategory; search?: string }) => {
    const params = new URLSearchParams()
    if (filters?.level) params.set('level', filters.level)
    if (filters?.category) params.set('category', filters.category)
    if (filters?.search) params.set('search', filters.search)
    const qs = params.toString()
    return request<{ success: boolean; data: Question[] }>(`/questions${qs ? `?${qs}` : ''}`)
  },

  getOne: (id: string) =>
    request<{ success: boolean; data: Question }>(`/questions/${id}`),

  create: (q: Omit<Question, 'id' | 'createdAt' | 'studied' | 'correct' | 'incorrect'>) =>
    request<{ success: boolean; data: Question }>('/questions', {
      method: 'POST',
      body: JSON.stringify(q),
    }),

  update: (id: string, q: Partial<Question>) =>
    request<{ success: boolean; data: Question }>(`/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(q),
    }),

  delete: (id: string) =>
    request<{ success: boolean }>(`/questions/${id}`, { method: 'DELETE' }),

  bulkCreate: (questions: Omit<Question, 'id' | 'createdAt' | 'studied' | 'correct' | 'incorrect'>[]) =>
    request<{ success: boolean; created: number }>('/questions/bulk', {
      method: 'POST',
      body: JSON.stringify({ questions }),
    }),
}
