const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

const app = express()
const PORT = process.env.PORT || 3000
const JWT_SECRET = process.env.JWT_SECRET || 'ankor-admin-secret-2025'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

// ─── SQLite ────────────────────────────────────────────────────────────
const DB_PATH = path.join(__dirname, 'data.db')
const db = new Database(DB_PATH)

db.exec(`
  CREATE TABLE IF NOT EXISTS questions (
    id          TEXT PRIMARY KEY,
    question    TEXT NOT NULL,
    answer      TEXT NOT NULL,
    detailedAnswer TEXT,
    codeExample TEXT,
    level       TEXT NOT NULL DEFAULT 'junior',
    category    TEXT NOT NULL DEFAULT 'android-sdk',
    studied     INTEGER NOT NULL DEFAULT 0,
    correct     INTEGER NOT NULL DEFAULT 0,
    incorrect   INTEGER NOT NULL DEFAULT 0,
    answered    INTEGER NOT NULL DEFAULT 0,
    createdAt   TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS stats (
    id      INTEGER PRIMARY KEY DEFAULT 1,
    studied INTEGER NOT NULL DEFAULT 0,
    correct INTEGER NOT NULL DEFAULT 0,
    total   INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS goals (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    description TEXT,
    type        TEXT NOT NULL DEFAULT 'questions',
    target      INTEGER NOT NULL DEFAULT 10,
    targetCount INTEGER,
    currentCount INTEGER DEFAULT 0,
    current     INTEGER NOT NULL DEFAULT 0,
    completed   INTEGER NOT NULL DEFAULT 0,
    createdAt   TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    id                 INTEGER PRIMARY KEY DEFAULT 1,
    theme              TEXT NOT NULL DEFAULT 'light',
    studyReminders     INTEGER NOT NULL DEFAULT 0,
    reminderTime       TEXT NOT NULL DEFAULT '19:00',
    backgroundGradient TEXT NOT NULL DEFAULT 'blue'
  );

  INSERT OR IGNORE INTO stats (id, studied, correct, total) VALUES (1, 0, 0, 0);
  INSERT OR IGNORE INTO settings (id) VALUES (1);
`)

// Seed если пусто
const count = db.prepare('SELECT COUNT(*) as n FROM questions').get()
if (count.n === 0) {
  const insert = db.prepare(`INSERT INTO questions (id,question,answer,detailedAnswer,codeExample,level,category,studied,correct,incorrect,answered,createdAt) VALUES (?,?,?,?,?,?,?,0,0,0,0,?)`)
  insert.run('1', 'Что такое Activity в Android?', 'Activity — это компонент Android, представляющий один экран с UI.',
    'Activity является одним из основных компонентов Android-приложения. Каждая Activity представляет один экран с пользовательским интерфейсом.',
    'class MainActivity : AppCompatActivity() {\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        setContentView(R.layout.activity_main)\n    }\n}',
    'junior', 'android-sdk', new Date().toISOString())
  insert.run('2', 'Что такое Fragment в Android?', 'Fragment — модульный компонент UI, который можно использовать в разных Activity.',
    'Fragment представляет поведение или часть UI в Activity. Fragment имеет собственный жизненный цикл.',
    'class MyFragment : Fragment() {\n    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {\n        return inflater.inflate(R.layout.fragment_my, container, false)\n    }\n}',
    'junior', 'android-sdk', new Date().toISOString())
  db.prepare('UPDATE stats SET total = 2 WHERE id = 1').run()
}

// ─── Middleware ─────────────────────────────────────────────────────────
app.use(cors())
app.use(express.json())

// JWT guard
const authMiddleware = (req, res, next) => {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized' })
  }
  try {
    jwt.verify(auth.slice(7), JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ success: false, error: 'Invalid token' })
  }
}

const ok  = (res, data, message = 'Success') => res.json({ success: true, data, message })
const err = (res, message = 'Error', status = 400) => res.status(status).json({ success: false, error: message })

const rowToQuestion = r => ({
  id: r.id, question: r.question, answer: r.answer,
  detailedAnswer: r.detailedAnswer || undefined,
  codeExample: r.codeExample || undefined,
  level: r.level, category: r.category,
  studied: !!r.studied, correct: r.correct, incorrect: r.incorrect,
  answered: !!r.answered, createdAt: r.createdAt,
})

// ─── Auth ───────────────────────────────────────────────────────────────
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body
  if (!password || password !== ADMIN_PASSWORD) {
    return err(res, 'Неверный пароль', 401)
  }
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '7d' })
  ok(res, { token }, 'Login successful')
})

