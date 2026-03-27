#!/bin/bash

echo "🚀 Запуск AnKor React TypeScript версии..."

# Проверяем, установлен ли Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен. Устанавливаем..."
    echo "Скачайте Node.js с https://nodejs.org/"
    exit 1
fi

# Проверяем, установлен ли npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm не установлен. Устанавливаем..."
    exit 1
fi

# Устанавливаем зависимости если нужно
if [ ! -d "node_modules" ]; then
    echo "📦 Устанавливаем зависимости..."
    npm install
fi

# Получаем IP адрес
IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

echo ""
echo "✅ React версия готова!"
echo "📱 На iPhone откройте: http://$IP:3000"
echo "💻 На компьютере: http://localhost:3000"
echo ""
echo "🛑 Для остановки: Ctrl+C"
echo ""

# Запускаем dev сервер
npm run dev