-- Footer logos ("Worked & collaborated with"), editable from the admin panel.
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run. Safe to run again.

create table if not exists public.collaborators (
  id uuid primary key default gen_random_uuid(),
  position int not null default 0,
  name text not null default '',
  logo_url text default '',
  link_url text default '',
  size text default '1',
  created_at timestamptz not null default now()
);

alter table public.collaborators enable row level security;
drop policy if exists "public read" on public.collaborators;
drop policy if exists "admin write" on public.collaborators;
create policy "public read" on public.collaborators for select using (true);
create policy "admin write" on public.collaborators for all to authenticated
  using (lower(auth.jwt() ->> 'email') = 'saloniajuana@gmail.com')
  with check (lower(auth.jwt() ->> 'email') = 'saloniajuana@gmail.com');

-- seed: the logos that are in the footer today (only if the table is empty)
insert into public.collaborators (position, name, logo_url)
select * from (values
  (1,  'Blue Hive Exhibits',                   'Logos/footer/mono/bluehive.png'),
  (2,  'Hamlin Creative',                      'Logos/footer/mono/hamlin.png'),
  (3,  'Hotel San Martín & Spa',               'Logos/footer/mono/sanmartin-text.png'),
  (4,  'Iara Snei',                            'Logos/footer/mono/iarasnei.png'),
  (5,  'Blackbox AI',                          'Logos/footer/mono/blackbox.svg'),
  (6,  'Obsidian CIO',                         'Logos/footer/mono/obsidian.png'),
  (7,  'The Expo Stars',                       'Logos/footer/mono/expostars.png'),
  (8,  'Vision To Vibe',                       'Logos/footer/mono/visiontovibe.png'),
  (9,  'Universidad Católica Argentina (UCA)', 'Logos/footer/mono/uca.png'),
  (10, 'Fist Bump',                            'Logos/footer/mono/fistbump.png'),
  (11, 'Sale con Fritas',                      'Logos/footer/mono/saleconfritas.png')
) as v(position, name, logo_url)
where not exists (select 1 from public.collaborators);
