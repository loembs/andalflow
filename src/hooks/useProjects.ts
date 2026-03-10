import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService, getProjectService, IProjectService } from '@/services/api';
import { Project, CreateProjectForm, PaginatedResponse } from '@/types';
import { ProjectAction, ProjectTracking, RoleStats } from '@/types/permissions';
import { useToast } from '@/hooks/use-toast';

// Hook personnalisé pour la gestion des projets (Principe SOLID - Dependency Inversion)
export const useProjects = (projectServiceInstance?: IProjectService) => {
  const projectServiceInstanceResolved = projectServiceInstance ?? getProjectService();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const svc = projectServiceInstanceResolved;

  // Queries pour récupérer les projets
  const useGetProjects = (page: number = 1, limit: number = 10) => {
    return useQuery({
      queryKey: ['projects', page, limit],
      queryFn: () => svc.getAllProjects(page, limit),
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  const useGetMyProjects = () => {
    return useQuery({
      queryKey: ['projects', 'my'],
      queryFn: () => svc.getMyProjects(),
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  const useGetProject = (id: string) => {
    return useQuery({
      queryKey: ['project', id],
      queryFn: () => svc.getProjectById(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  const useGetProjectsByStatus = (status: Project['status']) => {
    return useQuery({
      queryKey: ['projects', 'status', status],
      queryFn: () => svc.getProjectsByStatus(status),
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  const useGetProjectsByPriority = (priority: Project['priority']) => {
    return useQuery({
      queryKey: ['projects', 'priority', priority],
      queryFn: () => svc.getProjectsByPriority(priority),
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  const useGetProjectsByUser = (userId: string) => {
    return useQuery({
      queryKey: ['projects', 'user', userId],
      queryFn: () => svc.getProjectsByUser(userId),
      enabled: !!userId,
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  // Queries pour les actions et le suivi
  const useGetProjectActions = (projectId: string) => {
    return useQuery({
      queryKey: ['project', projectId, 'actions'],
      queryFn: () => svc.getProjectActions(projectId),
      enabled: !!projectId,
      staleTime: 1 * 60 * 1000, // 1 minute
    });
  };

  const useGetProjectTracking = (projectId: string) => {
    return useQuery({
      queryKey: ['project', projectId, 'tracking'],
      queryFn: () => svc.getProjectTracking(projectId),
      enabled: !!projectId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  const useGetProjectTeam = (projectId: string) => {
    return useQuery({
      queryKey: ['project', projectId, 'team'],
      queryFn: () => svc.getProjectTeam(projectId),
      enabled: !!projectId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Queries pour les statistiques
  const useGetProjectStats = () => {
    return useQuery({
      queryKey: ['projects', 'stats'],
      queryFn: () => svc.getProjectStats(),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  const useGetRoleStats = () => {
    return useQuery({
      queryKey: ['projects', 'role-stats'],
      queryFn: () => svc.getRoleStats(),
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  // Mutations pour les opérations CRUD
  const createProjectMutation = useMutation({
    mutationFn: (projectData: CreateProjectForm) => svc.createProject(projectData),
    onSuccess: (newProject) => {
      toast({
        title: "Projet créé",
        description: `Le projet "${newProject.name}" a été créé avec succès`,
      });
      
      // Invalider et refetch les queries de projets
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      // Ajouter le nouveau projet au cache
      queryClient.setQueryData(['project', newProject.id], newProject);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le projet",
        variant: "destructive",
      });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateProjectForm> }) =>
      svc.updateProject(id, data),
    onSuccess: (updatedProject) => {
      toast({
        title: "Projet mis à jour",
        description: `Le projet "${updatedProject.name}" a été mis à jour avec succès`,
      });
      
      // Invalider et refetch les queries de projets
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      // Mettre à jour le cache du projet spécifique
      queryClient.setQueryData(['project', updatedProject.id], updatedProject);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le projet",
        variant: "destructive",
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => svc.deleteProject(id),
    onSuccess: (_, deletedId) => {
      toast({
        title: "Projet supprimé",
        description: "Le projet a été supprimé avec succès",
      });
      
      // Invalider et refetch les queries de projets
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      // Supprimer le projet du cache
      queryClient.removeQueries({ queryKey: ['project', deletedId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le projet",
        variant: "destructive",
      });
    },
  });

  // Mutations pour les actions et le suivi
  const addProjectActionMutation = useMutation({
    mutationFn: (action: Omit<ProjectAction, 'id' | 'timestamp'>) =>
      svc.addProjectAction(action),
    onSuccess: (newAction) => {
      // Invalider les actions du projet
      queryClient.invalidateQueries({ queryKey: ['project', newAction.projectId, 'actions'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter l'action",
        variant: "destructive",
      });
    },
  });

  const trackProjectMutation = useMutation({
    mutationFn: (projectId: string) => svc.trackProject(projectId),
    onSuccess: (_, projectId) => {
      // Invalider le tracking du projet
      queryClient.invalidateQueries({ queryKey: ['project', projectId, 'tracking'] });
    },
  });

  // Mutations pour la gestion des équipes
  const addTeamMemberMutation = useMutation({
    mutationFn: ({ projectId, userId }: { projectId: string; userId: string }) =>
      svc.addTeamMember(projectId, userId),
    onSuccess: (updatedProject) => {
      toast({
        title: "Membre ajouté",
        description: "Le membre a été ajouté à l'équipe avec succès",
      });
      
      // Invalider les queries liées au projet
      queryClient.invalidateQueries({ queryKey: ['project', updatedProject.id] });
      queryClient.invalidateQueries({ queryKey: ['project', updatedProject.id, 'team'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le membre",
        variant: "destructive",
      });
    },
  });

  const removeTeamMemberMutation = useMutation({
    mutationFn: ({ projectId, userId }: { projectId: string; userId: string }) =>
      svc.removeTeamMember(projectId, userId),
    onSuccess: (updatedProject) => {
      toast({
        title: "Membre retiré",
        description: "Le membre a été retiré de l'équipe avec succès",
      });
      
      // Invalider les queries liées au projet
      queryClient.invalidateQueries({ queryKey: ['project', updatedProject.id] });
      queryClient.invalidateQueries({ queryKey: ['project', updatedProject.id, 'team'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de retirer le membre",
        variant: "destructive",
      });
    },
  });

  return {
    // Queries
    useGetProjects,
    useGetMyProjects,
    useGetProject,
    useGetProjectsByStatus,
    useGetProjectsByPriority,
    useGetProjectsByUser,
    useGetProjectActions,
    useGetProjectTracking,
    useGetProjectTeam,
    useGetProjectStats,
    useGetRoleStats,
    
    // Mutations CRUD
    createProject: createProjectMutation.mutate,
    updateProject: updateProjectMutation.mutate,
    deleteProject: deleteProjectMutation.mutate,
    
    // Mutations pour les actions et le suivi
    addProjectAction: addProjectActionMutation.mutate,
    trackProject: trackProjectMutation.mutate,
    
    // Mutations pour la gestion des équipes
    addTeamMember: addTeamMemberMutation.mutate,
    removeTeamMember: removeTeamMemberMutation.mutate,
    
    // États de chargement
    isCreatingProject: createProjectMutation.isPending,
    isUpdatingProject: updateProjectMutation.isPending,
    isDeletingProject: deleteProjectMutation.isPending,
    isAddingAction: addProjectActionMutation.isPending,
    isTrackingProject: trackProjectMutation.isPending,
    isAddingTeamMember: addTeamMemberMutation.isPending,
    isRemovingTeamMember: removeTeamMemberMutation.isPending,
  };
};
