import { supabase } from '@/lib/supabaseClient';
import type { Project, ProjectStatus, ProjectPriority } from '@/types';

export interface CreateProjectInput {
  name: string;
  clientId?: string;
  client?: string;
  description: string;
  priority: ProjectPriority;
  startDate: string | Date;
  endDate?: string | Date;
  budget?: number;
  teamMembers?: string[];
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {}

const mapStatus = (s: string): ProjectStatus => {
  if (['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED'].includes(s)) return s as ProjectStatus;
  return 'DRAFT';
};

const mapPriority = (p: string): ProjectPriority => {
  if (['LOW', 'MEDIUM', 'HIGH'].includes(p)) return p as ProjectPriority;
  return 'MEDIUM';
};

const rowToProject = (row: any): Project => ({
  id: row.id,
  name: row.name,
  client: row.clients?.name ?? row.client_name ?? '—',
  description: row.description ?? '',
  status: mapStatus(row.status ?? 'DRAFT'),
  priority: mapPriority(row.priority ?? 'MEDIUM'),
  progress: Number(row.progress ?? 0),
  startDate: row.start_date ?? new Date().toISOString(),
  endDate: row.end_date ?? undefined,
  budget: row.budget != null ? Number(row.budget) : undefined,
  userId: row.owner_id ?? '',
  teamMembers: row.team_member_ids ?? [],
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const ensureSupabase = () => {
  if (!supabase) throw new Error('Supabase n’est pas configuré.');
  return supabase;
};

export const projectServiceSupabase = {
  async list(limit: number = 50): Promise<Project[]> {
    const sb = ensureSupabase();
    const { data: rows, error } = await sb
      .from('projects')
      .select(`
        id,
        name,
        description,
        status,
        priority,
        progress,
        owner_id,
        start_date,
        end_date,
        budget,
        created_at,
        updated_at,
        client_id,
        clients ( name )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);

    const projects = (rows || []).map((r: any) => ({
      ...rowToProject(r),
      client: r.clients?.name ?? '—',
    }));

    const projectIds = projects.map((p) => p.id);
    if (projectIds.length > 0) {
      const { data: members } = await sb
        .from('project_members')
        .select('project_id, user_id')
        .in('project_id', projectIds);
      const byProject = (members || []).reduce((acc: Record<string, string[]>, m: any) => {
        if (!acc[m.project_id]) acc[m.project_id] = [];
        acc[m.project_id].push(m.user_id);
        return acc;
      }, {});
      projects.forEach((p) => {
        (p as any).teamMembers = byProject[p.id] ?? [];
      });
    }

    return projects;
  },

  async getById(id: string): Promise<Project | null> {
    const sb = ensureSupabase();
    const { data: row, error } = await sb
      .from('projects')
      .select(`
        *,
        clients ( name )
      `)
      .eq('id', id)
      .single();

    if (error || !row) return null;
    const project = rowToProject(row);
    project.client = (row as any).clients?.name ?? '—';
    const { data: members } = await sb.from('project_members').select('user_id').eq('project_id', id);
    (project as any).teamMembers = (members || []).map((m: any) => m.user_id);
    return project;
  },

  async create(input: CreateProjectInput): Promise<Project> {
    const sb = ensureSupabase();
    const { data: { user } } = await sb.auth.getUser();
    const payload: any = {
      name: input.name,
      description: input.description,
      status: 'ACTIVE',
      priority: (input.priority ?? 'MEDIUM').toUpperCase(),
      progress: 0,
      owner_id: user?.id ?? null,
      start_date: input.startDate ? new Date(input.startDate).toISOString().slice(0, 10) : null,
      end_date: input.endDate ? new Date(input.endDate).toISOString().slice(0, 10) : null,
      budget: input.budget ?? null,
    };
    if (input.clientId) payload.client_id = input.clientId;

    const { data, error } = await sb.from('projects').insert(payload).select('*').single();
    if (error) throw new Error(error.message);

    const project = rowToProject(data);
    project.client = input.client ?? '—';
    project.teamMembers = input.teamMembers ?? [];

    // Insérer tous les membres en parallèle et attendre leur complétion
    const memberInserts: PromiseLike<any>[] = [];
    if (user?.id) {
      memberInserts.push(
        sb.from('project_members').insert({ project_id: data.id, user_id: user.id, role_on_project: 'OWNER' })
      );
    }
    for (const uid of (input.teamMembers || [])) {
      if (uid !== user?.id) {
        memberInserts.push(
          sb.from('project_members').insert({ project_id: data.id, user_id: uid, role_on_project: null })
        );
      }
    }
    await Promise.all(memberInserts);

    return { ...project, id: data.id, createdAt: data.created_at, updatedAt: data.updated_at };
  },

  async update(id: string, input: UpdateProjectInput): Promise<Project> {
    const sb = ensureSupabase();
    const payload: any = {};
    if (input.name != null) payload.name = input.name;
    if (input.description != null) payload.description = input.description;
    if (input.priority != null) payload.priority = input.priority;
    if (input.startDate != null) payload.start_date = new Date(input.startDate).toISOString().slice(0, 10);
    if (input.endDate != null) payload.end_date = new Date(input.endDate).toISOString().slice(0, 10);
    if (input.budget != null) payload.budget = input.budget;
    if (input.clientId != null) payload.client_id = input.clientId;

    const { data, error } = await sb.from('projects').update(payload).eq('id', id).select('*').single();
    if (error) throw new Error(error.message);

    const existing = await this.getById(id);
    return existing ?? rowToProject(data);
  },

  async remove(id: string): Promise<void> {
    const sb = ensureSupabase();
    const { error } = await sb.from('projects').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};
