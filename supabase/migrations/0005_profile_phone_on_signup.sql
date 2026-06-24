-- ============================================================
-- CafeRoute · Phase 2 · 0005 capture phone on signup
-- Updates the signup trigger so the phone collected on the
-- /signup form lands on the profile too. Re-run safe (create or replace).
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
  requested_role := coalesce((new.raw_user_meta_data->>'role')::user_role, 'customer');

  -- The owner role must NEVER be self-assigned at signup.
  if requested_role = 'owner' then
    requested_role := 'customer';
  end if;

  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    nullif(new.raw_user_meta_data->>'phone', ''),
    requested_role
  );
  return new;
end;
$$;
