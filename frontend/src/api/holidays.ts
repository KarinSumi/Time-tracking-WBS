import { apiFetch } from './client';
import type { Holiday } from '../types';

export const getHolidays = () => apiFetch<Holiday[]>('/holidays');
export const createHoliday = (data: Partial<Holiday>) => apiFetch<Holiday>('/holidays', { method: 'POST', body: JSON.stringify(data) });
export const updateHoliday = (id: string, data: Partial<Holiday>) => apiFetch<Holiday>(`/holidays/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteHoliday = (id: string) => apiFetch<void>(`/holidays/${id}`, { method: 'DELETE' });
