-- Politique RLS : tous les membres connectés peuvent lire tous les profils
-- Nécessaire pour la page Équipe et la sélection de membres dans les formulaires
-- Idempotent : peut être ré-exécuté sans erreur

drop policy if exists "profiles read all internal" on public.profiles;

create policy "profiles read all internal"
on public.profiles
for select using (auth.uid() is not null);
