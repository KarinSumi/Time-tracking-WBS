import { axiosClient } from './client';
import type { User } from '../types';

export const login = (data: any) => axiosClient.post<{ token: string; user: User }>('/auth/login', data);
export const register = (data: any) => axiosClient.post<{ token: string; user: User }>('/auth/register', data);
export const getMe = () => axiosClient.get<User>('/auth/me');
export const uploadAvatar = (formData: FormData) => axiosClient.post<{ avatarUrl: string }>('/auth/profile/avatar', formData);
export const bulkRegisterUsers = (formData: FormData) => axiosClient.post<{ created: number; skipped: number; errors: string[] }>('/auth/bulk-register', formData);
