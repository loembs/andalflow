import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { clientService, type CreateClientInput, type UpdateClientInput } from '@/services/supabase/clients.service';
import { useToast } from '@/hooks/use-toast';
import type { Client } from '@/types';

// Gestion des clients côté Supabase (Principe MVP + React Query)
export const useClients = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const enabled = !!supabase;

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => (enabled ? clientService.list() : []),
    enabled,
    staleTime: 2 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateClientInput) => {
      if (!supabase) throw new Error('Supabase n’est pas configuré.');
      return clientService.create(input);
    },
    onSuccess: () => {
      toast({
        title: 'Client créé',
        description: 'Le client a été créé avec succès.',
      });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer le client.',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateClientInput }) => {
      if (!supabase) throw new Error('Supabase n’est pas configuré.');
      return clientService.update(id, input);
    },
    onSuccess: () => {
      toast({
        title: 'Client mis à jour',
        description: 'Les informations du client ont été mises à jour.',
      });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de mettre à jour le client.',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      if (!supabase) throw new Error('Supabase n’est pas configuré.');
      return clientService.remove(id);
    },
    onSuccess: () => {
      toast({
        title: 'Client supprimé',
        description: 'Le client a été supprimé avec succès.',
      });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer le client.',
        variant: 'destructive',
      });
    },
  });

  return {
    clients,
    isLoading,
    createClient: createMutation.mutate,
    updateClient: updateMutation.mutate,
    deleteClient: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

