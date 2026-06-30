import { createClient } from "@supabase/supabase-js";

// A cookie-less, session-less Supabase client for PUBLIC reads that can be
// cached across requests (e.g. the customer menu via unstable_cache). It runs
// as the `anon` role, so it only sees rows allowed by a public RLS policy
// (see migration 0012: anyone may read available menu items).
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
