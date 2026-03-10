import { useParams, useNavigate } from "react-router-dom"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Users,
  TrendingUp,
  DollarSign,
  Tag,
  User,
} from "lucide-react"
import { useState } from "react"
import { useProjects } from "@/hooks/useProjects"
import { useProfiles } from "@/hooks/useProfiles"
import { usePermissions } from "@/hooks/usePermissions"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "En cours",
  COMPLETED: "Terminé",
  DRAFT: "Brouillon",
  ARCHIVED: "Archivé",
}
const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-primary text-primary-foreground",
  COMPLETED: "bg-success text-success-foreground",
  DRAFT: "bg-muted text-muted-foreground",
  ARCHIVED: "bg-secondary text-secondary-foreground",
}
const PRIORITY_LABELS: Record<string, string> = { HIGH: "Haute", MEDIUM: "Moyenne", LOW: "Basse" }
const PRIORITY_VARIANTS: Record<string, "destructive" | "default" | "secondary"> = {
  HIGH: "destructive",
  MEDIUM: "default",
  LOW: "secondary",
}

const getInitials = (name: string | null) =>
  name ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "?"

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { useGetProject, deleteProject, isDeletingProject } = useProjects()
  const { data: project, isLoading } = useGetProject(id ?? "")
  const { profiles } = useProfiles()
  const { canEditProject, canDeleteProject } = usePermissions()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const teamProfiles = profiles.filter((p) => project?.teamMembers?.includes(p.id))

  const handleDelete = async () => {
    if (!project) return
    await deleteProject(project.id)
    navigate("/projects")
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6 max-w-4xl mx-auto">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </MainLayout>
    )
  }

  if (!project) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <h2 className="text-xl font-semibold mb-2">Projet introuvable</h2>
          <p className="text-muted-foreground mb-4">Ce projet n'existe pas ou a été supprimé.</p>
          <Button onClick={() => navigate("/projects")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux projets
          </Button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/projects")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
              <p className="text-muted-foreground text-sm">{project.client}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canEditProject(project) && (
              <Button variant="outline" onClick={() => navigate(`/projects/${project.id}/edit`)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            )}
            {canDeleteProject(project) && (
              <Button
                variant="outline"
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            )}
          </div>
        </div>

        {/* Informations principales */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Détails */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Détails du projet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Statut & Priorité */}
              <div className="flex flex-wrap gap-3">
                <Badge className={STATUS_COLORS[project.status] ?? ""}>
                  {STATUS_LABELS[project.status] ?? project.status}
                </Badge>
                <Badge variant={PRIORITY_VARIANTS[project.priority] ?? "secondary"}>
                  Priorité {PRIORITY_LABELS[project.priority] ?? project.priority}
                </Badge>
              </div>

              {/* Description */}
              {project.description && (
                <div>
                  <p className="text-sm font-medium mb-1 text-muted-foreground">Description</p>
                  <p className="text-sm leading-relaxed">{project.description}</p>
                </div>
              )}

              {/* Progression */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Progression
                  </div>
                  <span className="text-sm font-bold">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2.5" />
              </div>

              {/* Infos secondaires */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <div>
                    <p className="text-xs text-muted-foreground">Début</p>
                    <p className="font-medium text-foreground">
                      {format(new Date(project.startDate), "dd MMM yyyy", { locale: fr })}
                    </p>
                  </div>
                </div>
                {project.endDate && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <div>
                      <p className="text-xs text-muted-foreground">Échéance</p>
                      <p className="font-medium text-foreground">
                        {format(new Date(project.endDate), "dd MMM yyyy", { locale: fr })}
                      </p>
                    </div>
                  </div>
                )}
                {project.budget != null && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <div>
                      <p className="text-xs text-muted-foreground">Budget</p>
                      <p className="font-medium text-foreground">
                        {project.budget.toLocaleString("fr-FR")} €
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  <div>
                    <p className="text-xs text-muted-foreground">Client</p>
                    <p className="font-medium text-foreground">{project.client || "—"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Équipe */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Équipe
              </CardTitle>
              <CardDescription>
                {teamProfiles.length} membre{teamProfiles.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {teamProfiles.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun membre assigné.
                </p>
              ) : (
                teamProfiles.map((m) => (
                  <div key={m.id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      {m.avatar_url && <img src={m.avatar_url} alt={m.full_name ?? ""} />}
                      <AvatarFallback className="text-xs">
                        {getInitials(m.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {m.full_name ?? "Utilisateur"}
                      </p>
                      <p className="text-xs text-muted-foreground">{m.role}</p>
                    </div>
                  </div>
                ))
              )}

              {/* Propriétaire */}
              {project.userId && (
                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>
                      Propriétaire :{" "}
                      {profiles.find((p) => p.id === project.userId)?.full_name ?? "—"}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dialog suppression */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer ce projet ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Le projet "{project.name}" et toutes ses données
                associées seront définitivement supprimés.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeletingProject}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeletingProject ? "Suppression…" : "Supprimer"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  )
}

export default ProjectDetail
