import { axiosClient } from './client';

export const getHealth = () => axiosClient.get<any>('/health');
