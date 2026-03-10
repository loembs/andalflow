import { supabase } from '@/lib/supabaseClient';
import type { Invoice, InvoiceStatus } from '@/types';

export interface CreateInvoiceInput {
  clientId: string;
  projectId?: string;
  number: string;
  status?: InvoiceStatus;
  issueDate?: string | Date;
  dueDate?: string | Date;
  totalHt: number;
  totalTtc: number;
  currency?: string;
  templateName?: string;
}

export interface UpdateInvoiceInput extends Partial<CreateInvoiceInput> {}

const ensureSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase n’est pas configuré. Vérifiez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.');
  }
  return supabase;
};

export const invoiceService = {
  async list(): Promise<Invoice[]> {
    const sb = ensureSupabase();
    const { data, error } = await sb
      .from('invoices')
      .select('*')
      .order('issue_date', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      clientId: row.client_id,
      projectId: row.project_id ?? undefined,
      number: row.number,
      status: row.status,
      issueDate: row.issue_date,
      dueDate: row.due_date ?? undefined,
      totalHt: Number(row.total_ht ?? 0),
      totalTtc: Number(row.total_ttc ?? 0),
      currency: row.currency ?? 'EUR',
      templateName: row.template_name ?? undefined,
      createdBy: row.created_by ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  async create(input: CreateInvoiceInput): Promise<Invoice> {
    const sb = ensureSupabase();
    const { data: { user } } = await sb.auth.getUser();
    const { data, error } = await sb
      .from('invoices')
      .insert({
        client_id: input.clientId,
        project_id: input.projectId,
        number: input.number,
        status: input.status ?? 'DRAFT',
        issue_date: input.issueDate ?? new Date().toISOString(),
        due_date: input.dueDate,
        total_ht: input.totalHt,
        total_ttc: input.totalTtc,
        currency: input.currency ?? 'EUR',
        template_name: input.templateName,
        created_by: user?.id ?? undefined,
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id,
      clientId: data.client_id,
      projectId: data.project_id ?? undefined,
      number: data.number,
      status: data.status,
      issueDate: data.issue_date,
      dueDate: data.due_date ?? undefined,
      totalHt: Number(data.total_ht ?? 0),
      totalTtc: Number(data.total_ttc ?? 0),
      currency: data.currency ?? 'EUR',
      templateName: data.template_name ?? undefined,
      createdBy: data.created_by ?? undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async update(id: string, input: UpdateInvoiceInput): Promise<Invoice> {
    const sb = ensureSupabase();
    const { data, error } = await sb
      .from('invoices')
      .update({
        client_id: input.clientId,
        project_id: input.projectId,
        number: input.number,
        status: input.status,
        issue_date: input.issueDate,
        due_date: input.dueDate,
        total_ht: input.totalHt,
        total_ttc: input.totalTtc,
        currency: input.currency,
        template_name: input.templateName,
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id,
      clientId: data.client_id,
      projectId: data.project_id ?? undefined,
      number: data.number,
      status: data.status,
      issueDate: data.issue_date,
      dueDate: data.due_date ?? undefined,
      totalHt: Number(data.total_ht ?? 0),
      totalTtc: Number(data.total_ttc ?? 0),
      currency: data.currency ?? 'EUR',
      templateName: data.template_name ?? undefined,
      createdBy: data.created_by ?? undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async remove(id: string): Promise<void> {
    const sb = ensureSupabase();
    const { error } = await sb.from('invoices').delete().eq('id', id);
    if (error) {
      throw new Error(error.message);
    }
  },
};

