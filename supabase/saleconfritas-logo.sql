-- Sale con Fritas: use its own logo (it was showing the Vision To Vibe one).
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
update public.works set logo_url = 'Logos/saleconfritas.png' where title = 'Sale con Fritas';
