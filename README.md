# CafeRoute

Cafeteria food delivery — Next.js 14 (App Router) + TypeScript + Tailwind + Supabase.

Built so far:
- **Phase 1** — data layer (`supabase/`): schema, enums, signup trigger, RLS, RPCs, seed.
- **Phase 2** — auth & routing: login, signup (customer/rider), role-guard middleware,
  role-based redirect from `/`, and placeholder portal home pages.

## Setup

1. **Run migration 0005** in the Supabase SQL editor (captures the signup phone on the
   profile): `supabase/migrations/0005_profile_phone_on_signup.sql`.

2. **Environment.** Copy the example and fill in your project values
   (Supabase dashboard → Project Settings → API):
   ```bash
   cp .env.local.example .env.local
   ```
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
   ```

3. **For easy testing, turn off email confirmation** (dev only):
   Supabase dashboard → Authentication → Sign In / Providers → Email → disable
   "Confirm email". Then signups log in immediately. (Leave it on in production.)

4. **Run it.**
   ```bash
   npm install      # already done
   npm run dev      # http://localhost:3000
   ```

## Phase 2 — how to verify (acceptance criteria)

1. **Logged-out guard.** Visit `/customer`, `/rider`, `/owner` while signed out →
   each redirects to `/login`.
2. **Signup creates a profile with the chosen role.** Sign up as a **Customer** →
   you land on `/customer`. In Supabase: `select role from profiles ...` shows `customer`.
   Repeat as a **Rider** (different email) → lands on `/rider`.
3. **Role isolation.** As the customer, manually visit `/rider` and `/owner` →
   redirected back to `/customer`. As the rider, `/customer` and `/owner` →
   redirected to `/rider`.
4. **Owner.** Promote your account (`supabase/promote_owner.sql`), sign in →
   lands on `/owner`; `/customer` and `/rider` redirect away.
5. **Root redirect.** Visit `/` while logged in → sent to your role's portal.
   While logged out → `/login`.
6. **Sign out** (top-right button) → back to `/login`, and protected routes are
   blocked again.

When all six pass, Phase 2 is done. Phase 3 (customer menu/cart/checkout) is next.

## Project layout
```
app/
  (auth)/login, (auth)/signup   # auth pages
  customer | rider | owner       # portal homes (placeholders until phases 3-5)
  page.tsx                       # role-based redirect
lib/supabase/                    # browser, server, middleware clients
components/                      # PortalTopbar, SignOutButton
middleware.ts                    # session refresh + role guards
supabase/                        # Phase 1 SQL (migrations + seed)
```
