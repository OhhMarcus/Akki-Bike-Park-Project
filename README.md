# AKKI Bike Park · 丫髻山地單車樂園 — clickable demo

A pitch demo with both sides of the product:

- **Public site** riders use to book: lessons, pump track sessions, events & races, AKKI Bike Club, visit info.
- **Admin dashboard** (`/admin`) the park uses to run everything: today's sessions, bookings from every source, manual entry, schedule, weather closures, events, riders, stats.

Everything runs in the browser with realistic **sample data** (relative to today, next 4 weeks). No real payments, no real login. Amber **SWAP** markers show every placeholder; the "Demo · sample data" badge in the footer toggles them on and off.

## Run it

Needs Node 20+.

```bash
npm install
npm run dev        # http://localhost:3000
```

Production build: `npm run build && npm start`. Type check: `npm run typecheck`.

The admin opens straight into demo mode at **http://localhost:3000/admin** (no login). Public site and admin share the same browser storage, so a booking made on the site appears in the admin instantly (also across tabs). **Admin → Reset demo data** restores the sample data.

## 5-minute demo script

1. **Home**: the hero status card is live: open/closed, temperature, HK Observatory warning, next free session, countdown to the next race. Toggle **EN / 繁** in the nav (instant, remembered).
2. **Pump Track**: swipe the 14-day strip (phone) or use the week grid (desktop). Tap a slot → riders + rentals → pay (mock FPS / PayMe / card) → confirmed, usually in well under 30 seconds.
3. **Lessons**: Foundation or Advanced → available dates highlighted → "3 of 8 left" time slots → rider details (height → bike size) → waiver signed with a finger → mock payment → confirmation with add-to-calendar and WhatsApp. The 5-class pack is offered at step one.
4. **Admin → Today**: the booking you just made is in today's roster with rental bikes by size.
5. **Admin → Add booking**: enter a Klook or WhatsApp booking into the same calendar; try to overbook a full slot and see it blocked.
6. **Admin → Weather closure**: close the park for a Typhoon Signal No. 8 window, see the affected bookings and the bilingual rider message, send it (demo). The public pump track shows those slots as Closed and the hero card shows the warning. Reopen to undo.
7. **Admin → Events / Riders / Stats**: bilingual event editor, rider history and class packs, occupancy heatmap and bookings by source.

## Swap in the real details

| What | Where |
| --- | --- |
| Address, map search, MTR station, WhatsApp number, email, social links, prices, club fee | `src/config/site.ts` (one file; set each `placeholder: false` when confirmed) |
| Opening hours, session length, riders per session, recurring lesson times | `src/config/schedule.ts` (defaults) and live in **Admin → Schedule** |
| Lessons copy, 5-class pack, coach names/roles | `src/content/catalogue.ts` |
| Sample events | `src/content/events.ts` (or create real ones in **Admin → Events**) |
| All text, both languages, incl. month/weekday names and date/time formats | `src/i18n/messages/*.ts` (`"key": m("English", "中文")`) |
| Photos | Drop files into `public/images/` named after the slot (see `public/images/README.md`); no code changes |
| Waiver wording | `book.waiver.*` in `src/i18n/messages/book.ts` |

**Location check:** the brief places the park in Sheung Shui near Shek Wu San Tsuen, which is what the demo shows. The earlier research pack (and the name 丫髻山) pointed to Ha Mei San Tsuen, Ping Shan, Yuen Long. Confirm with AKKI and edit `site.location` in `src/config/site.ts`.

## Brand system

- Logo: `public/brand/akki-logo.png` (wordmark cut from the supplied artwork onto transparent) and `akki-logo-nav.png` (72 px tall for the 36 px nav). Never recoloured or stretched.
- Pattern: `public/brand/pattern.svg`, a seamless tile recreating the logo background (interlocking tribar triangles in rows with black bands, greys #2B2A2A–#3E3C3C on #080808). Regenerate it with `python3 scripts/generate-pattern.py` (tweak proportions and greys at the bottom of the script).
- Gradient `#A85FA8 → #C8829A → #EBB04A → #D8CF94 → #6FB1C6` is a highlighter only: primary buttons, selected dates, availability bars, one word per headline, focus rings, admin charts.
- Type: Barlow Condensed ExtraBold Italic (headlines, uppercase), Inter (body), Noto Sans TC (Chinese; Black for headlines, never fake-italic, no letter-spacing).
- Tokens: `tailwind.config.ts`, utilities: `src/app/globals.css`.

## Architecture

```
src/
  app/(site)/        public pages (layout adds header, footer, sticky Book bar, WhatsApp button)
  app/admin/         admin screens (AdminShell)
  components/        ui/ brand/ layout/ calendar/ booking/ + one folder per area
  config/            site.ts (placeholders), schedule.ts (hours, slots, capacity, lesson times)
  content/           catalogue (lessons, pack, coaches), sample events
  i18n/              dictionary + formatters (dates, times, money, plurals) + EN/繁 provider
  lib/
    schedule.ts      pure engine: weekly rules + blocks + bookings → sessions/slots with capacity & status
    services.ts      every write (book, move, edit, cancel, close park, events, packs) — re-checks capacity, so nothing double-books
    store.ts         demo persistence (localStorage), shared by site + admin, sample data refreshed daily
    seed.ts          deterministic sample riders/bookings (3 weeks history, 4 weeks ahead)
  types/             Lesson, Session, PumpTrackSlot, Booking (+source), ParkEvent, Rider, …
supabase/schema.sql  matching Postgres schema for the real thing
```

### Connecting the real services later

- **Database**: create the tables in `supabase/schema.sql`. Replace `getState`/`setState` in `src/lib/store.ts` with API calls of the same shapes, and run the `services.ts` checks inside a transaction (`select … for update` on the slot) so concurrent bookings can't overbook.
- **Payments**: `PaymentPicker` is the seam. Create the payment intent server-side (Stripe for cards/Apple Pay/Google Pay; PayMe for Business; FPS via the bank's QR), confirm by webhook, then mark the booking paid. The demo never collects card numbers.
- **WhatsApp**: confirmations and weather-closure messages map to WhatsApp Business Platform templates (one EN, one 繁中); the closure screen already produces both texts.
- **Klook**: bookings carry `source` and `externalRef`; a Klook channel-manager feed or manual entry in Admin → Add booking keeps them in the same capacity pool.
- **Weather**: replace `src/lib/weather.ts` with the HK Observatory open data API (current weather + warning summary).
- **Login**: add staff accounts with roles before `/admin` goes live.

## Deploy (put the demo online)

1. Sign in at [vercel.com](https://vercel.com) with GitHub.
2. **Add New → Project**, import `OhhMarcus/Akki-Bike-Park-Project`, keep the Next.js preset and every default, and click **Deploy**.
3. The site is live at `https://<project-name>.vercel.app` (dashboard at `/admin`). Every push to the branch redeploys.

No environment variables are needed: share links, canonical tags and link previews use the Vercel address automatically. Set `NEXT_PUBLIC_SITE_URL` once there is a custom domain. While the demo shows placeholder prices and contact details it sends `noindex`, so search engines skip it; set `SITE_INDEXABLE=true` for the real launch.

Demo data lives in each visitor's browser: a booking made on one device shows in the admin on that same browser, not on other devices.
