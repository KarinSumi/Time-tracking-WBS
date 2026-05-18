import { apiFetch } from './client';
import type { Organization } from '../types';

export const getSettings = () => apiFetch<Organization>('/organizations/settings');
export const updateSettings = (data: Partial<Organization>) => apiFetch<Organization>('/organizations/settings', { method: 'PATCH', body: JSON.stringify(data) });
export const uploadLogo = (formData: FormData) => apiFetch<{ logoUrl: string }>('/organizations/logo', { method: 'POST', body: formData });
