
import { AuthUser, UserRole } from '../types';
import { executeRun, runQuery } from './db';

// Initialize default owner if not exists
const initAuth = () => {
  const users = runQuery(`SELECT * FROM users WHERE role = 'owner'`);
  if (users.length === 0) {
    executeRun(`
      INSERT INTO users (id, username, password, name, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `, ['owner-1', 'admin', '11235@Admin', 'مدير النظام', 'owner', new Date().toISOString()]);
  }
};

export const loginUser = (username: string, password: string): AuthUser | null => {
  initAuth();
  const users = runQuery(`SELECT * FROM users WHERE username = ? AND password = ?`, [username, password]);
  
  if (users.length > 0) {
    const user = users[0];
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role as UserRole,
      createdAt: user.created_at,
      phone: user.phone
    };
  }
  return null;
};

export const registerStudent = (data: { name: string; email: string; password: string; phone: string }) => {
  initAuth();
  const existing = runQuery(`SELECT * FROM users WHERE username = ?`, [data.email]);
  if (existing.length > 0) {
    throw new Error('البريد الإلكتروني مسجل مسبقاً');
  }

  const id = Date.now().toString();
  const createdAt = new Date().toISOString();

  executeRun(`
    INSERT INTO users (id, username, password, name, role, phone, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [id, data.email, data.password, data.name, 'student', data.phone, createdAt]);

  return {
    id,
    username: data.email,
    name: data.name,
    role: 'student' as UserRole,
    createdAt,
    phone: data.phone
  };
};

export const createAdmin = (currentAdmin: AuthUser, data: { username: string; password: string; name: string }) => {
  if (currentAdmin.role !== 'owner') {
    throw new Error('غير مصرح لك بإضافة مسؤولين');
  }
  
  const existing = runQuery(`SELECT * FROM users WHERE username = ?`, [data.username]);
  if (existing.length > 0) {
    throw new Error('اسم المستخدم مستخدم مسبقاً');
  }

  const id = Date.now().toString();
  const createdAt = new Date().toISOString();

  executeRun(`
    INSERT INTO users (id, username, password, name, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [id, data.username, data.password, data.name, 'admin', createdAt]);

  return {
    id,
    username: data.username,
    name: data.name,
    role: 'admin' as UserRole,
    createdAt
  };
};

export const updateProfile = (userId: string, data: { name?: string; password?: string; phone?: string }) => {
  const existing = runQuery(`SELECT * FROM users WHERE id = ?`, [userId]);
  if (existing.length === 0) throw new Error('المستخدم غير موجود');

  let sql = `UPDATE users SET `;
  const params = [];
  const updates = [];

  if (data.name) { updates.push('name = ?'); params.push(data.name); }
  if (data.password) { updates.push('password = ?'); params.push(data.password); }
  if (data.phone) { updates.push('phone = ?'); params.push(data.phone); }

  if (updates.length === 0) return {
    ...existing[0],
    username: existing[0].username,
    role: existing[0].role as UserRole,
    createdAt: existing[0].created_at
  };

  sql += updates.join(', ') + ` WHERE id = ?`;
  params.push(userId);

  executeRun(sql, params);
  
  const updated = runQuery(`SELECT * FROM users WHERE id = ?`, [userId])[0];
  return {
    id: updated.id,
    username: updated.username,
    name: updated.name,
    role: updated.role as UserRole,
    createdAt: updated.created_at,
    phone: updated.phone
  };
};

export const getAllAdmins = (currentAdmin: AuthUser) => {
  if (currentAdmin.role !== 'owner') return [];
  const rows = runQuery(`SELECT * FROM users WHERE role = 'admin'`);
  return rows.map((u: any) => ({
    id: u.id,
    username: u.username,
    name: u.name,
    role: u.role,
    createdAt: u.created_at
  }));
};
