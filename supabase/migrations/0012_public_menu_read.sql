-- ============================================================
-- CafeRoute · 0012 · public menu read (for caching at scale)
-- Lets anyone read AVAILABLE menu items so the customer menu can be
-- cached across requests (one DB query serves many users) instead of
-- querying per visit. Hidden items + all writes stay owner/auth-only
-- (the existing policies remain; SELECT policies are OR'd together).
-- Run after 0011.
-- ============================================================

drop policy if exists "menu: public can read available" on menu_items;
create policy "menu: public can read available" on menu_items
for select using (is_available = true);
