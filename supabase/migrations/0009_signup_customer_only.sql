-- ============================================================
-- CafeRoute · 0009 · self-signup is always a customer
-- The signup form no longer offers a role. This hardens the rule at the
-- database: every self-signup becomes 'customer' regardless of any role
-- sent in metadata. Riders and owners are promoted manually by the owner
-- (see promote_rider.sql / promote_owner.sql). Re-run safe.
-- ============================================================

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    nullif(new.raw_user_meta_data->>'phone', ''),
    'customer'   -- always; never trust a role from signup metadata
  );
  return new;
end;
$$;
