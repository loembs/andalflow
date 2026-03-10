import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { invoiceService, type CreateInvoiceInput, type UpdateInvoiceInput } from '@/services/supabase/invoices.service';
import { useToast } from '@/hooks/use-toast';
import type { Invoice } from '@/types';

export const useInvoices = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const enabled = !!supabase;

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => (enabled ? invoiceService.list() : []),
    enabled,
    staleTime: 2 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateInvoiceInput) => {
      if (!supabase) throw new Error('Supabase n’est pas configuré.');
      return invoiceService.create(input);
    },
    onSuccess: () => {
      toast({
        title: 'Facture créée',
        description: 'La facture a été créée avec succès.',
      });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer la facture.',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateInvoiceInput }) => {
      if (!supabase) throw new Error('Supabase n’est pas configuré.');
      return invoiceService.update(id, input);
    },
    onSuccess: () => {
      toast({
        title: 'Facture mise à jour',
        description: 'La facture a été mise à jour.',
      });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de mettre à jour la facture.',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      if (!supabase) throw new Error('Supabase n’est pas configuré.');
      return invoiceService.remove(id);
    },
    onSuccess: () => {
      toast({
        title: 'Facture supprimée',
        description: 'La facture a été supprimée.',
      });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer la facture.',
        variant: 'destructive',
      });
    },
  });

  return {
    invoices,
    isLoading,
    createInvoice: createMutation.mutate,
    updateInvoice: updateMutation.mutate,
    deleteInvoice: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

