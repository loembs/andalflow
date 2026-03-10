-- Trigger : créer automatiquement un profil dès qu'un utilisateur s'inscrit
-- Idempotent : peut être ré-exécuté sans erreur

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    'DEVELOPER'  -- rôle par défaut ; à changer via 003_seed_profiles.sql pour les admins
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Supprimer l'ancien trigger s'il existe, puis le recréer
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();
