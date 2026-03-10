import { supabase } from '@/lib/supabaseClient';
import type { DashboardStats, Project } from '@/types';

const ensureSupabase = () => {
  if (!supabase) throw new Error('Supabase n’est pas configuré.');
  return supabase;
};

export const dashboardServiceSupabase = {
  async getStats(): Promise<DashboardStats> {
    const sb = ensureSupabase();

    // Nombre de projets actifs
    const { count: activeCount } = await sb
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'ACTIVE');

    // Nombre total de projets (pour le taux de complétion)
    const { count: totalCount } = await sb
      .from('projects')
      .select('id', { count: 'exact', head: true });

    // Nombre de projets terminés
    const { count: completedCount } = await sb
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'COMPLETED');

    // Nombre de membres (table profiles)
    const { count: membersCount } = await sb
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    // Projets créés ce mois vs mois dernier (tendance)
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

    const { count: thisMonthCount } = await sb
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfThisMonth);

    const { count: lastMonthCount } = await sb
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfLastMonth)
      .lt('created_at', startOfThisMonth);

    const active = activeCount ?? 0;
    const total = totalCount ?? 0;
    const completed = completedCount ?? 0;
    const members = membersCount ?? 0;
    const thisMonth = thisMonthCount ?? 0;
    const lastMonth = lastMonthCount ?? 0;

    // Taux de complétion = projets terminés / (actifs + terminés)
    const eligible = active + completed;
    const completionRate = eligible > 0 ? Math.round((completed / eligible) * 100) : 0;

    // Tendance projets ce mois vs mois dernier
    const projectTrendValue = lastMonth > 0
      ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100)
      : thisMonth > 0 ? 100 : 0;

    return {
      activeProjects: active,
      teamMembers: members,
      tasksInProgress: active, // projets actifs = charge de travail en cours
      completionRate,
      trends: {
        projects: {
          value: Math.abs(projectTrendValue),
          type: projectTrendValue >= 0 ? 'increase' : 'decrease',
        },
        tasks: { value: 0, type: 'increase' as const },
        completion: {
          value: completionRate,
          type: completionRate > 0 ? 'increase' : 'increase',
        },
      },
    };
  },

  async getRecentProjects(limit: number = 5): Promise<Project[]> {
    const sb = ensureSupabase();
    const { data: rows, error } = await sb
      .from('projects')
      .select(`
        id, name, description, status, priority, progress, owner_id,
        start_date, end_date, budget, created_at, updated_at, client_id,
        clients ( name )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (rows || []).map((r: any) => ({
      id: r.id,
      name: r.name,
      client: r.clients?.name ?? '—',
      description: r.description ?? '',
      status: (r.status ?? 'DRAFT') as Project['status'],
      priority: (r.priority ?? 'MEDIUM') as Project['priority'],
      progress: Number(r.progress ?? 0),
      startDate: r.start_date ?? new Date().toISOString(),
      endDate: r.end_date ?? undefined,
      budget: r.budget != null ? Number(r.budget) : undefined,
      userId: r.owner_id ?? '',
      teamMembers: [] as string[],
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  },
};
