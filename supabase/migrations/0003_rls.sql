-- ============================================================
-- CafeRoute · Phase 1 · 0003 Row Level Security
-- Enable RLS on every table and add policies.
-- Business rules live HERE, not just in the UI.
-- ============================================================

alter table profiles    enable row level security;
alter table menu_items  enable row level security;
alter table orders      enable row level security;
alter table order_items enable row level security;
alter table messages    enable row level security;

-- ----- Helper: is the current user the given role? -----
create or replace function current_role_is(target user_role)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (select 1 from profiles where id = auth.uid() and role = target);
$$;

-- ============================================================
-- PROFILES
--   read : own profile, or owner reads all
--   update: own profile only (role is immutable, enforced below)
--   insert: handled by the signup trigger (security definer), no policy needed
-- ============================================================
create policy "profiles: read own or owner reads all" on profiles
for select using (
  id = auth.uid() or current_role_is('owner')
);

create policy "profiles: update own" on profiles
for update using (id = auth.uid()) with check (id = auth.uid());

-- A user must not change their own role. Owners (and the service role /
-- SQL editor, where auth.uid() is null) may still change roles, which is how
-- the owner account gets promoted in seed.sql.
create or replace function prevent_role_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not current_role_is('owner') then
    raise exception 'You cannot change your own role';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_role_guard on profiles;
create trigger profiles_role_guard
  before update on profiles
  for each row execute function prevent_role_change();

-- ============================================================
-- MENU_ITEMS
--   select: any authenticated user
--   write : owner only
-- ============================================================
create policy "menu: readable by authenticated" on menu_items
for select using (auth.uid() is not null);

create policy "menu: owner manages" on menu_items
for all
using (current_role_is('owner'))
with check (current_role_is('owner'));

-- ============================================================
-- ORDERS
--   select: customer sees own; rider sees pending + assigned; owner sees all
--   insert: customer creating their own order
--   update: customer cancels own pending; rider accepts pending / updates own; owner any
--   (Most transitions go through the RPCs in 0004; these are the backstop.)
-- ============================================================
create policy "orders: select by participant/role" on orders
for select using (
  customer_id = auth.uid()
  or (current_role_is('rider') and (status = 'pending' or rider_id = auth.uid()))
  or current_role_is('owner')
);

create policy "orders: customer inserts own" on orders
for insert with check (
  customer_id = auth.uid() and current_role_is('customer')
);

create policy "orders: update by role" on orders
for update using (
  (customer_id = auth.uid() and status = 'pending')
  or (current_role_is('rider') and (status = 'pending' or rider_id = auth.uid()))
  or current_role_is('owner')
) with check (
  customer_id = auth.uid()
  or rider_id = auth.uid()
  or current_role_is('owner')
);

-- ============================================================
-- ORDER_ITEMS
--   select: visible if the parent order is visible to the user
--   insert: customer, for their own order
-- ============================================================
create policy "order_items: follow order visibility" on order_items
for select using (
  exists (
    select 1 from orders o
    where o.id = order_items.order_id
      and (
        o.customer_id = auth.uid()
        or (current_role_is('rider') and (o.status = 'pending' or o.rider_id = auth.uid()))
        or current_role_is('owner')
      )
  )
);

create policy "order_items: customer inserts for own order" on order_items
for insert with check (
  exists (
    select 1 from orders o
    where o.id = order_items.order_id
      and o.customer_id = auth.uid()
  )
);

-- ============================================================
-- MESSAGES
--   select/insert: only the customer or the assigned rider of that order
-- ============================================================
create policy "messages: order participants can read" on messages
for select using (
  exists (
    select 1 from orders o
    where o.id = messages.order_id
      and (o.customer_id = auth.uid() or o.rider_id = auth.uid())
  )
);

create policy "messages: order participants can send" on messages
for insert with check (
  sender_id = auth.uid() and exists (
    select 1 from orders o
    where o.id = messages.order_id
      and (o.customer_id = auth.uid() or o.rider_id = auth.uid())
  )
);
