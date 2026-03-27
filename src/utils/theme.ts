import { Theme } from '../types'

export const getTheme = (mode: 'light' | 'dark' | 'auto'): Theme => {
  const isDark = mode === 'dark' || (mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  
  return {
    mode: isDark ? 'dark' : 'light',
    primary: '#3b82f6',
    secondary: '#6b7280',
    background: isDark ? '#0f172a' : '#f8fafc',
    surface: isDark ? '#1e293b' : '#ffffff',
    text: isDark ? '#f1f5f9' : '#1f2937',
    textSecondary: isDark ? '#94a3b8' : '#6b7280'
  }
}

export const getLevelColor = (level: string): string => {
  const colors: Record<string, string> = {
    junior: '#10b981',
    middle: '#3b82f6',
    senior: '#8b5cf6',
    lead: '#f59e0b',
    architect: '#ef4444',
    expert: '#6366f1'
  }
  return colors[level] || '#6b7280'
}

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    kotlin: '#7c3aed',
    'android-sdk': '#059669',
    'ui-ux': '#dc2626',
    architecture: '#7c2d12',
    jetpack: '#0891b2',
    'dependency-injection': '#be123c',
    networking: '#be185d',
    databases: '#0d9488',
    performance: '#ca8a04',
    multithreading: '#9333ea',
    security: '#dc2626',
    testing: '#059669',
    'ci-cd': '#7c3aed',
    system: '#6b7280',
    behavioral: '#0891b2',
    publishing: '#0d9488'
  }
  return colors[category] || '#6b7280'
}
