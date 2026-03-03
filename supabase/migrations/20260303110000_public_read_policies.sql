begin;

-- Public read access only for published, non-deleted portfolio content.
drop policy if exists projects_public_read on public.projects;
create policy projects_public_read
on public.projects
for select
to anon, authenticated
using (
  status = 'published'
  and deleted_at is null
);

drop policy if exists experiences_public_read on public.experiences;
create policy experiences_public_read
on public.experiences
for select
to anon, authenticated
using (
  status = 'published'
  and deleted_at is null
);

drop policy if exists skills_public_read on public.skills;
create policy skills_public_read
on public.skills
for select
to anon, authenticated
using (
  status = 'published'
  and deleted_at is null
);

drop policy if exists profile_public_read on public.profile;
create policy profile_public_read
on public.profile
for select
to anon, authenticated
using (
  status = 'published'
  and deleted_at is null
);

-- Public read for only media referenced by published content.
drop policy if exists storage_public_portfolio_select on storage.objects;
create policy storage_public_portfolio_select
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'admin-private'
  and (
    exists (
      select 1
      from public.projects p
      where p.image_path = name
        and p.status = 'published'
        and p.deleted_at is null
    )
    or exists (
      select 1
      from public.profile pr
      where pr.avatar_path = name
        and pr.status = 'published'
        and pr.deleted_at is null
    )
  )
);

commit;

