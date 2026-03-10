-- RLS (Row Level Security) pour Andal Flow
-- Idempotent : peut être ré-exécuté sans erreur

-- Activer la RLS
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.client_feedback enable row level security;
alter table public.reminders enable row level security;

-- Fonction utilitaire : rôle applicatif de l'utilisateur connecté
-- SECURITY DEFINER : bypass RLS sur profiles pour éviter la récursion infinie
create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid();
$$;

-- ─── PROFILES ────────────────────────────────────────────────────────────────
drop policy if exists "profiles self read"    on public.profiles;
drop policy if exists "profiles self update"  on public.profiles;
drop policy if exists "profiles admin all"    on public.profiles;

create policy "profiles self read"
on public.profiles
for select using (id = auth.uid());

create policy "profiles self update"
on public.profiles
for update using (id = auth.uid());

create policy "profiles admin all"
on public.profiles
for all using (
  public.current_app_role() in ('ADMIN','ADMIN_ASSISTANT')
);

-- ─── CLIENTS ─────────────────────────────────────────────────────────────────
drop policy if exists "clients read internal" on public.clients;
drop policy if exists "clients admin write"   on public.clients;

create policy "clients read internal"
on public.clients
for select using (auth.uid() is not null);

create policy "clients admin write"
on public.clients
for all using (
  public.current_app_role() in ('ADMIN','ADMIN_ASSISTANT')
);

-- ─── PROJECTS ────────────────────────────────────────────────────────────────
drop policy if exists "projects read by admin or member" on public.projects;
drop policy if exists "projects admin manage"            on public.projects;

create policy "projects read by admin or member"
on public.projects
for select using (
  public.current_app_role() in ('ADMIN','ADMIN_ASSISTANT')
  or exists (
    select 1
    from public.project_members pm
    where pm.project_id = projects.id
      and pm.user_id = auth.uid()
  )
);

create policy "projects admin manage"
on public.projects
for all using (
  public.current_app_role() in ('ADMIN','ADMIN_ASSISTANT')
);

-- ─── PROJECT_MEMBERS ─────────────────────────────────────────────────────────
drop policy if exists "project_members read own"    on public.project_members;
drop policy if exists "project_members admin manage" on public.project_members;

create policy "project_members read own"
on public.project_members
for select using (user_id = auth.uid());

create policy "project_members admin manage"
on public.project_members
for all using (
  public.current_app_role() in ('ADMIN','ADMIN_ASSISTANT')
);

-- ─── INVOICES ────────────────────────────────────────────────────────────────
drop policy if exists "invoices admin manage"           on public.invoices;
drop policy if exists "invoices read by project member" on public.invoices;

create policy "invoices admin manage"
on public.invoices
for all using (
  public.current_app_role() in ('ADMIN','ADMIN_ASSISTANT')
);

create policy "invoices read by project member"
on public.invoices
for select using (
  public.current_app_role() in ('ADMIN','ADMIN_ASSISTANT')
  or exists (
    select 1
    from public.project_members pm
    where pm.project_id = invoices.project_id
      and pm.user_id = auth.uid()
  )
);

-- ─── INVOICE_ITEMS ───────────────────────────────────────────────────────────
drop policy if exists "invoice_items follow invoice" on public.invoice_items;

create policy "invoice_items follow invoice"
on public.invoice_items
for all using (
  exists (
    select 1
    from public.invoices i
    where i.id = invoice_items.invoice_id
      and (
        public.current_app_role() in ('ADMIN','ADMIN_ASSISTANT')
        or exists (
          select 1
          from public.project_members pm
          where pm.project_id = i.project_id
            and pm.user_id = auth.uid()
        )
      )
  )
);

-- ─── CLIENT_FEEDBACK ─────────────────────────────────────────────────────────
drop policy if exists "feedback read for members"       on public.client_feedback;
drop policy if exists "feedback insert internal"        on public.client_feedback;
drop policy if exists "feedback update admin or author" on public.client_feedback;
drop policy if exists "feedback delete admin or author" on public.client_feedback;

create policy "feedback read for members"
on public.client_feedback
for select using (
  public.current_app_role() in ('ADMIN','ADMIN_ASSISTANT')
  or exists (
    select 1
    from public.project_members pm
    where pm.project_id = client_feedback.project_id
      and pm.user_id = auth.uid()
  )
);

create policy "feedback insert internal"
on public.client_feedback
for insert with check (auth.uid() is not null);

create policy "feedback update admin or author"
on public.client_feedback
for update using (
  public.current_app_role() in ('ADMIN','ADMIN_ASSISTANT')
  or author_id = auth.uid()
);

create policy "feedback delete admin or author"
on public.client_feedback
for delete using (
  public.current_app_role() in ('ADMIN','ADMIN_ASSISTANT')
  or author_id = auth.uid()
);

-- ─── REMINDERS ───────────────────────────────────────────────────────────────
drop policy if exists "reminders assigned or admin" on public.reminders;
drop policy if exists "reminders admin manage"      on public.reminders;

create policy "reminders assigned or admin"
on public.reminders
for select using (
  public.current_app_role() in ('ADMIN','ADMIN_ASSISTANT')
  or assigned_to = auth.uid()
);

create policy "reminders admin manage"
on public.reminders
for all using (
  public.current_app_role() in ('ADMIN','ADMIN_ASSISTANT')
);
