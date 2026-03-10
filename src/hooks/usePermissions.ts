import { useAuth } from './useAuth';
import { permissionService, IPermissionService } from '@/services/permissions.service';
import { Project } from '@/types';
import { ProjectPermission } from '@/types/permissions';

// Hook personnalisé pour les permissions (Principe SOLID - Dependency Inversion)
export const usePermissions = (permissionServiceInstance: IPermissionService = permissionService) => {
  const { user } = useAuth();

  // Vérification des permissions générales
  const hasPermission = (permission: ProjectPermission, resource?: any): boolean => {
    if (!user) return false;
    return permissionServiceInstance.hasPermission(user, permission, resource);
  };

  // Permissions spécifiques aux projets
  const canCreateProject = (): boolean => {
    if (!user) return false;
    return permissionServiceInstance.canCreateProject(user);
  };

  const canViewProject = (project: Project): boolean => {
    if (!user) return false;
    return permissionServiceInstance.canViewProject(user, project);
  };

  const canEditProject = (project: Project): boolean => {
    if (!user) return false;
    return permissionServiceInstance.canEditProject(user, project);
  };

  const canDeleteProject = (project: Project): boolean => {
    if (!user) return false;
    return permissionServiceInstance.canDeleteProject(user, project);
  };

  // Permissions d'administration
  const canViewAllProjects = (): boolean => {
    if (!user) return false;
    return permissionServiceInstance.canViewAllProjects(user);
  };

  const canManageTeam = (): boolean => {
    if (!user) return false;
    return permissionServiceInstance.canManageTeam(user);
  };

  const canViewAnalytics = (): boolean => {
    if (!user) return false;
    return permissionServiceInstance.canViewAnalytics(user);
  };

  const canManageUsers = (): boolean => {
    if (!user) return false;
    return permissionServiceInstance.canManageUsers(user);
  };

  // Utilitaires pour l'affichage
  const getUserPermissions = (): ProjectPermission[] => {
    if (!user) return [];
    return permissionServiceInstance.getUserPermissions(user);
  };

  const filterProjectsByPermission = (projects: Project[]): Project[] => {
    if (!user) return [];
    return permissionServiceInstance.filterProjectsByPermission(user, projects);
  };

  const getRoleDisplayName = (role: string): string => {
    return permissionServiceInstance.getRoleDisplayName(role as any);
  };

  const getRoleColor = (role: string): string => {
    return permissionServiceInstance.getRoleColor(role as any);
  };

  // Vérifications de rôle (utilise les rôles en majuscules comme backend)
  const isAdmin = (): boolean => user?.role === 'ADMIN';
  const isManager = (): boolean => user?.role === 'MANAGER';
  const isDeveloper = (): boolean => user?.role === 'DEVELOPER';
  const isDesigner = (): boolean => user?.role === 'DESIGNER';

  return {
    // Permissions générales
    hasPermission,
    
    // Permissions de projets
    canCreateProject,
    canViewProject,
    canEditProject,
    canDeleteProject,
    
    // Permissions d'administration
    canViewAllProjects,
    canManageTeam,
    canViewAnalytics,
    canManageUsers,
    
    // Utilitaires
    getUserPermissions,
    filterProjectsByPermission,
    getRoleDisplayName,
    getRoleColor,
    
    // Vérifications de rôle
    isAdmin,
    isManager,
    isDeveloper,
    isDesigner,
    
    // État de l'utilisateur
    user,
    isAuthenticated: !!user,
  };
};
