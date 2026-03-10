import { User, Project } from '@/types';
import { UserRole, ProjectPermission, ROLE_PERMISSIONS, Permission } from '@/types/permissions';

// Interface pour le service de permissions (Principe SOLID - Interface Segregation)
export interface IPermissionService {
  hasPermission(user: User, permission: ProjectPermission, resource?: any): boolean;
  canCreateProject(user: User): boolean;
  canViewProject(user: User, project: Project): boolean;
  canEditProject(user: User, project: Project): boolean;
  canDeleteProject(user: User, project: Project): boolean;
  canViewAllProjects(user: User): boolean;
  canManageTeam(user: User): boolean;
  canViewAnalytics(user: User): boolean;
  canManageUsers(user: User): boolean;
  getUserPermissions(user: User): ProjectPermission[];
  filterProjectsByPermission(user: User, projects: Project[]): Project[];
}

// Implémentation du service de permissions
export class PermissionService implements IPermissionService {
  hasPermission(user: User, permission: ProjectPermission, resource?: any): boolean {
    const userPermissions = ROLE_PERMISSIONS[user.role as UserRole] || [];
    return userPermissions.includes(permission);
  }

  canCreateProject(user: User): boolean {
    return this.hasPermission(user, 'create_project');
  }

  canViewProject(user: User, project: Project): boolean {
    // Admin et managers peuvent voir tous les projets
    if (this.hasPermission(user, 'view_all_projects')) {
      return true;
    }

    // Les autres utilisateurs peuvent voir les projets où ils sont membres
    return project.teamMembers.includes(user.id);
  }

  canEditProject(user: User, project: Project): boolean {
    // Admin peut éditer tous les projets
    if (user.role === 'ADMIN') {
      return true;
    }

    // Managers peuvent éditer les projets qu'ils gèrent
    if (user.role === 'MANAGER' && this.hasPermission(user, 'edit_project')) {
      return true;
    }

    // Les créateurs du projet peuvent l'éditer
    return project.teamMembers.includes(user.id) && this.hasPermission(user, 'edit_project');
  }

  canDeleteProject(user: User, project: Project): boolean {
    // Seul l'admin peut supprimer des projets
    return user.role === 'ADMIN' && this.hasPermission(user, 'delete_project');
  }

  canViewAllProjects(user: User): boolean {
    return this.hasPermission(user, 'view_all_projects');
  }

  canManageTeam(user: User): boolean {
    return this.hasPermission(user, 'manage_team');
  }

  canViewAnalytics(user: User): boolean {
    return this.hasPermission(user, 'view_analytics');
  }

  canManageUsers(user: User): boolean {
    return this.hasPermission(user, 'manage_users');
  }

  getUserPermissions(user: User): ProjectPermission[] {
    return ROLE_PERMISSIONS[user.role as UserRole] || [];
  }

  filterProjectsByPermission(user: User, projects: Project[]): Project[] {
    if (this.canViewAllProjects(user)) {
      return projects;
    }

    return projects.filter(project => this.canViewProject(user, project));
  }

  // Méthodes utilitaires pour les composants
  getRoleDisplayName(role: UserRole): string {
    const roleNames: Record<UserRole, string> = {
      ADMIN: 'Administrateur',
      ADMIN_ASSISTANT: 'Assistant admin',
      MANAGER: 'Manager',
      DEVELOPER: 'Développeur',
      DESIGNER: 'Designer',
      COMMUNITY_MANAGER: 'Community Manager',
      CONTENT_MANAGER: 'Content Manager / Vidéaste',
    };
    return roleNames[role] || role;
  }

  getRoleColor(role: UserRole): string {
    const roleColors: Record<UserRole, string> = {
      ADMIN: 'destructive',
      ADMIN_ASSISTANT: 'destructive',
      MANAGER: 'default',
      DEVELOPER: 'secondary',
      DESIGNER: 'outline',
      COMMUNITY_MANAGER: 'default',
      CONTENT_MANAGER: 'default',
    };
    return roleColors[role] || 'secondary';
  }
}

// Instance singleton
export const permissionService = new PermissionService();
