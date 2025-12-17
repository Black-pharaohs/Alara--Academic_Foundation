
// This service handles SQLite via sql.js in the browser
// It persists the binary database to localStorage to simulate a persistent server DB

let db: any = null;
const DB_STORAGE_KEY = 'alara_sqlite_db_bin';

export const initDB = async () => {
  if (db) return db;

  try {
    // @ts-ignore - sql.js is loaded via script tag
    const SQL = await window.initSqlJs({
      locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
    });

    const savedDb = localStorage.getItem(DB_STORAGE_KEY);
    
    if (savedDb) {
      const uInt8Array = new Uint8Array(JSON.parse(savedDb));
      db = new SQL.Database(uInt8Array);
    } else {
      db = new SQL.Database();
      initTables();
    }
    
    console.log("SQLite Database Initialized");
    return db;
  } catch (err) {
    console.error("Failed to init SQLite:", err);
    return null;
  }
};

const initTables = () => {
  if (!db) return;
  
  // Create Users Table
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

  // Create Submissions Table
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
  
  saveDB();
};

export const saveDB = () => {
  if (!db) return;
  const data = db.export();
  const arr = Array.from(data);
  localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(arr));
};

export const getDB = () => db;

// SQL Helper to run query and return objects
export const runQuery = (sql: string, params: any[] = []) => {
  if (!db) return [];
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const result = [];
  while (stmt.step()) {
    result.push(stmt.getAsObject());
  }
  stmt.free();
  return result;
};

export const executeRun = (sql: string, params: any[] = []) => {
  if (!db) return;
  db.run(sql, params);
  saveDB();
};
