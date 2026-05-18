export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  orgName?: string;
  orgId?: string;
  brandColor?: string;
  logoUrl?: string;
  hoursLogged?: number;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  status?: string;
  orgId?: string;
}

export interface Phase {
  id: string;
  name: string;
  sortOrder?: number;
}

export interface TimeEntry {
  id?: string;
  taskDescription: string;
  hours: number;
  userId: string;
  date: string;
  status?: string;
  user?: { name: string; email: string; avatarUrl?: string };
  project?: Project | null;
  phase?: Phase | null;
  plannedTaskId?: string | null;
}

export interface PlannedTask {
  id: string;
  taskDescription: string;
  plannedHours: number;
  startDate: string;
  endDate: string;
  status: string;
  assigneeId: string;
  projectId?: string;
  phaseId?: string;
  wbsId?: string;
  assignee?: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'>;
  project?: Pick<Project, 'id' | 'name' | 'color'> | null;
  phase?: Pick<Phase, 'id' | 'name'> | null;
  actualHours?: number;
}

export interface Holiday {
  id: string;
  date: string;
  description: string;
  orgId: string;
}
export interface CapacityTask {
  id: string;
  description: string;
  wbsId?: string;
  totalPlanned: number;
  apportionedPlanned: number;
  startDate: string;
  endDate: string;
}

export interface CapacityData {
  userId: string;
  userName: string;
  maxCapacityHours: number;
  totalPlannedHours: number;
  totalActualHours: number;
  plannedUtilization: number;
  actualUtilization: number;
  utilizationPercentage: number;
  tasks: CapacityTask[];
}

export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  performedBy: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  timestamp: string;
  user?: { name: string; email: string; avatarUrl?: string };
}

export interface Organization {
  id: string;
  name: string;
  brandColor: string;
  logoUrl?: string;
  hoursLogged?: number;
}

export interface ForecastData {
  month: string;
  maxCapacity: number;
  plannedHours: number;
  utilization: number;
}
