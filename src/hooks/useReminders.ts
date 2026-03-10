import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { reminderService, type CreateReminderInput, type UpdateReminderInput } from '@/services/supabase/reminders.service';
import { useToast } from '@/hooks/use-toast';
import type { Reminder } from '@/types';

export const useReminders = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const enabled = !!supabase;

  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ['reminders'],
    queryFn: async () => (enabled ? reminderService.list() : []),
    enabled,
    staleTime: 2 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateReminderInput) => {
      if (!supabase) throw new Error('Supabase n’est pas configuré.');
      return reminderService.create(input);
    },
    onSuccess: () => {
      toast({
        title: 'Rappel créé',
        description: 'Le rappel a été enregistré.',
      });
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer le rappel.',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateReminderInput }) => {
      if (!supabase) throw new Error('Supabase n’est pas configuré.');
      return reminderService.update(id, input);
    },
    onSuccess: () => {
      toast({
        title: 'Rappel mis à jour',
        description: 'Le rappel a été mis à jour.',
      });
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de mettre à jour le rappel.',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      if (!supabase) throw new Error('Supabase n’est pas configuré.');
      return reminderService.remove(id);
    },
    onSuccess: () => {
      toast({
        title: 'Rappel supprimé',
        description: 'Le rappel a été supprimé.',
      });
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer le rappel.',
        variant: 'destructive',
      });
    },
  });

  return {
    reminders,
    isLoading,
    createReminder: createMutation.mutate,
    updateReminder: updateMutation.mutate,
    deleteReminder: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

