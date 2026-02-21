import fs from 'fs/promises';
import path from 'path';

async function main(){
  try {
    // dynamic import of sql.js
    const initSqlJs = (await import('sql.js')).default;

    const wasmPath = new URL('../node_modules/sql.js/dist/sql-wasm.wasm', import.meta.url).href;

    console.log('Initializing sql.js...');
    const SQL = await initSqlJs({ locateFile: () => wasmPath });

    const db = new SQL.Database();

    // Create tables - same schema as services/db.ts
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE,
        name TEXT,
        password TEXT,
        role TEXT,
        phone TEXT,
        created_at TEXT
      );
    `);

    db.run(`
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

    const data = db.export();
    const buffer = Buffer.from(data);

    const dir = path.resolve(process.cwd(), 'data');
    const filePath = path.join(dir, 'alara.sqlite');
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, buffer);

    console.log('Created SQLite DB at', filePath);
    process.exit(0);
  } catch (err) {
    console.error('Failed to initialize DB:', err.message || err);
    console.error('If sql.js is not installed, run: npm install sql.js');
    process.exit(2);
  }
}

main();
