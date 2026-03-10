import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjects } from "@/hooks/useProjects";
import { useAuth } from "@/hooks/useAuth";
import type { Project } from "@/types";
import { useNavigate } from "react-router-dom";
import {
  Code,
  GitBranch,
  Bug,
  FileText,
  Server,
  Zap,
  FolderKanban,
} from "lucide-react";

const Development = () => {
  const { user } = useAuth();
  const { useGetMyProjects } = useProjects();
  const { data: myProjects, isLoading } = useGetMyProjects();
  const navigate = useNavigate();

  const projects = myProjects ?? [];
  const activeProjects = projects.filter((p) => p.status === "ACTIVE");
  const completedProjects = projects.filter((p) => p.status === "COMPLETED");

  const getStatusLabel = (status: Project["status"]) => {
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

  const getStatusBadge = (status: Project["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "bg-primary text-primary-foreground";
      case "COMPLETED":
        return "bg-success text-success-foreground";
      case "DRAFT":
        return "bg-muted text-muted-foreground";
      case "ARCHIVED":
        return "bg-secondary text-secondary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityVariant = (priority: Project["priority"]) => {
    switch (priority) {
      case "HIGH":
        return "destructive" as const;
      case "MEDIUM":
        return "default" as const;
      case "LOW":
        return "secondary" as const;
      default:
        return "secondary" as const;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header développeur */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Développement</h1>
            <p className="text-sm text-muted-foreground">
              Vue dédiée aux sprints, tickets et livrables techniques
              {user && user.name ? ` — ${user.name}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="rounded-2xl"
              onClick={() => navigate("/projects")}
            >
              <FolderKanban className="h-4 w-4 mr-2" />
              Ouvrir le board projets
            </Button>
            <Button
              className="rounded-2xl"
              onClick={() => navigate("/feedback")}
            >
              <Bug className="h-4 w-4 mr-2" />
              Suivi des bugs
            </Button>
          </div>
        </div>

        {/* Résumé développeur basé sur des données réelles */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-2xl bg-card/80 backdrop-blur">
            <CardContent className="p-4 flex items-center gap-3">
              <Code className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Projets actifs</p>
                <p className="text-2xl font-semibold tabular-nums">
                  {isLoading ? "–" : activeProjects.length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl bg-card/80 backdrop-blur">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckIcon />
              <div>
                <p className="text-sm text-muted-foreground">Projets terminés</p>
                <p className="text-2xl font-semibold tabular-nums">
                  {isLoading ? "–" : completedProjects.length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl bg-card/80 backdrop-blur">
            <CardContent className="p-4 flex items-center gap-3">
              <Server className="h-5 w-5 text-info" />
              <div>
                <p className="text-sm text-muted-foreground">Total projets suivis</p>
                <p className="text-2xl font-semibold tabular-nums">
                  {isLoading ? "–" : projects.length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3">
            <TabsTrigger value="projects">Board projets</TabsTrigger>
            <TabsTrigger value="resources">Ressources techniques</TabsTrigger>
            <TabsTrigger value="analytics">Vue synthèse</TabsTrigger>
          </TabsList>

          {/* Projets réels depuis le service projets */}
          <TabsContent value="projects" className="space-y-4">
            {projects.length === 0 && !isLoading ? (
              <Card className="rounded-2xl">
                <CardContent className="py-10 text-center space-y-3">
                  <Code className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Aucun projet ne vous est encore assigné.
                  </p>
                  <Button
                    size="sm"
                    className="rounded-2xl"
                    onClick={() => navigate("/projects")}
                  >
                    Créer ou assigner un projet
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {projects.map((project) => (
                  <Card key={project.id} className="rounded-2xl hover:shadow-md transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Code className="h-4 w-4 text-primary" />
                          <div>
                            <CardTitle className="text-base">
                              {project.name}
                            </CardTitle>
                            <CardDescription>
                              {project.client}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={getPriorityVariant(project.priority)}
                            className="text-xs"
                          >
                            {project.priority}
                          </Badge>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                              project.status,
                            )}`}
                          >
                            {getStatusLabel(project.status)}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Progression</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>ID: {project.id}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => navigate("/projects")}
                        >
                          <GitBranch className="h-3 w-3 mr-1" />
                          Ouvrir dans le board
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Ressources techniques : uniquement des actions reliées */}
          <TabsContent value="resources" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="rounded-2xl bg-card/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4" />
                    Documentation & specs
                  </CardTitle>
                  <CardDescription>
                    Centraliser la documentation produit et technique.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start rounded-xl"
                    onClick={() => navigate("/projects")}
                  >
                    <FolderKanban className="h-4 w-4 mr-2" />
                    Guides par projet (board Projets)
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start rounded-xl"
                    onClick={() => navigate("/reminders")}
                  >
                    <Server className="h-4 w-4 mr-2" />
                    Rappels techniques & checklists
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-2xl bg-card/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Bug className="h-4 w-4" />
                    Bugs & tickets
                  </CardTitle>
                  <CardDescription>
                    Suivi centralisé des retours qualité et incidents.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start rounded-xl"
                    onClick={() => navigate("/feedback")}
                  >
                    <Bug className="h-4 w-4 mr-2" />
                    Ouvrir le board Feedback
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start rounded-xl"
                    onClick={() => navigate("/analytics")}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Performance & stabilité (Analytics)
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Vue synthèse simple, sans stats fictives */}
          <TabsContent value="analytics" className="space-y-4">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-sm">
                  Synthèse de votre charge technique
                </CardTitle>
                <CardDescription>
                  Indicateurs calculés à partir des projets réels.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">Projets en cours</p>
                  <p className="text-xl font-semibold tabular-nums">
                    {isLoading ? "–" : activeProjects.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total projets</p>
                  <p className="text-xl font-semibold tabular-nums">
                    {isLoading ? "–" : projects.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Taux de complétion moyen</p>
                  <p className="text-xl font-semibold tabular-nums">
                    {isLoading || projects.length === 0
                      ? "–"
                      : `${Math.round(
                          projects.reduce((acc, p) => acc + p.progress, 0) / projects.length,
                        )}%`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

const CheckIcon = () => (
  <svg
    className="h-5 w-5 text-success"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="10" cy="10" r="9" className="stroke-success" strokeWidth="1.5" />
    <path
      d="M6 10.5L8.5 13L14 7.5"
      className="stroke-success"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Development;