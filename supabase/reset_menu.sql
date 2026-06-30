-- ============================================================
-- CafeRoute · reset_menu.sql
-- Loads/refreshes the seven image-backed dishes used by the customer-page
-- redesign. Images live in /public/foods and are served from /foods/*.png.
-- Run in the Supabase SQL editor AFTER 0013.
--
-- Genuinely safe to re-run: upserts on the unique `name` key (added in
-- 0013), so re-running updates the existing rows in place instead of
-- inserting duplicates. No DELETE, so past orders' FK rows are untouched.
-- ============================================================

insert into menu_items (name, description, price, category, image_url, is_available, is_staple) values
  -- ----- Everyday staples (big pop-out "specials" tier) -----
  ('Jollof Rice',      'Smoky party jollof with grilled chicken and fried plantain',  400, 'Rice',  '/foods/jollof-removebg-preview.png',     true, true),
  ('White Rice & Stew','Fluffy white rice with a rich tomato pepper stew',            600, 'Rice',  '/foods/white_rice-removebg-preview.png', true, true),
  ('Plantain (Dodo)',  'Sweet fried ripe plantain with pepper sauce',                200, 'Sides', '/foods/plantain-removebg-preview.png',   true, true),
  ('Beans (Ewa)',      'Slow-cooked beans porridge, soft and savoury',               600, 'Sides', '/foods/beans-removebg-preview.png',      true, true),
  ('Grilled Chicken',  'Herb-roasted peppered chicken, two pieces',                 1500, 'Grill', '/foods/chicken-removebg-preview.png',    true, true),
  -- ----- Also on the menu (quieter tier) -----
  ('Shawarma',         'Beef shawarma wrap loaded with fresh veggies',              2500, 'Wraps', '/foods/sharwama-removebg-preview.png',   true, false),
  ('Pizza',            'Wood-fired pepperoni pizza',                                5000, 'Extras','/foods/pizza-removebg-preview.png',      true, false)
on conflict (name) do update set
  description  = excluded.description,
  price        = excluded.price,
  category     = excluded.category,
  image_url    = excluded.image_url,
  is_available = excluded.is_available,
  is_staple    = excluded.is_staple;
