import { supabase } from '@/lib/supabaseClient';
import type { Reminder, ReminderStatus } from '@/types';

export interface CreateReminderInput {
  targetType: string;
  targetId: string;
  title: string;
  description?: string;
  assignedTo?: string;
  dueAt: string | Date;
  status?: ReminderStatus;
}

export interface UpdateReminderInput extends Partial<CreateReminderInput> {}

const ensureSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase n’est pas configuré. Vérifiez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.');
  }
  return supabase;
};

export const reminderService = {
  async list(): Promise<Reminder[]> {
    const sb = ensureSupabase();
    const { data, error } = await sb
      .from('reminders')
      .select('*')
      .order('due_at', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      targetType: row.target_type,
      targetId: row.target_id,
      title: row.title,
      description: row.description ?? undefined,
      assignedTo: row.assigned_to ?? undefined,
      dueAt: row.due_at,
      status: row.status,
      createdBy: row.created_by ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  async create(input: CreateReminderInput): Promise<Reminder> {
    const sb = ensureSupabase();
    const { data: { user } } = await sb.auth.getUser();
    const { data, error } = await sb
      .from('reminders')
      .insert({
        target_type: input.targetType,
        target_id: input.targetId,
        title: input.title,
        description: input.description,
        assigned_to: input.assignedTo,
        due_at: input.dueAt,
        status: input.status ?? 'PENDING',
        created_by: user?.id ?? undefined,
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id,
      targetType: data.target_type,
      targetId: data.target_id,
      title: data.title,
      description: data.description ?? undefined,
      assignedTo: data.assigned_to ?? undefined,
      dueAt: data.due_at,
      status: data.status,
      createdBy: data.created_by ?? undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async update(id: string, input: UpdateReminderInput): Promise<Reminder> {
    const sb = ensureSupabase();
    const { data, error } = await sb
      .from('reminders')
      .update({
        target_type: input.targetType,
        target_id: input.targetId,
        title: input.title,
        description: input.description,
        assigned_to: input.assignedTo,
        due_at: input.dueAt,
        status: input.status,
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id,
      targetType: data.target_type,
      targetId: data.target_id,
      title: data.title,
      description: data.description ?? undefined,
      assignedTo: data.assigned_to ?? undefined,
      dueAt: data.due_at,
      status: data.status,
      createdBy: data.created_by ?? undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async remove(id: string): Promise<void> {
    const sb = ensureSupabase();
    const { error } = await sb.from('reminders').delete().eq('id', id);
    if (error) {
      throw new Error(error.message);
    }
  },
};

