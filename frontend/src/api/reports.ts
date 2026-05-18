import { apiFetch } from './client';

export const getCapacity = (startDate: string, endDate: string) => apiFetch<any[]>(`/reports/capacity?startDate=${startDate}&endDate=${endDate}`);
export const getForecasting = () => apiFetch<any>('/reports/forecasting');
