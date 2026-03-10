import { supabase } from '@/lib/supabaseClient';
import type { ClientFeedback, FeedbackStatus } from '@/types';

export interface CreateFeedbackInput {
  clientId?: string;
  projectId?: string;
  message: string;
  channel?: string;
  status?: FeedbackStatus;
  sentiment?: string;
}

export interface UpdateFeedbackInput extends Partial<CreateFeedbackInput> {}

const ensureSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase n’est pas configuré. Vérifiez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.');
  }
  return supabase;
};

export const feedbackService = {
  async list(): Promise<ClientFeedback[]> {
    const sb = ensureSupabase();
    const { data, error } = await sb
      .from('client_feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      clientId: row.client_id ?? undefined,
      projectId: row.project_id ?? undefined,
      authorId: row.author_id ?? undefined,
      channel: row.channel ?? undefined,
      message: row.message,
      status: row.status,
      sentiment: row.sentiment ?? undefined,
      createdAt: row.created_at,
      resolvedAt: row.resolved_at ?? undefined,
    }));
  },

  async create(input: CreateFeedbackInput): Promise<ClientFeedback> {
    const sb = ensureSupabase();
    const { data: { user } } = await sb.auth.getUser();
    const { data, error } = await sb
      .from('client_feedback')
      .insert({
        client_id: input.clientId,
        project_id: input.projectId,
        author_id: user?.id ?? undefined,
        message: input.message,
        channel: input.channel,
        status: input.status ?? 'NEW',
        sentiment: input.sentiment,
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id,
      clientId: data.client_id ?? undefined,
      projectId: data.project_id ?? undefined,
      authorId: data.author_id ?? undefined,
      channel: data.channel ?? undefined,
      message: data.message,
      status: data.status,
      sentiment: data.sentiment ?? undefined,
      createdAt: data.created_at,
      resolvedAt: data.resolved_at ?? undefined,
    };
  },

  async update(id: string, input: UpdateFeedbackInput): Promise<ClientFeedback> {
    const sb = ensureSupabase();
    const { data, error } = await sb
      .from('client_feedback')
      .update({
        client_id: input.clientId,
        project_id: input.projectId,
        message: input.message,
        channel: input.channel,
        status: input.status,
        sentiment: input.sentiment,
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id,
      clientId: data.client_id ?? undefined,
      projectId: data.project_id ?? undefined,
      authorId: data.author_id ?? undefined,
      channel: data.channel ?? undefined,
      message: data.message,
      status: data.status,
      sentiment: data.sentiment ?? undefined,
      createdAt: data.created_at,
      resolvedAt: data.resolved_at ?? undefined,
    };
  },

  async remove(id: string): Promise<void> {
    const sb = ensureSupabase();
    const { error } = await sb.from('client_feedback').delete().eq('id', id);
    if (error) {
      throw new Error(error.message);
    }
  },
};

