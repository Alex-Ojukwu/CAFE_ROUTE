-- ============================================================
-- CafeRoute · Phase 1 · seed data
-- Run AFTER 0001-0004. Seeds menu items + promotes one owner.
-- ============================================================

-- ----- Menu items (prices in NGN; images served from /public/foods) -----
insert into menu_items (name, description, price, category, image_url, is_available, is_staple) values
  -- Everyday staples (big pop-out "specials" tier)
  ('Jollof Rice',      'Smoky party jollof with grilled chicken and fried plantain',  400, 'Rice',  '/foods/jollof-removebg-preview.png',     true, true),
  ('White Rice & Stew','Fluffy white rice with a rich tomato pepper stew',            600, 'Rice',  '/foods/white_rice-removebg-preview.png', true, true),
  ('Plantain (Dodo)',  'Sweet fried ripe plantain with pepper sauce',                200, 'Sides', '/foods/plantain-removebg-preview.png',   true, true),
  ('Beans (Ewa)',      'Slow-cooked beans porridge, soft and savoury',               600, 'Sides', '/foods/beans-removebg-preview.png',      true, true),
  ('Grilled Chicken',  'Herb-roasted peppered chicken, two pieces',                 1500, 'Grill', '/foods/chicken-removebg-preview.png',    true, true),
  -- Also on the menu (quieter tier)
  ('Shawarma',         'Beef shawarma wrap loaded with fresh veggies',              2500, 'Wraps', '/foods/sharwama-removebg-preview.png',   true, false),
  ('Pizza',            'Wood-fired pepperoni pizza',                                5000, 'Extras','/foods/pizza-removebg-preview.png',      true, false);

-- ----- Owner account -----
-- The owner role can never be self-assigned at signup (see 0002). Create the
-- owner the safe way:
--   1. Supabase Dashboard -> Authentication -> Users -> "Add user"
--      Email: owner@caferoute.test   (set a password, mark email confirmed)
--      The signup trigger creates a profile with role = 'customer'.
--   2. Promote that profile to owner by running the statement below with the
--      real email. (auth.uid() is null in the SQL editor, so the role guard
--      allows this promotion.)

update profiles
set role = 'owner', full_name = 'CafeRoute Owner'
where id = (select id from auth.users where email = 'owner@caferoute.test');

-- Optional: seed a rider the same way (create the auth user first, then):
-- update profiles set role = 'rider' where id = (select id from auth.users where email = 'rider@caferoute.test');
