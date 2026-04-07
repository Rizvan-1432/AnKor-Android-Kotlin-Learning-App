export type QuestionLevel = 'junior' | 'middle' | 'senior' | 'lead' | 'architect' | 'expert'

export type QuestionCategory =
  | 'kotlin' | 'android-sdk' | 'ui-ux' | 'architecture'
  | 'jetpack' | 'dependency-injection' | 'networking' | 'databases'
  | 'performance' | 'multithreading' | 'security' | 'testing'
  | 'ci-cd' | 'system' | 'behavioral' | 'publishing'
  | 'html' | 'css' | 'html-css' | 'javascript' | 'typescript' | 'react'
  | 'state-management' | 'build-tools' | 'web-performance'
  | 'web-security' | 'browser-api'
  | 'web-testing'

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
  // Android
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

  // Frontend
  { value: 'html',                 label: 'Frontend: HTML' },
  { value: 'css',                  label: 'Frontend: CSS' },
  { value: 'html-css',             label: 'Frontend: HTML/CSS (legacy)' },
  { value: 'javascript',           label: 'Frontend: JavaScript' },
  { value: 'typescript',           label: 'Frontend: TypeScript' },
  { value: 'react',                label: 'Frontend: React' },
  { value: 'state-management',     label: 'Frontend: State Management' },
  { value: 'build-tools',          label: 'Frontend: Build Tools' },
  { value: 'web-performance',      label: 'Frontend: Web Performance' },
  { value: 'web-security',         label: 'Frontend: Web Security' },
  { value: 'browser-api',          label: 'Frontend: Browser API' },
  { value: 'web-testing',          label: 'Frontend: Web Testing (Jest/RTL)' },
]

export const LEVEL_COLORS: Record<QuestionLevel, string> = {
  junior:    '#10b981',
  middle:    '#3b82f6',
  senior:    '#8b5cf6',
  lead:      '#f59e0b',
  architect: '#ef4444',
  expert:    '#6366f1',
}
