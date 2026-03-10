import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Users,
  Calendar,
  UserPlus,
  Filter,
  FolderKanban,
  CheckCircle2,
  Info,
} from "lucide-react"
import { useProfiles } from "@/hooks/useProfiles"
import { useProjects } from "@/hooks/useProjects"
import { usePermissions } from "@/hooks/usePermissions"
import type { UserRole } from "@/types"

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrateur",
  ADMIN_ASSISTANT: "Assistant admin",
  MANAGER: "Manager",
  DEVELOPER: "Développeur",
  DESIGNER: "Designer",
  COMMUNITY_MANAGER: "Community Manager",
  CONTENT_MANAGER: "Content Manager",
}

const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: "bg-destructive/10 text-destructive border-destructive/20",
  ADMIN_ASSISTANT: "bg-destructive/10 text-destructive border-destructive/20",
  MANAGER: "bg-primary/10 text-primary border-primary/20",
  DEVELOPER: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  DESIGNER: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  COMMUNITY_MANAGER: "bg-success/10 text-success border-success/20",
  CONTENT_MANAGER: "bg-orange-500/10 text-orange-600 border-orange-500/20",
}

const getInitials = (name: string | null) => {
  if (!name) return "?"
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

const STATUS_MAP: Record<string, string> = {
  DRAFT: "Brouillon",
  ACTIVE: "En cours",
  COMPLETED: "Terminé",
  ARCHIVED: "Archivé",
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  ACTIVE: "bg-primary text-primary-foreground",
  COMPLETED: "bg-success text-success-foreground",
  ARCHIVED: "bg-secondary text-secondary-foreground",
}

const Team = () => {
  const { profiles, isLoading: isLoadingProfiles } = useProfiles()
  const { useGetProjects } = useProjects()
  const { data: projectsData, isLoading: isLoadingProjects } = useGetProjects(1, 500)
  const { isAdmin, canManageTeam } = usePermissions()
  const [showInviteDialog, setShowInviteDialog] = useState(false)

  const projects = projectsData?.data ?? []

  // Statistiques calculées depuis les vraies données
  const totalMembers = profiles.length
  const totalProjects = projects.length
  const activeProjects = projects.filter((p) => p.status === "ACTIVE").length
  const avgProgress =
    projects.length > 0
      ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
      : 0

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Équipe</h1>
            <p className="text-muted-foreground">
              Gestion des membres, projets et performance de l'équipe
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtrer
            </Button>
            {(isAdmin() || canManageTeam()) && (
              <Button onClick={() => setShowInviteDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Inviter membre
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="members" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="members">Membres</TabsTrigger>
            <TabsTrigger value="projects">Projets équipe</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* ─── Onglet Membres ─── */}
          <TabsContent value="members" className="space-y-6">
            {isLoadingProfiles ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="text-center">
                      <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                      <Skeleton className="h-5 w-32 mx-auto mt-2" />
                      <Skeleton className="h-4 w-24 mx-auto" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : profiles.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun membre</h3>
                  <p className="text-muted-foreground max-w-sm">
                    L'équipe est vide. Invitez des membres via le bouton "Inviter membre".
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {profiles.map((member) => {
                  const memberProjects = projects.filter(
                    (p) => p.teamMembers?.includes(member.id) || p.userId === member.id
                  )
                  const initials = getInitials(member.full_name)
                  const roleLabel = ROLE_LABELS[member.role] ?? member.role
                  const roleColor = ROLE_COLORS[member.role] ?? "bg-muted/50 text-muted-foreground"

                  return (
                    <Card key={member.id} className="hover:shadow-md transition-all">
                      <CardHeader className="text-center pb-2">
                        <div className="flex justify-center mb-3">
                          <Avatar className="h-16 w-16">
                            {member.avatar_url ? (
                              <img src={member.avatar_url} alt={member.full_name ?? ""} />
                            ) : null}
                            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                          </Avatar>
                        </div>
                        <CardTitle className="text-lg">
                          {member.full_name ?? "Utilisateur"}
                        </CardTitle>
                        <Badge variant="outline" className={roleColor}>
                          {roleLabel}
                        </Badge>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Date d'arrivée */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Membre depuis{" "}
                            {new Date(member.created_at).toLocaleDateString("fr-FR", {
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        {/* Projets actifs */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Projets actifs</span>
                            <span className="text-sm font-bold">{memberProjects.length}</span>
                          </div>
                          {memberProjects.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {memberProjects.slice(0, 3).map((p) => (
                                <Badge key={p.id} variant="secondary" className="text-xs">
                                  {p.name}
                                </Badge>
                              ))}
                              {memberProjects.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{memberProjects.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* ─── Onglet Projets équipe ─── */}
          <TabsContent value="projects" className="space-y-4">
            {isLoadingProjects ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-48 mb-3" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-2 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun projet</h3>
                  <p className="text-muted-foreground">
                    Créez votre premier projet depuis la page Projets.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {projects.map((project) => {
                  const memberProfiles = profiles.filter((p) =>
                    project.teamMembers?.includes(p.id)
                  )
                  return (
                    <Card key={project.id} className="hover:shadow-md transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between gap-4">
                          <div className="space-y-3 flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="font-semibold text-lg">{project.name}</h3>
                              <Badge
                                className={
                                  STATUS_COLORS[project.status] ??
                                  "bg-muted text-muted-foreground"
                                }
                              >
                                {STATUS_MAP[project.status] ?? project.status}
                              </Badge>
                              {project.client && project.client !== "—" && (
                                <span className="text-sm text-muted-foreground">
                                  · {project.client}
                                </span>
                              )}
                            </div>

                            {/* Avatars des membres */}
                            <div className="flex items-center gap-3">
                              <div className="flex -space-x-2">
                                {memberProfiles.slice(0, 5).map((m) => (
                                  <Avatar
                                    key={m.id}
                                    className="h-8 w-8 border-2 border-background"
                                    title={m.full_name ?? ""}
                                  >
                                    {m.avatar_url ? (
                                      <img src={m.avatar_url} alt={m.full_name ?? ""} />
                                    ) : null}
                                    <AvatarFallback className="text-xs">
                                      {getInitials(m.full_name)}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                                {memberProfiles.length > 5 && (
                                  <Avatar className="h-8 w-8 border-2 border-background">
                                    <AvatarFallback className="text-xs bg-muted">
                                      +{memberProfiles.length - 5}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {memberProfiles.length} membre
                                {memberProfiles.length !== 1 ? "s" : ""}
                              </span>
                            </div>

                            {/* Barre de progression */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Progression</span>
                                <span className="text-sm font-medium">{project.progress}%</span>
                              </div>
                              <Progress value={project.progress} className="h-2" />
                            </div>
                          </div>

                          <div className="text-right space-y-2 shrink-0">
                            {project.endDate && (
                              <div className="flex items-center gap-1 text-muted-foreground justify-end">
                                <Calendar className="h-4 w-4" />
                                <span className="text-sm">
                                  {new Date(project.endDate).toLocaleDateString("fr-FR")}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* ─── Onglet Performance ─── */}
          <TabsContent value="performance" className="space-y-6">
            {/* Stats globales */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{totalMembers}</p>
                      <p className="text-sm text-muted-foreground">Membres</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <FolderKanban className="h-5 w-5 text-info" />
                    <div>
                      <p className="text-2xl font-bold">{totalProjects}</p>
                      <p className="text-sm text-muted-foreground">Projets total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <div>
                      <p className="text-2xl font-bold">{activeProjects}</p>
                      <p className="text-sm text-muted-foreground">Projets actifs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <FolderKanban className="h-5 w-5 text-warning" />
                    <div>
                      <p className="text-2xl font-bold">{avgProgress}%</p>
                      <p className="text-sm text-muted-foreground">Progression moy.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance par membre */}
            <Card>
              <CardHeader>
                <CardTitle>Répartition des projets par membre</CardTitle>
                <CardDescription>Nombre de projets par personne</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingProfiles || isLoadingProjects ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : profiles.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Aucun membre à afficher.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {profiles.map((member) => {
                      const memberProjectCount = projects.filter(
                        (p) => p.teamMembers?.includes(member.id) || p.userId === member.id
                      ).length
                      const maxProjects = Math.max(
                        ...profiles.map(
                          (m) =>
                            projects.filter(
                              (p) => p.teamMembers?.includes(m.id) || p.userId === m.id
                            ).length
                        ),
                        1
                      )
                      const workloadPct = Math.round((memberProjectCount / maxProjects) * 100)

                      return (
                        <div
                          key={member.id}
                          className="flex items-center gap-4 p-4 border rounded-lg"
                        >
                          <Avatar className="h-10 w-10 shrink-0">
                            {member.avatar_url ? (
                              <img src={member.avatar_url} alt={member.full_name ?? ""} />
                            ) : null}
                            <AvatarFallback>{getInitials(member.full_name)}</AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium truncate">
                                {member.full_name ?? "Utilisateur"}
                              </p>
                              <span className="text-sm text-muted-foreground shrink-0 ml-2">
                                {memberProjectCount} projet
                                {memberProjectCount !== 1 ? "s" : ""}
                              </span>
                            </div>
                            <Progress value={workloadPct} className="h-2" />
                          </div>

                          <Badge
                            variant="outline"
                            className={`shrink-0 text-xs ${ROLE_COLORS[member.role] ?? ""}`}
                          >
                            {ROLE_LABELS[member.role] ?? member.role}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog : Inviter un membre */}
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Inviter un membre
              </DialogTitle>
              <DialogDescription>
                Comment ajouter un nouveau membre à l'équipe
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="flex gap-3 p-4 rounded-lg border bg-muted/30">
                <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Pour inviter un nouveau membre :</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>
                      Accédez à votre tableau de bord{" "}
                      <a
                        href="https://supabase.com/dashboard"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline underline-offset-2"
                      >
                        Supabase
                      </a>
                    </li>
                    <li>Allez dans Authentication → Users</li>
                    <li>Cliquez sur "Invite user" et entrez l'email</li>
                    <li>Exécutez ensuite le SQL pour assigner le bon rôle dans <code className="bg-muted px-1 rounded">profiles</code></li>
                  </ol>
                </div>
              </div>
              <div className="bg-muted rounded-lg p-3 text-xs font-mono overflow-x-auto">
                <p className="text-muted-foreground mb-1">-- Exemple SQL à exécuter après invitation :</p>
                <p>{"INSERT INTO public.profiles (id, full_name, role)"}</p>
                <p>{"SELECT id, 'Prénom Nom', 'DEVELOPER'"}</p>
                <p>{"FROM auth.users WHERE email = 'email@exemple.com'"}</p>
                <p>{"ON CONFLICT (id) DO UPDATE SET full_name = excluded.full_name, role = excluded.role;"}</p>
              </div>
              <Button className="w-full" onClick={() => setShowInviteDialog(false)}>
                Compris
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}

export default Team
