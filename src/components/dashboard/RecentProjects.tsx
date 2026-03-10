import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Project } from "@/types";
import { FolderKanban } from "lucide-react";

interface RecentProjectsProps {
  projects: Project[];
  isLoading?: boolean;
}

// Composant View pour les projets récents (Principe MVP)
export const RecentProjects = ({ projects, isLoading = false }: RecentProjectsProps) => {
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
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="h-6 bg-muted animate-pulse rounded w-1/3" />
          <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderKanban className="h-5 w-5" />
          Projets récents
        </CardTitle>
        <CardDescription>
          Suivi de l'avancement des projets prioritaires
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projects.map((project) => (
            <div 
              key={project.id} 
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{project.name}</h4>
                  <Badge variant={getPriorityColor(project.priority)} className="text-xs">
                    {getPriorityLabel(project.priority)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{project.client}</p>
                <div className="flex items-center gap-2">
                  <Progress value={project.progress} className="flex-1 max-w-[200px]" />
                  <span className="text-sm font-medium">{project.progress}%</span>
                </div>
              </div>
              <div className="text-right">
                <Badge 
                  variant="outline" 
                  className={`${getStatusColor(project.status)} text-white border-0`}
                >
                  {getStatusLabel(project.status)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
