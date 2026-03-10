import { apiClient } from './client';
import { authService as backendAuthService, type IAuthService } from './auth.service';
import { supabaseAuthService } from './auth.supabase.service';
import { projectService, type IProjectService } from './project.service';
import { projectServiceSupabaseAdapter } from './project-supabase.adapter';
import { dashboardService, type IDashboardService } from './dashboard.service';
import { dashboardServiceSupabaseAdapter } from './dashboard-supabase.adapter';
import { config } from '@/config/environment';
import { supabase } from '@/lib/supabaseClient';

// Export de tous les services API
export {
  apiClient,
  backendAuthService,
  supabaseAuthService,
  projectService,
  dashboardService,
  type IAuthService,
  type IProjectService,
  type IDashboardService,
};

// Sélecteur d’implémentation d’authentification (backend Spring ou Supabase)
export const getAuthService = (): IAuthService => {
  const hasSupabaseEnv =
    !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (
    config.supabase.authProvider === 'supabase' ||
    (config.supabase.authProvider === 'auto' && hasSupabaseEnv)
  ) {
    return supabaseAuthService;
  }

  return backendAuthService;
};

export const getProjectService = (): IProjectService => {
  if (supabase) return projectServiceSupabaseAdapter;
  return projectService;
};

export const getDashboardService = (): IDashboardService => {
  if (supabase) return dashboardServiceSupabaseAdapter;
  return dashboardService;
};
