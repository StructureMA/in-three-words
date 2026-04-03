# In a Few Words — Platform Design Spec

**Date:** 2026-04-03
**Status:** Approved

---

## Overview

"In a Few Words" is a recurring art project where strangers commission original acrylic paintings by providing 2–4 words as creative direction. One entry is selected each week, the artist paints an original piece, and a portion of every sale goes to a rotating charity. The buyer receives the one-and-only original, shipped to their door.

This spec covers the full-featured web platform — replacing the current static landing page with a Next.js application that handles submissions, automated notifications, payments, gallery, and admin management.

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js (App Router) | Full-stack: public site + admin |
| Database | Supabase (Postgres) | Free tier sufficient at launch volume |
| Auth | Supabase Auth | Single admin account, RLS on admin operations |
| SMS | Resend | Clean API, US numbers, ~$0.01/message |
| Payments | Stripe | Card payments; Venmo/PayPal tracked manually |
| Hosting | Vercel | Free tier for personal projects |
| Image Storage | Supabase Storage | Painting photos, donation receipts |

**Estimated monthly cost at launch:** ~$3–5/month (Resend SMS + Stripe fees on card payments only)

---

## Public Pages

### `/` — Homepage

Focused landing page with the following sections in order:

1. **Nav** — Logo ("In a Few Words"), links to Gallery, About, Enter
2. **Hero** — "Give me three words. I'll paint *you* a painting." + tagline: "Tell me 2–4 words — they'll guide the painting."
3. **"Painting Now" banner** — Current week's entry: name, location, words. Self-contained — no other CTAs inside this box.
4. **"Enter for next week" CTA** — Button linking to `/enter`, with a live countdown underneath showing days/hours/minutes until entries close (Saturday at midnight). Three states:
   - **Mon–Sat (open):** Countdown timer + "Entries close Saturday at midnight"
   - **Sat night–Sun (closed):** "Entries closed — entry announced Sunday"
   - **Sunday night (reset):** Fresh countdown + "New week — entries are open!"
5. **How it works** — 5-step visual breakdown
6. **Charity banner** — "Art that gives back"
7. **Footer**

### `/enter` — Entry Form

Fields:
- **Words** — 4 input fields in a row. First 2 required, last 2 optional. Example shown once above the fields: *(ex. purple, elephant, ethereal, humble)*
- **Name** — required
- **Phone** — required (for SMS notification)
- **Size preference** — radio: Small (up to 11×14) / Medium (12×16 – 24×36)

No shipping address collected here — that comes after payment.

Form validates: minimum 2 words, name, and phone required. Shows confirmation on success.

### `/gallery` — Past Paintings

Grid of completed paintings. Each card shows:
- Painting photo
- The 2–4 words
- Buyer name (first name, last initial) and city/state
- Charity that benefited

### `/pay/[token]` — Checkout Page

Accessed only via the SMS link sent to the selected entry. Token-based access:
- Unique, unguessable token tied to a specific selection
- Only works during the active 3-hour payment window
- Expires after payment or window close
- Shows "This link has expired" to anyone outside the window

