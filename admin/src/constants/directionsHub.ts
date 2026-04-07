/** Направления на `/questions` — порядок как в основном приложении (`TRACKS`). */

export type DirectionHubItem = {
  id: string
  name: string
  description: string
  icon: string
  color: string
  soon: boolean
  adminPath?: '/questions/android' | '/questions/frontend'
}

/** 1 Android → 2 Frontend → 3 Backend → 4 iOS → 5 DevOps → 6 Machine Learning */
export const DIRECTIONS_HUB: DirectionHubItem[] = [
  {
    id: 'android',
    name: 'Android разработка',
    description: 'Kotlin, SDK, Jetpack, архитектура и всё что нужно Android-разработчику',
    icon: '🤖',
    color: '#3b82f6',
    soon: false,
    adminPath: '/questions/android',
  },
  {
    id: 'frontend',
    name: 'Frontend разработка',
    description: 'Теперь доступно: HTML, CSS, JavaScript, React, TypeScript и браузерные API',
    icon: '🌐',
    color: '#f59e0b',
    soon: false,
    adminPath: '/questions/frontend',
  },
  {
    id: 'backend',
    name: 'Backend разработка',
    description: 'Node.js, Python, базы данных, REST, микросервисы',
    icon: '⚙️',
    color: '#10b981',
    soon: true,
  },
  {
    id: 'ios',
    name: 'iOS разработка',
    description: 'Swift, SwiftUI, UIKit, Xcode',
    icon: '🍎',
    color: '#6366f1',
    soon: true,
  },
  {
    id: 'devops',
    name: 'DevOps',
    description: 'Docker, Kubernetes, CI/CD, облачные платформы',
    icon: '🚀',
    color: '#ef4444',
    soon: true,
  },
  {
    id: 'ml',
    name: 'Machine Learning',
    description: 'Python, TensorFlow, ML-алгоритмы, нейросети',
    icon: '🧠',
    color: '#8b5cf6',
    soon: true,
  },
]
