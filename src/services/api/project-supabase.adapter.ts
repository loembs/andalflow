import type { Project, CreateProjectForm, PaginatedResponse } from '@/types';
import type { IProjectService } from './project.service';
import { projectServiceSupabase } from '@/services/supabase/projects.service';
import { supabase } from '@/lib/supabaseClient';

function toPriority(p: string): 'LOW' | 'MEDIUM' | 'HIGH' {
  const u = (p || 'MEDIUM').toString().toUpperCase();
  return u === 'LOW' || u === 'HIGH' ? u : 'MEDIUM';
}

export const projectServiceSupabaseAdapter: IProjectService = {
  async getAllProjects(page: number = 1, limit: number = 50): Promise<PaginatedResponse<Project>> {
    const data = await projectServiceSupabase.list(limit);
    return {
      data,
      pagination: {
        page,
        limit,
        total: data.length,
        totalPages: Math.max(1, Math.ceil(data.length / limit)),
      },
    };
  },

  async getProjectById(id: string): Promise<Project> {
    const p = await projectServiceSupabase.getById(id);
    if (!p) throw new Error('Projet non trouvé');
    return p;
  },

  async createProject(projectData: CreateProjectForm): Promise<Project> {
    const data = projectData as CreateProjectForm & { clientId?: string };
    return projectServiceSupabase.create({
      name: projectData.name,
      clientId: data.clientId,
      client: projectData.client,
      description: projectData.description,
      priority: toPriority(projectData.priority),
      startDate: projectData.startDate,
      endDate: projectData.endDate,
      budget: projectData.budget,
      teamMembers: projectData.teamMembers,
    });
  },

  async updateProject(id: string, projectData: Partial<CreateProjectForm>): Promise<Project> {
    const data = projectData as Partial<CreateProjectForm> & { clientId?: string };
    return projectServiceSupabase.update(id, {
      name: projectData.name,
      clientId: data.clientId,
      description: projectData.description,
      priority: projectData.priority ? toPriority(projectData.priority) : undefined,
      startDate: projectData.startDate,
      endDate: projectData.endDate,
      budget: projectData.budget,
    });
  },

  async deleteProject(id: string): Promise<void> {
    await projectServiceSupabase.remove(id);
  },

  async getProjectsByStatus(status: Project['status']): Promise<Project[]> {
    const all = await projectServiceSupabase.list(500);
    return all.filter((p) => p.status === status);
  },

  async getProjectsByPriority(priority: Project['priority']): Promise<Project[]> {
    const all = await projectServiceSupabase.list(500);
    return all.filter((p) => p.priority === priority);
  },

  async getProjectsByUser(userId: string): Promise<Project[]> {
    const all = await projectServiceSupabase.list(500);
    return all.filter((p) => p.userId === userId || (p.teamMembers && p.teamMembers.includes(userId)));
  },

  async getMyProjects(): Promise<Project[]> {
    return projectServiceSupabase.list(500);
  },

  async getProjectActions(_projectId: string): Promise<any[]> {
    return [];
  },

  async addProjectAction(_action: any): Promise<any> {
    throw new Error('Non implémenté avec Supabase');
  },

  async trackProject(_projectId: string): Promise<void> {
    // no-op
  },

  async getProjectTracking(_projectId: string): Promise<any> {
    return null;
  },

  async getProjectStats(): Promise<{ total: number; active: number; completed: number; averageProgress: number }> {
    const all = await projectServiceSupabase.list(500);
    const active = all.filter((p) => p.status === 'ACTIVE').length;
    const completed = all.filter((p) => p.status === 'COMPLETED').length;
    const sum = all.reduce((a, p) => a + p.progress, 0);
    return {
      total: all.length,
      active,
      completed,
      averageProgress: all.length ? Math.round(sum / all.length) : 0,
    };
  },

  async getRoleStats(): Promise<any[]> {
    return [];
  },

  async addTeamMember(projectId: string, userId: string): Promise<Project> {
    if (!supabase) throw new Error('Supabase non configuré');
    const { error } = await supabase
      .from('project_members')
      .upsert({ project_id: projectId, user_id: userId, role_on_project: null });
    if (error) throw new Error(error.message);
    const project = await projectServiceSupabase.getById(projectId);
    if (!project) throw new Error('Projet non trouvé');
    return project;
  },

  async removeTeamMember(projectId: string, userId: string): Promise<Project> {
    if (!supabase) throw new Error('Supabase non configuré');
    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
    const project = await projectServiceSupabase.getById(projectId);
    if (!project) throw new Error('Projet non trouvé');
    return project;
  },

  async getProjectTeam(projectId: string): Promise<any[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('project_members')
      .select('user_id, role_on_project, profiles(id, full_name, role, avatar_url)')
      .eq('project_id', projectId);
    if (error) return [];
    return data ?? [];
  },
};
