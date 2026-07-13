-- Analytics tables for visitor + search stats.
-- Run in Supabase SQL Editor (service_role inserts from Next.js API).

create extension if not exists pgcrypto;

create table if not exists public.analytics_visits (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  event_type text not null
    check (event_type in (
      'page_view',
      'menu_click',
      'category_click',
      'section_view',
      'product_interest'
    )),
  page text not null,
  referrer text,
  menu_label text,
  category_label text,
  category_type text,
  seafood text,
  created_at timestamptz not null default now()
);

create index if not exists analytics_visits_created_at_idx
  on public.analytics_visits (created_at desc);

create index if not exists analytics_visits_session_created_idx
  on public.analytics_visits (session_id, created_at);

create index if not exists analytics_visits_event_created_idx
  on public.analytics_visits (event_type, created_at desc);

create index if not exists analytics_visits_page_created_idx
  on public.analytics_visits (page, created_at desc)
  where event_type = 'page_view';

create index if not exists analytics_visits_seafood_interest_idx
  on public.analytics_visits (category_label, created_at desc)
  where event_type = 'product_interest';

create table if not exists public.analytics_searches (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  query text not null,
  has_results boolean not null default false,
  clicked boolean not null default false,
  clicked_target text,
  clicked_href text,
  clicked_category text,
  clicked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists analytics_searches_created_at_idx
  on public.analytics_searches (created_at desc);

create index if not exists analytics_searches_query_created_idx
  on public.analytics_searches (lower(query), created_at desc);

create index if not exists analytics_searches_session_query_idx
  on public.analytics_searches (session_id, query, created_at desc);

alter table public.analytics_visits enable row level security;
alter table public.analytics_searches enable row level security;

grant all on table public.analytics_visits to service_role;
grant all on table public.analytics_searches to service_role;

-- No anon access; only service_role via Next.js API.
drop policy if exists "analytics_visits_service_all" on public.analytics_visits;
create policy "analytics_visits_service_all"
  on public.analytics_visits
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "analytics_searches_service_all" on public.analytics_searches;
create policy "analytics_searches_service_all"
  on public.analytics_searches
  for all
  to service_role
  using (true)
  with check (true);

-- First page_view timestamp per session (for new vs returning).
create or replace function public.analytics_session_first_seen()
returns table (session_id text, first_seen timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select v.session_id, min(v.created_at) as first_seen
  from public.analytics_visits v
  where v.event_type = 'page_view'
  group by v.session_id;
$$;

revoke all on function public.analytics_session_first_seen() from public;
grant execute on function public.analytics_session_first_seen() to service_role;
