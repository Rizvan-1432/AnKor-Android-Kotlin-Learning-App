# 👨‍💻 Разработчик

## Bakhaev Rizvan

**Роль:** Главный разработчик и дизайнер

**Специализация:**
- Frontend (React, TypeScript, Vite)
- Mobile First и адаптивная вёрстка
- Progressive Web Apps (PWA)
- User Experience (UX)

**О проекте AnKor:**  
Веб-приложение для подготовки к собеседованиям по **Android и Kotlin**: карточки (режим изучения), тест с выбором ответа, статистика, цели, синхронизация с API. Фокус на мобильных устройствах.

**Структура репозитория:**

| Папка | Назначение |
|--------|------------|
| `src/` | Основное приложение (React + TS + MUI + Zustand) |
| `server/` | REST API на Express + SQLite (`better-sqlite3`) |
| `admin/` | Отдельная админ-панель (контент вопросов, импорт) |

**Стек основного приложения (`src/`):**

- **React 18**, **TypeScript**, **Vite**
- **MUI 5**, **Emotion**, **Framer Motion**
- **React Router 6**, **Zustand** (+ `persist` в `localStorage`)
- **vite-plugin-pwa** (Service Worker, манифест)
- **Prism.js** (подсветка Kotlin в ответах)
- **Vitest** / **Playwright** (тесты; e2e — `npm run test:e2e`)

**Особенности продукта:**

- Mobile First, нижняя навигация на маленьких экранах
- Светлая / тёмная / системная тема, настройки доступности
- Офлайн-очередь действий и синхронизация с сервером
- API: переменная **`VITE_API_URL`** (прод: обычно Render и т.п.)

**Полезные команды (из корня репозитория):**

```bash
npm run dev          # фронт (Vite)
npm run server:dev   # API (Express)
npm run dev:full     # фронт + API (concurrently)
npm run build        # сборка клиента
npm run test:e2e     # Playwright (см. playwright.config.ts)
```

**Контакты:**

- GitHub: [@rizvanbakhaev](https://github.com/rizvanbakhaev)

---

*Создано с ❤️ для изучения Android и Kotlin*
