import { axiosClient } from './client';
import type { PlannedTask, User } from '../types';

export const getPlans = () => axiosClient.get<PlannedTask[]>('/plans');
export const createPlan = (data: Partial<PlannedTask>) => axiosClient.post<PlannedTask>('/plans', data);
export const updatePlan = (id: string, data: Partial<PlannedTask>) => axiosClient.put<PlannedTask>(`/plans/${id}`, data);
export const deletePlan = (id: string) => axiosClient.delete<void>(`/plans/${id}`);
export const updatePlanDates = (id: string, startDate: string, endDate: string) => axiosClient.patch<PlannedTask>(`/plans/${id}/dates`, { startDate, endDate });
export const uploadPlans = (formData: FormData) => axiosClient.post<{ created: number }>('/plans/upload', formData);
export const getPlanUsers = () => axiosClient.get<User[]>('/plans/users');
export const getPlanTemplate = () => '/api/plans/template'; // Return URL for download
