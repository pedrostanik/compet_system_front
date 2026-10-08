import api from './axios';
import type { Me, Role, Session, UserAccount } from '@/types';

export const login = (email: string, password: string) =>
  api.post<Session>('/api/auth/login', { email, password }).then(r => r.data);

export const logout = () => api.post('/api/auth/logout');

export const getMe = () => api.get<Me>('/api/me').then(r => r.data);

/** Ends the user's other sessions; returns a new session for this device. */
export const changePassword = (currentPassword: string, newPassword: string) =>
  api.post<Session>('/api/me/password', { currentPassword, newPassword }).then(r => r.data);

// --- Account management (OWNER / ADMIN) ---

export const getUsers = () => api.get<UserAccount[]>('/api/users').then(r => r.data);

export const createUser = (data: { name: string; email: string; role: Role; temporaryPassword: string }) =>
  api.post<UserAccount>('/api/users', data).then(r => r.data);

export const updateUser = (id: string, data: { name: string; role: Role; status: UserAccount['status'] }) =>
  api.put<UserAccount>(`/api/users/${id}`, data).then(r => r.data);

export const resetUserPassword = (id: string, temporaryPassword: string) =>
  api.post<UserAccount>(`/api/users/${id}/reset-password`, { temporaryPassword }).then(r => r.data);
