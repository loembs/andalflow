import { useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { useReminders } from '@/hooks/useReminders';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { AlarmClock, Plus, Search, CheckCircle2 } from 'lucide-react';
import type { Reminder, ReminderStatus } from '@/types';
import { format, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ReminderFormProps {
  initial?: Partial<Reminder>;
  onSubmit: (values: {
    targetType: string;
    targetId: string;
    title: string;
    description?: string;
    dueAt: string;
    status: ReminderStatus;
  }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ReminderForm = ({ initial, onSubmit, onCancel, isSubmitting }: ReminderFormProps) => {
  const [targetType, setTargetType] = useState(initial?.targetType ?? 'INVOICE');
  const [targetId, setTargetId] = useState(initial?.targetId ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [dueAt, setDueAt] = useState(
    initial?.dueAt ? new Date(initial.dueAt).toISOString().substring(0, 16) : new Date().toISOString().substring(0, 16)
  );
  const [status, setStatus] = useState<ReminderStatus>(initial?.status ?? 'PENDING');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetType || !targetId.trim()) return;
    onSubmit({
      targetType,
      targetId: targetId.trim(),
      title: title.trim(),
      description: description || undefined,
      dueAt,
      status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Type de cible *</Label>
          <Select value={targetType} onValueChange={setTargetType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INVOICE">Facture</SelectItem>
              <SelectItem value="PROJECT">Projet</SelectItem>
              <SelectItem value="CLIENT">Client</SelectItem>
              <SelectItem value="OTHER">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>ID de la cible *</Label>
          <Input
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            placeholder="ID (ou référence) de la facture/projet/client"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Titre *</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Relancer le client pour la facture FAC-2024-001"
        />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Détails du rappel..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Échéance *</Label>
          <Input
            type="datetime-local"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Statut</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as ReminderStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">En attente</SelectItem>
              <SelectItem value="DONE">Terminé</SelectItem>
              <SelectItem value="CANCELLED">Annulé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  );
};

const statusBadge = (status: ReminderStatus, overdue: boolean) => {
  if (status === 'DONE') {
    return (
      <Badge className="bg-success text-success-foreground">
        Terminé
      </Badge>
    );
  }
  if (status === 'CANCELLED') {
    return (
      <Badge variant="outline">
        Annulé
      </Badge>
    );
  }
  if (overdue) {
    return (
      <Badge className="bg-destructive text-destructive-foreground">
        En retard
      </Badge>
    );
  }
  return (
    <Badge variant="secondary">
      À venir
    </Badge>
  );
};

const RemindersPage = () => {
  const { reminders, isLoading, createReminder, updateReminder, deleteReminder, isCreating, isUpdating, isDeleting } = useReminders();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReminderStatus | 'ALL'>('ALL');
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Reminder | null>(null);
  const [toDelete, setToDelete] = useState<Reminder | null>(null);

  const now = new Date();

  const filtered = reminders.filter((r) => {
    const term = search.toLowerCase();
    const matchesSearch =
      r.title.toLowerCase().includes(term) ||
      (r.description ?? '').toLowerCase().includes(term) ||
      r.targetId.toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const overdueCount = filtered.filter((r) => r.status === 'PENDING' && isPast(new Date(r.dueAt))).length;
  const todayCount = filtered.filter((r) => {
    const d = new Date(r.dueAt);
    return (
      r.status === 'PENDING' &&
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  }).length;
  const doneCount = filtered.filter((r) => r.status === 'DONE').length;

  const openCreate = () => {
    setEditing(null);
    setShowDialog(true);
  };

  const openEdit = (r: Reminder) => {
    setEditing(r);
    setShowDialog(true);
  };

  const handleSubmitForm: ReminderFormProps['onSubmit'] = (values) => {
    if (editing) {
      updateReminder({ id: editing.id, input: values });
    } else {
      createReminder(values);
    }
    setShowDialog(false);
  };

  const confirmDelete = () => {
    if (toDelete) {
      deleteReminder(toDelete.id);
      setToDelete(null);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Rappels & relances</h1>
            <p className="text-muted-foreground">
              Vue centrale de tous les rappels (factures, projets, clients) pour l’équipe.
            </p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouveau rappel
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <AlarmClock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Rappels du jour</p>
                <p className="text-2xl font-bold">{todayCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <AlarmClock className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">En retard</p>
                <p className="text-2xl font-bold">{overdueCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Terminés</p>
                <p className="text-2xl font-bold">{doneCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Filtres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher par titre, description ou cible..."
                  className="pl-9"
                />
              </div>
              <div>
                <Label>Statut</Label>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ReminderStatus | 'ALL')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tous</SelectItem>
                    <SelectItem value="PENDING">En attente</SelectItem>
                    <SelectItem value="DONE">Terminé</SelectItem>
                    <SelectItem value="CANCELLED">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tableau */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des rappels</CardTitle>
            <CardDescription>Vue Monday-like pour piloter toutes les relances.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Chargement des rappels...</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun rappel trouvé. Créez un rappel pour une facture, un projet ou un client.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Cible</TableHead>
                    <TableHead>Échéance</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => {
                    const overdue = r.status === 'PENDING' && isPast(new Date(r.dueAt));
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.title}</TableCell>
                        <TableCell>{r.targetType}</TableCell>
                        <TableCell>{r.targetId}</TableCell>
                        <TableCell>
                          {r.dueAt
                            ? format(new Date(r.dueAt), 'dd/MM/yyyy HH:mm', { locale: fr })
                            : '—'}
                        </TableCell>
                        <TableCell>{statusBadge(r.status, overdue)}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEdit(r)}
                          >
                            Mettre à jour
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setToDelete(r)}
                          >
                            Supprimer
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dialog création / édition */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editing ? 'Mettre à jour le rappel' : 'Nouveau rappel'}
              </DialogTitle>
            </DialogHeader>
            <ReminderForm
              initial={editing ?? undefined}
              onSubmit={handleSubmitForm}
              onCancel={() => setShowDialog(false)}
              isSubmitting={isCreating || isUpdating}
            />
          </DialogContent>
        </Dialog>

        {/* Confirmation suppression */}
        <AlertDialog open={!!toDelete} onOpenChange={() => setToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer ce rappel ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Le rappel ne sera plus visible dans la liste.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
};

export default RemindersPage;

