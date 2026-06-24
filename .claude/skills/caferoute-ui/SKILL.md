---
name: CafeRoute UI System
description: Apply CafeRoute's warm, dark, food-focused visual system, mobile-first layout rules, the shared order-status badge palette, NGN currency formatting, and per-portal shell conventions. Load whenever building or refactoring any frontend page or component in this project (customer menu/cart/tracking, rider pool/delivery, owner dashboard/menu management), styling Tailwind, or building shared UI like badges, chat, toasts, empty/loading states.
---

# CafeRoute UI System

CafeRoute is a cafeteria food-delivery app with three portals — **Customer**, **Rider**, **Owner** — sharing one design language. Stack is fixed: **Next.js 14 (App Router) + TypeScript + Tailwind CSS**. Apply everything below; these are project rules, not suggestions.

## Visual direction — warm, dark & food-focused

Dark, moody, appetizing. Warm near-black charcoal backgrounds (never cool/blue-gray, never pure black), lit by a rich amber/orange primary and soft glowing amber borders on framed sections. Food photography is the hero — let it pop against the dark surface. Serif display wordmark and section headings; clean sans body. Rounded corners, soft glow/shadow, generous spacing. Inviting and premium, never sterile or corporate.

Reference: the login screen (dark frame with glowing amber border, serif "CafeRoute" wordmark, amber compass-pin logo, dark inputs with orange focus rings, amber "Sign In" button) and the customer menu (dark canvas, "DISCOVER **CAFEROUTE** SPECIALS" heading with amber accent word, food cards with "Featured"/"Popular" amber tags and orange add buttons).

Define these as Tailwind theme tokens in `tailwind.config.ts` (extend `colors`); never hardcode hex in components.

- **primary** (brand, CTAs, accents): warm amber/orange — base `#EA6A1F`, with tints/shades (`50`–`900`). Hover slightly brighter.
- **background:** warm near-black charcoal `#15110D` for the page; a touch lighter `#1E1812` for raised areas.
- **surface / cards:** `#241D16` (warm dark brown-charcoal), subtle warm border `#3A2F24`. Featured/framed cards get a soft amber glow (e.g. `ring-1 ring-primary/40` + soft shadow).
- **ink / text:** warm off-white `#F5EEE6` for body; muted warm tan `#A89A88` for secondary text.
- **accent:** fresh green `#4FB06A` for positive/success moments (slightly brighter so it reads on dark).
- Headings/wordmark: a **serif display** face (e.g. Playfair Display or similar) via `next/font`. Body: friendly sans (Inter/Nunito). Headings can use uppercase tracking for section titles.
- Cards: `rounded-2xl`, soft shadow, real padding (`p-4`/`p-5`). Food image fills the top or side of the card edge-to-edge.

## Order-status badges (shared, identical across ALL portals)

Build ONE `<StatusBadge status={...} />` component and reuse it everywhere an order status appears. These are bright pills that pop against the dark surface — fixed colors, do not vary per portal:

| status | label | color intent (Tailwind) |
|---|---|---|
| `pending` | Pending | amber — `bg-amber-400/20 text-amber-300` |
| `accepted` | Accepted | blue — `bg-blue-400/20 text-blue-300` |
| `out_for_delivery` | Out for delivery | indigo — `bg-indigo-400/20 text-indigo-300` |
| `delivered` | Delivered | green — `bg-green-400/20 text-green-300` |
| `cancelled` | Cancelled | gray — `bg-gray-400/15 text-gray-400` |

Pill shape (`rounded-full`), small text, comfortable horizontal padding.

## Currency — always NGN

All money displays in Nigerian Naira. Use a single shared helper, never manual concatenation, and never leave demo `$` prices in:

```ts
export const formatNaira = (n: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(n);
```

Seed/demo data must use NGN amounts and a local context — do NOT ship placeholder US locations (e.g. "San Francisco, CA") or USD prices.

## Mobile-first (non-negotiable)

Riders and customers are on phones. Design at the smallest breakpoint first, then scale up with `sm:`/`md:`/`lg:` into the richer multi-column desktop layout (e.g. menu grid + "Your Orders" sidebar). Tap targets ≥ 44px. Primary actions (Add to cart, Accept delivery, Mark delivered, Send message) must be reachable with one thumb — prefer bottom-anchored buttons/bars on mobile. No fixed pixel widths on containers; use Flex/Grid and fluid widths.

## Portal shell

Each portal shares one layout: a top bar (serif CafeRoute wordmark + role label + user menu/sign-out) on the dark surface, and a content area. Keep the shell consistent; only the nav items differ per role. The role label should be obvious (a small amber pill: "Rider", "Owner").

## Required states (don't ship a screen without them)

Every data-driven screen needs three states:
- **Loading:** skeleton placeholders matching the content shape (dark shimmer), not a bare spinner where a list will be.
- **Empty:** friendly, on-theme copy + a next action. E.g. rider pool empty → "No deliveries waiting right now — check back soon." Cart empty → "Your cart's empty. Add something tasty."
- **Error:** plain message + retry, never a raw stack trace.

Confirm actions with **toasts** (order placed, accepted, delivered, message sent).

## Accessibility (a11y)

- Semantic HTML: real `<button>`, `<nav>`, `<main>`, `<form>` — never a clickable `<div>`.
- Maintain WCAG AA contrast on the DARK theme: warm off-white text on charcoal passes easily; check that muted tan secondary text and amber-on-dark still meet AA, and that the amber button uses dark `#15110D` text (not white) if white fails AA on it.
- All inputs have associated `<label>`s; icon-only buttons get `aria-label`.
- Visible focus rings (amber glow); don't remove outlines without replacing them.

## Component architecture

- Keep presentational components separate from data/state. Pages/Server Components fetch from Supabase; dumb UI components receive props.
- Shared components live in `components/` (e.g. `StatusBadge`, `OrderChat`, `MenuItemCard`, `PortalShell`, `EmptyState`). Reuse, don't re-implement per portal.
- Theme only through `tailwind.config.ts` tokens — no inline hex, no magic numbers repeated across files.

## When to apply

Load these rules whenever building or editing any frontend page or component, adding/refactoring Tailwind styles, or implementing shared UI (badges, chat, cards, shells, empty/loading/error states) in this project.
