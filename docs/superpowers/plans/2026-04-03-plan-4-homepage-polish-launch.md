# Plan 4: Homepage + Polish + Launch

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the dynamic homepage with "Painting Now" banner and live entry countdown, the remaining public pages (FAQ, Pricing, Terms & Stuff), the admin dashboard with stats, admin settings page, and apply design polish across the entire site.

**Architecture:** Completes the remaining pages in the existing Next.js + Supabase setup. Homepage uses server components to fetch current week data. Countdown timer reuses the existing client component pattern. Design polish applies the frontend-design skill principles — distinctive typography, motion, spatial composition.

**Tech Stack:** Next.js 16, Supabase, TypeScript, Tailwind CSS 4

---

## File Structure (new/modified files only)

```
src/
├── app/
│   ├── page.tsx                       # Dynamic homepage (replace placeholder)
│   ├── layout.tsx                     # Updated with public nav
│   ├── faq/
│   │   └── page.tsx                   # FAQ page
│   ├── pricing/
│   │   └── page.tsx                   # Pricing page
│   ├── terms/
│   │   └── page.tsx                   # Terms & Stuff page
│   └── admin/
│       └── (authenticated)/
│           ├── page.tsx               # Full admin dashboard with stats
│           └── settings/
│               └── page.tsx           # Admin settings page
├── components/
│   ├── public-nav.tsx                 # Public site navigation
│   ├── footer.tsx                     # Site footer
│   └── entry-countdown.tsx            # Homepage entry countdown
└── lib/
    └── utils.ts                       # Add getEntriesCloseDate helper
```

---

### Task 1: Build Public Nav and Footer Components

**Files:**
- Create: `src/components/public-nav.tsx`
- Create: `src/components/footer.tsx`
- Modify: `src/app/layout.tsx` — add nav and footer to root layout

The public nav should:
- Show "In a Few Words" logo (Playfair Display, teal)
- Links: Gallery, About, Enter (Enter styled as accent)
- Fixed position, glassmorphism background (blur + semi-transparent)
- Mobile responsive (hamburger or simplified)

The footer should:
- "© 2026 In a Few Words · Original art. A few words. A good cause."
- Simple, centered

Only show the nav/footer on public pages — NOT on admin pages or the payment page. The root layout should conditionally render them, or better yet, use route groups to separate public and admin layouts.

Commit: `feat: add public navigation and footer`

---

### Task 2: Build the Dynamic Homepage

**Files:**
- Rewrite: `src/app/page.tsx`
- Create: `src/components/entry-countdown.tsx`
- Modify: `src/lib/utils.ts` — add `getEntriesCloseDate` helper

The homepage sections (in order per our design):
1. **Hero** — "Give me three words. I'll paint *you* a painting." + tagline
2. **"Painting Now" banner** — fetch current week's selection. Show entry name, location, words as pills. If no selection this week, hide or show "No painting this week"
3. **"Enter for next week" CTA** — button linking to `/enter` with live countdown to Saturday midnight. Three states: open (countdown), closed (Sat night–Sun), reset (new week)
4. **How it works** — 5-step cards
5. **Charity banner** — "Art that gives back" with current week's charity name if set
6. **Footer**

The countdown component should:
- Calculate time until next Saturday at midnight (local time or EST)
- Display as: days : hours : min (like the mockup)
- Show "Entries closed — entry announced Sunday" when past Saturday midnight
- Show "New week — entries are open!" when it resets Monday

Commit: `feat: build dynamic homepage with painting now banner and countdown`

---

### Task 3: Build FAQ, Pricing, and Terms & Stuff Pages

**Files:**
- Create: `src/app/faq/page.tsx`
- Create: `src/app/pricing/page.tsx`
- Create: `src/app/terms/page.tsx`

**FAQ page** — expandable Q&A items. Use the same questions from the existing static HTML:
1. Does it cost anything to enter?
2. What kind of words should I pick?
3. How is the selection made?
4. Do I get to approve the painting first?
5. Is this really the original painting?
6. Can I enter every week?
7. Which charity does the donation go to?
8. Do you ship outside the US?

**Pricing page** — two pricing cards:
- Small (up to 11×14): $20, $5 to charity
- Medium (12×16 – 24×36): $25, $7 to charity
- Each card lists: Original acrylic painting, Your words interpreted, Shipped anywhere in the US, Featured on social media

**Terms & Stuff page** — titled "Terms & Stuff" (not "Terms and Conditions"):
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

All pages should use Playfair Display for headings, consistent styling with the rest of the site.

Commit: `feat: add FAQ, pricing, and Terms & Stuff pages`

---

### Task 4: Build Admin Dashboard with Stats

**Files:**
- Rewrite: `src/app/admin/(authenticated)/page.tsx`

Replace the placeholder dashboard with the full version:
- **Week status bar** — current week label + status text (e.g., "Painting in progress", "Awaiting entries")
- **Stats row (4 cards):** This week's entry count, Total paintings (all time), Total donated (all time $), Entries close in (countdown)
- **Two-column layout:**
  - Left: This week's entry card (if drawn) — name, phone, words, payment status, progress tracker
  - Right: Current charity card + next week's entries preview

Fetch all needed data server-side from Supabase.

Commit: `feat: build full admin dashboard with stats and weekly overview`

---

### Task 5: Build Admin Settings Page

**Files:**
- Create: `src/app/admin/(authenticated)/settings/page.tsx`
- Create: `src/app/admin/(authenticated)/settings/settings-form.tsx` (client component)
- Create: `src/actions/settings.ts`

The settings page should let the admin update:
- Venmo handle
- Whether entries are currently open/closed (manual override)

Server action `updateSetting(key, value)` — authenticates admin, updates site_settings table.

Client component with form fields for each setting, save button.

Commit: `feat: add admin settings page`

---

### Task 6: Final Verification and Cleanup

- [ ] TypeScript check: `npx tsc --noEmit`
- [ ] Lint: `npm run lint`
- [ ] Fix any issues
- [ ] Push and create PR
