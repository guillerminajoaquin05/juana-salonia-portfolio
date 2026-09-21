-- Juana Salonia site — Supabase schema + seed
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.

-- ---------- tables ----------
create table if not exists public.works (
  id uuid primary key default gen_random_uuid(),
  position int not null default 0,
  title text not null,
  categories text[] not null default '{}',
  meta text default '',
  summary text default '',
  year_place text default '',
  role text default '',
  drive_url text default '',
  context text default '',
  role_text text default '',
  highlights text default '',
  logo_url text default '',
  cover_url text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  position int not null default 0,
  title text not null,
  text text default '',
  details text[] not null default '{}',
  category text default '',        -- Work filter this service links to
  image_url text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.lately_items (
  id uuid primary key default gen_random_uuid(),
  position int not null default 0,
  text text not null,
  status text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value text default ''
);

-- ---------- row level security ----------
-- Everyone can READ (the public site). Only a logged-in user can WRITE.
-- Public sign-ups must be DISABLED (Authentication -> Providers -> Email ->
-- turn off "Allow new users to sign up"), so the only logged-in user is Juana.
alter table public.works         enable row level security;
alter table public.services      enable row level security;
alter table public.lately_items  enable row level security;
alter table public.site_settings enable row level security;

do $$
declare t text;
begin
  foreach t in array array['works','services','lately_items','site_settings'] loop
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('drop policy if exists "auth write" on public.%I', t);
    execute format('create policy "public read" on public.%I for select using (true)', t);
    execute format('create policy "auth write" on public.%I for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;

-- ---------- storage (photos/logos uploaded from the admin) ----------
insert into storage.buckets (id, name, public) values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "media public read" on storage.objects;
drop policy if exists "media auth insert" on storage.objects;
drop policy if exists "media auth update" on storage.objects;
drop policy if exists "media auth delete" on storage.objects;
create policy "media public read" on storage.objects for select using (bucket_id = 'media');
create policy "media auth insert" on storage.objects for insert to authenticated with check (bucket_id = 'media');
create policy "media auth update" on storage.objects for update to authenticated using (bucket_id = 'media');
create policy "media auth delete" on storage.objects for delete to authenticated using (bucket_id = 'media');

-- ---------- seed (current site content) ----------
insert into public.works (position, title, categories, meta, logo_url) values
 (1, 'EuroShop Düsseldorf', '{Events}', 'Events · International Experience', 'Logos/Blue%20Hive%20Exhibits/bh-logo-tag-digital-horizontal-rgb-lg.png'),
 (2, 'Event Marketer''s Toolbox', '{Podcast}', 'Podcast Production · USA · 2025–Present', 'Logos/Obsidian%20CIO/Obsidian-RGB_Horizontal%20-%20Obsidian.png'),
 (3, 'The Expo Factor', '{Podcast,Content}', 'Podcast & Content Production', 'Logos/The%20Expo%20Stars/LOGOFINAL2-transparent.png'),
 (4, 'Building a Podcast From Scratch — UCA', '{Speaking,Podcast}', 'Speaking · Teaching · Buenos Aires', 'Logos/Hamlin%20Creative/HAMLIN-transparent.png'),
 (5, 'Iara Snei — Bali', '{Travel,Content}', 'Travel · Content · Production', 'Logos/Iara%20Snei/logo%20is.png'),
 (6, 'Sale con Fritas', '{Podcast}', 'Podcast Launch & Production', 'Logos/Vision%20To%20Vibe/VisionToVibe-icon-transparent.png')
on conflict do nothing;

insert into public.services (position, title, text, details, category) values
 (1, 'Podcast Production & Strategy', 'From concept to episode delivery — everything a podcast needs to actually ship.',
    '{"Concept development & pre-production","Guest coordination","Recording, publishing & distribution","Show notes & content repurposing"}', 'Podcast'),
 (2, 'LinkedIn & Content Strategy', 'Building a presence that actually sounds like you, and a content system you can keep up with.',
    '{"Personal branding & content strategy","Copywriting","Carousels & newsletters","Profile optimization"}', 'Content'),
 (3, 'Projects, Events & Experiences', 'End-to-end production for the projects and experiences that need someone to just make it happen.',
    '{"Production & coordination","Communication & logistics","Content & on-site support"}', 'Events')
on conflict do nothing;

insert into public.lately_items (position, text, status) values
 (1, 'Producing a new podcast', 'In progress'),
 (2, 'Finishing my degree in Digital & Interactive Communication', 'In progress'),
 (3, 'Preparing another creative travel experience', 'Coming up'),
 (4, 'Gave my first university masterclass', 'Done'),
 (5, 'Worked at EuroShop in Düsseldorf', 'Done')
on conflict do nothing;

insert into public.site_settings (key, value) values
 ('home_about', 'Juana works across digital communication, content, podcasts and events. She''s less a "content creator" and more a *producer, coordinator and strategist* — the person who makes sure ideas actually happen.'),
 ('about_p1', '[PENDING: full story — how Juana got into digital communication, content, podcasts and events, and what drives her work.]'),
 ('about_p2', 'She''s less a "content creator" and more a *producer, coordinator and strategist* — the person who makes sure ideas actually happen, from a podcast concept to an international trade fair.'),
 ('about_p3', '[PENDING: international experience — countries, industries, notable collaborations.]'),
 ('about_pd', 'P.D. — born in Mendoza, based in Buenos Aires, Argentina. Speaks Spanish & English.'),
 ('degree', 'Upcoming B.A. in Digital and Interactive Communication'),
 ('school', 'Pontificia Universidad Católica Argentina (UCA)'),
 ('about_photos', '["Fotos/web/portrait-1.jpg","Fotos/web/balloons-1.jpg","Fotos/web/portrait-2.jpg","Fotos/web/fan.jpg","Fotos/web/railway.jpg","Fotos/web/elephant.jpg","Fotos/web/balloons-2.jpg","Fotos/web/balloons-3.jpg"]'),
 ('email', 'saloniajuana@gmail.com'),
 ('linkedin', 'https://www.linkedin.com/in/juanasalonia/')
on conflict (key) do nothing;
