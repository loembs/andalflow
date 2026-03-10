-- RLS feedback update/delete (inclus dans 002 désormais, conservé pour compatibilité)
-- Idempotent : peut être ré-exécuté sans erreur

drop policy if exists "feedback update admin or author" on public.client_feedback;
drop policy if exists "feedback delete admin or author" on public.client_feedback;

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
