-- ============================================================
-- CafeRoute · Phase 1 · seed data
-- Run AFTER 0001-0004. Seeds menu items + promotes one owner.
-- ============================================================

-- ----- Menu items (prices in NGN) -----
insert into menu_items (name, description, price, category, is_available) values
  ('Jollof Rice & Chicken', 'Smoky party jollof with a grilled chicken thigh',        2500, 'Main',    true),
  ('Fried Rice & Turkey',   'Vegetable fried rice with peppered turkey',              3000, 'Main',    true),
  ('Pounded Yam & Egusi',   'Hand-pounded yam with rich egusi and assorted meat',     3500, 'Main',    true),
  ('Amala & Ewedu',         'Soft amala with ewedu and gbegiri, served with beef',    3200, 'Main',    true),
  ('Beef Suya',             'Spicy skewered beef with yaji and onions',               1800, 'Grill',   true),
  ('Peppered Snail',        'Grilled snail in a hot pepper sauce',                    4000, 'Grill',   true),
  ('Puff Puff (6 pcs)',     'Golden fried dough balls',                                800, 'Sides',   true),
  ('Plantain (Dodo)',       'Sweet fried ripe plantain',                              1000, 'Sides',   true),
  ('Moi Moi',               'Steamed bean pudding with egg and fish',                 1200, 'Sides',   true),
  ('Chapman',               'Classic Nigerian cocktail mocktail',                     1500, 'Drinks',  true),
  ('Zobo',                  'Chilled hibiscus drink with pineapple and ginger',        700, 'Drinks',  true),
  ('Bottled Water',         '75cl table water',                                        300, 'Drinks',  true);

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
