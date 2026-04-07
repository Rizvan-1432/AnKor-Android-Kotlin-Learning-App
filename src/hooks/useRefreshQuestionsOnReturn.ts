import { useEffect, useRef } from 'react'
import { useAppStore } from '../store'

/** Не чаще одного раза в интервал — иначе focus + visibility дадут два запроса подряд. */
const MIN_INTERVAL_MS = 5_000

/**
 * Когда пользователь снова открывает вкладку с приложением (после админки и т.п.),
 * подтягиваем вопросы с API — локальный кэш в zustand/localStorage иначе остаётся устаревшим.
 */
export function useRefreshQuestionsOnReturn(): void {
  const loadQuestions = useAppStore(s => s.loadQuestions)
  const lastFetchAt = useRef(0)

  useEffect(() => {
    const maybeRefresh = () => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return
      if (typeof navigator !== 'undefined' && !navigator.onLine) return
      const now = Date.now()
      if (lastFetchAt.current > 0 && now - lastFetchAt.current < MIN_INTERVAL_MS) return
      lastFetchAt.current = now
      void loadQuestions()
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') maybeRefresh()
    }

    window.addEventListener('focus', maybeRefresh)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.removeEventListener('focus', maybeRefresh)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [loadQuestions])
}
