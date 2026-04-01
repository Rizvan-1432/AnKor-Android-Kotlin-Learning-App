import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { AppState, AppActions, Question, Goal, StudySession } from '../types'
import { apiService } from '../services/api'
import { offlineManager } from '../services/offlineManager'
import { ApiError } from '../config/api'

const useAppStore = create<AppState & AppActions>()(
  persist(
    (set, get) => {
      // Подписка на события сети — обновляем isOnline реактивно
      if (typeof window !== 'undefined') {
        window.addEventListener('online', () => set({ isOnline: true, error: null }))
        window.addEventListener('offline', () => set({ isOnline: false }))
      }

      return {
      // Initial state
      questions: [],
      loading: false,
      error: null,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      lastSync: null,
      stats: { studied: 0, correct: 0, total: 0 },
      goals: [],
      settings: {
        theme: 'light',
        studyReminders: false,
        reminderTime: '19:00',
        backgroundGradient: 'blue',
        dailyGoal: 10,
        fontScale: 'normal',
        highContrast: false,
        analyticsConsent: false,
      },
      currentSession: undefined,
      achievements: [],

      // Question actions
      addQuestion: (questionData) => {
        get().addQuestionWithAPI(questionData)
      },

      updateQuestion: (id, updates) => {
        get().updateQuestionWithAPI(id, updates)
      },

      deleteQuestion: (id) => {
        get().deleteQuestionWithAPI(id)
      },

      markCorrect: (id) => {
        set((state) => {
          const question = state.questions.find(q => q.id === id)
          if (!question || question.answered) return state

          const now = new Date().toISOString()
          const updatedQuestions = state.questions.map(q =>
            q.id === id
              ? {
                  ...q,
                  studied: true,
                  studiedAt: now,
                  correct: q.correct + 1,
                  answered: true
                }
              : q
          )

          const newStats = {
            ...state.stats,
            studied: state.stats.studied + (question.studied ? 0 : 1),
            correct: state.stats.correct + 1
          }

          const updatedGoals = state.goals.map(goal => {
            let currentCount = 0
            if (goal.type === 'studied') currentCount = newStats.studied
            else if (goal.type === 'correct') currentCount = newStats.correct
            else if (goal.type === 'questions') currentCount = updatedQuestions.length
            else return goal
            return { ...goal, currentCount, completed: currentCount >= (goal.targetCount ?? goal.target) }
          })

          return { questions: updatedQuestions, stats: newStats, goals: updatedGoals }
        })
        // После локального обновления отправляем актуальное состояние вопроса на сервер,
        // чтобы админ-панель видела реальные counters (correct/incorrect/studied).
        const updated = get().questions.find(q => q.id === id)
        if (updated) {
          void get().updateQuestionWithAPI(id, {
            studied: updated.studied,
            studiedAt: updated.studiedAt,
            correct: updated.correct,
            incorrect: updated.incorrect,
            answered: updated.answered,
          })
        }
      },

      markIncorrect: (id) => {
        set((state) => {
          const question = state.questions.find(q => q.id === id)
          if (!question || question.answered) return state

          const now = new Date().toISOString()
          const updatedQuestions = state.questions.map(q =>
            q.id === id
              ? {
                  ...q,
                  studied: true,
                  studiedAt: now,
                  incorrect: q.incorrect + 1,
                  answered: true
                }
              : q
          )

          const newStats = {
            ...state.stats,
            studied: state.stats.studied + (question.studied ? 0 : 1)
          }

          const updatedGoals = state.goals.map(goal => {
            let currentCount = 0
            if (goal.type === 'studied') currentCount = newStats.studied
            else if (goal.type === 'correct') currentCount = newStats.correct
            else if (goal.type === 'questions') currentCount = updatedQuestions.length
            else return goal
            return { ...goal, currentCount, completed: currentCount >= (goal.targetCount ?? goal.target) }
          })

          return { questions: updatedQuestions, stats: newStats, goals: updatedGoals }
        })
        // Синхронизируем результат ответа с API для отображения в админке.
        const updated = get().questions.find(q => q.id === id)
        if (updated) {
          void get().updateQuestionWithAPI(id, {
            studied: updated.studied,
            studiedAt: updated.studiedAt,
            correct: updated.correct,
            incorrect: updated.incorrect,
            answered: updated.answered,
          })
        }
      },

      // Goal actions
      addGoal: (goalData) => {
        const newGoal: Goal = {
          ...goalData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        }
        
        set((state) => ({
          goals: [...state.goals, newGoal]
        }))
      },

      updateGoal: (id, updates) => {
        set((state) => ({
          goals: state.goals.map(g => 
            g.id === id ? { ...g, ...updates } : g
          )
        }))
      },

      deleteGoal: (id) => {
        set((state) => ({
          goals: state.goals.filter(g => g.id !== id)
        }))
      },

      // Settings actions
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }))
      },

      // Study session actions
      startStudySession: (level) => {
        const { questions } = get()
        const levelQuestions = questions.filter(q => q.level === level)
        
        const session: StudySession = {
          id: Date.now().toString(),
          level,
          questions: levelQuestions,
          currentIndex: 0,
          startTime: new Date().toISOString(),
          completed: false
        }

        set({ currentSession: session })
      },

      endStudySession: () => {
        set((state) => ({
          currentSession: state.currentSession 
            ? { ...state.currentSession, endTime: new Date().toISOString(), completed: true }
            : undefined
        }))
      },

      nextQuestion: () => {
        set((state) => {
          if (!state.currentSession) return state
          
          const nextIndex = state.currentSession.currentIndex + 1
          if (nextIndex >= state.currentSession.questions.length) {
            return {
              currentSession: {
                ...state.currentSession,
                endTime: new Date().toISOString(),
                completed: true
              }
            }
          }

          return {
            currentSession: {
              ...state.currentSession,
              currentIndex: nextIndex
            }
          }
        })
      },

      previousQuestion: () => {
        set((state) => {
          if (!state.currentSession) return state
          
          const prevIndex = Math.max(0, state.currentSession.currentIndex - 1)
          return {
            currentSession: {
              ...state.currentSession,
              currentIndex: prevIndex
            }
          }
        })
      },

      // Data actions
      exportData: () => {
        const state = get()
        return JSON.stringify({
          questions: state.questions,
          stats: state.stats,
          goals: state.goals,
          settings: state.settings,
          achievements: state.achievements,
          exportDate: new Date().toISOString(),
          version: '2.0.0'
        }, null, 2)
      },

      importData: (dataString) => {
        try {
          const data = JSON.parse(dataString)
          
          set({
            questions: data.questions || [],
            stats: data.stats || { studied: 0, correct: 0, total: 0 },
            goals: data.goals || [],
            settings: data.settings || {
              theme: 'light',
              studyReminders: false,
              reminderTime: '19:00'
            },
            achievements: data.achievements || []
          })
        } catch (error) {
          console.error('Import error:', error)
        }
      },

      resetStats: () => {
        set((state) => ({
          questions: state.questions.map(q => ({
            ...q,
            studied: false,
            correct: 0,
            incorrect: 0,
            answered: false
          })),
          stats: {
            studied: 0,
            correct: 0,
            total: state.questions.length
          },
          goals: state.goals.map(g => ({
            ...g,
            currentCount: 0,
            completed: false
          }))
        }))
      },

      resetAllData: () => {
        set({
          questions: [],
          stats: { studied: 0, correct: 0, total: 0 },
          goals: [],
          settings: {
            theme: 'light',
            studyReminders: false,
            reminderTime: '19:00',
            backgroundGradient: 'blue',
            dailyGoal: 10,
            fontScale: 'normal',
            highContrast: false,
            analyticsConsent: false,
          },
          currentSession: undefined,
          achievements: []
        })
      },

      // API Actions
      loadQuestions: async (level?: string) => {
        set({ loading: true, error: null })
        
        try {
          const response = await apiService.getQuestions(level as any)
          if (response.success && response.data) {
            // Сервер — источник истины: берём только вопросы с API.
            // Локальный прогресс переносим только для совпадающих id.
            set((state) => {
              const localById = new Map(state.questions.map(q => [q.id, q]))
              const serverQuestions = response.data!.map((q) => {
                const local = localById.get(q.id)
                if (!local) return q
                return {
                  ...q,
                  studied: local.studied,
                  studiedAt: local.studiedAt,
                  correct: local.correct,
                  incorrect: local.incorrect,
                  answered: local.answered,
                }
              })
              return {
                questions: serverQuestions,
                loading: false,
                lastSync: new Date().toISOString()
              }
            })
          } else {
            throw new Error(response.error || 'Ошибка загрузки вопросов')
          }
        } catch (error) {
          const errorMessage = error instanceof ApiError 
            ? error.message 
            : 'Ошибка загрузки вопросов'
          
          set({ loading: false, error: errorMessage })
          
          if (!navigator.onLine) {
            const offlineData = offlineManager.getOfflineData()
            if (offlineData.questions.length > 0) {
              set({ questions: offlineData.questions })
            }
          }
        }
      },

      loadStats: async () => {
        try {
          const response = await apiService.getStats()
          if (response.success && response.data) {
            set({ stats: response.data })
          }
        } catch (error) {
          console.warn('Ошибка загрузки статистики:', error)
        }
      },

      loadGoals: async () => {
        try {
          const response = await apiService.getGoals()
          if (response.success && response.data) {
            set({ goals: response.data })
          }
        } catch (error) {
          console.warn('Ошибка загрузки целей:', error)
        }
      },

      loadSettings: async () => {
        try {
          const response = await apiService.getSettings()
          if (response.success && response.data) {
            set({ settings: response.data })
          }
        } catch (error) {
          console.warn('Ошибка загрузки настроек:', error)
        }
      },

      syncWithServer: async () => {
        if (!navigator.onLine) {
          throw new Error('Нет подключения к интернету')
        }

        set({ loading: true })
        
        try {
          // Синхронизируем все данные
          await Promise.all([
            get().loadQuestions(),
            get().loadStats(),
            get().loadGoals(),
            get().loadSettings()
          ])
          
          set({ 
            loading: false,
            lastSync: new Date().toISOString(),
            error: null
          })
        } catch (error) {
          set({ 
            loading: false,
            error: error instanceof Error ? error.message : 'Ошибка синхронизации'
          })
        }
      },

      // Обновленные действия с API интеграцией
      addQuestionWithAPI: async (questionData) => {
        const newQuestion: Question = {
          ...questionData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        }

        // Локальное обновление
        set((state) => {
          const newQuestions = [...state.questions, newQuestion]
          const newStats = {
            studied: newQuestions.filter(q => q.studied).length,
            correct: newQuestions.reduce((sum, q) => sum + q.correct, 0),
            total: newQuestions.length
          }
          return { questions: newQuestions, stats: newStats }
        })

        // API запрос
        if (navigator.onLine) {
          try {
            await apiService.createQuestion(newQuestion)
          } catch (error) {
            // Добавляем в офлайн очередь
            offlineManager.addAction({
              type: 'CREATE_QUESTION',
              data: newQuestion
            })
          }
        } else {
          // Офлайн режим
          offlineManager.addAction({
            type: 'CREATE_QUESTION',
            data: newQuestion
          })
        }
      },

      updateQuestionWithAPI: async (id, updates) => {
        // Локальное обновление
        set((state) => ({
          questions: state.questions.map(q => 
            q.id === id ? { ...q, ...updates } : q
          )
        }))

        // API запрос
        if (navigator.onLine) {
          try {
            await apiService.updateQuestion(id, updates)
          } catch (error) {
            offlineManager.addAction({
              type: 'UPDATE_QUESTION',
              data: { id, ...updates }
            })
          }
        } else {
          offlineManager.addAction({
            type: 'UPDATE_QUESTION',
            data: { id, ...updates }
          })
        }
      },

      deleteQuestionWithAPI: async (id) => {
        // Локальное удаление
        set((state) => {
          const newQuestions = state.questions.filter(q => q.id !== id)
          const newStats = {
            studied: newQuestions.filter(q => q.studied).length,
            correct: newQuestions.reduce((sum, q) => sum + q.correct, 0),
            total: newQuestions.length
          }
          return { questions: newQuestions, stats: newStats }
        })

        // API запрос
        if (navigator.onLine) {
          try {
            await apiService.deleteQuestion(id)
          } catch (error) {
            offlineManager.addAction({
              type: 'DELETE_QUESTION',
              data: { id }
            })
          }
        } else {
          offlineManager.addAction({
            type: 'DELETE_QUESTION',
            data: { id }
          })
        }
      },

      }
    },
    {
      name: 'ankor-storage',
      version: 3,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState: any) => {
        if (persistedState && typeof persistedState === 'object') {
          const { questions: _q, ...rest } = persistedState
          const merged = { ...rest, questions: [] as Question[] }
          if (merged.settings && typeof merged.settings === 'object') {
            merged.settings = {
              ...merged.settings,
              dailyGoal: typeof merged.settings.dailyGoal === 'number' ? merged.settings.dailyGoal : 10,
              fontScale: merged.settings.fontScale ?? 'normal',
              highContrast: !!merged.settings.highContrast,
              analyticsConsent: !!merged.settings.analyticsConsent,
            }
          }
          return merged
        }
        return persistedState
      },
      partialize: (state) => ({
        stats: state.stats,
        goals: state.goals,
        settings: state.settings,
        achievements: state.achievements
      })
    }
  )
)

export { useAppStore }
