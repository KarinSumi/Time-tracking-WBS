import { axiosClient } from './client';
import type { Holiday } from '../types';

export const getHolidays = () => axiosClient.get<Holiday[]>('/holidays');
export const createHoliday = (data: Partial<Holiday>) => axiosClient.post<Holiday>('/holidays', data);
export const updateHoliday = (id: string, data: Partial<Holiday>) => axiosClient.put<Holiday>(`/holidays/${id}`, data);
export const deleteHoliday = (id: string) => axiosClient.delete<void>(`/holidays/${id}`);
