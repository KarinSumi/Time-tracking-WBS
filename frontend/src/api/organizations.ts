import { axiosClient } from './client';
import type { Organization } from '../types';

export const getSettings = () => axiosClient.get<Organization>('/organizations/settings');
export const updateSettings = (data: Partial<Organization>) => axiosClient.patch<Organization>('/organizations/settings', data);
export const uploadLogo = (formData: FormData) => axiosClient.post<{ logoUrl: string }>('/organizations/logo', formData);