// ─── Questions ──────────────────────────────────────────────────────────
app.get('/api/questions', (req, res) => {
  const { level, category, search } = req.query
  let sql = 'SELECT * FROM questions WHERE 1=1'
  const params = []
  if (level)    { sql += ' AND level = ?';    params.push(level) }
  if (category) { sql += ' AND category = ?'; params.push(category) }
  if (search)   { sql += ' AND (question LIKE ? OR answer LIKE ?)'; params.push(`%${search}%`, `%${search}%`) }
  sql += ' ORDER BY createdAt DESC'
  const rows = db.prepare(sql).all(...params)
  ok(res, rows.map(rowToQuestion))
})

app.get('/api/questions/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM questions WHERE id = ?').get(req.params.id)
  if (!row) return err(res, 'Not found', 404)
  ok(res, rowToQuestion(row))
})

app.post('/api/questions', authMiddleware, (req, res) => {
  const q = { ...req.body, id: Date.now().toString(), createdAt: new Date().toISOString() }
  db.prepare(`INSERT INTO questions (id,question,answer,detailedAnswer,codeExample,level,category,studied,correct,incorrect,answered,createdAt)
    VALUES (@id,@question,@answer,@detailedAnswer,@codeExample,@level,@category,0,0,0,0,@createdAt)`).run(q)
  db.prepare('UPDATE stats SET total = (SELECT COUNT(*) FROM questions) WHERE id = 1').run()
  ok(res, rowToQuestion(db.prepare('SELECT * FROM questions WHERE id = ?').get(q.id)), 'Created')
})

app.put('/api/questions/:id', authMiddleware, (req, res) => {
  const row = db.prepare('SELECT * FROM questions WHERE id = ?').get(req.params.id)
  if (!row) return err(res, 'Not found', 404)
  const upd = { ...rowToQuestion(row), ...req.body, id: req.params.id }
  db.prepare(`UPDATE questions SET question=@question,answer=@answer,detailedAnswer=@detailedAnswer,codeExample=@codeExample,level=@level,category=@category,studied=@studied,correct=@correct,incorrect=@incorrect,answered=@answered WHERE id=@id`)
    .run({ ...upd, studied: upd.studied ? 1 : 0, answered: upd.answered ? 1 : 0 })
  db.prepare('UPDATE stats SET total = (SELECT COUNT(*) FROM questions) WHERE id = 1').run()
  ok(res, rowToQuestion(db.prepare('SELECT * FROM questions WHERE id = ?').get(req.params.id)), 'Updated')
})

app.delete('/api/questions/:id', authMiddleware, (req, res) => {
  const row = db.prepare('SELECT id FROM questions WHERE id = ?').get(req.params.id)
  if (!row) return err(res, 'Not found', 404)
  db.prepare('DELETE FROM questions WHERE id = ?').run(req.params.id)
  db.prepare('UPDATE stats SET total = (SELECT COUNT(*) FROM questions) WHERE id = 1').run()
  ok(res, null, 'Deleted')
})

// Bulk create (для импорта)
app.post('/api/questions/bulk', authMiddleware, (req, res) => {
  const { questions } = req.body
  if (!Array.isArray(questions)) return err(res, 'questions must be array')
  const insert = db.prepare(`INSERT OR IGNORE INTO questions (id,question,answer,detailedAnswer,codeExample,level,category,studied,correct,incorrect,answered,createdAt)
    VALUES (@id,@question,@answer,@detailedAnswer,@codeExample,@level,@category,0,0,0,0,@createdAt)`)
  const insertMany = db.transaction(qs => qs.forEach(q => insert.run({
    id: Date.now().toString() + Math.random().toString(36).slice(2),
    question: q.question || '',
    answer: q.answer || '',
    detailedAnswer: q.detailedAnswer || null,
    codeExample: q.codeExample || null,
    level: q.level || 'junior',
    category: q.category || 'android-sdk',
    createdAt: new Date().toISOString(),
  })))
  insertMany(questions)
  db.prepare('UPDATE stats SET total = (SELECT COUNT(*) FROM questions) WHERE id = 1').run()
  ok(res, { created: questions.length }, 'Bulk created')
})

