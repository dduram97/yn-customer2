-- Customer news media fields (safe for existing customer_news rows).
-- Run in Supabase SQL Editor after customer-news.sql.

alter table public.customer_news
  add column if not exists media_url text;

alter table public.customer_news
  add column if not exists media_type text;

-- Keep legacy image_url; backfill media_url from it when empty.
update public.customer_news
set media_url = image_url
where media_url is null
  and image_url is not null
  and btrim(image_url) <> '';

-- Infer media_type from URL extension when missing.
update public.customer_news
set media_type = case
  when lower(coalesce(media_url, image_url, '')) like '%.gif%' then 'gif'
  when lower(coalesce(media_url, image_url, '')) ~* '\.(mp4|webm|mov|m4v|ogg)(\?|#|$)' then 'video'
  when coalesce(media_url, image_url) is not null
    and btrim(coalesce(media_url, image_url)) <> '' then 'image'
  else null
end
where media_type is null
  or btrim(media_type) = '';

-- Optional integrity: only allow known types (null = no media).
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'customer_news_media_type_check'
  ) then
    alter table public.customer_news
      add constraint customer_news_media_type_check
      check (
        media_type is null
        or media_type in ('image', 'gif', 'video')
      );
  end if;
end $$;
