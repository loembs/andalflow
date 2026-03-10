import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { feedbackService, type CreateFeedbackInput, type UpdateFeedbackInput } from '@/services/supabase/feedback.service';
import { useToast } from '@/hooks/use-toast';
import type { ClientFeedback } from '@/types';

export const useFeedback = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const enabled = !!supabase;

  const { data: feedback = [], isLoading } = useQuery({
    queryKey: ['feedback'],
    queryFn: async () => (enabled ? feedbackService.list() : []),
    enabled,
    staleTime: 2 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateFeedbackInput) => {
      if (!supabase) throw new Error('Supabase n’est pas configuré.');
      return feedbackService.create(input);
    },
    onSuccess: () => {
      toast({
        title: 'Feedback ajouté',
        description: 'Le retour client a été enregistré.',
      });
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d’ajouter le feedback.',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateFeedbackInput }) => {
      if (!supabase) throw new Error('Supabase n’est pas configuré.');
      return feedbackService.update(id, input);
    },
    onSuccess: () => {
      toast({
        title: 'Feedback mis à jour',
        description: 'Le statut du feedback a été mis à jour.',
      });
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de mettre à jour le feedback.',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      if (!supabase) throw new Error('Supabase n’est pas configuré.');
      return feedbackService.remove(id);
    },
    onSuccess: () => {
      toast({
        title: 'Feedback supprimé',
        description: 'Le retour client a été supprimé.',
      });
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer le feedback.',
        variant: 'destructive',
      });
    },
  });

  return {
    feedback,
    isLoading,
    createFeedback: createMutation.mutate,
    updateFeedback: updateMutation.mutate,
    deleteFeedback: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

