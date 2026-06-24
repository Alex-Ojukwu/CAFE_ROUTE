-- ============================================================
-- CafeRoute · Phase 1 · 0004 RPC functions
-- Transitions / writes where logic matters live behind these
-- security-definer functions so totals and state are trusted.
-- ============================================================

-- ------------------------------------------------------------
-- place_order(items, address, phone, notes) -> new order id
--   items: jsonb array of { "menu_item_id": uuid, "quantity": int }
--   Total is computed SERVER-SIDE from menu_items (never trust the client).
--   Order + its items are created atomically.
-- ------------------------------------------------------------
create or replace function place_order(
  items   jsonb,
  address text,
  phone   text default null,
  notes   text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order_id uuid;
  v_total    numeric(10,2) := 0;
  v_item     jsonb;
  v_menu     menu_items%rowtype;
  v_qty      int;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if not current_role_is('customer') then
    raise exception 'Only customers can place orders';
  end if;
  if items is null or jsonb_array_length(items) = 0 then
    raise exception 'Cart is empty';
  end if;
  if address is null or length(trim(address)) = 0 then
    raise exception 'Delivery address is required';
  end if;

  insert into orders (customer_id, status, total, delivery_address, delivery_notes, customer_phone)
  values (auth.uid(), 'pending', 0, address, notes, phone)
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(items)
  loop
    v_qty := (v_item->>'quantity')::int;
    if v_qty is null or v_qty <= 0 then
      raise exception 'Invalid quantity for item %', v_item->>'menu_item_id';
    end if;

    select * into v_menu
    from menu_items
    where id = (v_item->>'menu_item_id')::uuid
      and is_available = true;

    if not found then
      raise exception 'Menu item not available: %', v_item->>'menu_item_id';
    end if;

    insert into order_items (order_id, menu_item_id, item_name, unit_price, quantity)
    values (v_order_id, v_menu.id, v_menu.name, v_menu.price, v_qty);

    v_total := v_total + (v_menu.price * v_qty);
  end loop;

  update orders set total = v_total where id = v_order_id;
  return v_order_id;
end;
$$;

-- ------------------------------------------------------------
-- accept_order(order_id) -> the accepted order
--   Atomic: the UPDATE ... WHERE status = 'pending' locks the row so two
--   riders cannot both accept the same order. The loser gets a clean error.
-- ------------------------------------------------------------
create or replace function accept_order(p_order_id uuid)
returns orders
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order orders%rowtype;
begin
  if not current_role_is('rider') then
    raise exception 'Only riders can accept orders';
  end if;

  update orders
  set rider_id    = auth.uid(),
      status      = 'accepted',
      accepted_at = now()
  where id = p_order_id
    and status = 'pending'
  returning * into v_order;

  if not found then
    raise exception 'Order is no longer available';
  end if;

  return v_order;
end;
$$;

-- ------------------------------------------------------------
-- update_order_status(order_id, new_status) -> the updated order
--   Rider drives accepted -> out_for_delivery -> delivered on their own order.
--   Stamps delivered_at on delivery. (Used in Phase 4.)
-- ------------------------------------------------------------
create or replace function update_order_status(p_order_id uuid, p_new_status order_status)
returns orders
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order orders%rowtype;
begin
  select * into v_order from orders where id = p_order_id;
  if not found then
    raise exception 'Order not found';
  end if;

  if not (v_order.rider_id = auth.uid() or current_role_is('owner')) then
    raise exception 'Not allowed to update this order';
  end if;

  -- Enforce the legal forward transitions.
  if not (
       (v_order.status = 'accepted'         and p_new_status = 'out_for_delivery')
    or (v_order.status = 'out_for_delivery' and p_new_status = 'delivered')
    or current_role_is('owner')  -- owner may override
  ) then
    raise exception 'Illegal status transition % -> %', v_order.status, p_new_status;
  end if;

  update orders
  set status       = p_new_status,
      delivered_at = case when p_new_status = 'delivered' then now() else delivered_at end
  where id = p_order_id
  returning * into v_order;

  return v_order;
end;
$$;

-- ------------------------------------------------------------
-- cancel_order(order_id) -> the cancelled order
--   Customer may cancel their own order while still pending; owner may cancel any.
-- ------------------------------------------------------------
create or replace function cancel_order(p_order_id uuid)
returns orders
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order orders%rowtype;
begin
  select * into v_order from orders where id = p_order_id;
  if not found then
    raise exception 'Order not found';
  end if;

  if current_role_is('owner') then
    null; -- owner may cancel any order
  elsif v_order.customer_id = auth.uid() and v_order.status = 'pending' then
    null; -- customer may cancel their own pending order
  else
    raise exception 'Not allowed to cancel this order';
  end if;

  update orders
  set status       = 'cancelled',
      cancelled_at = now()
  where id = p_order_id
  returning * into v_order;

  return v_order;
end;
$$;

-- ------------------------------------------------------------
-- owner_stats(from, to) -> jsonb dashboard payload
--   KPIs + per-day series + status breakdown + top items + per-rider.
--   Owner only. Aggregation stays in SQL (no pulling all rows to the client).
-- ------------------------------------------------------------
create or replace function owner_stats(
  p_from timestamptz default (now() - interval '30 days'),
  p_to   timestamptz default now()
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  result jsonb;
begin
  if not current_role_is('owner') then
    raise exception 'Owner only';
  end if;

  with scoped as (
    select * from orders
    where placed_at >= p_from and placed_at <= p_to
  ),
  kpis as (
    select
      count(*)                                                          as total_orders,
      count(*) filter (where status = 'delivered')                     as delivered,
      count(*) filter (where status = 'cancelled')                     as cancelled,
      count(*) filter (where status in ('pending','accepted','out_for_delivery')) as active,
      coalesce(sum(total) filter (where status = 'delivered'), 0)       as revenue,
      avg(extract(epoch from (delivered_at - placed_at)))
        filter (where status = 'delivered')                            as avg_delivery_seconds
    from scoped
  ),
  per_day as (
    select
      to_char(date_trunc('day', placed_at), 'YYYY-MM-DD')              as day,
      count(*)                                                          as orders,
      coalesce(sum(total) filter (where status = 'delivered'), 0)       as revenue
    from scoped
    group by 1
    order by 1
  ),
  status_breakdown as (
    select status, count(*) as count
    from scoped
    group by status
  ),
  top_items as (
    select oi.item_name, sum(oi.quantity) as qty
    from order_items oi
    join scoped o on o.id = oi.order_id
    group by oi.item_name
    order by qty desc
    limit 5
  ),
  per_rider as (
    select p.id as rider_id, p.full_name, count(*) as deliveries
    from scoped o
    join profiles p on p.id = o.rider_id
    where o.status = 'delivered'
    group by p.id, p.full_name
    order by deliveries desc
  )
  select jsonb_build_object(
    'range',                jsonb_build_object('from', p_from, 'to', p_to),
    'kpis',                 (select to_jsonb(k) from kpis k),
    'orders_per_day',       coalesce((select jsonb_agg(to_jsonb(d)) from per_day d), '[]'::jsonb),
    'revenue_per_day',      coalesce((select jsonb_agg(jsonb_build_object('day', d.day, 'revenue', d.revenue)) from per_day d), '[]'::jsonb),
    'status_breakdown',     coalesce((select jsonb_agg(to_jsonb(s)) from status_breakdown s), '[]'::jsonb),
    'top_items',            coalesce((select jsonb_agg(to_jsonb(t)) from top_items t), '[]'::jsonb),
    'deliveries_per_rider', coalesce((select jsonb_agg(to_jsonb(r)) from per_rider r), '[]'::jsonb)
  )
  into result;

  return result;
end;
$$;

-- Expose the RPCs to logged-in users only (internal role checks do the rest).
revoke execute on function place_order(jsonb, text, text, text)   from anon;
revoke execute on function accept_order(uuid)                     from anon;
revoke execute on function update_order_status(uuid, order_status) from anon;
revoke execute on function cancel_order(uuid)                     from anon;
revoke execute on function owner_stats(timestamptz, timestamptz)  from anon;

grant execute on function place_order(jsonb, text, text, text)    to authenticated;
grant execute on function accept_order(uuid)                      to authenticated;
grant execute on function update_order_status(uuid, order_status) to authenticated;
grant execute on function cancel_order(uuid)                      to authenticated;
grant execute on function owner_stats(timestamptz, timestamptz)   to authenticated;
