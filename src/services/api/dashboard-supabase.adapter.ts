import type { DashboardStats, Project, Task } from '@/types';
import type { IDashboardService } from './dashboard.service';
import { dashboardServiceSupabase } from '@/services/supabase/dashboard.service';

export const dashboardServiceSupabaseAdapter: IDashboardService = {
  async getDashboardStats(): Promise<DashboardStats> {
    return dashboardServiceSupabase.getStats();
  },
  async getRecentProjects(limit: number = 5): Promise<Project[]> {
    return dashboardServiceSupabase.getRecentProjects(limit);
  },
  async getUpcomingTasks(_limit: number = 10): Promise<Task[]> {
    return [];
  },
  async getProjectProgress(): Promise<{ projectId: string; progress: number }[]> {
    return [];
  },
  async getTeamPerformance(): Promise<any> {
    return null;
  },
};
