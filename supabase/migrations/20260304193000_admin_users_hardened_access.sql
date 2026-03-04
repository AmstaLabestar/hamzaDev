begin;

alter table public.admin_users enable row level security;

drop policy if exists admin_users_self_active_select on public.admin_users;
create policy admin_users_self_active_select
on public.admin_users
for select
to authenticated
using (
  user_id = auth.uid()
  and is_active = true
  and deleted_at is null
  and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

commit;
