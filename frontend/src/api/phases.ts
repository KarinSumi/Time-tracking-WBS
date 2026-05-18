import { apiFetch } from './client';
import type { Phase } from '../types';

export const getPhases = () => apiFetch<Phase[]>('/phases');
export const createPhase = (data: Partial<Phase>) => apiFetch<Phase>('/phases', { method: 'POST', body: JSON.stringify(data) });
export const updatePhase = (id: string, data: Partial<Phase>) => apiFetch<Phase>(`/phases/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deletePhase = (id: string) => apiFetch<void>(`/phases/${id}`, { method: 'DELETE' });
