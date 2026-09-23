-- Optional "View site / View podcast / See more" button on each project.
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run. Safe to run again.
alter table public.works add column if not exists link_url text default '';
alter table public.works add column if not exists link_label text default 'more';
