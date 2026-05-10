
import { AuthUser, UserRole } from '../types';
import { executeRun, runQuery } from './db';

const initAuth = () => {
  const users = runQuery(`SELECT * FROM users WHERE role = 'owner'`);
  if (users.length === 0) {
    executeRun(`
      INSERT INTO users (username, password, name, role, created_at)
      VALUES (?, ?, ?, ?, ?)
    `, ['admin', '1123@Admin', 'مدير النظام', 'owner', new Date().toISOString()]);
  }
};

export const loginUser = async (username: string, password: string): Promise<AuthUser | null> => {
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

export const registerStudent = async (userData: { name: string; email: string; password: string; phone: string }): Promise<AuthUser> => {
  initAuth();
  const existing = runQuery(`SELECT * FROM users WHERE username = ?`, [userData.email]);
  if (existing.length > 0) {
    throw new Error('البريد الإلكتروني مسجل مسبقاً');
  }

  const id = Date.now().toString();
  const createdAt = new Date().toISOString();

  executeRun(`
    INSERT INTO users (id, username, password, name, role, phone, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [id, userData.email, userData.password, userData.name, 'student', userData.phone, createdAt]);

  return {
    id,
    username: userData.email,
    name: userData.name,
    role: 'student' as UserRole,
    createdAt,
    phone: userData.phone
  };
};

export const createAdmin = async (currentAdmin: AuthUser, userData: { username: string; password: string; name: string }): Promise<AuthUser> => {
  if (currentAdmin.role !== 'owner') {
    throw new Error('غير مصرح لك بإضافة مسؤولين');
  }
  
  const existing = runQuery(`SELECT * FROM users WHERE username = ?`, [userData.username]);
  if (existing.length > 0) {
    throw new Error('اسم المستخدم مستخدم مسبقاً');
  }

  const id = Date.now().toString();
  const createdAt = new Date().toISOString();

  executeRun(`
    INSERT INTO users (id, username, password, name, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [id, userData.username, userData.password, userData.name, 'admin', createdAt]);

  return {
    id,
    username: userData.username,
    name: userData.name,
    role: 'admin' as UserRole,
    createdAt
  };
};

export const updateProfile = async (userId: string, data: { name?: string; password?: string; phone?: string }): Promise<AuthUser> => {
  const existing = runQuery(`SELECT * FROM users WHERE id = ?`, [userId]);
  if (existing.length === 0) throw new Error('المستخدم غير موجود');

  let sql = `UPDATE users SET `;
  const params = [];
  const updates = [];

  if (data.name) { updates.push('name = ?'); params.push(data.name); }
  if (data.password) { updates.push('password = ?'); params.push(data.password); }
  if (data.phone) { updates.push('phone = ?'); params.push(data.phone); }

  if (updates.length === 0) return {
    id: existing[0].id,
    name: existing[0].name,
    username: existing[0].username,
    role: existing[0].role as UserRole,
    createdAt: existing[0].created_at,
    phone: existing[0].phone
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

export const getAllAdmins = async (currentAdmin: AuthUser): Promise<AuthUser[]> => {
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
