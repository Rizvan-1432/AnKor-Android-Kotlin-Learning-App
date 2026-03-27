// Основные типы приложения AnKor

export interface Question {
  id: string
  question: string
  answer: string // Краткий ответ
  detailedAnswer?: string // Расширенный ответ
  codeExample?: string // Код с комментариями
  level: QuestionLevel
  category: QuestionCategory
  studied: boolean
  studiedAt?: string // Дата последнего изучения (для счётчика "сегодня")
  correct: number
  incorrect: number
  answered?: boolean // Флаг для предотвращения повторных кликов
  createdAt: string
}

export type QuestionLevel = 'junior' | 'middle' | 'senior' | 'lead' | 'architect' | 'expert'

export type QuestionCategory = 
  | 'kotlin'
  | 'android-sdk'
  | 'ui-ux'
  | 'architecture'
  | 'jetpack'
  | 'dependency-injection'
  | 'networking'
  | 'databases'
  | 'performance'
  | 'multithreading'
  | 'security'
  | 'testing'
  | 'ci-cd'
  | 'system'
  | 'behavioral'
  | 'publishing'

export interface Stats {
  studied: number
  correct: number
  total: number
}

export type UserStats = Stats

export interface Goal {
  id: string
  title: string
  description?: string
  type: 'daily' | 'weekly' | 'monthly' | 'studied' | 'correct' | 'questions'
  target: number
  targetCount?: number
  currentCount?: number
  category?: QuestionCategory
  current: number
  completed: boolean
  createdAt: string
}

export interface Settings {
  theme: 'light' | 'dark' | 'auto'
  studyReminders: boolean
  reminderTime: string
  backgroundGradient: 'blue' | 'orange' | 'purple' | 'green' | 'black' | 'dark-blue' | 'dark-gray' | 'random'
}

export interface StudySession {
  id: string
  level: QuestionLevel
  questions: Question[]
  currentIndex: number
  startTime: string
  endTime?: string
  completed: boolean
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
}

// UI типы
export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export interface NotificationProps {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

// Store типы
export interface AppState {
  questions: Question[]
  stats: Stats
  goals: Goal[]
  settings: Settings
  currentSession?: StudySession
  achievements: Achievement[]
  loading: boolean
  error: string | null
  isOnline: boolean
  lastSync: string | null
}

export interface AppActions {
  // Questions
  addQuestion: (question: Omit<Question, 'id' | 'createdAt'>) => void
  updateQuestion: (id: string, updates: Partial<Question>) => void
  deleteQuestion: (id: string) => void
  markCorrect: (id: string) => void
  markIncorrect: (id: string) => void
  
  // Goals
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void
  updateGoal: (id: string, updates: Partial<Goal>) => void
  deleteGoal: (id: string) => void
  
  // Settings
  updateSettings: (settings: Partial<Settings>) => void
  
  // Study
  startStudySession: (level: QuestionLevel) => void
  endStudySession: () => void
  nextQuestion: () => void
  previousQuestion: () => void
  
  // Data
  exportData: () => string
  importData: (data: string) => void
  resetStats: () => void
  resetAllData: () => void
  
  // API Actions
  loadQuestions: (level?: string) => Promise<void>
  loadStats: () => Promise<void>
  loadGoals: () => Promise<void>
  loadSettings: () => Promise<void>
  syncWithServer: () => Promise<void>
  
  // API Question Actions
  addQuestionWithAPI: (question: Omit<Question, 'id' | 'createdAt'>) => Promise<void>
  updateQuestionWithAPI: (id: string, updates: Partial<Question>) => Promise<void>
  deleteQuestionWithAPI: (id: string) => Promise<void>
}

// API типы
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Theme типы
export interface Theme {
  mode: 'light' | 'dark'
  primary: string
  secondary: string
  background: string
  surface: string
  text: string
  textSecondary: string
}
