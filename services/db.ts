
// This service handles SQLite via sql.js in the browser
// It persists the binary database to localStorage to simulate a persistent server DB

let db: any = null;
const DB_STORAGE_KEY = 'alara_sqlite_db_bin';
const DB_FILE_DIR = 'data';
const DB_FILE_NAME = 'alara.sqlite';

const isNodeEnv = typeof window === 'undefined' || (typeof process !== 'undefined' && !!(process.versions && process.versions.node));

export const initDB = async () => {
  if (db) return db;

  try {
    // @ts-ignore - sql.js may be loaded via script tag in browser
    const SQL = (typeof window !== 'undefined' && (window as any).initSqlJs)
      ? await (window as any).initSqlJs({
          locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        })
      : null;

    // If running in Node/Electron and fs is available, try to load DB from disk
    if (isNodeEnv) {
      try {
        const { default: initSqlJs } = await import('sql.js');
        // Use sql.js package in Node if available
        const SQLNode = await initSqlJs({ locateFile: (f: string) => f });
        const loaded = await tryLoadDBFromDisk(SQLNode);
        if (loaded) {
          db = loaded;
          console.log('[DB] Loaded existing database from disk');
          return db;
        }
        // else create new DB using SQLNode
        db = new SQLNode.Database();
        await initTables();
        await saveDBToDisk(SQLNode);
        console.log('[DB] Created new database (Node/Electron)');
        return db;
      } catch (nodeErr) {
        console.warn('[DB] Node environment failed, falling back to browser approach', nodeErr);
        // fall through to browser approach if possible
      }
    }

    if (!SQL) {
      throw new Error('sql.js not available in this environment');
    }

    const savedDb = (typeof localStorage !== 'undefined') ? localStorage.getItem(DB_STORAGE_KEY) : null;

    if (savedDb) {
      const uInt8Array = new Uint8Array(JSON.parse(savedDb));
      db = new SQL.Database(uInt8Array);
      console.log('[DB] Loaded existing database from localStorage');
    } else {
      db = new SQL.Database();
      await initTables();
      // attempt to save to disk if possible
      try {
        await saveDBToDisk(SQL);
      } catch (e) {
        // ignore disk save errors in browser
      }
      console.log('[DB] Created new database (Browser)');
    }

    console.log('[DB] SQLite Database Initialization Complete');
    return db;
  } catch (err) {
    console.error('[DB] Failed to initialize SQLite:', err);
    return null;
  }
};

const initTables = async () => {
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
  
  await saveDB(); // Call saveDB to persist the database after table creation
};

export const saveDB = async () => {
  if (!db) return;
  const data = db.export();
  const arr = Array.from(data);
  
  // Save to localStorage (browser)
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(arr));
      console.log('[DB] Data saved to localStorage');
    }
  } catch (e) {
    console.warn('[DB] Failed to save to localStorage:', (e as Error).message);
  }

  // Save to disk (Node/Electron)
  try {
    const initSql = await import('sql.js').catch(() => null);
    if (initSql) {
      await saveDBToDisk(initSql as any);
    }
  } catch (err) {
    console.warn('[DB] Failed to save to disk:', err);
  }
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

export const executeRun = async (sql: string, params: any[] = []) => {
  if (!db) return;
  db.run(sql, params);
  await saveDB();
  console.log('[DB] Executed and persisted:', sql.substring(0, 50) + '...');
};

// --- Disk helpers (Node/Electron) ---
const tryLoadDBFromDisk = async (SQL: any) => {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const dir = path.resolve(process.cwd(), DB_FILE_DIR);
    const filePath = path.join(dir, DB_FILE_NAME);
    try {
      const stat = await fs.stat(filePath).catch(() => null);
      if (!stat) return false;
      const buf = await fs.readFile(filePath);
      const u8 = new Uint8Array(buf.buffer || buf);
      return new SQL.Database(u8);
    } catch (err) {
      return false;
    }
  } catch (e) {
    return false;
  }
};

const saveDBToDisk = async (SQL: any) => {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const dir = path.resolve(process.cwd(), DB_FILE_DIR);
    const filePath = path.join(dir, DB_FILE_NAME);
    await fs.mkdir(dir, { recursive: true }).catch(() => null);
    const data = db.export();
    const buffer = Buffer.from(data);
    await fs.writeFile(filePath, buffer);
    console.log(`Saved SQLite DB to ${filePath}`);
  } catch (err) {
    console.warn('Failed to save DB to disk:', err);
  }
};
