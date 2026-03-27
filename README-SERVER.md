# 🚀 AnKor Server Integration

Полная интеграция с сервером для хранения данных на AEZA или любом другом хостинге.

## 📋 Что изменилось

### **✅ Добавлено:**
- **API Service** - Полноценный сервис для работы с сервером
- **Offline Manager** - Офлайн синхронизация данных
- **Sync Status** - Компонент статуса синхронизации
- **Test Server** - Локальный сервер для разработки
- **Error Handling** - Обработка ошибок API
- **Loading States** - Состояния загрузки

### **🔄 Как работает:**

1. **Онлайн режим** - Данные сохраняются на сервер
2. **Офлайн режим** - Данные сохраняются локально и синхронизируются при подключении
3. **Автосинхронизация** - Каждые 30 секунд
4. **Ручная синхронизация** - Кнопка на главной странице

## 🛠 Установка и запуск

### **1. Установка зависимостей:**
```bash
# Установка всех зависимостей (клиент + сервер)
npm run install:all

# Или по отдельности
npm install
cd server && npm install
```

### **2. Запуск в режиме разработки:**
```bash
# Запуск клиента и сервера одновременно
npm run dev:full

# Или по отдельности
npm run dev          # Клиент на порту 3001
npm run server:dev   # Сервер на порту 3000
```

### **3. Запуск только сервера:**
```bash
npm run server
```

## 🌐 Настройка для AEZA

### **1. Создайте .env файл:**
```bash
cp env.example .env
```

### **2. Обновите .env:**
```env
# Замените на ваш домен AEZA
VITE_API_URL=https://your-domain.com/api

# Для разработки
# VITE_API_URL=http://localhost:3000/api
```

### **3. Деплой на AEZA:**

1. **Загрузите файлы сервера** в папку на AEZA
2. **Установите зависимости:**
   ```bash
   npm install
   ```
3. **Запустите сервер:**
   ```bash
   npm start
   ```

## 📁 Структура сервера

```
server/
├── index.js          # Основной файл сервера
├── package.json      # Зависимости сервера
└── README.md         # Документация сервера
```

## 🔌 API Endpoints

### **Questions (Вопросы)**
- `GET /api/questions` - Получить все вопросы
- `GET /api/questions?level=junior` - Фильтр по уровню
- `GET /api/questions/:id` - Получить вопрос по ID
- `POST /api/questions` - Создать вопрос
- `PUT /api/questions/:id` - Обновить вопрос
- `DELETE /api/questions/:id` - Удалить вопрос
- `POST /api/questions/sync` - Синхронизация офлайн данных

### **Stats (Статистика)**
- `GET /api/stats` - Получить статистику
- `PUT /api/stats` - Обновить статистику
- `POST /api/stats/sync` - Синхронизация статистики

### **Goals (Цели)**
- `GET /api/goals` - Получить цели
- `POST /api/goals` - Создать цель
- `PUT /api/goals/:id` - Обновить цель
- `DELETE /api/goals/:id` - Удалить цель

### **Settings (Настройки)**
- `GET /api/settings` - Получить настройки
- `PUT /api/settings` - Обновить настройки

### **Health Check**
- `GET /api/health` - Проверка состояния сервера

## 🔄 Офлайн синхронизация

### **Как работает:**
1. При отсутствии интернета данные сохраняются локально
2. Действия добавляются в очередь синхронизации
3. При появлении интернета данные автоматически синхронизируются
4. Можно принудительно синхронизировать через кнопку

### **Типы офлайн действий:**
- `CREATE_QUESTION` - Создание вопроса
- `UPDATE_QUESTION` - Обновление вопроса
- `DELETE_QUESTION` - Удаление вопроса
- `UPDATE_STATS` - Обновление статистики
- `CREATE_GOAL` - Создание цели
- `UPDATE_GOAL` - Обновление цели
- `DELETE_GOAL` - Удаление цели
- `UPDATE_SETTINGS` - Обновление настроек

## 🎯 Использование в коде

### **Загрузка данных:**
```tsx
import { useAppStore } from '@/store'

const Component = () => {
  const { loadQuestions, loadStats, loading, error } = useAppStore()
  
  useEffect(() => {
    loadQuestions()
    loadStats()
  }, [])
  
  if (loading) return <div>Загрузка...</div>
  if (error) return <div>Ошибка: {error}</div>
  
  return <div>Контент</div>
}
```

### **Синхронизация:**
```tsx
const { syncWithServer, isOnline } = useAppStore()

const handleSync = async () => {
  if (!isOnline) {
    alert('Нет подключения к интернету')
    return
  }
  
  try {
    await syncWithServer()
    alert('Данные синхронизированы!')
  } catch (error) {
    alert('Ошибка синхронизации')
  }
}
```

## 🚨 Обработка ошибок

### **Типы ошибок:**
- **Network Error** - Нет подключения к интернету
- **API Error** - Ошибка сервера (500, 404, etc.)
- **Timeout Error** - Превышено время ожидания
- **Validation Error** - Неверные данные

### **Автоматические действия:**
- **Retry** - Автоматические повторы (до 3 раз)
- **Offline Queue** - Сохранение в офлайн очередь
- **User Notification** - Уведомления пользователю

## 🔧 Настройка для продакшена

### **1. Переменные окружения:**
```env
NODE_ENV=production
PORT=3000
API_URL=https://your-domain.com/api
```

### **2. База данных:**
Замените in-memory хранилище на реальную БД:
- **PostgreSQL** - Рекомендуется
- **MongoDB** - Для NoSQL
- **MySQL** - Классический выбор

### **3. Безопасность:**
- Добавьте CORS настройки
- Настройте HTTPS
- Добавьте аутентификацию
- Настройте rate limiting

## 📊 Мониторинг

### **Логи сервера:**
```bash
# Просмотр логов
tail -f server.log

# Мониторинг в реальном времени
pm2 logs ankor-server
```

### **Метрики:**
- Количество запросов
- Время ответа
- Ошибки API
- Статус синхронизации

## 🆘 Решение проблем

### **Сервер не запускается:**
```bash
# Проверьте порт
lsof -i :3000

# Установите зависимости
cd server && npm install
```

### **Ошибки CORS:**
```javascript
// В server/index.js
app.use(cors({
  origin: ['http://localhost:3001', 'https://your-domain.com'],
  credentials: true
}))
```

### **Ошибки синхронизации:**
1. Проверьте URL API в .env
2. Убедитесь что сервер запущен
3. Проверьте CORS настройки
4. Посмотрите логи браузера

## 🎉 Готово!

Теперь ваше приложение AnKor полностью интегрировано с сервером и готово для деплоя на AEZA!

**Следующие шаги:**
1. Настройте домен на AEZA
2. Обновите VITE_API_URL
3. Загрузите код на сервер
4. Запустите приложение

**Удачи в изучении Android и Kotlin! 🚀**
