-- ============================================================
-- CafeRoute · 0013 · unique menu item names (stop duplicates)
-- Past runs of seed.sql / reset_menu.sql created duplicate menu_items
-- because there was no unique constraint on `name` and reset_menu could
-- not delete rows referenced by past orders (FK), so it re-inserted a
-- second copy. This migration collapses duplicates onto one canonical row
-- per name, then adds `unique (name)` so it can never happen again.
-- order_items keeps its own name/price snapshot (see 0004), so re-pointing
-- its FK to the canonical row does not change any historical order.
-- Run after 0012.
-- ============================================================

-- Canonical row per name = the oldest one.
with canon as (
  select distinct on (name) name, id as keep_id
  from menu_items
  order by name, created_at, id
),
dupes as (
  select m.id as dup_id, c.keep_id
  from menu_items m
  join canon c on c.name = m.name
  where m.id <> c.keep_id
)
-- 1) Re-point any order that referenced a duplicate to the canonical row.
update order_items oi
set menu_item_id = d.keep_id
from dupes d
where oi.menu_item_id = d.dup_id;

-- 2) Now nothing references the duplicates — delete them.
with canon as (
  select distinct on (name) name, id as keep_id
  from menu_items
  order by name, created_at, id
)
delete from menu_items m
using canon c
where c.name = m.name and m.id <> c.keep_id;

-- 3) Enforce uniqueness going forward.
create unique index if not exists menu_items_name_key on menu_items (name);
