import { axiosClient } from './client';
import type { TimeEntry, User, AuditLog } from '../types';

export const getAdminEntries = (params: any = {}) => {
  const searchParams = new URLSearchParams(params as any);
  return axiosClient.get<TimeEntry[]>(`/admin/entries?${searchParams.toString()}`);
};
export const getAdminUsers = () => axiosClient.get<User[]>('/admin/users');
export const updateAdminEntry = (id: string, data: any) => axiosClient.patch<TimeEntry>(`/admin/entries/${id}`, data);
export const createAdminEntry = (data: any) => axiosClient.post<TimeEntry>('/admin/entries', data);
export const uploadAdminEntries = (formData: FormData) => axiosClient.post<{ created: number; errors: number }>('/admin/entries/upload', formData);
export const getAuditLogs = () => axiosClient.get<AuditLog[]>('/admin/audit-logs');
export const getAdminStatus = () => axiosClient.get<any>('/admin/status');
export const unlockAdminAccount = (email: string) => axiosClient.post<{ success: boolean; message: string }>('/admin/status/unlock', { email });
export const triggerSystemUpgrade = () => axiosClient.post<{ message: string }>('/admin/status/upgrade');
