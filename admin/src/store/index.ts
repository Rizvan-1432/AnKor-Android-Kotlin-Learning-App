import { create } from 'zustand'
import { Question, QuestionLevel, QuestionCategory } from '../types'
import { questionsApi } from '../services/api'

interface AdminStore {
  questions: Question[]
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  
  setAuth: (val: boolean) => void
  loadQuestions: (filters?: { level?: QuestionLevel; category?: QuestionCategory; search?: string }) => Promise<void>
  createQuestion: (q: Omit<Question, 'id' | 'createdAt' | 'studied' | 'correct' | 'incorrect'>) => Promise<void>
  updateQuestion: (id: string, q: Partial<Question>) => Promise<void>
  deleteQuestion: (id: string) => Promise<void>
  bulkCreate: (questions: Omit<Question, 'id' | 'createdAt' | 'studied' | 'correct' | 'incorrect'>[]) => Promise<number>
  clearError: () => void
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  questions: [],
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('admin_token'),

  setAuth: (val) => set({ isAuthenticated: val }),
  clearError: () => set({ error: null }),

  loadQuestions: async (filters) => {
    set({ loading: true, error: null })
    try {
      const res = await questionsApi.getAll(filters)
      set({ questions: res.data, loading: false })
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Ошибка загрузки' })
    }
  },

  createQuestion: async (q) => {
    set({ loading: true, error: null })
    try {
      const res = await questionsApi.create(q)
      set(state => ({ questions: [res.data, ...state.questions], loading: false }))
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Ошибка создания' })
      throw e
    }
  },

  updateQuestion: async (id, q) => {
    set({ loading: true, error: null })
    try {
      const res = await questionsApi.update(id, q)
      set(state => ({
        questions: state.questions.map(item => item.id === id ? res.data : item),
        loading: false,
      }))
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Ошибка обновления' })
      throw e
    }
  },

  deleteQuestion: async (id) => {
    set({ loading: true, error: null })
    try {
      await questionsApi.delete(id)
      set(state => ({
        questions: state.questions.filter(q => q.id !== id),
        loading: false,
      }))
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Ошибка удаления' })
      throw e
    }
  },

  bulkCreate: async (questions) => {
    set({ loading: true, error: null })
    try {
      const res = await questionsApi.bulkCreate(questions)
      await get().loadQuestions()
      return res.created
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Ошибка импорта' })
      throw e
    }
  },
}))
