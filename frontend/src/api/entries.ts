import { apiFetch } from './client';
import type { TimeEntry } from '../types';

export const getEntries = () => apiFetch<TimeEntry[]>('/entries');
export const createEntry = (data: Partial<TimeEntry>) => apiFetch<TimeEntry>('/entries', { method: 'POST', body: JSON.stringify(data) });
export const updateEntry = (id: string, data: Partial<TimeEntry>) => apiFetch<TimeEntry>(`/entries/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteEntry = (id: string) => apiFetch<void>(`/entries/${id}`, { method: 'DELETE' });

export const createMultiDayEntries = (data: any) => apiFetch<{ count: number }>('/entries/multi-day', { method: 'POST', body: JSON.stringify(data) });
export const createBulkEntries = (entries: any[]) => apiFetch<{ count: number }>('/entries/bulk', { method: 'POST', body: JSON.stringify(entries) });
export const getDraftsSummary = () => apiFetch<{ count: number; hours: number }>('/entries/summary/drafts');

export const bulkUpdateStatus = (ids: string[], status: string) => apiFetch<{ count: number }>('/entries/status', { method: 'PATCH', body: JSON.stringify({ ids, status }) });