// Sync (офлайн)
app.post('/api/questions/sync', (req, res) => {
  const { questions: qs } = req.body
  if (!Array.isArray(qs)) return err(res, 'Invalid data')
  const upsert = db.prepare(`INSERT OR REPLACE INTO questions (id,question,answer,detailedAnswer,codeExample,level,category,studied,correct,incorrect,answered,createdAt)
    VALUES (@id,@question,@answer,@detailedAnswer,@codeExample,@level,@category,@studied,@correct,@incorrect,@answered,@createdAt)`)
  db.transaction(arr => arr.forEach(q => upsert.run({ ...q, studied: q.studied ? 1 : 0, answered: q.answered ? 1 : 0 })))(qs)
  db.prepare('UPDATE stats SET total = (SELECT COUNT(*) FROM questions) WHERE id = 1').run()
  const rows = db.prepare('SELECT * FROM questions ORDER BY createdAt DESC').all()
  ok(res, rows.map(rowToQuestion), 'Synced')
})

// ─── Stats ──────────────────────────────────────────────────────────────
app.get('/api/stats', (req, res) => {
  ok(res, db.prepare('SELECT studied,correct,total FROM stats WHERE id=1').get())
})
app.put('/api/stats', (req, res) => {
  const cur = db.prepare('SELECT * FROM stats WHERE id=1').get()
  const upd = { ...cur, ...req.body }
  db.prepare('UPDATE stats SET studied=@studied,correct=@correct,total=@total WHERE id=1').run(upd)
  ok(res, db.prepare('SELECT studied,correct,total FROM stats WHERE id=1').get(), 'Updated')
})
app.post('/api/stats/sync', (req, res) => {
  const cur = db.prepare('SELECT * FROM stats WHERE id=1').get()
  const upd = { ...cur, ...req.body }
  db.prepare('UPDATE stats SET studied=@studied,correct=@correct,total=@total WHERE id=1').run(upd)
  ok(res, db.prepare('SELECT studied,correct,total FROM stats WHERE id=1').get(), 'Synced')
})

// ─── Goals ──────────────────────────────────────────────────────────────
app.get('/api/goals', (req, res) => {
  const rows = db.prepare('SELECT * FROM goals').all()
  ok(res, rows.map(r => ({ ...r, completed: !!r.completed })))
})
app.post('/api/goals', (req, res) => {
  const g = { ...req.body, id: Date.now().toString(), createdAt: new Date().toISOString() }
  db.prepare(`INSERT INTO goals (id,title,description,type,target,targetCount,currentCount,current,completed,createdAt)
    VALUES (@id,@title,@description,@type,@target,@targetCount,@currentCount,@current,@completed,@createdAt)`)
    .run({ ...g, completed: g.completed ? 1 : 0 })
  ok(res, g, 'Created')
})
app.put('/api/goals/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM goals WHERE id=?').get(req.params.id)
  if (!row) return err(res, 'Not found', 404)
  const upd = { ...row, ...req.body, id: req.params.id }
  db.prepare('UPDATE goals SET title=@title,description=@description,type=@type,target=@target,targetCount=@targetCount,currentCount=@currentCount,current=@current,completed=@completed WHERE id=@id')
    .run({ ...upd, completed: upd.completed ? 1 : 0 })
  ok(res, { ...upd, completed: !!upd.completed }, 'Updated')
})
app.delete('/api/goals/:id', (req, res) => {
  db.prepare('DELETE FROM goals WHERE id=?').run(req.params.id)
  ok(res, null, 'Deleted')
})

// ─── Settings ───────────────────────────────────────────────────────────
app.get('/api/settings', (req, res) => {
  ok(res, db.prepare('SELECT theme,studyReminders,reminderTime,backgroundGradient FROM settings WHERE id=1').get())
})
app.put('/api/settings', (req, res) => {
  const cur = db.prepare('SELECT * FROM settings WHERE id=1').get()
  const upd = { ...cur, ...req.body }
  db.prepare('UPDATE settings SET theme=@theme,studyReminders=@studyReminders,reminderTime=@reminderTime,backgroundGradient=@backgroundGradient WHERE id=1').run(upd)
  ok(res, db.prepare('SELECT theme,studyReminders,reminderTime,backgroundGradient FROM settings WHERE id=1').get(), 'Updated')
})

// ─── Health ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => ok(res, { status: 'OK', db: 'SQLite', timestamp: new Date().toISOString() }))

app.use((req, res) => err(res, 'Route not found', 404))

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`🔐 Admin password: ${ADMIN_PASSWORD}`)
  console.log(`📊 API: http://localhost:${PORT}/api`)
  console.log(`🗄️  DB: ${DB_PATH}`)
})
