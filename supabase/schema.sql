-- Run this in the Supabase SQL Editor before first deploy / migration.

create table if not exists public.site_content (
  id text primary key default 'main',
  content jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

-- Table-level grants (required; without these you get "permission denied for table site_content")
grant usage on schema public to anon, authenticated, service_role;
grant select on table public.site_content to anon, authenticated;
grant all on table public.site_content to service_role;

-- Public read for customer pages
drop policy if exists "site_content_public_read" on public.site_content;
create policy "site_content_public_read"
  on public.site_content
  for select
  to anon, authenticated
  using (true);

-- Service role full access (backup; service_role normally bypasses RLS)
drop policy if exists "site_content_service_all" on public.site_content;
create policy "site_content_service_all"
  on public.site_content
  for all
  to service_role
  using (true)
  with check (true);

-- Storage bucket for admin uploads (images, GIF, video).
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "uploads_public_read" on storage.objects;
create policy "uploads_public_read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'uploads');

drop policy if exists "uploads_service_write" on storage.objects;
create policy "uploads_service_write"
  on storage.objects
  for insert
  to service_role
  with check (bucket_id = 'uploads');

drop policy if exists "uploads_service_update" on storage.objects;
create policy "uploads_service_update"
  on storage.objects
  for update
  to service_role
  using (bucket_id = 'uploads');

drop policy if exists "uploads_service_delete" on storage.objects;
create policy "uploads_service_delete"
  on storage.objects
  for delete
  to service_role
  using (bucket_id = 'uploads');
