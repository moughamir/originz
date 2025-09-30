// Agent types for availability and roles
export type AgentStatus = 'online' | 'busy' | 'away' | 'offline';
export type AgentRole = 'AGENT' | 'SUPERVISOR' | 'ADMIN';

export interface WeekSchedule {
  // Simplified schedule representation (expand later)
  [weekday: string]: Array<{ start: string; end: string }>; // 24h time strings
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: AgentStatus;
  department: string;
  activeChats: number;
  maxConcurrentChats: number;
  workingHours: {
    timezone: string;
    schedule: WeekSchedule;
  };
}
