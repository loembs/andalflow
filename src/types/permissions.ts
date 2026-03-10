// Types pour la gestion des permissions et rôles
// Import des types depuis index.ts pour maintenir la cohérence
import type { UserRole, UserRoleLowercase } from './index';

// Type pour les rôles en minuscules (pour l'UI)
export type UserRoleUI = UserRoleLowercase;

export type ProjectPermission = 
  | 'create_project'
  | 'view_project'
  | 'edit_project'
  | 'delete_project'
  | 'assign_tasks'
  | 'view_all_projects'
  | 'manage_team'
  | 'view_analytics'
  | 'manage_users';

export interface Permission {
  action: ProjectPermission;
  resource: string;
  conditions?: Record<string, any>;
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
}

// Configuration des permissions par rôle (utilise les rôles en majuscules comme backend)
export const ROLE_PERMISSIONS: Record<UserRole, ProjectPermission[]> = {
  ADMIN: [
    'create_project',
    'view_project',
    'edit_project',
    'delete_project',
    'assign_tasks',
    'view_all_projects',
    'manage_team',
    'view_analytics',
    'manage_users',
  ],
  // L'assistant admin dispose des mêmes droits que l'admin
  ADMIN_ASSISTANT: [
    'create_project',
    'view_project',
    'edit_project',
    'delete_project',
    'assign_tasks',
    'view_all_projects',
    'manage_team',
    'view_analytics',
    'manage_users',
  ],
  MANAGER: [
    'create_project',
    'view_project',
    'edit_project',
    'assign_tasks',
    'view_all_projects',
    'manage_team',
  ],
  DEVELOPER: [
    'create_project',
    'view_project',
    'edit_project',
    'assign_tasks',
  ],
  DESIGNER: [
    'create_project',
    'view_project',
    'edit_project',
    'assign_tasks',
  ],
  COMMUNITY_MANAGER: [
    'create_project',
    'view_project',
    'edit_project',
    'assign_tasks',
  ],
  CONTENT_MANAGER: [
    'create_project',
    'view_project',
    'edit_project',
    'assign_tasks',
  ],
};

// Les types ProjectAction et ProjectTracking sont maintenant dans index.ts
// Importez-les depuis là si nécessaire

// Types pour les statistiques par rôle
export interface RoleStats {
  role: UserRole;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  averageProgress: number;
  recentActivity: import('./index').ProjectAction[];
}
