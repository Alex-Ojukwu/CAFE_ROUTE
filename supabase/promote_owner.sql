-- Promote a user to owner.
-- 1. Find your id:
--      select id, email from auth.users;
-- 2. Paste it below and run:

update profiles set role = 'owner' where id = 'YOUR_USER_ID';
