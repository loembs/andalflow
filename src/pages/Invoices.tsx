import { useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { useInvoices } from '@/hooks/useInvoices';
import { useClients } from '@/hooks/useClients';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { FileText, Plus, Euro, Search, CalendarIcon } from 'lucide-react';
import type { Client, Invoice, InvoiceStatus } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface InvoiceFormProps {
  clients: Client[];
  initial?: Partial<Invoice>;
  onSubmit: (values: {
    clientId: string;
    number: string;
    status: InvoiceStatus;
    issueDate: string;
    dueDate?: string;
    totalHt: number;
    totalTtc: number;
    currency: string;
  }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const InvoiceForm = ({ clients, initial, onSubmit, onCancel, isSubmitting }: InvoiceFormProps) => {
  const [clientId, setClientId] = useState(initial?.clientId ?? (clients[0]?.id ?? ''));
  const [number, setNumber] = useState(initial?.number ?? '');
  const [status, setStatus] = useState<InvoiceStatus>(initial?.status ?? 'DRAFT');
  const [issueDate, setIssueDate] = useState(
    initial?.issueDate ? new Date(initial.issueDate).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10)
  );
  const [dueDate, setDueDate] = useState(
    initial?.dueDate ? new Date(initial.dueDate).toISOString().substring(0, 10) : ''
  );
  const [totalHt, setTotalHt] = useState(initial?.totalHt ?? 0);
  const [taxRate, setTaxRate] = useState(20); // simple TVA par défaut

  const totalTtc = useMemo(() => {
    const ht = Number(totalHt) || 0;
    const rate = Number(taxRate) || 0;
    return Math.round(ht * (1 + rate / 100) * 100) / 100;
  }, [totalHt, taxRate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !number.trim()) return;

    onSubmit({
      clientId,
      number: number.trim(),
      status,
      issueDate,
      dueDate: dueDate || undefined,
      totalHt: Number(totalHt) || 0,
      totalTtc,
      currency: 'EUR',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Client *</Label>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Numéro de facture *</Label>
          <Input
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="FAC-2024-001"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Statut</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as InvoiceStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Brouillon</SelectItem>
              <SelectItem value="SENT">Envoyée</SelectItem>
              <SelectItem value="PAID">Payée</SelectItem>
              <SelectItem value="OVERDUE">En retard</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Date d’émission</Label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Date d’échéance</Label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Total HT</Label>
          <div className="relative">
            <Euro className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="number"
              step="0.01"
              value={totalHt}
              onChange={(e) => setTotalHt(Number(e.target.value))}
              className="pl-8"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>TVA (%)</Label>
          <Input
            type="number"
            step="0.01"
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label>Total TTC (calculé)</Label>
          <Input value={totalTtc} readOnly />
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

const getStatusBadge = (status: InvoiceStatus) => {
  switch (status) {
    case 'DRAFT':
      return <Badge variant="outline">Brouillon</Badge>;
    case 'SENT':
      return <Badge variant="secondary">Envoyée</Badge>;
    case 'PAID':
      return <Badge className="bg-success text-success-foreground">Payée</Badge>;
    case 'OVERDUE':
      return <Badge className="bg-destructive text-destructive-foreground">En retard</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

// Page Factures (finance) type Monday.com
const Invoices = () => {
  const { invoices, isLoading, createInvoice, updateInvoice, deleteInvoice, isCreating, isUpdating, isDeleting } = useInvoices();
  const { clients } = useClients();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'ALL'>('ALL');
  const [showDialog, setShowDialog] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

  const clientsById = useMemo(
    () =>
      new Map(
        clients.map((c) => [c.id, c] as [string, Client])
      ),
    [clients]
  );

  const filteredInvoices = invoices.filter((inv) => {
    const term = search.toLowerCase();
    const client = clientsById.get(inv.clientId);
    const matchesSearch =
      inv.number.toLowerCase().includes(term) ||
      (client?.name ?? '').toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalHt = filteredInvoices.reduce((sum, inv) => sum + (inv.totalHt || 0), 0);
  const totalPaid = filteredInvoices
    .filter((inv) => inv.status === 'PAID')
    .reduce((sum, inv) => sum + (inv.totalTtc || 0), 0);
  const totalOverdue = filteredInvoices
    .filter((inv) => inv.status === 'OVERDUE')
    .reduce((sum, inv) => sum + (inv.totalTtc || 0), 0);

  const openCreate = () => {
    setEditingInvoice(null);
    setShowDialog(true);
  };

  const openEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setShowDialog(true);
  };

  const handleSubmitForm: InvoiceFormProps['onSubmit'] = (values) => {
    if (editingInvoice) {
      updateInvoice({ id: editingInvoice.id, input: values });
    } else {
      createInvoice(values);
    }
    setShowDialog(false);
  };

  const confirmDelete = () => {
    if (invoiceToDelete) {
      deleteInvoice(invoiceToDelete.id);
      setInvoiceToDelete(null);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Factures</h1>
            <p className="text-muted-foreground">
              Suivi financier des projets clients (brouillons, envoyées, payées, en retard)
              {clients.length === 0 && (
                <span className="block mt-1 text-amber-600 dark:text-amber-400 text-sm">
                  Ajoutez au moins un client pour créer une facture.
                </span>
              )}
            </p>
          </div>
          <Button
            onClick={openCreate}
            className="flex items-center gap-2"
            disabled={clients.length === 0}
            title={clients.length === 0 ? 'Ajoutez d\'abord au moins un client' : undefined}
          >
            <Plus className="h-4 w-4" />
            Nouvelle facture
          </Button>
        </div>

        {/* Stats finance */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Factures</p>
                <p className="text-2xl font-bold">{filteredInvoices.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Euro className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Total payé (TTC)</p>
                <p className="text-2xl font-bold">
                  {totalPaid.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Euro className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">En retard (TTC)</p>
                <p className="text-2xl font-bold">
                  {totalOverdue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
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
                  placeholder="Rechercher par numéro ou client..."
                  className="pl-9"
                />
              </div>
              <div className="space-y-1">
                <Label>Statut</Label>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as InvoiceStatus | 'ALL')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tous</SelectItem>
                    <SelectItem value="DRAFT">Brouillon</SelectItem>
                    <SelectItem value="SENT">Envoyée</SelectItem>
                    <SelectItem value="PAID">Payée</SelectItem>
                    <SelectItem value="OVERDUE">En retard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Total HT (filtré)</Label>
                <div className="flex items-center gap-2">
                  <Euro className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {totalHt.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tableau des factures */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des factures</CardTitle>
            <CardDescription>Vue type tableau Monday.com des factures clients.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Chargement des factures...</p>
            ) : filteredInvoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucune facture trouvée. Créez-en une nouvelle pour commencer.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Facture</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Émission</TableHead>
                    <TableHead>Échéance</TableHead>
                    <TableHead>Total TTC</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((inv) => {
                    const client = clientsById.get(inv.clientId);
                    return (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium">{inv.number}</TableCell>
                        <TableCell>{client?.name ?? '—'}</TableCell>
                        <TableCell>
                          {inv.issueDate
                            ? format(new Date(inv.issueDate), 'dd/MM/yyyy', { locale: fr })
                            : '—'}
                        </TableCell>
                        <TableCell>
                          {inv.dueDate
                            ? format(new Date(inv.dueDate), 'dd/MM/yyyy', { locale: fr })
                            : '—'}
                        </TableCell>
                        <TableCell>
                          {inv.totalTtc.toLocaleString('fr-FR', {
                            style: 'currency',
                            currency: inv.currency || 'EUR',
                          })}
                        </TableCell>
                        <TableCell>{getStatusBadge(inv.status)}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEdit(inv)}
                          >
                            Modifier
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setInvoiceToDelete(inv)}
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
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {editingInvoice ? 'Modifier la facture' : 'Nouvelle facture'}
              </DialogTitle>
            </DialogHeader>
            <InvoiceForm
              clients={clients}
              initial={editingInvoice ?? undefined}
              onSubmit={handleSubmitForm}
              onCancel={() => setShowDialog(false)}
              isSubmitting={isCreating || isUpdating}
            />
          </DialogContent>
        </Dialog>

        {/* Confirmation suppression */}
        <AlertDialog open={!!invoiceToDelete} onOpenChange={() => setInvoiceToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer cette facture ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. La facture "{invoiceToDelete?.number}" sera supprimée.
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

export default Invoices;

