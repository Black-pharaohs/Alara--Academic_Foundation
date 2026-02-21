
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
          console.log('SQLite DB loaded from disk');
          return db;
        }
        // else create new DB using SQLNode
        db = new SQLNode.Database();
        initTables();
        await saveDBToDisk(SQLNode);
        console.log('SQLite Database Initialized (Node)');
        return db;
      } catch (nodeErr) {
        console.warn('Node sql.js not available or failed to init, falling back to browser approach', nodeErr);
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
    } else {
      db = new SQL.Database();
      initTables();
      // attempt to save to disk if possible
      try {
        await saveDBToDisk(SQL);
      } catch (e) {
        // ignore disk save errors in browser
      }
    }

    console.log('SQLite Database Initialized');
    return db;
  } catch (err) {
    console.error('Failed to init SQLite:', err);
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
  
  saveDB(); // Call saveDB to persist the database after table creation
};

export const saveDB = () => {
  if (!db) return;
  const data = db.export();
  const arr = Array.from(data);
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(arr));
    }
  } catch (e) {
    // ignore localStorage errors
  }

  // attempt to save to disk when possible (Node/Electron)
  (async () => {
    try {
      const initSql = await import('sql.js').catch(() => null);
      if (!initSql) return;
      await saveDBToDisk(initSql as any);
    } catch (err) {
      // ignore disk save errors
    }
  })();
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
