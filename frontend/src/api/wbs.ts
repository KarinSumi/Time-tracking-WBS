import { axiosClient } from './client';

export const getWbsGantt = (projectId: string) => axiosClient.get<any[]>(`/wbs-gantt/${projectId}`);
