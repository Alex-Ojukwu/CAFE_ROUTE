-- Promote a customer to rider.
-- When someone gives you their email and wants to deliver, run this in the
-- Supabase SQL editor (as the owner / in the dashboard editor).

update profiles
set role = 'rider'
where id = (select id from auth.users where email = 'THEIR_EMAIL@example.com');

-- To set them back to customer:
-- update profiles set role = 'customer'
-- where id = (select id from auth.users where email = 'THEIR_EMAIL@example.com');
