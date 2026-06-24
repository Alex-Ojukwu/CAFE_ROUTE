# CafeRoute — Phase 1 (Data layer)

Schema, enums, signup trigger, RLS, RPC functions, and seed data. This is the
only phase built so far. Auth/routing and the portals come in Phase 2+.

## What to run, in order

Open **Supabase Dashboard → SQL Editor** and run each file top to bottom:

| Order | File | What it does |
|-------|------|--------------|
| 1 | `migrations/0001_schema.sql`       | Enums + 5 tables + indexes |
| 2 | `migrations/0002_auth_trigger.sql` | Auto-create a profile on signup (blocks self-assigned `owner`) |
| 3 | `migrations/0003_rls.sql`          | Enable RLS + all policies + `current_role_is()` + role-immutability guard |
| 4 | `migrations/0004_rpc.sql`          | `place_order`, `accept_order`, `update_order_status`, `cancel_order`, `owner_stats` |
| 5 | `seed.sql`                         | Menu items + owner promotion |

For the owner step in `seed.sql`: first create the user in
**Authentication → Users → Add user** (email `owner@caferoute.test`, confirmed),
then run the `update profiles ... role = 'owner'` statement.

## How to verify Phase 1 is good

### 1. Structure exists
```sql
select tablename, rowsecurity
from pg_tables where schemaname = 'public';
-- expect: profiles, menu_items, orders, order_items, messages — all rowsecurity = true
```
```sql
select unnest(enum_range(null::order_status));  -- 5 statuses
select unnest(enum_range(null::user_role));     -- 3 roles
select count(*) from menu_items;                -- 12 seeded items
```

### 2. Policies & functions are present
```sql
select tablename, policyname, cmd from pg_policies where schemaname='public' order by 1;
select proname from pg_proc
where proname in ('handle_new_user','current_role_is','place_order','accept_order',
                  'update_order_status','cancel_order','owner_stats','prevent_role_change');
```

### 3. Signup trigger works
Create any user in **Authentication → Users**, then:
```sql
select id, full_name, role from profiles order by created_at desc limit 1;
-- a row exists; role = 'customer' even if you passed role:'owner' in metadata
```

### 4. Owner promotion + role guard
```sql
select role from profiles
where id = (select id from auth.users where email = 'owner@caferoute.test');  -- 'owner'
```

### 5. RPC behaviour (simulate a logged-in user)
The RPCs read `auth.uid()`, so impersonate a real profile id in the SQL editor:
```sql
-- pick a customer's profile id
-- \set uid '<paste-a-profile-uuid>'
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"<PROFILE_UUID>","role":"authenticated"}';

  -- place an order from two menu items
  select place_order(
    jsonb_build_array(
      jsonb_build_object('menu_item_id', (select id from menu_items where name='Jollof Rice & Chicken'), 'quantity', 2),
      jsonb_build_object('menu_item_id', (select id from menu_items where name='Chapman'),               'quantity', 1)
    ),
    '12 Allen Avenue, Ikeja', '08030000000', 'Ring the bell'
  ) as new_order_id;
  -- total should be 2500*2 + 1500 = 6500, computed server-side
  select status, total from orders order by placed_at desc limit 1;
rollback;
```

### 6. Atomic accept (no double-accept)
Run `accept_order(<pending_order_id>)` impersonating one rider → succeeds and
sets `status='accepted'`, `rider_id`, `accepted_at`. Run it again (same or other
rider) → raises **"Order is no longer available"**. This is the Phase 4 guarantee,
already enforced at the data layer.

### 7. RLS actually blocks cross-user access
Impersonate customer A and confirm `select * from orders` only returns A's rows;
impersonate a rider and confirm they see `pending` orders + their own assigned
ones, never another customer's history. `owner_stats(...)` raises **"Owner only"**
for non-owners.

---

When all seven pass, Phase 1's acceptance criteria are met (data layer runs,
totals/transitions are server-trusted, RLS protects across roles and users).
Stop here — Phase 2 (auth & routing) is next.
```
