import { axiosClient } from './client';
import type { User } from '../types';

export const getTeam = () => axiosClient.get<User[]>('/team');
export const getTeamMembers = getTeam;
export const updateMemberRole = (memberId: string, role: string) => axiosClient.patch<User>(`/team/${memberId}/role`, { role });
export const updateMemberManager = (memberId: string, managerId: string | null) => axiosClient.patch<User>(`/team/${memberId}/manager`, { managerId });
