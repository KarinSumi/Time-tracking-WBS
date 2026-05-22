import { axiosClient } from './client';
import type { Phase } from '../types';

export const getPhases = () => axiosClient.get<Phase[]>('/phases');
export const createPhase = (data: Partial<Phase>) => axiosClient.post<Phase>('/phases', data);
export const updatePhase = (id: string, data: Partial<Phase>) => axiosClient.put<Phase>(`/phases/${id}`, data);
export const deletePhase = (id: string) => axiosClient.delete<void>(`/phases/${id}`);
