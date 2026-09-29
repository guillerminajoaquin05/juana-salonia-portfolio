-- Security Advisor fixes (2026-09-29).
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run. Safe to run again.
-- If the admin's login email ever changes, update it in the two places below.

-- 1) Only Juana's account can edit content (was: any signed-in user).
do $$
declare t text;
begin
  foreach t in array array['works','services','lately_items','site_settings','testimonials'] loop
    execute format('drop policy if exists "auth write" on public.%I', t);
    execute format('drop policy if exists "admin write" on public.%I', t);
    execute format($p$create policy "admin write" on public.%I for all to authenticated
      using (lower(auth.jwt() ->> 'email') = 'saloniajuana@gmail.com')
      with check (lower(auth.jwt() ->> 'email') = 'saloniajuana@gmail.com')$p$, t);
  end loop;
end $$;

-- 2) Photos: the bucket is public, so files open by URL without a read policy.
--    Dropping it stops anyone from listing every uploaded file. Uploads/edits: Juana only.
drop policy if exists "media public read" on storage.objects;
drop policy if exists "media auth insert" on storage.objects;
drop policy if exists "media auth update" on storage.objects;
drop policy if exists "media auth delete" on storage.objects;
drop policy if exists "media admin insert" on storage.objects;
drop policy if exists "media admin update" on storage.objects;
drop policy if exists "media admin delete" on storage.objects;
create policy "media admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and lower(auth.jwt() ->> 'email') = 'saloniajuana@gmail.com');
create policy "media admin update" on storage.objects for update to authenticated
  using (bucket_id = 'media' and lower(auth.jwt() ->> 'email') = 'saloniajuana@gmail.com');
create policy "media admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and lower(auth.jwt() ->> 'email') = 'saloniajuana@gmail.com');

-- 3) Internal helper function created by Supabase: nobody needs to call it through the API.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
