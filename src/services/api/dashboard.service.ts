import { apiClient } from './client';
import { DashboardStats, Project, Task, ApiResponse } from '@/types';

// Interface pour le service de dashboard (Principe SOLID - Interface Segregation)
export interface IDashboardService {
  getDashboardStats(): Promise<DashboardStats>;
  getRecentProjects(limit?: number): Promise<Project[]>;
  getUpcomingTasks(limit?: number): Promise<Task[]>;
  getProjectProgress(): Promise<{ projectId: string; progress: number }[]>;
  getTeamPerformance(): Promise<any>;
}

// Implémentation du service de dashboard
export class DashboardService implements IDashboardService {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return response.data;
  }

  async getRecentProjects(limit: number = 5): Promise<Project[]> {
    const response = await apiClient.get<ApiResponse<Project[]>>(`/dashboard/recent-projects?limit=${limit}`);
    return response.data;
  }

  async getUpcomingTasks(limit: number = 10): Promise<Task[]> {
    const response = await apiClient.get<ApiResponse<Task[]>>(`/dashboard/upcoming-tasks?limit=${limit}`);
    return response.data;
  }

  async getProjectProgress(): Promise<{ projectId: string; progress: number }[]> {
    const response = await apiClient.get<ApiResponse<{ projectId: string; progress: number }[]>>('/dashboard/project-progress');
    return response.data;
  }

  async getTeamPerformance(): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>('/dashboard/team-performance');
    return response.data;
  }
}

// Instance singleton
export const dashboardService = new DashboardService();
