-- ============================================================
-- CafeRoute · 0010 · menu staples
-- Flags everyday dishes (jollof, plantain, white rice, beans) so the
-- customer menu can give them the big "specials" pop-out tier, while the
-- rest sit in a quieter tier. Run after 0001-0009.
-- ============================================================

alter table menu_items
  add column if not exists is_staple boolean not null default false;
