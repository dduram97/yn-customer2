-- Home featured flag for customer_news (safe for existing rows).
-- Run in Supabase SQL Editor after customer-news.sql.

alter table public.customer_news
  add column if not exists show_on_home boolean not null default false;

create index if not exists customer_news_home_featured_idx
  on public.customer_news (show_on_home, is_active)
  where show_on_home = true;
