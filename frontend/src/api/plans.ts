import { apiFetch } from './client';
import type { PlannedTask, User } from '../types';

export const getPlans = () => apiFetch<PlannedTask[]>('/plans');
export const createPlan = (data: Partial<PlannedTask>) => apiFetch<PlannedTask>('/plans', { method: 'POST', body: JSON.stringify(data) });
export const updatePlan = (id: string, data: Partial<PlannedTask>) => apiFetch<PlannedTask>(`/plans/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deletePlan = (id: string) => apiFetch<void>(`/plans/${id}`, { method: 'DELETE' });
export const updatePlanDates = (id: string, startDate: string, endDate: string) => apiFetch<PlannedTask>(`/plans/${id}/dates`, { method: 'PATCH', body: JSON.stringify({ startDate, endDate }) });
export const uploadPlans = (formData: FormData) => apiFetch<{ created: number }>('/plans/upload', { method: 'POST', body: formData });
export const getPlanUsers = () => apiFetch<User[]>('/plans/users');
export const getPlanTemplate = () => '/api/plans/template'; // Return URL for download
