-- Work list: every hover logo in the site's burgundy (#66253D).
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
update public.works set logo_url = 'Logos/work/hamlin.png'        where title like 'Building a Podcast From Scratch%';
update public.works set logo_url = 'Logos/work/expostars.png'     where title = 'The Expo Factor';
update public.works set logo_url = 'Logos/work/obsidian.png'      where title like 'Event Marketer%';
update public.works set logo_url = 'Logos/work/bluehive.png'      where title like 'EuroShop%';
update public.works set logo_url = 'Logos/work/iarasnei.png'      where title ilike 'Iara Snei%';
update public.works set logo_url = 'Logos/work/saleconfritas.png' where title = 'Sale con Fritas';
