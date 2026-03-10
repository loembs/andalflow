import { useState } from 'react';
import { MainLayout } from "@/components/layout/main-layout";
import { ProjectList } from "@/components/projects/ProjectList";
import { CreateProjectForm } from "@/components/projects/CreateProjectForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useProjects } from "@/hooks/useProjects";
import { usePermissions } from "@/hooks/usePermissions";
import { useClients } from "@/hooks/useClients";
import { supabase } from "@/lib/supabaseClient";
import { Project } from "@/types";
import { useNavigate } from "react-router-dom";

// Page Projects avec architecture MVP (Principe MVP - Presenter)
const Projects = () => {
  const navigate = useNavigate();
  const { 
    useGetProjects, 
    useGetMyProjects,
    deleteProject, 
    isDeletingProject 
  } = useProjects();
  const { canViewAllProjects, canCreateProject } = usePermissions();
  const { clients } = useClients();
  const useSupabaseProjects = !!supabase;
  
  // États locaux
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Queries pour récupérer les projets selon les permissions
  const { 
    data: allProjects, 
    isLoading: isLoadingAllProjects 
  } = useGetProjects(1, 50);
  
  const { 
    data: myProjects, 
    isLoading: isLoadingMyProjects 
  } = useGetMyProjects();

  // Déterminer quels projets afficher selon les permissions
  const projects = canViewAllProjects() ? allProjects?.data || [] : myProjects || [];
  const isLoading = canViewAllProjects() ? isLoadingAllProjects : isLoadingMyProjects;

  // Gestionnaires d'événements
  const handleCreateProject = () => {
    if (canCreateProject()) {
      setShowCreateDialog(true);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
    // Les queries seront automatiquement invalidées par le hook useProjects
  };

  const handleViewProject = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  const handleEditProject = (project: Project) => {
    navigate(`/projects/${project.id}/edit`);
  };

  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
  };

  const confirmDelete = async () => {
    if (projectToDelete) {
      try {
        await deleteProject(projectToDelete.id);
        setProjectToDelete(null);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const cancelDelete = () => {
    setProjectToDelete(null);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestion des Projets</h1>
            <p className="text-muted-foreground">
              {canViewAllProjects() 
                ? 'Gérez tous les projets de l\'équipe' 
                : 'Gérez vos projets personnels'
              }
            </p>
          </div>
        </div>

        {/* Liste des projets */}
        <ProjectList
          projects={projects}
          isLoading={isLoading}
          onCreateProject={handleCreateProject}
          onViewProject={handleViewProject}
          onEditProject={handleEditProject}
          onDeleteProject={handleDeleteProject}
        />

        {/* Dialog de création de projet */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un nouveau projet</DialogTitle>
            </DialogHeader>
            <CreateProjectForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setShowCreateDialog(false)}
              clients={useSupabaseProjects ? clients : undefined}
            />
          </DialogContent>
        </Dialog>

        {/* Dialog de confirmation de suppression */}
        <AlertDialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action ne peut pas être annulée. Cela supprimera définitivement le projet 
                "{projectToDelete?.name}" et toutes ses données associées.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelDelete}>Annuler</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete}
                disabled={isDeletingProject}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeletingProject ? 'Suppression...' : 'Supprimer'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
};

export default Projects;