-- Photo gallery per project (a JSON list of image URLs, in display order).
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run. Safe to run again.
alter table public.works add column if not exists gallery text default '[]';
