-- ============================================================
-- CafeRoute · Phase 1 · 0001 schema (enums, tables, indexes)
-- Run this first in the Supabase SQL editor.
-- ============================================================

-- ===== ENUMS =====
create type user_role    as enum ('customer', 'rider', 'owner');
create type order_status as enum ('pending', 'accepted', 'out_for_delivery', 'delivered', 'cancelled');

-- ===== PROFILES (1:1 with auth.users) =====
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        user_role not null default 'customer',
  full_name   text not null,
  phone       text,
  avatar_url  text,
  is_active   boolean not null default true,   -- for riders: available to take orders
  created_at  timestamptz not null default now()
);

-- ===== MENU =====
create table menu_items (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text,
  price         numeric(10,2) not null check (price >= 0),
  category      text not null default 'Main',
  image_url     text,
  is_available  boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ===== ORDERS =====
create table orders (
  id                uuid primary key default gen_random_uuid(),
  customer_id       uuid not null references profiles(id),
  rider_id          uuid references profiles(id),         -- null until accepted
  status            order_status not null default 'pending',
  total             numeric(10,2) not null default 0,
  delivery_address  text not null,
  delivery_notes    text,
  customer_phone    text,
  placed_at         timestamptz not null default now(),
  accepted_at       timestamptz,
  delivered_at      timestamptz,
  cancelled_at      timestamptz
);

-- ===== ORDER ITEMS =====
create table order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references orders(id) on delete cascade,
  menu_item_id  uuid not null references menu_items(id),
  item_name     text not null,            -- snapshot, so historical orders survive menu edits
  unit_price    numeric(10,2) not null,   -- snapshot
  quantity      int not null check (quantity > 0)
);

-- ===== MESSAGES (rider <-> customer, scoped to an order) =====
create table messages (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references orders(id) on delete cascade,
  sender_id   uuid not null references profiles(id),
  body        text not null,
  created_at  timestamptz not null default now()
);

create index on orders (status);
create index on orders (customer_id);
create index on orders (rider_id);
create index on messages (order_id);
create index on order_items (order_id);
