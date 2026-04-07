import type { QuestionCategory } from '../types'

/** Как в основном приложении (`TRACKS`) — фильтр вопросов по направлению. */
export const ANDROID_CATEGORIES: QuestionCategory[] = [
  'android-sdk', 'jetpack', 'ui-ux', 'kotlin', 'multithreading', 'architecture',
  'dependency-injection', 'networking', 'databases', 'performance', 'security',
  'testing', 'ci-cd', 'publishing', 'system', 'behavioral',
]

export const FRONTEND_CATEGORIES: QuestionCategory[] = [
  'html', 'css', 'html-css', 'javascript', 'typescript', 'react',
  'state-management', 'build-tools', 'web-performance', 'web-security',
  'browser-api', 'web-testing',
]

export const ANDROID_CATEGORY_SET = new Set<string>(ANDROID_CATEGORIES)
export const FRONTEND_CATEGORY_SET = new Set<string>(FRONTEND_CATEGORIES)
