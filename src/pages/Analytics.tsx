import { useMemo } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  FolderKanban,
  CheckCircle2,
  Clock,
  Archive,
  FileEdit,
} from "lucide-react"
import { useProjects } from "@/hooks/useProjects"
import { useClients } from "@/hooks/useClients"
import { useProfiles } from "@/hooks/useProfiles"
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

const PRIORITY_LABELS: Record<string, string> = {
  HIGH: "Haute",
  MEDIUM: "Moyenne",
  LOW: "Basse",
}

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "bg-destructive/10 text-destructive border-destructive/20",
  MEDIUM: "bg-warning/10 text-warning border-warning/20",
  LOW: "bg-muted/50 text-muted-foreground",
}

const StatCard = ({
  icon: Icon,
  value,
  label,
  sub,
  iconClass,
  isLoading,
}: {
  icon: React.ElementType
  value: string | number
  label: string
  sub?: string
  iconClass?: string
  isLoading?: boolean
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${iconClass ?? "text-primary"}`} />
        <div className="min-w-0">
          {isLoading ? (
            <>
              <Skeleton className="h-7 w-16 mb-1" />
              <Skeleton className="h-4 w-28" />
            </>
          ) : (
            <>
              <p className="text-2xl font-bold leading-tight">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
              {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
            </>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
)

const Analytics = () => {
  const { useGetProjects } = useProjects()
  const { data: projectsData, isLoading: isLoadingProjects } = useGetProjects(1, 500)
  const { clients, isLoading: isLoadingClients } = useClients()
  const { profiles, isLoading: isLoadingProfiles } = useProfiles()

  const projects = projectsData?.data ?? []
  const isLoading = isLoadingProjects || isLoadingClients || isLoadingProfiles

  // ─── Métriques calculées ───────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = projects.length
    const completed = projects.filter((p) => p.status === "COMPLETED").length
    const active = projects.filter((p) => p.status === "ACTIVE").length
    const draft = projects.filter((p) => p.status === "DRAFT").length
    const archived = projects.filter((p) => p.status === "ARCHIVED").length

    // Taux de réussite = projets terminés / (projets non-brouillon et non-archivés + terminés)
    const eligible = active + completed
    const successRate = eligible > 0 ? Math.round((completed / eligible) * 100) : 0

    // Progression moyenne de tous les projets actifs
    const activeProjets = projects.filter((p) => p.status === "ACTIVE")
    const avgProgress =
      activeProjets.length > 0
        ? Math.round(activeProjets.reduce((sum, p) => sum + p.progress, 0) / activeProjets.length)
        : 0

    // Croissance : projets créés ce mois vs mois dernier
    const now = new Date()
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const thisMonthCount = projects.filter(
      (p) => new Date(p.createdAt) >= startOfThisMonth
    ).length
    const lastMonthCount = projects.filter(
      (p) =>
        new Date(p.createdAt) >= startOfLastMonth &&
        new Date(p.createdAt) < startOfThisMonth
    ).length
    const growth =
      lastMonthCount > 0
        ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)
        : thisMonthCount > 0
        ? 100
        : 0

    return { total, completed, active, draft, archived, successRate, avgProgress, growth, thisMonthCount, lastMonthCount }
  }, [projects])

  // ─── Répartition par statut ────────────────────────────────────────────────
  const statusBreakdown = useMemo(() => {
    return ["ACTIVE", "COMPLETED", "DRAFT", "ARCHIVED"].map((status) => {
      const count = projects.filter((p) => p.status === status).length
      const pct = projects.length > 0 ? Math.round((count / projects.length) * 100) : 0
      return { status, count, pct }
    })
  }, [projects])

  // ─── Répartition par priorité ─────────────────────────────────────────────
  const priorityBreakdown = useMemo(() => {
    return ["HIGH", "MEDIUM", "LOW"].map((priority) => {
      const count = projects.filter((p) => p.priority === priority).length
      const pct = projects.length > 0 ? Math.round((count / projects.length) * 100) : 0
      return { priority, count, pct }
    })
  }, [projects])

  // ─── Top projets par progression ──────────────────────────────────────────
  const topProjects = useMemo(() => {
    return [...projects]
      .filter((p) => p.status === "ACTIVE")
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 6)
  }, [projects])

  // ─── Répartition des rôles dans l'équipe ──────────────────────────────────
  const roleBreakdown = useMemo(() => {
    const counts: Partial<Record<UserRole, number>> = {}
    for (const p of profiles) {
      counts[p.role] = (counts[p.role] ?? 0) + 1
    }
    const maxCount = Math.max(...Object.values(counts), 1)
    return Object.entries(counts).map(([role, count]) => ({
      role: role as UserRole,
      count,
      pct: Math.round((count / maxCount) * 100),
    }))
  }, [profiles])

  // ─── Membres les plus actifs (nb de projets) ──────────────────────────────
  const memberActivity = useMemo(() => {
    return profiles
      .map((m) => ({
        ...m,
        projectCount: projects.filter(
          (p) => p.teamMembers?.includes(m.id) || p.userId === m.id
        ).length,
      }))
      .sort((a, b) => b.projectCount - a.projectCount)
      .slice(0, 6)
  }, [profiles, projects])

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">Analyse des performances en temps réel</p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="projects">Projets</TabsTrigger>
            <TabsTrigger value="team">Équipe</TabsTrigger>
          </TabsList>

          {/* ─── Vue d'ensemble ─── */}
          <TabsContent value="overview" className="space-y-6">
            {/* KPIs principaux */}
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard
                icon={BarChart3}
                value={`${stats.successRate}%`}
                label="Taux de réussite"
                sub={`${stats.completed} projet(s) terminé(s)`}
                iconClass="text-primary"
                isLoading={isLoading}
              />
              <StatCard
                icon={Users}
                value={clients.length}
                label="Clients"
                sub={`${profiles.length} membre(s) d'équipe`}
                iconClass="text-success"
                isLoading={isLoading}
              />
              <StatCard
                icon={Target}
                value={stats.completed}
                label="Projets livrés"
                sub={`sur ${stats.total} total`}
                iconClass="text-warning"
                isLoading={isLoading}
              />
              <StatCard
                icon={stats.growth >= 0 ? TrendingUp : TrendingDown}
                value={`${stats.growth >= 0 ? "+" : ""}${stats.growth}%`}
                label="Croissance"
                sub={`${stats.thisMonthCount} projet(s) ce mois`}
                iconClass={stats.growth >= 0 ? "text-success" : "text-destructive"}
                isLoading={isLoading}
              />
            </div>

            {/* Progression moyenne + Projets actifs */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderKanban className="h-5 w-5 text-primary" />
                    Progression moyenne (projets actifs)
                  </CardTitle>
                  <CardDescription>
                    {stats.active} projet(s) en cours · moy. {stats.avgProgress}%
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-4 w-full" />
                  ) : (
                    <div className="space-y-2">
                      <Progress value={stats.avgProgress} className="h-3" />
                      <p className="text-sm text-muted-foreground text-right">
                        {stats.avgProgress}% de complétion moyenne
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Répartition par statut
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isLoading
                    ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-6 w-full" />)
                    : statusBreakdown.map(({ status, count, pct }) => (
                        <div key={status} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Badge className={`text-xs ${STATUS_COLORS[status]}`}>
                                {STATUS_LABELS[status] ?? status}
                              </Badge>
                            </div>
                            <span className="font-medium">
                              {count} ({pct}%)
                            </span>
                          </div>
                          <Progress value={pct} className="h-1.5" />
                        </div>
                      ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ─── Onglet Projets ─── */}
          <TabsContent value="projects" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard icon={FolderKanban} value={stats.active} label="En cours" iconClass="text-primary" isLoading={isLoading} />
              <StatCard icon={CheckCircle2} value={stats.completed} label="Terminés" iconClass="text-success" isLoading={isLoading} />
              <StatCard icon={Clock} value={stats.draft} label="Brouillons" iconClass="text-muted-foreground" isLoading={isLoading} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Priorités */}
              <Card>
                <CardHeader>
                  <CardTitle>Répartition par priorité</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isLoading
                    ? [...Array(3)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)
                    : priorityBreakdown.map(({ priority, count, pct }) => (
                        <div key={priority} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <Badge variant="outline" className={PRIORITY_COLORS[priority]}>
                              {PRIORITY_LABELS[priority] ?? priority}
                            </Badge>
                            <span className="font-medium">
                              {count} projet(s) · {pct}%
                            </span>
                          </div>
                          <Progress value={pct} className="h-1.5" />
                        </div>
                      ))}
                </CardContent>
              </Card>

              {/* Top projets actifs */}
              <Card>
                <CardHeader>
                  <CardTitle>Avancement des projets actifs</CardTitle>
                  <CardDescription>Classés par progression</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isLoading ? (
                    [...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
                  ) : topProjects.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      Aucun projet actif.
                    </p>
                  ) : (
                    topProjects.map((p) => (
                      <div key={p.id} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium truncate max-w-[200px]" title={p.name}>
                            {p.name}
                          </span>
                          <span className="shrink-0 ml-2 font-bold">{p.progress}%</span>
                        </div>
                        <Progress value={p.progress} className="h-2" />
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ─── Onglet Équipe ─── */}
          <TabsContent value="team" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <StatCard icon={Users} value={profiles.length} label="Membres au total" iconClass="text-primary" isLoading={isLoading} />
              <StatCard
                icon={FolderKanban}
                value={profiles.length > 0 ? (stats.total / profiles.length).toFixed(1) : "—"}
                label="Projets par membre (moy.)"
                iconClass="text-info"
                isLoading={isLoading}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Répartition par rôle */}
              <Card>
                <CardHeader>
                  <CardTitle>Répartition par rôle</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isLoading ? (
                    [...Array(4)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)
                  ) : roleBreakdown.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucun membre.
                    </p>
                  ) : (
                    roleBreakdown.map(({ role, count, pct }) => (
                      <div key={role} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{ROLE_LABELS[role] ?? role}</span>
                          <span className="text-muted-foreground">
                            {count} membre{count > 1 ? "s" : ""}
                          </span>
                        </div>
                        <Progress value={pct} className="h-1.5" />
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Activité par membre */}
              <Card>
                <CardHeader>
                  <CardTitle>Projets par membre</CardTitle>
                  <CardDescription>Charge de travail par personne</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isLoading ? (
                    [...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
                  ) : memberActivity.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucun membre.
                    </p>
                  ) : (
                    memberActivity.map((m) => {
                      const maxCount = Math.max(...memberActivity.map((x) => x.projectCount), 1)
                      return (
                        <div key={m.id} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium truncate max-w-[180px]">
                              {m.full_name ?? "Utilisateur"}
                            </span>
                            <span className="text-muted-foreground shrink-0 ml-2">
                              {m.projectCount} projet{m.projectCount > 1 ? "s" : ""}
                            </span>
                          </div>
                          <Progress
                            value={Math.round((m.projectCount / maxCount) * 100)}
                            className="h-1.5"
                          />
                        </div>
                      )
                    })
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}

export default Analytics
