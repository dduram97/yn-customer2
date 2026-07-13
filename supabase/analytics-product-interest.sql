-- Apply on existing projects that already ran analytics.sql
-- Enables product_interest events for "인기 수산물 관심도".

alter table public.analytics_visits
  drop constraint if exists analytics_visits_event_type_check;

alter table public.analytics_visits
  add constraint analytics_visits_event_type_check
  check (event_type in (
    'page_view',
    'menu_click',
    'category_click',
    'section_view',
    'product_interest'
  ));

alter table public.analytics_visits
  add column if not exists seafood text;

create index if not exists analytics_visits_seafood_interest_idx
  on public.analytics_visits (category_label, created_at desc)
  where event_type = 'product_interest';
