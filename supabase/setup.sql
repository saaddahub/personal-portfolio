-- Run in the Supabase SQL Editor. Safe to rerun.
begin;
create table if not exists public.portfolio_content (
  id text primary key check (id = 'main'),
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  updated_at timestamptz not null default now()
);
alter table public.portfolio_content enable row level security;
revoke all on public.portfolio_content from anon, authenticated;
grant select on public.portfolio_content to anon, authenticated;
grant insert, update on public.portfolio_content to authenticated;
drop policy if exists "Public portfolio read" on public.portfolio_content;
create policy "Public portfolio read" on public.portfolio_content for select to anon, authenticated using (true);
drop policy if exists "Admin portfolio insert" on public.portfolio_content;
create policy "Admin portfolio insert" on public.portfolio_content for insert to authenticated
with check ((auth.jwt()->'app_metadata'->>'portfolio_admin') = 'true');
drop policy if exists "Admin portfolio update" on public.portfolio_content;
create policy "Admin portfolio update" on public.portfolio_content for update to authenticated
using ((auth.jwt()->'app_metadata'->>'portfolio_admin') = 'true')
with check ((auth.jwt()->'app_metadata'->>'portfolio_admin') = 'true');
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-images', 'project-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists "Portfolio admin upload" on storage.objects;
create policy "Portfolio admin upload" on storage.objects for insert to authenticated
with check (bucket_id = 'project-images' and (auth.jwt()->'app_metadata'->>'portfolio_admin') = 'true');
commit;
-- After creating your user under Authentication > Users, run separately,
-- replacing the email below with your own. Then sign in again.
-- update auth.users
-- set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"portfolio_admin":true}'::jsonb
-- where email = 'YOUR_EMAIL_HERE';
