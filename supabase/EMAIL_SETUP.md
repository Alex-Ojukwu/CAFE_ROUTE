# CafeRoute — Email (SMTP) setup with Resend

Supabase's built-in email sender is rate-limited and **dev/testing only**. For real
users (signup confirmation + password reset) you must connect your own SMTP.
This guide uses **Resend** (free tier: 3,000 emails/month).

> No code changes are needed for SMTP itself — it's all dashboard config.
> Keep **email confirmation OFF** until step 7 so nothing breaks mid-setup.

---

## 1. Create a Resend account
1. Go to https://resend.com and sign up.
2. Verify your own email to activate the account.

## 2. Add & verify your sending domain
1. Resend dashboard → **Domains** → **Add Domain**.
2. Enter the domain you'll send from (e.g. `caferoute.app`). If you don't own a
   domain yet, buy one (Namecheap/Cloudflare) — you need it to send from
   `no-reply@yourdomain`. (Resend's shared `onboarding@resend.dev` works only for
   testing to your own address.)
3. Resend shows DNS records (SPF, DKIM, and a return-path/MX). Add each one in
   your domain's DNS provider (Cloudflare/Namecheap/etc.).
4. Back in Resend, click **Verify**. Wait until the domain shows **Verified**
   (DNS can take minutes to a few hours).

## 3. Create an SMTP API key
1. Resend → **API Keys** → **Create API Key** (Sending access is enough).
2. Copy the key (starts with `re_...`). You'll paste it as the SMTP **password**.

Resend SMTP credentials:
| Field    | Value                          |
|----------|--------------------------------|
| Host     | `smtp.resend.com`              |
| Port     | `465` (SSL) or `587` (STARTTLS)|
| Username | `resend`                       |
| Password | your `re_...` API key          |

## 4. Set Site URL + Redirect allowlist in Supabase
Supabase → **Authentication → URL Configuration**:
- **Site URL** → your production URL (e.g. `https://caferoute.vercel.app`).
  The signup confirmation link redirects here.
- **Redirect URLs** (allowlist) → add every origin the app runs on, e.g.:
  - `http://localhost:3000/**`
  - `https://caferoute.vercel.app/**`

  These must be allowed or the password-reset link (`{origin}/login`) is rejected.

## 5. Enter the SMTP settings in Supabase
Supabase → **Authentication → Emails → SMTP Settings** → **Enable Custom SMTP**:
- **Sender email**: `no-reply@yourdomain` (must be on the verified Resend domain)
- **Sender name**: `CafeRoute`
- **Host**: `smtp.resend.com`
- **Port**: `465`
- **Username**: `resend`
- **Password**: your `re_...` key
- Save.

## 6. Test delivery (confirmation still OFF)
1. On the app's **login** page, type a real email you control and click
   **Forgot password** — this sends an email regardless of the confirmation
   setting, so it's the cleanest test.
2. Check the inbox. If the email arrives from `no-reply@yourdomain`, SMTP works.
   If not: check Resend → **Logs** for the failure, and that the domain is Verified.

## 7. Turn on email confirmation (only after step 6 passes)
Supabase → **Authentication → Providers → Email** → enable **Confirm email**.
Now new signups receive a working confirmation email and must confirm before login.

## 8. (Optional) Customize templates
Supabase → **Authentication → Email Templates** — brand the Confirm signup and
Reset password emails. Keep the `{{ .ConfirmationURL }}` token intact.

---

## ⚠️ Known gap: password reset has no "set new password" page yet
`app/(auth)/login/page.tsx` sends a reset link that returns the user to `/login`
in a recovery session, but there is **no UI to enter a new password**, so the
reset can't be completed. This needs a small page that calls
`supabase.auth.updateUser({ password })`. Build this before relying on password
reset in production.
