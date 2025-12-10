
import { AuthUser, UserRole } from '../types';

const USERS_KEY = 'masari_users';

// Initialize default owner if not exists
const initAuth = () => {
  const users = getUsers();
  if (!users.find(u => u.role === 'owner')) {
    const owner: AuthUser & { password: string } = {
      id: 'owner-1',
      username: 'admin',
      password: 'admin123', // In a real app, this should be hashed
      name: 'مدير النظام',
      role: 'owner',
      createdAt: new Date().toISOString()
    };
    users.push(owner);
    saveUsers(users);
  }
};

const getUsers = (): any[] => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveUsers = (users: any[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const loginUser = (username: string, password: string): AuthUser | null => {
  initAuth();
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    const { password, ...userWithoutPass } = user;
    return userWithoutPass;
  }
  return null;
};

export const registerStudent = (data: { name: string; email: string; password: string; phone: string }) => {
  const users = getUsers();
  if (users.find(u => u.username === data.email)) {
    throw new Error('البريد الإلكتروني مسجل مسبقاً');
  }

  const newUser = {
    id: Date.now().toString(),
    username: data.email,
    password: data.password,
    name: data.name,
    phone: data.phone,
    role: 'student' as UserRole,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);
  
  const { password, ...userWithoutPass } = newUser;
  return userWithoutPass;
};

export const createAdmin = (currentAdmin: AuthUser, data: { username: string; password: string; name: string }) => {
  if (currentAdmin.role !== 'owner') {
    throw new Error('غير مصرح لك بإضافة مسؤولين');
  }
  
  const users = getUsers();
  if (users.find(u => u.username === data.username)) {
    throw new Error('اسم المستخدم مستخدم مسبقاً');
  }

  const newAdmin = {
    id: Date.now().toString(),
    username: data.username,
    password: data.password,
    name: data.name,
    role: 'admin' as UserRole,
    createdAt: new Date().toISOString()
  };

  users.push(newAdmin);
  saveUsers(users);
  return newAdmin;
};

export const updateProfile = (userId: string, data: { name?: string; password?: string }) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) throw new Error('المستخدم غير موجود');

  if (data.name) users[index].name = data.name;
  if (data.password) users[index].password = data.password;

  saveUsers(users);
  
  const { password, ...updatedUser } = users[index];
  return updatedUser;
};

export const getAllAdmins = (currentAdmin: AuthUser) => {
  if (currentAdmin.role !== 'owner') return [];
  return getUsers().filter(u => u.role === 'admin').map(({ password, ...u }) => u);
};
