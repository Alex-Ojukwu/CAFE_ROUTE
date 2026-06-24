-- ============================================================
-- CafeRoute · Phase 1 · 0002 auth trigger
-- Auto-create a profile whenever a new auth user signs up.
-- ============================================================

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  requested_role user_role;
begin
  -- Read the requested role from signup metadata, defaulting to customer.
  requested_role := coalesce((new.raw_user_meta_data->>'role')::user_role, 'customer');

  -- Security: the owner role must NEVER be self-assigned at signup.
  -- Owners are created/promoted manually (see seed.sql). Coerce any
  -- 'owner' coming from metadata down to 'customer'.
  if requested_role = 'owner' then
    requested_role := 'customer';
  end if;

  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    requested_role
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
