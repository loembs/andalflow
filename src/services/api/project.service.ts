import { apiClient } from './client';
import { Project, CreateProjectForm, ApiResponse, PaginatedResponse } from '@/types';
import { ProjectAction, ProjectTracking, RoleStats } from '@/types/permissions';

// Interface pour le service de projets (Principe SOLID - Interface Segregation)
export interface IProjectService {
  // Opérations CRUD de base
  getAllProjects(page?: number, limit?: number): Promise<PaginatedResponse<Project>>;
  getProjectById(id: string): Promise<Project>;
  createProject(projectData: CreateProjectForm): Promise<Project>;
  updateProject(id: string, projectData: Partial<CreateProjectForm>): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  
  // Filtrage et recherche
  getProjectsByStatus(status: Project['status']): Promise<Project[]>;
  getProjectsByPriority(priority: Project['priority']): Promise<Project[]>;
  getProjectsByUser(userId: string): Promise<Project[]>;
  getMyProjects(): Promise<Project[]>;
  
  // Suivi et actions
  getProjectActions(projectId: string): Promise<ProjectAction[]>;
  addProjectAction(action: Omit<ProjectAction, 'id' | 'timestamp'>): Promise<ProjectAction>;
  trackProject(projectId: string): Promise<void>;
  getProjectTracking(projectId: string): Promise<ProjectTracking>;
  
  // Statistiques et analytics
  getProjectStats(): Promise<{
    total: number;
    active: number;
    completed: number;
    averageProgress: number;
  }>;
  getRoleStats(): Promise<RoleStats[]>;
  
  // Gestion des équipes
  addTeamMember(projectId: string, userId: string): Promise<Project>;
  removeTeamMember(projectId: string, userId: string): Promise<Project>;
  getProjectTeam(projectId: string): Promise<any[]>;
}

// Implémentation du service de projets
export class ProjectService implements IProjectService {
  // Opérations CRUD de base
  async getAllProjects(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Project>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Project>>>(`/projects?page=${page}&limit=${limit}`);
    return response.data;
  }

  async getProjectById(id: string): Promise<Project> {
    const response = await apiClient.get<ApiResponse<Project>>(`/projects/${id}`);
    return response.data;
  }

  async createProject(projectData: CreateProjectForm): Promise<Project> {
    const response = await apiClient.post<ApiResponse<Project>>('/projects', projectData);
    return response.data;
  }

  async updateProject(id: string, projectData: Partial<CreateProjectForm>): Promise<Project> {
    const response = await apiClient.put<ApiResponse<Project>>(`/projects/${id}`, projectData);
    return response.data;
  }

  async deleteProject(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/projects/${id}`);
  }

  // Filtrage et recherche
  async getProjectsByStatus(status: Project['status']): Promise<Project[]> {
    const response = await apiClient.get<ApiResponse<Project[]>>(`/projects/status/${status}`);
    return response.data;
  }

  async getProjectsByPriority(priority: Project['priority']): Promise<Project[]> {
    const response = await apiClient.get<ApiResponse<Project[]>>(`/projects/priority/${priority}`);
    return response.data;
  }

  async getProjectsByUser(userId: string): Promise<Project[]> {
    const response = await apiClient.get<ApiResponse<Project[]>>(`/projects/user/${userId}`);
    return response.data;
  }

  async getMyProjects(): Promise<Project[]> {
    const response = await apiClient.get<ApiResponse<Project[]>>('/projects/my');
    return response.data;
  }

  // Suivi et actions
  async getProjectActions(projectId: string): Promise<ProjectAction[]> {
    const response = await apiClient.get<ApiResponse<ProjectAction[]>>(`/projects/${projectId}/actions`);
    return response.data;
  }

  async addProjectAction(action: Omit<ProjectAction, 'id' | 'timestamp'>): Promise<ProjectAction> {
    const response = await apiClient.post<ApiResponse<ProjectAction>>(`/projects/${action.projectId}/actions`, action);
    return response.data;
  }

  async trackProject(projectId: string): Promise<void> {
    await apiClient.post<ApiResponse<void>>(`/projects/${projectId}/track`);
  }

  async getProjectTracking(projectId: string): Promise<ProjectTracking> {
    const response = await apiClient.get<ApiResponse<ProjectTracking>>(`/projects/${projectId}/tracking`);
    return response.data;
  }

  // Statistiques et analytics
  async getProjectStats(): Promise<{
    total: number;
    active: number;
    completed: number;
    averageProgress: number;
  }> {
    const response = await apiClient.get<ApiResponse<{
      total: number;
      active: number;
      completed: number;
      averageProgress: number;
    }>>('/projects/stats');
    return response.data;
  }

  async getRoleStats(): Promise<RoleStats[]> {
    const response = await apiClient.get<ApiResponse<RoleStats[]>>('/projects/role-stats');
    return response.data;
  }

  // Gestion des équipes
  async addTeamMember(projectId: string, userId: string): Promise<Project> {
    const response = await apiClient.post<ApiResponse<Project>>(`/projects/${projectId}/team`, { userId });
    return response.data;
  }

  async removeTeamMember(projectId: string, userId: string): Promise<Project> {
    const response = await apiClient.delete<ApiResponse<Project>>(`/projects/${projectId}/team/${userId}`);
    return response.data;
  }

  async getProjectTeam(projectId: string): Promise<any[]> {
    const response = await apiClient.get<ApiResponse<any[]>>(`/projects/${projectId}/team`);
    return response.data;
  }
}

// Instance singleton
export const projectService = new ProjectService();
