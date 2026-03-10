import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Users, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { usePermissions } from '@/hooks/usePermissions';
import { useProjects } from '@/hooks/useProjects';
import { useProfiles } from '@/hooks/useProfiles';
import { CreateProjectForm as CreateProjectFormType } from '@/types';
import type { Client } from '@/types';
import { cn } from '@/lib/utils';

const createProjectSchema = z.object({
  name: z.string().min(3, 'Le nom du projet doit contenir au moins 3 caractères'),
  client: z.string().min(2, 'Le nom du client doit contenir au moins 2 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  priority: z.enum(['low', 'medium', 'high']),
  startDate: z.date(),
  endDate: z.date().optional(),
  budget: z.number().optional(),
  teamMembers: z.array(z.string()).optional(),
});

type CreateProjectFormData = z.infer<typeof createProjectSchema>;

interface CreateProjectFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  clients?: Client[];
}

const getInitials = (name: string | null) => {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
};

export const CreateProjectForm = ({ onSuccess, onCancel, clients = [] }: CreateProjectFormProps) => {
  const { canCreateProject } = usePermissions();
  const { createProject, isCreatingProject } = useProjects();
  const { profiles } = useProfiles();
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      priority: 'medium',
      teamMembers: [],
    },
  });

  if (!canCreateProject()) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Vous n'avez pas les permissions pour créer un projet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const onSubmit = async (data: CreateProjectFormData) => {
    if (clients.length > 0 && !selectedClientId) {
      setValue('client', '', { shouldValidate: true });
      return;
    }
    try {
      const priority = (data.priority?.toUpperCase() ?? 'MEDIUM') as 'LOW' | 'MEDIUM' | 'HIGH';
      const projectData: CreateProjectFormType & { clientId?: string } = {
        name: data.name,
        client: data.client,
        description: data.description,
        priority,
        startDate: data.startDate,
        endDate: data.endDate,
        budget: data.budget,
        teamMembers: selectedMemberIds,
      };
      if (clients.length && selectedClientId) {
        projectData.clientId = selectedClientId;
        const c = clients.find((x) => x.id === selectedClientId);
        if (c) projectData.client = c.name;
      }
      await createProject(projectData);
      onSuccess?.();
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
    }
  };

  const toggleMember = (memberId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const selectedProfiles = profiles.filter((p) => selectedMemberIds.includes(p.id));
  const availableProfiles = profiles.filter((p) => !selectedMemberIds.includes(p.id));

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Créer un nouveau projet
        </CardTitle>
        <CardDescription>
          Remplissez les informations ci-dessous pour créer un nouveau projet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Nom et Client */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nom du projet *
              </label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Ex: Refonte site web"
                className={cn(errors.name && 'border-destructive')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="client" className="text-sm font-medium">
                Client *
              </label>
              {clients.length > 0 ? (
                <Select
                  value={selectedClientId}
                  onValueChange={(id) => {
                    setSelectedClientId(id);
                    const c = clients.find((x) => x.id === id);
                    setValue('client', c?.name ?? '', { shouldValidate: true });
                  }}
                >
                  <SelectTrigger className={cn(!selectedClientId && errors.client && 'border-destructive')}>
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                        {c.company ? ` — ${c.company}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="client"
                  {...register('client')}
                  placeholder="Ex: Entreprise ABC"
                  className={cn(errors.client && 'border-destructive')}
                />
              )}
              {errors.client && (
                <p className="text-sm text-destructive">{errors.client.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description *
            </label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Décrivez le projet en détail..."
              rows={4}
              className={cn(errors.description && 'border-destructive')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Priorité et Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Priorité *</label>
              <Select
                defaultValue="medium"
                onValueChange={(value) => setValue('priority', value as 'low' | 'medium' | 'high')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Basse</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="budget" className="text-sm font-medium">
                Budget (optionnel)
              </label>
              <Input
                id="budget"
                type="number"
                placeholder="Ex: 5000"
                {...register('budget', { valueAsNumber: true })}
              />
            </div>
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
                      'w-full justify-start text-left font-normal',
                      !watch('startDate') && 'text-muted-foreground',
                      errors.startDate && 'border-destructive'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watch('startDate')
                      ? format(watch('startDate')!, 'PPP', { locale: fr })
                      : 'Sélectionner une date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={watch('startDate')}
                    onSelect={(date) => date && setValue('startDate', date, { shouldValidate: true })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.startDate && (
                <p className="text-sm text-destructive">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date de fin (optionnel)</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !watch('endDate') && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watch('endDate')
                      ? format(watch('endDate')!, 'PPP', { locale: fr })
                      : 'Sélectionner une date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={watch('endDate')}
                    onSelect={(date) => date && setValue('endDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Membres de l'équipe */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Membres de l'équipe
            </label>

            {/* Membres sélectionnés */}
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
                    <span>{m.full_name ?? 'Utilisateur'}</span>
                    <X className="h-3 w-3 ml-0.5 opacity-60" />
                  </Badge>
                ))}
              </div>
            )}

            {/* Sélecteur de membres */}
            {availableProfiles.length > 0 ? (
              <Select onValueChange={(id) => toggleMember(id)} value="">
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
                        <span>{m.full_name ?? 'Utilisateur'}</span>
                        <span className="text-muted-foreground text-xs">· {m.role}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : profiles.length > 0 ? (
              <p className="text-sm text-muted-foreground">Tous les membres ont été ajoutés.</p>
            ) : null}

            <p className="text-xs text-muted-foreground">
              Vous serez automatiquement ajouté comme propriétaire du projet.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isCreatingProject}>
              Annuler
            </Button>
            <Button type="submit" disabled={isCreatingProject}>
              {isCreatingProject ? 'Création...' : 'Créer le projet'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
