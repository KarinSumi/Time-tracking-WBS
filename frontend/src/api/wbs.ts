import { apiFetch } from './client';

export const getWbsGantt = (projectId: string) => apiFetch<any[]>(`/wbs-gantt/${projectId}`);