**Single-page checkout flow:**
- **Payment section:** Stripe card payment OR Venmo/PayPal instructions (buyer's choice)
- **Shipping section:** Street address, city, state, zip (US only)
- **One "Confirm" button** to submit both

### `/faq` — FAQ Page

Standalone page with expandable Q&A items (same content as current landing page FAQ).

### `/pricing` — Pricing Page

Two-tier pricing cards:
- Small (up to 11×14): $20, $5 to charity
- Medium (12×16 – 24×36): $25, $7 to charity

### `/terms` — Terms & Stuff

Section header: "Terms & Stuff" (intentionally casual to match brand voice).

Rules:
1. Must be 18 or older to enter
2. Entry is free — no purchase necessary
3. One entry per person per week
4. Entries do not roll over — submit fresh each week
5. One entry is selected at random each Sunday
6. If selected, you must confirm and pay within 3 hours or the next person is drawn
7. Paintings are the artist's original interpretation — no revision requests
8. US shipping addresses only
9. Entries accept 2–4 words
10. By entering, you agree to be featured on social media (first name, last initial, city/state)
11. The artist reserves the right to skip or modify any week's selection

---

## Admin Pages

All admin pages behind Supabase Auth (single admin account). Dark nav bar to visually distinguish from public site.

### `/admin` — Dashboard

**Top bar:** Current week label + overall status ("Painting in progress", "Awaiting selection", etc.)

**Stats row (4 cards):**
- This week's entries (count)
- Total paintings (all time)
- Total donated (all time, dollar amount)
- Entries close in (countdown)

**Two-column layout:**

*Left column — This week's entry card:*
- Name, location, phone number
- Words (as pills/tags)
- Payment status badge (paid/pending + method)
- Size badge
- **Progress tracker** — vertical stepper: Drawn → Notified → Confirmed & Paid → Painting → Shipped → Posted to Gallery. Current step highlighted, completed steps checked.
- **Action buttons** — contextual to current step:
  - "Upload painting photo" (during painting step)
  - "Mark as shipped" → opens form: shipping provider (dropdown), tracking number, expected arrival date
  - "Post to gallery" (after shipped)

*Right column:*
- **Charity this week** — name, donation amount (pre-filled from size), "Mark donated" button → opens form: charity name (pre-filled), donation amount (pre-filled), date, receipt upload (image/PDF). Also "Change charity" button.
- **Next week's entries** — live preview list showing name, words, and time submitted. "View all →" links to `/admin/entries`.

### `/admin/entries` — Entry Management

Table/list of all entries for the selected week. Columns: name, phone, words, size, submitted date.

**"Draw an entry" button** — system picks one at random, shows the result for review. Admin approves before SMS is sent (semi-automated flow).

Week selector to view past weeks' entries.

### `/admin/payments` — Payment Tracking

List of all selections with payment status:
- Stripe payments auto-confirmed with timestamp
- Venmo/PayPal: manual "Mark as paid" button with payment method selector

### `/admin/gallery` — Gallery Management

- Upload painting photos
- Add/edit descriptions
- Toggle "featured" visibility on public gallery
- View past paintings with their entry details

### `/admin/charities` — Charity Management

- Set this week's charity (name, URL)
- Log donations with receipt upload
- View donation history: charity name, amount, date, receipt

### `/admin/settings`

- Venmo handle (displayed on payment page)
- Entry open/close schedule
- Site banner text overrides
- Resend SMS configuration

---

## Database Schema

### `entries`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | text | Entrant's name |
| phone | text | For SMS |
| word_1 | text | Required |
| word_2 | text | Required |
| word_3 | text | Optional |
| word_4 | text | Optional |
| size | enum | `small` or `medium` |
| week_of | date | Monday of entry week |
| created_at | timestamp | |

### `selections`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| entry_id | uuid | FK → entries |
| payment_token | text | Unique unguessable token for `/pay/[token]` |
| status | enum | `drawn` → `notified` → `confirmed` → `paid` → `painting` → `shipped` → `posted` |
| notified_at | timestamp | When SMS was sent |
| expires_at | timestamp | 3 hours after notified_at |
| payment_method | enum | `stripe`, `venmo`, `paypal`, or null |
| payment_confirmed_at | timestamp | |
| shipping_street | text | Collected at checkout |
| shipping_city | text | |
| shipping_state | text | |
| shipping_zip | text | |
| shipping_provider | text | USPS, UPS, FedEx, etc. |
| tracking_number | text | |
| expected_arrival | date | |
| shipped_at | timestamp | |
| created_at | timestamp | |

### `paintings`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| selection_id | uuid | FK → selections |
| image_url | text | Photo of finished painting |
| description | text | Optional artist notes |
| featured | boolean | Show on public gallery |
| created_at | timestamp | |

### `charities`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | text | Charity name |
| url | text | Charity website |
| week_of | date | Which week featured |
| donation_amount | decimal | |
| donated_at | timestamp | |
| receipt_url | text | Uploaded proof of donation |
| created_at | timestamp | |

### `site_settings`

| Column | Type | Notes |
|--------|------|-------|
| key | text | PK (e.g., `venmo_handle`, `entries_open`) |
| value | text | |
| updated_at | timestamp | |

All tables protected by Row Level Security. Public read access only on: entries (count only), paintings (featured), charities, site_settings. All write operations require admin auth.

---

## Key Flows

### Weekly Cycle

1. **Monday:** New week opens. Site countdown resets. Banner updates with last week's completed painting.
2. **Mon–Sat:** Entries come in via `/enter`. Admin can see them in real-time on dashboard.
3. **Saturday midnight:** Entries close. Countdown switches to "Entries closed" state.
4. **Sunday morning:** Admin opens `/admin/entries`, hits "Draw an entry." System picks at random, shows the result.
5. **Admin approves:** SMS fires via Resend with payment link. 3-hour countdown begins on dashboard.
6. **Selected person pays:** Via Stripe (auto-confirmed) or Venmo (admin marks manually). Shipping address collected on the payment page.
7. **If no response in 3 hours:** Admin can draw again from the dashboard.
8. **Admin paints:** Status moves to `painting`.
9. **Admin ships:** "Mark as shipped" → enters provider, tracking, expected arrival.
10. **Admin posts:** Uploads photo to gallery, marks as featured.
11. **Admin donates:** Logs charity donation with receipt upload.
12. **Cycle restarts.**

### Payment Page Access Control

- Token generated on draw, stored in `selections.payment_token`
- URL: `/pay/[token]`
- Valid only when `selections.status` is `notified` or `confirmed` AND `now < expires_at`
- After payment or expiry: shows "This link has expired"
- No authentication required — the token IS the access

### SMS Notification

Sent via Resend when admin approves the drawn entry. Message includes:
- Greeting with their name
- Their words
- Payment link (`/pay/[token]`)
- Venmo option with handle
- 3-hour deadline note

---

## Design Direction

**Brand name:** In a Few Words
**Tagline:** "Original art. A few words. A good cause."

**Typography:**
- Display: Playfair Display (serif) — headlines, hero, banner
- Body: Upgraded from DM Sans to something more characterful (Instrument Sans, Satoshi, or similar) — to be finalized during implementation

**Color palette:**
- Background: `#FAFAF8` (warm off-white)
- Text: `#1A1A1A`
- Muted: `#6B6B6B`
- Accent: `#2E6B8A` (teal)
- Accent light: `#E8F1F5`
- Warm: `#D4A574`
- Cards: `#FFFFFF`
- Border: `#E8E6E3`

**Design principles:**
- Warm, handmade feel — this is about art, not software
- Generous whitespace, breathing room
- Staggered reveal animations on page load
- Smooth countdown timer animation
- Satisfying form micro-interactions
- Admin UI: clean and functional but not sterile — same warmth as public site with dark nav to distinguish

**Multi-page layout:**
- Homepage is focused: hero + painting now + enter CTA + how it works + charity
- Gallery, entry form, FAQ, pricing, and Terms & Stuff each get their own page
- Nav links to all sections

---

## What This Spec Does NOT Cover

- Email notifications (SMS only at launch)
- International shipping
- Print reproductions
- Community charity voting
- User accounts / entry history
- Analytics / tracking
- Mobile app

These are roadmap items that can be specced separately as the project grows.
