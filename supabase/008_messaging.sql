-- Messagerie temps réel pour Andal Flow
-- Tables : conversations, conversation_participants, messages
-- Idempotent : peut être ré-exécuté sans erreur

-- ─── 1) Conversations ────────────────────────────────────────────────────────
create table if not exists public.conversations (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  type       text not null default 'direct' check (type in ('direct', 'channel')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── 2) Participants ─────────────────────────────────────────────────────────
create table if not exists public.conversation_participants (
  conversation_id uuid references public.conversations(id) on delete cascade,
  user_id         uuid references public.profiles(id) on delete cascade,
  joined_at       timestamptz default now(),
  primary key (conversation_id, user_id)
);

-- ─── 3) Messages ─────────────────────────────────────────────────────────────
create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id       uuid references public.profiles(id) on delete set null,
  content         text not null,
  created_at      timestamptz default now()
);

create index if not exists idx_messages_conversation on public.messages(conversation_id, created_at);

-- ─── Fonction utilitaire (SECURITY DEFINER pour éviter la récursion RLS) ─────
create or replace function public.is_conversation_participant(conv_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.conversation_participants
    where conversation_id = conv_id
      and user_id = auth.uid()
  );
$$;

-- ─── RLS ─────────────────────────────────────────────────────────────────────
alter table public.conversations             enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages                  enable row level security;

-- CONVERSATIONS
drop policy if exists "conversations read participant"    on public.conversations;
drop policy if exists "conversations insert authenticated" on public.conversations;
drop policy if exists "conversations update creator"      on public.conversations;

create policy "conversations read participant"
on public.conversations for select using (
  public.is_conversation_participant(id)
);

create policy "conversations insert authenticated"
on public.conversations for insert with check (auth.uid() is not null);

create policy "conversations update creator"
on public.conversations for update using (
  created_by = auth.uid()
  or public.current_app_role() in ('ADMIN', 'ADMIN_ASSISTANT')
);

-- CONVERSATION_PARTICIPANTS
-- Note : pas de self-join ici pour éviter la récursion infinie
-- Tous les membres connectés peuvent voir les participants (app interne)
drop policy if exists "participants read authenticated"   on public.conversation_participants;
drop policy if exists "participants insert authenticated" on public.conversation_participants;
drop policy if exists "participants delete own"           on public.conversation_participants;
-- Suppression des anciennes politiques si elles existent
drop policy if exists "participants read own"             on public.conversation_participants;

create policy "participants read authenticated"
on public.conversation_participants for select using (auth.uid() is not null);

create policy "participants insert authenticated"
on public.conversation_participants for insert with check (auth.uid() is not null);

create policy "participants delete own"
on public.conversation_participants for delete using (user_id = auth.uid());

-- MESSAGES
drop policy if exists "messages read participant"   on public.messages;
drop policy if exists "messages insert participant" on public.messages;
drop policy if exists "messages delete own"         on public.messages;

create policy "messages read participant"
on public.messages for select using (
  public.is_conversation_participant(conversation_id)
);

create policy "messages insert participant"
on public.messages for insert with check (
  sender_id = auth.uid()
  and public.is_conversation_participant(conversation_id)
);

create policy "messages delete own"
on public.messages for delete using (sender_id = auth.uid());

-- ─── Realtime (idempotent via DO block) ──────────────────────────────────────
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
