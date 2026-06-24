-- ============================================================
-- CafeRoute · Phase 3 · enable Realtime
-- Adds tables to the supabase_realtime publication so the app gets
-- live order updates (and chat in Phase 6). Run once.
-- Realtime still respects RLS, so users only receive rows they can read.
-- ============================================================

alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table messages;
