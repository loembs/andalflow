-- Reset complet et idempotent des politiques RLS pour la messagerie
-- À exécuter dans Supabase SQL Editor si les messages retournent 403

-- ─── Supprimer TOUTES les politiques existantes sur les 3 tables ─────────────
do $$
declare
  pol record;
begin
  for pol in
    select schemaname, tablename, policyname
    from pg_policies
    where tablename in ('conversations', 'conversation_participants', 'messages')
      and schemaname = 'public'
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      pol.policyname, pol.schemaname, pol.tablename
    );
  end loop;
end $$;

-- ─── S'assurer que RLS est activé ────────────────────────────────────────────
alter table public.conversations             enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages                  enable row level security;

-- ─── CONVERSATIONS : politiques simples et permissives ───────────────────────
create policy "conv_select"
on public.conversations for select
using (auth.uid() is not null);

create policy "conv_insert"
on public.conversations for insert
with check (auth.uid() is not null);

create policy "conv_update"
on public.conversations for update
using (auth.uid() is not null);

create policy "conv_delete"
on public.conversations for delete
using (auth.uid() is not null);

-- ─── CONVERSATION_PARTICIPANTS ────────────────────────────────────────────────
create policy "cp_select"
on public.conversation_participants for select
using (auth.uid() is not null);

create policy "cp_insert"
on public.conversation_participants for insert
with check (auth.uid() is not null);

create policy "cp_delete"
on public.conversation_participants for delete
using (auth.uid() is not null);

-- ─── MESSAGES ────────────────────────────────────────────────────────────────
create policy "msg_select"
on public.messages for select
using (auth.uid() is not null);

create policy "msg_insert"
on public.messages for insert
with check (auth.uid() is not null);

create policy "msg_delete"
on public.messages for delete
using (auth.uid() is not null);

-- ─── Realtime (idempotent) ────────────────────────────────────────────────────
do $$
begin
  begin
    alter publication supabase_realtime add table public.messages;
  exception when others then null;
  end;
  begin
    alter publication supabase_realtime add table public.conversations;
  exception when others then null;
  end;
end $$;
