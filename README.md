# AKKI Bike Park / 丫髻山地單車樂園

Bilingual (繁體中文 default + English) website, booking prototype, events system, staff admin demo and private sales proposal for AKKI Bike Park, Hong Kong.

Built with Next.js 15 (App Router), TypeScript, Tailwind CSS, Radix/shadcn-style components, Lucide, Framer Motion, Zod. Supabase-ready; runs **fully locally** with mock data + `localStorage` when no environment variables are set.

> This is a demonstration prototype. Prices, events, opening hours, trail data, testimonials and instructors are **placeholders**, clearly marked with amber `DEMO` labels. Nothing is charged; no card data is ever collected.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
npm run typecheck    # tsc --noEmit
npm run build && npm start
```

No `.env` is required. Optionally copy `.env.example` to `.env.local`.

### Demo credentials

| Area | URL | Login |
| --- | --- | --- |
| Admin dashboard | `/admin` | `admin@akki-demo.hk` / `akki-demo-2025` |
| Private sales proposal (not linked publicly) | `/proposal` | none |
| Look up a seeded booking | `/my-bookings` | reference `AKKI-DEMO01`, email `rider1@example.com` |
| Demo promo codes | Booking → Review | `FIRSTRIDE` (10%), `AKKI50` (HK$50 off) |

Use **Admin → Reset demo data** to clear everything stored in the browser.

## Route map

| Route | Purpose |
| --- | --- |
| `/` | Hero + park status, quick booking, audiences, events, coaching, gallery, location, CTA |
| `/park` | Interactive trail/facility map, difficulty filters, safety and gear guidance |
| `/booking` | 6-step booking: experience → date/time → riders → review → payment (demo) → confirmation |
| `/my-bookings` | Booking list, lookup, cancel / change requests |
| `/events`, `/events/[slug]` | Event list + calendar, filters, detail, registration, WhatsApp share, .ics |
| `/coaching` | Programmes + "which programme suits me?" questionnaire |
| `/groups` | Schools, youth, corporate, birthdays, private groups, brand days; quote enquiry |
| `/visit`, `/contact` | Directions, hours, rules, FAQ, checklist; enquiry form |
| `/privacy`, `/terms`, `/cancellation`, `/waiver` | Legal placeholders |
| `/admin/*` | Protected demo dashboard (bookings, customers, events, coaching, capacity, content, enquiries, promotions, memberships) |
| `/proposal` | Private commercial proposal for AKKI management (`noindex`, not in navigation) |
| `/api/*` | Zod-validated, sanitised, rate-limited endpoints |

## Architecture

```
src/
  app/                 Routes. (site)/ has the public header/footer; admin/ and proposal/ have own layouts
    api/               bookings, enquiries, group-enquiries, waitlist, newsletter, payments/intent
  components/
    ui/                shadcn-style primitives (Button, Input, Modal, Accordion, Toast…)
    common/ layout/    shared building blocks, navigation, footer, sticky mobile Book Now
    home/ park/ booking/ events/ coaching/ groups/ visit/ contact/ admin/ proposal/
  config/
    site.ts            ★ ALL unverified business info: address, phone, email, hours, social, session times
    pricing.ts         ★ DEMO prices, add-ons, membership tiers
    proposal.ts        ★ Editable proposal pricing placeholders
  content/             Demo events, coaching programmes, trails, seed bookings, FAQ, testimonials
  i18n/
    messages/*.ts      ★ Every UI string as { en, zh } side by side, one file per area
    dictionary.ts      Merges the message files; keys are type-checked
  lib/                 store (localStorage), availability, pricing, validation (zod), sanitize, ratelimit, supabase, payments, seo, jsonld
  types/               Domain types (User, RiderProfile, Guardian, Booking, TimeSlot, Experience, Event, …)
supabase/schema.sql    Postgres schema + row-level security matching the types
```

### Data flow

1. The browser validates with a shared Zod schema, then POSTs to an API route.
2. The route re-validates, sanitises, rate-limits, and (if Supabase env vars exist) inserts into Supabase.
3. On success the browser also stores the record in `localStorage` (`src/lib/store.ts`), which powers My Bookings and the admin demo. Collections stay on seed content until first edited, so demo dates are always relative to today.

## Replacing mock content

1. **Business facts** → edit `src/config/site.ts`, then set `verified: true` on each block (JSON-LD only emits verified address/phone).
2. **Prices** → `src/config/pricing.ts` (later: `experiences` table).
3. **Copy, both languages** → `src/i18n/messages/<area>.ts`. Content objects (events, programmes, trails) use `{ en, zh }` pairs in `src/content/*.ts`.
4. **Events** → add real ones in Admin → Events (untick "Demo") or edit `src/content/events.ts`. Only non-demo events receive Event structured data and countdowns.
5. **Photos** → drop files in `public/` and pass `src="/your.jpg"` to `PhotoPlaceholder` (or replace the component with `next/image`). Always keep descriptive `alt` text.
6. **Trails / map** → `src/content/trails.ts`; put the official PDF at `public/akki-park-map.pdf` and set `parkMapPdf.available = true`.
7. **Testimonials** → `src/content/testimonials.ts` (only real, permissioned quotes).
8. Hide amber demo labels for launch: `NEXT_PUBLIC_SHOW_DEMO_LABELS=false`.

## Going live

### Supabase
1. Create a project, run `supabase/schema.sql`.
2. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server only).
3. API routes then persist automatically. Replace `useStored(...)` reads in `src/lib/store.ts` with Supabase queries and replace the demo admin login with Supabase Auth plus a role check (`users.role in ('staff','admin')`) and RLS policies.

### Payments
`src/lib/payments.ts` and `/api/payments/intent` are the seam. Recommended: Stripe (cards, Apple/Google Pay, Alipay HK, WeChat Pay, FPS availability depends on account region and approval; confirm with the provider) using hosted Checkout or Elements. Create the PaymentIntent server-side, confirm via a signed webhook (`STRIPE_WEBHOOK_SECRET`), recompute prices from the database, and lock slot capacity in a transaction. Never accept card numbers in this app's own inputs.

### Deploy to Vercel
1. Push to GitHub, import the repo in Vercel (framework preset: Next.js, no build overrides).
2. Add environment variables from `.env.example`. Set `NEXT_PUBLIC_SITE_URL` to the production URL (used by sitemap, canonical URLs, Open Graph).
3. Replace the in-memory rate limiter in `src/lib/ratelimit.ts` with Upstash Redis (serverless instances do not share memory).

## Security & privacy notes

- Shared Zod validation client + server; text sanitised (`src/lib/sanitize.ts`); CSV export neutralises formula injection; honeypot fields; per-IP rate limits on booking, enquiry, waitlist, newsletter, proposal endpoints.
- Security headers in `next.config.mjs`. Secrets only in env vars; the service-role key is server-only.
- No card data stored or transmitted by this app. Waiver + guardian consent captured per booking for minors.
- Consent checkboxes on every form that collects personal data; privacy/terms pages are placeholders for legal review. This prototype does not claim PDPO compliance; have counsel review before launch.

## Known prototype limits

- Availability is deterministic mock data plus local bookings; real capacity locking needs the database.
- Admin auth is a demo gate in the browser (not secure).
- Email confirmations, WhatsApp Business messaging and live payments are simulated.
- Weather is a placeholder.
