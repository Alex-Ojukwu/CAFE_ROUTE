-- ============================================================
-- CafeRoute · Phase 4 · profile visibility for order counterparties
-- The customer and the assigned rider on an order need to see each
-- other's name/phone on the tracking + delivery pages. RLS otherwise
-- limits profile reads to "own profile" / owner. This adds exactly that
-- mutual visibility, scoped to a shared order.
-- ============================================================

create policy "profiles: order counterparties can read each other" on profiles
for select using (
  exists (
    select 1 from orders o
    where (o.customer_id = auth.uid() and o.rider_id = profiles.id)
       or (o.rider_id = auth.uid() and o.customer_id = profiles.id)
  )
);
