-- Iara Snei: trimmed logo (the old file had empty space below it, so it sat too high)
-- and the same logo on all three Iara Snei projects.
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
update public.works set logo_url = 'Logos/iarasnei.png' where title ilike 'Iara Snei%';
