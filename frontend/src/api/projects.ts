import { axiosClient } from './client';
import type { Project } from '../types';

export const getProjects = () => axiosClient.get<Project[]>('/projects');
export const getProject = (id: string) => axiosClient.get<Project>(`/projects/${id}`);
export const createProject = (data: Partial<Project>) => axiosClient.post<Project>('/projects', data);
export const updateProject = (id: string, data: Partial<Project>) => axiosClient.put<Project>(`/projects/${id}`, data);
export const deleteProject = (id: string) => axiosClient.delete<void>(`/projects/${id}`);
export const getProjectStats = (id: string) => axiosClient.get<any>(`/projects/${id}/stats`);
