-- LinkedIn coaching is personalised (no portfolio to show): its button goes to Contact.
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
update public.services set category = 'Contact' where title = 'LinkedIn Profile Coaching';
