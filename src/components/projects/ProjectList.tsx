import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  FolderKanban, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  Users,
  TrendingUp
} from 'lucide-react';
import { Project } from '@/types';
import { usePermissions } from '@/hooks/usePermissions';
import { useProjects } from '@/hooks/useProjects';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ProjectListProps {
  projects: Project[];
  isLoading?: boolean;
  onCreateProject?: () => void;
  onViewProject?: (project: Project) => void;
  onEditProject?: (project: Project) => void;
  onDeleteProject?: (project: Project) => void;
}

// Composant de liste des projets (Principe MVP - View)
export const ProjectList = ({ 
  projects, 
  isLoading = false,
  onCreateProject,
  onViewProject,
  onEditProject,
  onDeleteProject
}: ProjectListProps) => {
  const { 
    canCreateProject, 
    canEditProject, 
    canDeleteProject, 
    canViewAllProjects,
    filterProjectsByPermission,
    getRoleDisplayName,
    getRoleColor,
    user 
  } = usePermissions();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Project['status'] | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Project['priority'] | 'all'>('all');

  // Filtrage des projets selon les permissions
  const filteredProjects = filterProjectsByPermission(projects);

  // Filtrage par recherche et critères
  const displayedProjects = filteredProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const statusGroups: { key: Project['status']; label: string }[] = [
    { key: 'ACTIVE', label: 'En cours' },
    { key: 'DRAFT', label: 'Brouillon' },
    { key: 'COMPLETED', label: 'Terminés' },
    { key: 'ARCHIVED', label: 'Archivés' },
  ];

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case "ACTIVE":
        return "bg-primary";
      case "DRAFT":
        return "bg-muted";
      case "COMPLETED":
        return "bg-success";
      case "ARCHIVED":
        return "bg-secondary";
      default:
        return "bg-muted";
    }
  };

  const getStatusLabel = (status: Project['status']) => {
    switch (status) {
      case "ACTIVE":
        return "En cours";
      case "DRAFT":
        return "Brouillon";
      case "COMPLETED":
        return "Terminé";
      case "ARCHIVED":
        return "Archivé";
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case "HIGH":
        return "destructive";
      case "MEDIUM":
        return "default";
      case "LOW":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getPriorityLabel = (priority: Project['priority']) => {
    switch (priority) {
      case "HIGH":
        return "Haute";
      case "MEDIUM":
        return "Moyenne";
      case "LOW":
        return "Basse";
      default:
        return priority;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
                <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                <div className="h-2 bg-muted animate-pulse rounded w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Projets</h2>
          <p className="text-muted-foreground">
            {displayedProjects.length} projet{displayedProjects.length > 1 ? 's' : ''} trouvé{displayedProjects.length > 1 ? 's' : ''}
            {!canViewAllProjects() && ' (vos projets uniquement)'}
          </p>
        </div>
        
        {canCreateProject() && (
          <Button onClick={onCreateProject} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouveau projet
          </Button>
        )}
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un projet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="DRAFT">Brouillon</SelectItem>
                <SelectItem value="ACTIVE">En cours</SelectItem>
                <SelectItem value="COMPLETED">Terminé</SelectItem>
                <SelectItem value="ARCHIVED">Archivé</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les priorités</SelectItem>
                <SelectItem value="LOW">Basse</SelectItem>
                <SelectItem value="MEDIUM">Moyenne</SelectItem>
                <SelectItem value="HIGH">Haute</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des projets sous forme de groupes (style Monday.com) */}
      <div className="space-y-6">
        {displayedProjects.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun projet trouvé</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Aucun projet ne correspond à vos critères de recherche.'
                  : 'Commencez par créer votre premier projet.'}
              </p>
              {canCreateProject() && (
                <Button onClick={onCreateProject}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un projet
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          statusGroups.map((group) => {
            const groupProjects = displayedProjects.filter(
              (project) => project.status === group.key
            );

            if (groupProjects.length === 0) return null;

            return (
              <div key={group.key} className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${getStatusColor(group.key as Project['status'])}`}
                    />
                    <span className="text-sm font-semibold">
                      {group.label} · {groupProjects.length} projet
                      {groupProjects.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {groupProjects.map((project) => (
                    <Card key={project.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex flex-col lg:flex-row gap-4 justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <h3 className="text-sm font-semibold">{project.name}</h3>
                                <p className="text-xs text-muted-foreground">{project.client}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={getPriorityColor(project.priority)}>
                                  {getPriorityLabel(project.priority)}
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className={`${getStatusColor(project.status)} text-white border-0 text-[10px]`}
                                >
                                  {getStatusLabel(project.status)}
                                </Badge>
                              </div>
                            </div>

                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {project.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  Début:{' '}
                                  {format(new Date(project.startDate), 'dd/MM/yyyy', { locale: fr })}
                                </span>
                              </div>
                              {project.endDate && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    Fin:{' '}
                                    {format(new Date(project.endDate), 'dd/MM/yyyy', { locale: fr })}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>
                                  {project.teamMembers.length} membre
                                  {project.teamMembers.length > 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span>Progression</span>
                                <span className="font-medium">{project.progress}%</span>
                              </div>
                              <Progress value={project.progress} className="h-1.5" />
                            </div>
                          </div>

                          <div className="flex flex-row lg:flex-col gap-2 lg:items-end">
                            {onViewProject && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onViewProject(project)}
                                className="flex items-center gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                Voir
                              </Button>
                            )}
                            
                            {canEditProject(project) && onEditProject && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEditProject(project)}
                                className="flex items-center gap-1"
                              >
                                <Edit className="h-3 w-3" />
                                Modifier
                              </Button>
                            )}
                            
                            {canDeleteProject(project) && onDeleteProject && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDeleteProject(project)}
                                className="flex items-center gap-1 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                                Supprimer
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
