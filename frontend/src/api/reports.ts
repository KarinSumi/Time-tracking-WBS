import { axiosClient } from './client';

export const getCapacity = (startDate: string, endDate: string) => axiosClient.get<any[]>(`/reports/capacity?startDate=${startDate}&endDate=${endDate}`);
export const getForecasting = () => axiosClient.get<any>('/reports/forecasting');
