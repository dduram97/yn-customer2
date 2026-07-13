-- Customer news (소식) for yn-customer notice / home.
-- Run in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.customer_news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null default '',
  image_url text,
  media_url text,
  media_type text check (
    media_type is null or media_type in ('image', 'gif', 'video')
  ),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customer_news_active_created_idx
  on public.customer_news (is_active, created_at desc);

create index if not exists customer_news_created_at_idx
  on public.customer_news (created_at desc);

alter table public.customer_news enable row level security;

grant select on table public.customer_news to anon, authenticated;
grant all on table public.customer_news to service_role;

-- Public can read active news only
drop policy if exists "customer_news_public_read_active" on public.customer_news;
create policy "customer_news_public_read_active"
  on public.customer_news
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "customer_news_service_all" on public.customer_news;
create policy "customer_news_service_all"
  on public.customer_news
  for all
  to service_role
  using (true)
  with check (true);

create or replace function public.set_customer_news_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists customer_news_set_updated_at on public.customer_news;
create trigger customer_news_set_updated_at
  before update on public.customer_news
  for each row
  execute function public.set_customer_news_updated_at();
