-- Smoke tests for RLS and storage access rules.
-- Run in Supabase SQL Editor after schema + policy deployment.

begin;
set local role authenticated;

do $$
declare
  v_admin_id uuid;
  v_non_admin_id uuid;
  v_count bigint;
begin
  select au.user_id
  into v_admin_id
  from public.admin_users au
  where au.is_active = true
    and au.deleted_at is null
  limit 1;

  if v_admin_id is null then
    raise exception 'No active admin found in public.admin_users';
  end if;

  select u.id
  into v_non_admin_id
  from auth.users u
  where not exists (
    select 1
    from public.admin_users au
    where au.user_id = u.id
      and au.is_active = true
      and au.deleted_at is null
  )
  limit 1;

  perform set_config('request.jwt.claim.sub', v_admin_id::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);

  if not public.is_admin() then
    raise exception 'Admin check failed for user %', v_admin_id;
  end if;

  perform 1 from public.projects limit 1;
  perform 1 from public.experiences limit 1;
  perform 1 from public.skills limit 1;
  perform 1 from public.documents limit 1;
  perform 1 from public.admin_logs limit 1;
  perform 1 from storage.objects where bucket_id = 'admin-private' limit 1;

  if v_non_admin_id is null then
    raise notice 'No non-admin user found. Non-admin policy checks skipped.';
    return;
  end if;

  perform set_config('request.jwt.claim.sub', v_non_admin_id::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);

  if public.is_admin() then
    raise exception 'Non-admin user % incorrectly resolved as admin', v_non_admin_id;
  end if;

  select count(*) into v_count from public.projects;
  if v_count <> 0 then
    raise exception 'Non-admin should not see projects, got % row(s)', v_count;
  end if;

  select count(*) into v_count from public.experiences;
  if v_count <> 0 then
    raise exception 'Non-admin should not see experiences, got % row(s)', v_count;
  end if;

  select count(*) into v_count from public.skills;
  if v_count <> 0 then
    raise exception 'Non-admin should not see skills, got % row(s)', v_count;
  end if;

  select count(*) into v_count from public.documents;
  if v_count <> 0 then
    raise exception 'Non-admin should not see documents, got % row(s)', v_count;
  end if;

  select count(*) into v_count from public.admin_logs;
  if v_count <> 0 then
    raise exception 'Non-admin should not see admin logs, got % row(s)', v_count;
  end if;

  select count(*) into v_count
  from storage.objects
  where bucket_id = 'admin-private';

  if v_count <> 0 then
    raise exception 'Non-admin should not see private storage objects, got % row(s)', v_count;
  end if;

  raise notice 'RLS/storage smoke tests passed. admin=% non_admin=%', v_admin_id, v_non_admin_id;
end $$;

rollback;

