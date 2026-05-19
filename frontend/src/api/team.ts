import { apiFetch } from './client';
import type { User } from '../types';

export const getTeam = () => apiFetch<User[]>('/team');
export const getTeamMembers = getTeam;
export const updateMemberRole = (memberId: string, role: string) => apiFetch<User>(`/team/${memberId}/role`, { method: 'PATCH', body: JSON.stringify({ role }) });
export const updateMemberManager = (memberId: string, managerId: string | null) => apiFetch<User>(`/team/${memberId}/manager`, { method: 'PATCH', body: JSON.stringify({ managerId }) });
