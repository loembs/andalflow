-- Seed des profils Andal Flow — assigne les bons rôles aux comptes existants
-- Idempotent : peut être ré-exécuté sans erreur
-- À exécuter APRÈS avoir créé les utilisateurs dans Authentication → Users

insert into public.profiles (id, full_name, role)
select id, 'Mourzane Ousmanou', 'ADMIN'
from auth.users where email = 'mourzaneousmanouadmin@andalflow.com'
on conflict (id) do update set full_name = excluded.full_name, role = excluded.role;

insert into public.profiles (id, full_name, role)
select id, 'Yannice Garcia', 'ADMIN_ASSISTANT'
from auth.users where email = 'yannicegarciaadmin@andalflow.com'
on conflict (id) do update set full_name = excluded.full_name, role = excluded.role;

insert into public.profiles (id, full_name, role)
select id, 'Patrick Winner', 'DEVELOPER'
from auth.users where email = 'patrickwinnerdev@andalflow.com'
on conflict (id) do update set full_name = excluded.full_name, role = excluded.role;

insert into public.profiles (id, full_name, role)
select id, 'Maty Com', 'COMMUNITY_MANAGER'
from auth.users where email = 'matycom@andalflow.com'
on conflict (id) do update set full_name = excluded.full_name, role = excluded.role;

insert into public.profiles (id, full_name, role)
select id, 'Sydney Design', 'DESIGNER'
from auth.users where email = 'sydneydesign@andalflow.com'
on conflict (id) do update set full_name = excluded.full_name, role = excluded.role;

insert into public.profiles (id, full_name, role)
select id, 'Mikael Videaste', 'CONTENT_MANAGER'
from auth.users where email = 'mikaelvideaste@andalflow.com'
on conflict (id) do update set full_name = excluded.full_name, role = excluded.role;
