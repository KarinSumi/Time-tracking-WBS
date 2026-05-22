import { axiosClient } from './client';
import type { TimeEntry } from '../types';

export const getEntries = () => axiosClient.get<TimeEntry[]>('/entries');
export const createEntry = (data: Partial<TimeEntry>) => axiosClient.post<TimeEntry>('/entries', data);
export const updateEntry = (id: string, data: Partial<TimeEntry>) => axiosClient.put<TimeEntry>(`/entries/${id}`, data);
export const deleteEntry = (id: string) => axiosClient.delete<void>(`/entries/${id}`);

export const createMultiDayEntries = (data: any) => axiosClient.post<{ count: number }>('/entries/multi-day', data);
export const createBulkEntries = (entries: any[]) => axiosClient.post<{ count: number }>('/entries/bulk', entries);
export const getDraftsSummary = () => axiosClient.get<{ count: number; hours: number }>('/entries/summary/drafts');

export const bulkUpdateStatus = (ids: string[], status: string) => axiosClient.post<{ count: number }>('/entries/bulk-status', { ids, status });
