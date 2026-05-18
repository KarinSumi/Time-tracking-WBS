import { apiFetch } from './client';
import type { User } from '../types';

export const login = (data: any) => apiFetch<{ token: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(data) });
export const register = (data: any) => apiFetch<{ token: string; user: User }>('/auth/register', { method: 'POST', body: JSON.stringify(data) });
export const getMe = () => apiFetch<User>('/auth/me');
export const uploadAvatar = (formData: FormData) => apiFetch<{ avatarUrl: string }>('/auth/profile/avatar', { method: 'POST', body: formData });
