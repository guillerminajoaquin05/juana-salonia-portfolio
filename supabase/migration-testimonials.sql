-- Testimonials, editable from the admin panel (Contact page).
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  position int not null default 0,
  quote text not null default '',
  quote_es text default '',
  name text not null default '',
  role text default '',
  role_es text default '',
  created_at timestamptz not null default now()
);

alter table public.testimonials enable row level security;
drop policy if exists "public read" on public.testimonials;
drop policy if exists "auth write" on public.testimonials;
create policy "public read" on public.testimonials for select using (true);
create policy "auth write" on public.testimonials for all to authenticated using (true) with check (true);

-- seed: the three placeholders that are on the site today
insert into public.testimonials (position, quote, name, role) values
 (1, '[PENDING: testimonial from a podcast/events collaborator.]', '[Name, role]', ''),
 (2, '[PENDING: testimonial from a content/LinkedIn collaborator.]', '[Name, role]', ''),
 (3, '[PENDING: testimonial from a production/experiences collaborator.]', '[Name, role]', '')
on conflict do nothing;
