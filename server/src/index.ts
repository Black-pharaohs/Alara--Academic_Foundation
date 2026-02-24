import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

// setup database file in top-level data folder
const DB_PATH = path.resolve(process.cwd(), '../data/alara.sqlite');
let db: Database<sqlite3.Database, sqlite3.Statement>;

async function initDb() {
  db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  // ensure tables exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      name TEXT,
      password TEXT,
      role TEXT,
      phone TEXT,
      created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      date TEXT,
      student_name TEXT,
      email TEXT,
      phone TEXT,
      school_name TEXT,
      address TEXT,
      academic_strengths TEXT,
      interests TEXT,
      soft_skills TEXT,
      work_preference TEXT,
      env_preference TEXT,
      top_major TEXT,
      match_score INTEGER
    );
  `);

  console.log('[Server DB] Initialized at', DB_PATH);
}

const app = express();
app.use(cors());
app.use(bodyParser.json());

// simple health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// submissions endpoints
app.get('/api/submissions', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM submissions ORDER BY date DESC');
    res.json(rows);
  } catch (err) {
    console.error('[API] get submissions error', err);
    res.status(500).json({ error: 'internal' });
  }
});

app.post('/api/submissions', async (req, res) => {
  try {
    const s = req.body;
    // ensure required fields
    await db.run(`
      INSERT INTO submissions (
        id, user_id, date, student_name, email, phone, school_name, address,
        academic_strengths, interests, soft_skills, work_preference, env_preference,
        top_major, match_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      s.id, s.user_id, s.date, s.student_name, s.email, s.phone, s.school_name, s.address,
      s.academic_strengths, s.interests, s.soft_skills, s.work_preference, s.env_preference,
      s.top_major, s.match_score
    ]);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('[API] post submission error', err);
    res.status(500).json({ error: 'internal' });
  }
});

app.delete('/api/submissions', async (req, res) => {
  try {
    await db.run('DELETE FROM submissions');
    res.json({ success: true });
  } catch (err) {
    console.error('[API] delete submissions error', err);
    res.status(500).json({ error: 'internal' });
  }
});

// TODO: auth endpoints (login, register) could mirror previous services

// start server
const PORT = process.env.PORT || 4000;
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('[Server] Failed to start', err);
  process.exit(1);
});
