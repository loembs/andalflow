-- Correction des politiques RLS pour la création de projets et l'ajout de membres
-- Idempotent : peut être ré-exécuté sans erreur

-- ─── PROJECTS : autoriser tout utilisateur connecté à créer un projet ─────────
-- (la politique "projects admin manage" couvre déjà les admin pour toutes les opérations)
-- Sans cette politique, seuls les admins pouvaient insérer, bloquant les autres rôles.
drop policy if exists "projects create authenticated" on public.projects;

create policy "projects create authenticated"
on public.projects
for insert with check (auth.uid() is not null);

-- ─── PROJECT_MEMBERS : autoriser le propriétaire d'un projet à ajouter des membres ─
-- Sans cette politique, les insertions de membres partaient sans erreur visible
-- mais étaient rejetées silencieusement par Supabase.
drop policy if exists "project_members insert by owner or admin" on public.project_members;

create policy "project_members insert by owner or admin"
on public.project_members
for insert with check (
  -- L'utilisateur courant est admin
  public.current_app_role() in ('ADMIN', 'ADMIN_ASSISTANT')
  -- OU l'utilisateur courant est propriétaire du projet
  or exists (
    select 1
    from public.projects
    where id = project_id
      and owner_id = auth.uid()
  )
  -- OU l'utilisateur s'ajoute lui-même
  or user_id = auth.uid()
);
