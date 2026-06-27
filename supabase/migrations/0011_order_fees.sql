-- ============================================================
-- CafeRoute · 0011 · order fees (pack + delivery)
-- Adds a flat packaging fee and delivery fee to every order. Fees are
-- applied SERVER-SIDE in place_order so the client can't tamper with them.
-- Keep these amounts in sync with lib/fees.ts. Run after 0010.
-- ============================================================

alter table orders
  add column if not exists pack_fee     numeric(10,2) not null default 0,
  add column if not exists delivery_fee numeric(10,2) not null default 0;

-- Recreate place_order so total = items subtotal + pack fee + delivery fee.
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
  v_subtotal numeric(10,2) := 0;
  v_pack     numeric(10,2) := 200;  -- keep in sync with lib/fees.ts PACK_FEE
  v_delivery numeric(10,2) := 500;  -- keep in sync with lib/fees.ts DELIVERY_FEE
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

  insert into orders (customer_id, status, total, pack_fee, delivery_fee, delivery_address, delivery_notes, customer_phone)
  values (auth.uid(), 'pending', 0, v_pack, v_delivery, address, notes, phone)
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

    v_subtotal := v_subtotal + (v_menu.price * v_qty);
  end loop;

  update orders
  set total = v_subtotal + v_pack + v_delivery
  where id = v_order_id;

  return v_order_id;
end;
$$;

revoke execute on function place_order(jsonb, text, text, text) from anon;
grant  execute on function place_order(jsonb, text, text, text) to authenticated;
