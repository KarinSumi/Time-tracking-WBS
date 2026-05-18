import { apiFetch } from './client';
import type { TimeEntry, User, AuditLog } from '../types';

export const getAdminEntries = (params: any = {}) => {
  const searchParams = new URLSearchParams(params as any);
  return apiFetch<TimeEntry[]>(`/admin/entries?${searchParams.toString()}`);
};
export const getAdminUsers = () => apiFetch<User[]>('/admin/users');
export const updateAdminEntry = (id: string, data: any) => apiFetch<TimeEntry>(`/admin/entries/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const createAdminEntry = (data: any) => apiFetch<TimeEntry>('/admin/entries', { method: 'POST', body: JSON.stringify(data) });
export const uploadAdminEntries = (formData: FormData) => apiFetch<{ created: number; errors: number }>('/admin/entries/upload', { method: 'POST', body: formData });
export const getAuditLogs = () => apiFetch<AuditLog[]>('/admin/audit-logs');
