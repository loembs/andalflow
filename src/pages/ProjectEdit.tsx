import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ArrowLeft, CalendarIcon, Users, X, Save } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useProjects } from "@/hooks/useProjects"
import { useProfiles } from "@/hooks/useProfiles"
import { useClients } from "@/hooks/useClients"
import { usePermissions } from "@/hooks/usePermissions"
import { cn } from "@/lib/utils"

const editSchema = z.object({
  name: z.string().min(3, "Au moins 3 caractères"),
  client: z.string().min(1, "Client requis"),
  description: z.string().min(10, "Au moins 10 caractères"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED"]),
  progress: z.number().min(0).max(100),
  startDate: z.date(),
  endDate: z.date().optional(),
  budget: z.number().optional(),
})

type EditFormData = z.infer<typeof editSchema>

const getInitials = (name: string | null) =>
  name ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "?"

const ProjectEdit = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { useGetProject, updateProject, isUpdatingProject } = useProjects()
  const { data: project, isLoading } = useGetProject(id ?? "")
  const { profiles } = useProfiles()
  const { clients } = useClients()
  const { canEditProject } = usePermissions()

  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string>("")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
  })

  // Pré-remplir le formulaire quand le projet est chargé
  useEffect(() => {
    if (!project) return
    reset({
      name: project.name,
      client: project.client,
      description: project.description,
      priority: project.priority as "LOW" | "MEDIUM" | "HIGH",
      status: project.status as "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED",
      progress: project.progress,
      startDate: new Date(project.startDate),
      endDate: project.endDate ? new Date(project.endDate) : undefined,
      budget: project.budget ?? undefined,
    })
    setSelectedMemberIds(project.teamMembers ?? [])
    const matchingClient = clients.find((c) => c.name === project.client)
    if (matchingClient) setSelectedClientId(matchingClient.id)
  }, [project, clients, reset])

  const toggleMember = (memberId: string) =>
    setSelectedMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    )

  const onSubmit = (data: EditFormData) => {
    if (!project) return
    const payload: any = {
      name: data.name,
      client: data.client,
      description: data.description,
      priority: data.priority,
      startDate: data.startDate,
      endDate: data.endDate,
      budget: data.budget,
    }
    if (selectedClientId) payload.clientId = selectedClientId
    updateProject(
      { id: project.id, data: payload },
      { onSuccess: () => navigate(`/projects/${project.id}`) }
    )
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-4 max-w-2xl mx-auto">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-96 w-full" />
        </div>
      </MainLayout>
    )
  }

  if (!project) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-muted-foreground mb-4">Projet introuvable.</p>
          <Button onClick={() => navigate("/projects")}>
            <ArrowLeft className="h-4 w-4 mr-2" />Retour
          </Button>
        </div>
      </MainLayout>
    )
  }

  if (!canEditProject(project)) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-muted-foreground mb-4">
            Vous n'avez pas la permission de modifier ce projet.
          </p>
          <Button onClick={() => navigate(`/projects/${project.id}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />Retour
          </Button>
        </div>
      </MainLayout>
    )
  }

  const selectedProfiles = profiles.filter((p) => selectedMemberIds.includes(p.id))
  const availableProfiles = profiles.filter((p) => !selectedMemberIds.includes(p.id))

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/projects/${project.id}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Modifier le projet</h1>
            <p className="text-sm text-muted-foreground">{project.name}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations du projet</CardTitle>
            <CardDescription>Modifiez les champs puis enregistrez.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Nom & Client */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom du projet *</label>
                  <Input
                    {...register("name")}
                    className={cn(errors.name && "border-destructive")}
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Client *</label>
                  {clients.length > 0 ? (
                    <Select
                      value={selectedClientId}
                      onValueChange={(cid) => {
                        setSelectedClientId(cid)
                        const c = clients.find((x) => x.id === cid)
                        if (c) setValue("client", c.name, { shouldValidate: true })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}{c.company ? ` — ${c.company}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      {...register("client")}
                      className={cn(errors.client && "border-destructive")}
                    />
                  )}
                  {errors.client && <p className="text-xs text-destructive">{errors.client.message}</p>}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  {...register("description")}
                  rows={4}
                  className={cn(errors.description && "border-destructive")}
                />
                {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
              </div>

              {/* Statut, Priorité, Progression */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Statut</label>
                  <Select
                    value={watch("status")}
                    onValueChange={(v) => setValue("status", v as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Brouillon</SelectItem>
                      <SelectItem value="ACTIVE">En cours</SelectItem>
                      <SelectItem value="COMPLETED">Terminé</SelectItem>
                      <SelectItem value="ARCHIVED">Archivé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Priorité</label>
                  <Select
                    value={watch("priority")}
                    onValueChange={(v) => setValue("priority", v as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Basse</SelectItem>
                      <SelectItem value="MEDIUM">Moyenne</SelectItem>
                      <SelectItem value="HIGH">Haute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Progression : {watch("progress") ?? 0}%
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    {...register("progress", { valueAsNumber: true })}
                  />
                </div>
              </div>

              {/* Budget */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Budget (€, optionnel)</label>
                <Input
                  type="number"
                  placeholder="Ex : 5000"
                  {...register("budget", { valueAsNumber: true })}
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date de début *</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !watch("startDate") && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {watch("startDate")
                          ? format(watch("startDate")!, "PPP", { locale: fr })
                          : "Sélectionner"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={watch("startDate")}
                        onSelect={(d) => d && setValue("startDate", d, { shouldValidate: true })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date de fin (optionnel)</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !watch("endDate") && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {watch("endDate")
                          ? format(watch("endDate")!, "PPP", { locale: fr })
                          : "Sélectionner"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={watch("endDate")}
                        onSelect={(d) => d && setValue("endDate", d)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Membres */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Membres de l'équipe
                </label>

                {selectedProfiles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedProfiles.map((m) => (
                      <Badge
                        key={m.id}
                        variant="secondary"
                        className="flex items-center gap-1 pr-1 cursor-pointer"
                        onClick={() => toggleMember(m.id)}
                      >
                        <Avatar className="h-4 w-4">
                          <AvatarFallback className="text-[9px]">
                            {getInitials(m.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{m.full_name ?? "Utilisateur"}</span>
                        <X className="h-3 w-3 ml-0.5 opacity-60" />
                      </Badge>
                    ))}
                  </div>
                )}

                {availableProfiles.length > 0 && (
                  <Select onValueChange={(mid) => toggleMember(mid)} value="">
                    <SelectTrigger>
                      <SelectValue placeholder="Ajouter un membre…" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProfiles.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-[10px]">
                                {getInitials(m.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{m.full_name ?? "Utilisateur"}</span>
                            <span className="text-muted-foreground text-xs">· {m.role}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isUpdatingProject}>
                  <Save className="h-4 w-4 mr-2" />
                  {isUpdatingProject ? "Enregistrement…" : "Enregistrer"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

export default ProjectEdit
