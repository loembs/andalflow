import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { useFeedback } from '@/hooks/useFeedback';
import { useClients } from '@/hooks/useClients';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { MessageCircle, Plus, Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Client, ClientFeedback, FeedbackStatus } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface FeedbackFormProps {
  clients: Client[];
  initial?: Partial<ClientFeedback>;
  onSubmit: (values: {
    clientId?: string;
    channel?: string;
    message: string;
    status: FeedbackStatus;
    sentiment?: string;
  }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const FeedbackForm = ({ clients, initial, onSubmit, onCancel, isSubmitting }: FeedbackFormProps) => {
  const [clientId, setClientId] = useState(initial?.clientId ?? '');
  const [channel, setChannel] = useState(initial?.channel ?? 'email');
  const [message, setMessage] = useState(initial?.message ?? '');
  const [status, setStatus] = useState<FeedbackStatus>(initial?.status ?? 'NEW');
  const [sentiment, setSentiment] = useState(initial?.sentiment ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSubmit({
      clientId: clientId || undefined,
      channel,
      message: message.trim(),
      status,
      sentiment: sentiment || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Client (optionnel)</Label>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger>
              <SelectValue placeholder="Associer à un client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Aucun</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Canal</Label>
          <Select value={channel} onValueChange={setChannel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="call">Appel</SelectItem>
              <SelectItem value="meeting">Réunion</SelectItem>
              <SelectItem value="social">Réseaux sociaux</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Message *</Label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Copiez-collez le retour client, ou résumez-le ici..."
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Statut</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as FeedbackStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NEW">Nouveau</SelectItem>
              <SelectItem value="IN_PROGRESS">En cours</SelectItem>
              <SelectItem value="RESOLVED">Résolu</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Sentiment (optionnel)</Label>
          <Select value={sentiment} onValueChange={setSentiment}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un sentiment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Non précisé</SelectItem>
              <SelectItem value="positive">Positif</SelectItem>
              <SelectItem value="neutral">Neutre</SelectItem>
              <SelectItem value="negative">Négatif</SelectItem>
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

const statusBadge = (status: FeedbackStatus) => {
  switch (status) {
    case 'NEW':
      return (
        <Badge variant="outline" className="border-warning text-warning">
          Nouveau
        </Badge>
      );
    case 'IN_PROGRESS':
      return (
        <Badge variant="secondary">
          En cours
        </Badge>
      );
    case 'RESOLVED':
      return (
        <Badge className="bg-success text-success-foreground">
          Résolu
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
};

const sentimentBadge = (sentiment?: string) => {
  if (!sentiment) return <Badge variant="outline">N/A</Badge>;
  if (sentiment === 'positive') {
    return (
      <Badge className="bg-success/10 text-success border-success/50">
        Positif
      </Badge>
    );
  }
  if (sentiment === 'negative') {
    return (
      <Badge className="bg-destructive/10 text-destructive border-destructive/50">
        Négatif
      </Badge>
    );
  }
  return (
    <Badge variant="outline">
      Neutre
    </Badge>
  );
};

const FeedbackPage = () => {
  const { feedback, isLoading, createFeedback, updateFeedback, deleteFeedback, isCreating, isUpdating, isDeleting } = useFeedback();
  const { clients } = useClients();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | 'ALL'>('ALL');
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<ClientFeedback | null>(null);
  const [toDelete, setToDelete] = useState<ClientFeedback | null>(null);

  const filtered = feedback.filter((fb) => {
    const term = search.toLowerCase();
    const client = clients.find((c) => c.id === fb.clientId);
    const matchesSearch =
      fb.message.toLowerCase().includes(term) ||
      (client?.name ?? '').toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'ALL' || fb.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openCreate = () => {
    setEditing(null);
    setShowDialog(true);
  };

  const openEdit = (fb: ClientFeedback) => {
    setEditing(fb);
    setShowDialog(true);
  };

  const handleSubmitForm: FeedbackFormProps['onSubmit'] = (values) => {
    if (editing) {
      updateFeedback({ id: editing.id, input: values });
    } else {
      createFeedback(values);
    }
    setShowDialog(false);
  };

  const confirmDelete = () => {
    if (toDelete) {
      deleteFeedback(toDelete.id);
      setToDelete(null);
    }
  };

  const newCount = feedback.filter((f) => f.status === 'NEW').length;
  const inProgressCount = feedback.filter((f) => f.status === 'IN_PROGRESS').length;
  const resolvedCount = feedback.filter((f) => f.status === 'RESOLVED').length;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Feedback clients</h1>
            <p className="text-muted-foreground">
              Centralisez et suivez tous les retours clients (positifs comme négatifs).
            </p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouveau feedback
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Nouveaux</p>
                <p className="text-2xl font-bold">{newCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-info" />
              <div>
                <p className="text-sm text-muted-foreground">En cours</p>
                <p className="text-2xl font-bold">{inProgressCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Résolus</p>
                <p className="text-2xl font-bold">{resolvedCount}</p>
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
                  placeholder="Rechercher par client ou contenu..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div>
                <Label>Statut</Label>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as FeedbackStatus | 'ALL')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tous</SelectItem>
                    <SelectItem value="NEW">Nouveau</SelectItem>
                    <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                    <SelectItem value="RESOLVED">Résolu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tableau */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des feedbacks</CardTitle>
            <CardDescription>Vue type board Monday.com pour suivre tous les retours.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Chargement des feedbacks...</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun feedback trouvé. Ajoutez un premier retour pour commencer.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Canal</TableHead>
                    <TableHead>Sentiment</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Créé le</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((fb) => {
                    const client = clients.find((c) => c.id === fb.clientId);
                    return (
                      <TableRow key={fb.id}>
                        <TableCell>{client?.name ?? '—'}</TableCell>
                        <TableCell className="max-w-md">
                          <p className="text-sm line-clamp-2">{fb.message}</p>
                        </TableCell>
                        <TableCell>{fb.channel ?? '—'}</TableCell>
                        <TableCell>{sentimentBadge(fb.sentiment)}</TableCell>
                        <TableCell>{statusBadge(fb.status)}</TableCell>
                        <TableCell>
                          {fb.createdAt
                            ? format(new Date(fb.createdAt), 'dd/MM/yyyy', { locale: fr })
                            : '—'}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEdit(fb)}
                          >
                            Mettre à jour
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setToDelete(fb)}
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
                {editing ? 'Mettre à jour le feedback' : 'Nouveau feedback'}
              </DialogTitle>
            </DialogHeader>
            <FeedbackForm
              clients={clients}
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
              <AlertDialogTitle>Supprimer ce feedback ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Le message ne sera plus visible dans l’historique.
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

export default FeedbackPage;

