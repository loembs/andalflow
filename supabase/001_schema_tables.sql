-- Schéma principal Supabase pour Andal Flow
-- Idempotent : peut être ré-exécuté sans erreur

-- 1) Profils utilisateurs (mappés sur auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null check (
    role in (
      'ADMIN',
      'ADMIN_ASSISTANT',
      'MANAGER',
      'DEVELOPER',
      'DESIGNER',
      'COMMUNITY_MANAGER',
      'CONTENT_MANAGER'
    )
  ),
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_profiles_role on public.profiles(role);

-- 2) Clients
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  contact_email text,
  phone text,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3) Projets (types enum créés de façon idempotente)
do $$ begin
  create type project_status as enum ('DRAFT','ACTIVE','COMPLETED','ARCHIVED');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type project_priority as enum ('LOW','MEDIUM','HIGH');
exception when duplicate_object then null;
end $$;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id),
  name text not null,
  description text,
  status project_status not null default 'DRAFT',
  priority project_priority not null default 'MEDIUM',
  progress int2 not null default 0 check (progress between 0 and 100),
  owner_id uuid references public.profiles(id),
  start_date date,
  end_date date,
  budget numeric(12,2),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4) Membres de projet
create table if not exists public.project_members (
  project_id uuid references public.projects(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role_on_project text,
  primary key (project_id, user_id)
);

-- 5) Factures
do $$ begin
  create type invoice_status as enum ('DRAFT','SENT','PAID','OVERDUE');
exception when duplicate_object then null;
end $$;

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id),
  project_id uuid references public.projects(id),
  number text not null unique,
  status invoice_status not null default 'DRAFT',
  issue_date date not null default current_date,
  due_date date,
  total_ht numeric(12,2) not null default 0,
  total_ttc numeric(12,2) not null default 0,
  currency text not null default 'EUR',
  template_name text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  label text not null,
  quantity numeric(10,2) not null default 1,
  unit_price numeric(12,2) not null default 0,
  tax_rate numeric(5,2) not null default 0
);

-- 6) Feedback / retours clients
do $$ begin
  create type feedback_status as enum ('NEW','IN_PROGRESS','RESOLVED');
exception when duplicate_object then null;
end $$;

create table if not exists public.client_feedback (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id),
  project_id uuid references public.projects(id),
  author_id uuid references public.profiles(id),
  channel text,
  message text not null,
  status feedback_status not null default 'NEW',
  sentiment text,
  created_at timestamptz default now(),
  resolved_at timestamptz
);

-- 7) Rappels / relances
do $$ begin
  create type reminder_status as enum ('PENDING','DONE','CANCELLED');
exception when duplicate_object then null;
end $$;

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  target_type text not null,
  target_id uuid not null,
  title text not null,
  description text,
  assigned_to uuid references public.profiles(id),
  due_at timestamptz not null,
  status reminder_status not null default 'PENDING',
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
