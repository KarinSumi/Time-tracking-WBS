import { axiosClient } from './client';

export interface NextTaskSuggestion {
  type: 'PLAN' | 'PROJECT_FALLBACK' | 'GENERAL_FALLBACK' | 'NO_TASKS';
  plannedTaskId: string | null;
  projectId: string | null;
  phaseId: string | null;
  projectName: string;
  phaseName: string;
  taskDescription: string;
  title: string;
  description: string;
  hoursLeft: number;
}

export const suggestNextTask = () => axiosClient.get<NextTaskSuggestion>('/suggestions/next-task');
