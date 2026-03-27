export type QuestionLevel = 'junior' | 'middle' | 'senior' | 'lead' | 'architect' | 'expert'

export type QuestionCategory =
  | 'kotlin' | 'android-sdk' | 'ui-ux' | 'architecture'
  | 'jetpack' | 'dependency-injection' | 'networking' | 'databases'
  | 'performance' | 'multithreading' | 'security' | 'testing'
  | 'ci-cd' | 'system' | 'behavioral' | 'publishing'

export interface Question {
  id: string
  question: string
  answer: string
  detailedAnswer?: string
  codeExample?: string
  level: QuestionLevel
  category: QuestionCategory
  studied: boolean
  correct: number
  incorrect: number
  createdAt: string
}

export const LEVEL_OPTIONS: { value: QuestionLevel; label: string }[] = [
  { value: 'junior',    label: 'Junior' },
  { value: 'middle',    label: 'Middle' },
  { value: 'senior',   label: 'Senior' },
  { value: 'lead',     label: 'Lead' },
  { value: 'architect', label: 'Architect' },
  { value: 'expert',   label: 'Expert' },
]

export const CATEGORY_OPTIONS: { value: QuestionCategory; label: string }[] = [
  { value: 'kotlin',               label: 'Kotlin' },
  { value: 'android-sdk',          label: 'Android SDK' },
  { value: 'ui-ux',                label: 'UI/UX' },
  { value: 'architecture',         label: 'Архитектура' },
  { value: 'jetpack',              label: 'Jetpack' },
  { value: 'dependency-injection', label: 'DI (Hilt/Dagger)' },
  { value: 'networking',           label: 'Сеть (Retrofit)' },
  { value: 'databases',            label: 'Базы данных (Room)' },
  { value: 'performance',          label: 'Производительность' },
  { value: 'multithreading',       label: 'Многопоточность' },
  { value: 'security',             label: 'Безопасность' },
  { value: 'testing',              label: 'Тестирование' },
  { value: 'ci-cd',                label: 'CI/CD' },
  { value: 'system',               label: 'Системные' },
  { value: 'behavioral',           label: 'Поведенческие' },
  { value: 'publishing',           label: 'Публикация' },
]

export const LEVEL_COLORS: Record<QuestionLevel, string> = {
  junior:    '#10b981',
  middle:    '#3b82f6',
  senior:    '#8b5cf6',
  lead:      '#f59e0b',
  architect: '#ef4444',
  expert:    '#6366f1',
}
