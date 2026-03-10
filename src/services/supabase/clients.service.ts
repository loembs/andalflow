import { supabase } from '@/lib/supabaseClient';
import type { Client } from '@/types';

export interface CreateClientInput {
  name: string;
  company?: string;
  contactEmail?: string;
  phone?: string;
  notes?: string;
}

export interface UpdateClientInput extends Partial<CreateClientInput> {}

const ensureSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase n’est pas configuré. Vérifiez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.');
  }
  return supabase;
};

export const clientService = {
  async list(): Promise<Client[]> {
    const sb = ensureSupabase();
    const { data, error } = await sb
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      company: row.company ?? undefined,
      contactEmail: row.contact_email ?? undefined,
      phone: row.phone ?? undefined,
      notes: row.notes ?? undefined,
      createdBy: row.created_by ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  async create(input: CreateClientInput): Promise<Client> {
    const sb = ensureSupabase();
    const { data: { user } } = await sb.auth.getUser();
    const { data, error } = await sb
      .from('clients')
      .insert({
        name: input.name,
        company: input.company,
        contact_email: input.contactEmail,
        phone: input.phone,
        notes: input.notes,
        created_by: user?.id ?? undefined,
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id,
      name: data.name,
      company: data.company ?? undefined,
      contactEmail: data.contact_email ?? undefined,
      phone: data.phone ?? undefined,
      notes: data.notes ?? undefined,
      createdBy: data.created_by ?? undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async update(id: string, input: UpdateClientInput): Promise<Client> {
    const sb = ensureSupabase();
    const { data, error } = await sb
      .from('clients')
      .update({
        name: input.name,
        company: input.company,
        contact_email: input.contactEmail,
        phone: input.phone,
        notes: input.notes,
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id,
      name: data.name,
      company: data.company ?? undefined,
      contactEmail: data.contact_email ?? undefined,
      phone: data.phone ?? undefined,
      notes: data.notes ?? undefined,
      createdBy: data.created_by ?? undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async remove(id: string): Promise<void> {
    const sb = ensureSupabase();
    const { error } = await sb.from('clients').delete().eq('id', id);
    if (error) {
      throw new Error(error.message);
    }
  },
};

