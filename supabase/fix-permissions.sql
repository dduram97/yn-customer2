-- Fix "permission denied for table site_content"
-- Run once in Supabase SQL Editor if you already ran an older schema.sql.

grant usage on schema public to anon, authenticated, service_role;
grant select on table public.site_content to anon, authenticated;
grant all on table public.site_content to service_role;

drop policy if exists "site_content_service_all" on public.site_content;
create policy "site_content_service_all"
  on public.site_content
  for all
  to service_role
  using (true)
  with check (true);
