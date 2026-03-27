const express = require('express')
const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// In-memory storage (в реальном проекте используйте базу данных)
let questions = [
  {
    id: '1',
    question: 'Что такое Activity в Android?',
    answer: 'Activity - это компонент Android, который представляет один экран с пользовательским интерфейсом.',
    detailedAnswer: 'Activity является одним из основных компонентов Android приложения. Каждая Activity представляет один экран с пользовательским интерфейсом. Activity управляет жизненным циклом экрана, обрабатывает пользовательские события и координирует работу с другими компонентами приложения.',
    codeExample: 'class MainActivity : AppCompatActivity() {\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        setContentView(R.layout.activity_main)\n        \n        // Инициализация UI компонентов\n        val button = findViewById<Button>(R.id.button)\n        button.setOnClickListener {\n            // Обработка клика\n        }\n    }\n}',
    level: 'junior',
    category: 'android-sdk',
    studied: false,
    correct: 0,
    incorrect: 0,
    answered: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    question: 'Что такое Fragment в Android?',
    answer: 'Fragment - это модульный компонент UI, который можно использовать в разных Activity.',
    detailedAnswer: 'Fragment представляет поведение или часть пользовательского интерфейса в Activity. Fragment имеет собственный жизненный цикл, но зависит от Activity. Fragment можно использовать повторно в разных Activity, что делает код более модульным.',
    codeExample: 'class MyFragment : Fragment() {\n    override fun onCreateView(\n        inflater: LayoutInflater,\n        container: ViewGroup?,\n        savedInstanceState: Bundle?\n    ): View? {\n        return inflater.inflate(R.layout.fragment_my, container, false)\n    }\n}',
    level: 'junior',
    category: 'android-sdk',
    studied: false,
    correct: 0,
    incorrect: 0,
    answered: false,
    createdAt: new Date().toISOString()
  }
]

let stats = { studied: 0, correct: 0, total: 2 }
let goals = []
let settings = {
  theme: 'light',
  studyReminders: false,
  reminderTime: '19:00'
}

// Helper function
const sendResponse = (res, data, message = 'Success') => {
  res.json({
    success: true,
    data,
    message
  })
}

const sendError = (res, message = 'Error', status = 400) => {
  res.status(status).json({
    success: false,
    error: message
  })
}

// Routes

// Questions
app.get('/api/questions', (req, res) => {
  const { level } = req.query
  let filteredQuestions = questions
  
  if (level) {
    filteredQuestions = questions.filter(q => q.level === level)
  }
  
  sendResponse(res, filteredQuestions)
})

app.get('/api/questions/:id', (req, res) => {
  const question = questions.find(q => q.id === req.params.id)
  if (!question) {
    return sendError(res, 'Question not found', 404)
  }
  sendResponse(res, question)
})

app.post('/api/questions', (req, res) => {
  const newQuestion = {
    ...req.body,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  }
  questions.push(newQuestion)
  stats.total = questions.length
  sendResponse(res, newQuestion, 'Question created')
})

app.put('/api/questions/:id', (req, res) => {
  const index = questions.findIndex(q => q.id === req.params.id)
  if (index === -1) {
    return sendError(res, 'Question not found', 404)
  }
  
  questions[index] = { ...questions[index], ...req.body }
  sendResponse(res, questions[index], 'Question updated')
})

app.delete('/api/questions/:id', (req, res) => {
  const index = questions.findIndex(q => q.id === req.params.id)
  if (index === -1) {
    return sendError(res, 'Question not found', 404)
  }
  
  questions.splice(index, 1)
  stats.total = questions.length
  sendResponse(res, null, 'Question deleted')
})

// Batch sync for offline data
app.post('/api/questions/sync', (req, res) => {
  const { questions: syncQuestions } = req.body
  
  if (Array.isArray(syncQuestions)) {
    // Merge with existing questions
    syncQuestions.forEach(syncQ => {
      const existingIndex = questions.findIndex(q => q.id === syncQ.id)
      if (existingIndex >= 0) {
        questions[existingIndex] = { ...questions[existingIndex], ...syncQ }
      } else {
        questions.push(syncQ)
      }
    })
    
    stats.total = questions.length
    sendResponse(res, questions, 'Questions synced')
  } else {
    sendError(res, 'Invalid questions data')
  }
})

// Stats
app.get('/api/stats', (req, res) => {
  sendResponse(res, stats)
})

app.put('/api/stats', (req, res) => {
  stats = { ...stats, ...req.body }
  sendResponse(res, stats, 'Stats updated')
})

app.post('/api/stats/sync', (req, res) => {
  stats = { ...stats, ...req.body }
  sendResponse(res, stats, 'Stats synced')
})

// Goals
app.get('/api/goals', (req, res) => {
  sendResponse(res, goals)
})

app.post('/api/goals', (req, res) => {
  const newGoal = {
    ...req.body,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  }
  goals.push(newGoal)
  sendResponse(res, newGoal, 'Goal created')
})

app.put('/api/goals/:id', (req, res) => {
  const index = goals.findIndex(g => g.id === req.params.id)
  if (index === -1) {
    return sendError(res, 'Goal not found', 404)
  }
  
  goals[index] = { ...goals[index], ...req.body }
  sendResponse(res, goals[index], 'Goal updated')
})

app.delete('/api/goals/:id', (req, res) => {
  const index = goals.findIndex(g => g.id === req.params.id)
  if (index === -1) {
    return sendError(res, 'Goal not found', 404)
  }
  
  goals.splice(index, 1)
  sendResponse(res, null, 'Goal deleted')
})

// Settings
app.get('/api/settings', (req, res) => {
  sendResponse(res, settings)
})

app.put('/api/settings', (req, res) => {
  settings = { ...settings, ...req.body }
  sendResponse(res, settings, 'Settings updated')
})

// Health check
app.get('/api/health', (req, res) => {
  sendResponse(res, { status: 'OK', timestamp: new Date().toISOString() })
})

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack)
  sendError(res, 'Something went wrong!', 500)
})

// 404 handler
app.use((req, res) => {
  sendError(res, 'Route not found', 404)
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 API available at http://localhost:${PORT}/api`)
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`)
})
