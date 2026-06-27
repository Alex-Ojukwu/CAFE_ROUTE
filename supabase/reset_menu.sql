-- ============================================================
-- CafeRoute · reset_menu.sql
-- Replaces the menu with the seven image-backed dishes used by the
-- customer-page redesign. Images live in /public/foods and are served
-- from /foods/*.png. Run in the Supabase SQL editor AFTER 0010.
--
-- Safe to re-run: it clears existing menu items that aren't tied to a
-- real order (FK-referenced ones are left alone), then loads the seven.
-- ============================================================

delete from menu_items
where id not in (select menu_item_id from order_items);

insert into menu_items (name, description, price, category, image_url, is_available, is_staple) values
  -- ----- Everyday staples (big pop-out "specials" tier) -----
  ('Jollof Rice',      'Smoky party jollof with grilled chicken and fried plantain',  400, 'Rice',  '/foods/jollof-removebg-preview.png',     true, true),
  ('White Rice & Stew','Fluffy white rice with a rich tomato pepper stew',            600, 'Rice',  '/foods/white_rice-removebg-preview.png', true, true),
  ('Plantain (Dodo)',  'Sweet fried ripe plantain with pepper sauce',                200, 'Sides', '/foods/plantain-removebg-preview.png',   true, true),
  ('Beans (Ewa)',      'Slow-cooked beans porridge, soft and savoury',               600, 'Sides', '/foods/beans-removebg-preview.png',      true, true),
  -- ----- Also on the menu (quieter tier) -----
  ('Grilled Chicken',  'Herb-roasted peppered chicken, two pieces',                 1500, 'Grill', '/foods/chicken-removebg-preview.png',    true, false),
  ('Shawarma',         'Beef shawarma wrap loaded with fresh veggies',              2500, 'Wraps', '/foods/sharwama-removebg-preview.png',   true, false),
  ('Pizza',            'Wood-fired pepperoni pizza',                                5000, 'Extras','/foods/pizza-removebg-preview.png',      true, false);
