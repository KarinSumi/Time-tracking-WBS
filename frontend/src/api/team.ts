import { apiFetch } from './client';
import type { User } from '../types';

export const getTeam = () => apiFetch<User[]>('/team');
export const getTeamMembers = getTeam;
export const updateMemberRole = (memberId: string, role: string) => apiFetch<User>(`/team/${memberId}`, { method: 'PATCH', body: JSON.stringify({ role }) });
