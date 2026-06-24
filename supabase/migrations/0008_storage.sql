-- ============================================================
-- CafeRoute · Phase 5 · menu-images storage bucket
-- Public read (so customer cards can show photos), owner-only write.
-- Run once in the Supabase SQL editor.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do nothing;

-- Public read is served by the public bucket, but an explicit select policy
-- keeps things clear and works for signed reads too.
create policy "menu-images: public read"
on storage.objects for select
using (bucket_id = 'menu-images');

create policy "menu-images: owner upload"
on storage.objects for insert
with check (bucket_id = 'menu-images' and public.current_role_is('owner'));

create policy "menu-images: owner update"
on storage.objects for update
using (bucket_id = 'menu-images' and public.current_role_is('owner'));

create policy "menu-images: owner delete"
on storage.objects for delete
using (bucket_id = 'menu-images' and public.current_role_is('owner'));
