begin;

do $$
begin
  create type public.project_type as enum ('web', 'mobile', 'desktop', 'api', 'other');
exception
  when duplicate_object then null;
end $$;

alter table public.projects
  add column if not exists project_type public.project_type not null default 'web',
  add column if not exists demo_video_path text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'projects_demo_video_path_format_check'
      and conrelid = 'public.projects'::regclass
  ) then
    alter table public.projects
      add constraint projects_demo_video_path_format_check
      check (
        demo_video_path is null
        or demo_video_path ~ '^projects/[0-9a-fA-F-]{36}/.+$'
      );
  end if;
end $$;

create index if not exists idx_projects_type_status_date
  on public.projects (project_type, status, project_date desc, created_at desc)
  where deleted_at is null;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'admin-private',
  'admin-private',
  false,
  104857600,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = greatest(storage.buckets.file_size_limit, excluded.file_size_limit),
    allowed_mime_types = (
      select array(
        select distinct mime
        from unnest(coalesce(storage.buckets.allowed_mime_types, array[]::text[]) || excluded.allowed_mime_types) as mime
      )
    );

drop policy if exists storage_admin_insert on storage.objects;
create policy storage_admin_insert
on storage.objects for insert to authenticated
with check (
  bucket_id = 'admin-private'
  and public.is_admin()
  and (storage.foldername(name))[1] in ('documents', 'projects', 'avatars')
  and (storage.foldername(name))[2] = auth.uid()::text
  and (
    ((storage.foldername(name))[1] = 'documents' and lower(storage.extension(name)) = 'pdf')
    or
    ((storage.foldername(name))[1] = 'avatars' and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp'))
    or
    ((storage.foldername(name))[1] = 'projects' and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp', 'mp4', 'webm', 'mov'))
  )
);

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
      where (p.image_path = name or p.demo_video_path = name)
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
