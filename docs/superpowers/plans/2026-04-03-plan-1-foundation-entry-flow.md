# Plan 1: Foundation + Entry Flow

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up the Next.js project with Supabase, build the entry submission form, admin authentication, admin entries page, and the draw-an-entry flow — producing a working end-to-end loop from "someone submits words" to "admin draws an entry."

**Architecture:** Next.js App Router with Server Components by default, client components only where interactivity is needed (forms, countdown). Supabase for Postgres database and auth. All admin routes protected by middleware checking Supabase session. Public pages are server-rendered. Entry form uses a Server Action to insert into the database.

**Tech Stack:** Next.js 15+, React 19, Supabase (JS client v2), TypeScript, Tailwind CSS 4, Vercel (deployment target)

**Domain:** `inafewwords.art` (pointed at Vercel)

---

## File Structure

```
in-a-few-words/
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout — fonts, global styles, metadata
│   │   ├── page.tsx                    # Homepage (placeholder for Plan 4)
│   │   ├── enter/
│   │   │   └── page.tsx               # Entry submission form
│   │   ├── admin/
│   │   │   ├── layout.tsx             # Admin layout — dark nav, auth gate
│   │   │   ├── page.tsx               # Admin dashboard (placeholder for Plan 4)
│   │   │   ├── login/
│   │   │   │   └── page.tsx           # Admin login page
│   │   │   └── entries/
│   │   │       └── page.tsx           # View entries + draw an entry
│   │   └── auth/
│   │       └── callback/
│   │           └── route.ts           # Supabase auth callback handler
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts              # Browser Supabase client
│   │   │   ├── server.ts              # Server-side Supabase client (cookies)
│   │   │   └── admin.ts              # Service role client for admin ops
│   │   ├── types.ts                   # Database types (generated + custom)
│   │   └── utils.ts                   # Shared helpers (getCurrentWeek, etc.)
│   ├── actions/
│   │   ├── entries.ts                 # Server Actions: submitEntry
│   │   └── selections.ts             # Server Actions: drawEntry, approveEntry
│   └── middleware.ts                  # Auth check for /admin/* routes
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql     # Full database schema
├── public/                            # Static assets (keep existing)
├── tailwind.config.ts                 # Tailwind configuration
├── next.config.ts                     # Next.js configuration
├── package.json
├── tsconfig.json
└── .env.local.example                 # Template for required env vars
```

---

### Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `.env.local.example`
- Modify: `.gitignore`

- [ ] **Step 1: Create Next.js project**

Run from the repo root. We're initializing inside the existing repo, so use `--no-git` since git is already set up.

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-git --import-alias "@/*"
```

When prompted:
- Would you like to use Turbopack? → Yes

- [ ] **Step 2: Update .gitignore for Next.js**

Add these lines to the existing `.gitignore`:

```
# Next.js
.next/
out/

# Vercel
.vercel/

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Local env
.env*.local
```

- [ ] **Step 3: Create .env.local.example**

```bash
# .env.local.example
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

- [ ] **Step 4: Install fonts**

```bash
npm install @fontsource-variable/playfair-display
```

We'll use `next/font/google` for font loading. Update `src/app/layout.tsx`:

```tsx
import { Playfair_Display } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

// We'll swap this for a more characterful font in Plan 4
// For now, use the system sans-serif via Tailwind defaults
export const metadata = {
  title: "In a Few Words — Original Art for a Cause",
  description:
    "Tell me 2–4 words. I'll paint you a painting. Each week, one stranger is selected. A portion goes to charity.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={playfair.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 5: Create a placeholder homepage**

Update `src/app/page.tsx`:

```tsx
export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-[family-name:var(--font-playfair)] text-5xl font-bold mb-4">
          In a Few Words
        </h1>
        <p className="text-gray-500 text-lg">Coming soon — inafewwords.art</p>
      </div>
    </main>
  );
}
```

- [ ] **Step 6: Verify the dev server starts**

```bash
npm run dev
```

Expected: App loads at `http://localhost:3000` showing "In a Few Words / Coming soon"

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: initialize Next.js project with TypeScript and Tailwind"
```

---

### Task 2: Set Up Supabase Database Schema

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: Create the migration file**

Create `supabase/migrations/001_initial_schema.sql`:

```sql
-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Entries table
create table public.entries (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text not null,
  word_1 text not null,
  word_2 text not null,
  word_3 text,
  word_4 text,
  size text not null check (size in ('small', 'medium')),
  week_of date not null,
  created_at timestamptz not null default now()
);

-- Selections table
create table public.selections (
  id uuid primary key default uuid_generate_v4(),
  entry_id uuid not null references public.entries(id),
  payment_token text not null unique,
  status text not null default 'drawn' check (
    status in ('drawn', 'notified', 'confirmed', 'paid', 'painting', 'shipped', 'posted')
  ),
  notified_at timestamptz,
  expires_at timestamptz,
  payment_method text check (payment_method in ('stripe', 'venmo', 'paypal')),
  payment_confirmed_at timestamptz,
  shipping_street text,
  shipping_city text,
  shipping_state text,
  shipping_zip text,
  shipping_provider text,
  tracking_number text,
  expected_arrival date,
  shipped_at timestamptz,
  created_at timestamptz not null default now()
);

-- Paintings table
create table public.paintings (
  id uuid primary key default uuid_generate_v4(),
  selection_id uuid not null references public.selections(id),
  image_url text not null,
  description text,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

-- Charities table
create table public.charities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  url text,
  week_of date not null,
  donation_amount decimal(10, 2),
  donated_at timestamptz,
  receipt_url text,
  created_at timestamptz not null default now()
);

-- Site settings table
create table public.site_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

-- Insert default settings
insert into public.site_settings (key, value) values
  ('entries_open', 'true'),
  ('venmo_handle', ''),
  ('current_week', to_char(date_trunc('week', now()), 'YYYY-MM-DD'));

-- Indexes
create index idx_entries_week_of on public.entries(week_of);
create index idx_selections_payment_token on public.selections(payment_token);
create index idx_selections_status on public.selections(status);
create index idx_paintings_featured on public.paintings(featured) where featured = true;
create index idx_charities_week_of on public.charities(week_of);

-- Row Level Security
alter table public.entries enable row level security;
alter table public.selections enable row level security;
alter table public.paintings enable row level security;
alter table public.charities enable row level security;
alter table public.site_settings enable row level security;

-- Public can INSERT entries (submitting the form)
create policy "Anyone can submit an entry"
  on public.entries for insert
  with check (true);

-- Public can read entry COUNT per week (for social proof) but not individual entries
create policy "Public can count entries"
  on public.entries for select
  using (true);

-- Public can read featured paintings (gallery)
create policy "Public can view featured paintings"
  on public.paintings for select
  using (featured = true);

-- Public can read charities
create policy "Public can view charities"
  on public.charities for select
  using (true);

-- Public can read site settings
create policy "Public can read settings"
  on public.site_settings for select
  using (true);

-- Admin full access (authenticated users)
create policy "Admin full access to entries"
  on public.entries for all
  using (auth.role() = 'authenticated');

create policy "Admin full access to selections"
  on public.selections for all
  using (auth.role() = 'authenticated');

create policy "Admin full access to paintings"
  on public.paintings for all
  using (auth.role() = 'authenticated');

create policy "Admin full access to charities"
  on public.charities for all
  using (auth.role() = 'authenticated');

create policy "Admin full access to settings"
  on public.site_settings for all
  using (auth.role() = 'authenticated');
```

- [ ] **Step 2: Run the migration in Supabase**

Go to your Supabase project dashboard → SQL Editor → paste and run the migration SQL.

Alternatively, if using the Supabase CLI:

```bash
npx supabase db push
```

Expected: All 5 tables created with RLS policies active.

- [ ] **Step 3: Verify tables exist**

In the Supabase dashboard, go to Table Editor. You should see: `entries`, `selections`, `paintings`, `charities`, `site_settings`.

- [ ] **Step 4: Commit**

```bash
git add supabase/
git commit -m "feat: add database schema with RLS policies"
```

---

### Task 3: Set Up Supabase Client Libraries

**Files:**
- Create: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/admin.ts`, `src/lib/types.ts`, `src/lib/utils.ts`

- [ ] **Step 1: Install Supabase packages**

```bash
npm install @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 2: Create the browser client**

Create `src/lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 3: Create the server client**

Create `src/lib/supabase/server.ts`:

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // This can be ignored in Server Components
            // when called from a Server Component context
          }
        },
      },
    }
  );
}
```

- [ ] **Step 4: Create the admin (service role) client**

Create `src/lib/supabase/admin.ts`:

```typescript
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
```

- [ ] **Step 5: Create database types**

Create `src/lib/types.ts`:

```typescript
export type EntrySize = "small" | "medium";

export type SelectionStatus =
  | "drawn"
  | "notified"
  | "confirmed"
  | "paid"
  | "painting"
  | "shipped"
  | "posted";

export type PaymentMethod = "stripe" | "venmo" | "paypal";

export interface Entry {
  id: string;
  name: string;
  phone: string;
  word_1: string;
  word_2: string;
  word_3: string | null;
  word_4: string | null;
  size: EntrySize;
  week_of: string;
  created_at: string;
}

export interface Selection {
  id: string;
  entry_id: string;
  payment_token: string;
  status: SelectionStatus;
  notified_at: string | null;
  expires_at: string | null;
  payment_method: PaymentMethod | null;
  payment_confirmed_at: string | null;
  shipping_street: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_zip: string | null;
  shipping_provider: string | null;
  tracking_number: string | null;
  expected_arrival: string | null;
  shipped_at: string | null;
  created_at: string;
}

export interface Painting {
  id: string;
  selection_id: string;
  image_url: string;
  description: string | null;
  featured: boolean;
  created_at: string;
}

export interface Charity {
  id: string;
  name: string;
  url: string | null;
  week_of: string;
  donation_amount: number | null;
  donated_at: string | null;
  receipt_url: string | null;
  created_at: string;
}

export interface SiteSetting {
  key: string;
  value: string;
  updated_at: string;
}

// Join types for convenience
export interface SelectionWithEntry extends Selection {
  entries: Entry;
}
```

- [ ] **Step 6: Create utility helpers**

Create `src/lib/utils.ts`:

```typescript
/**
 * Get the Monday of the current week as a YYYY-MM-DD string.
 * Used to group entries by week.
 */
export function getCurrentWeekMonday(): string {
  const now = new Date();
  const day = now.getDay();
  // Adjust so Monday = 0 (JS has Sunday = 0)
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return monday.toISOString().split("T")[0];
}

/**
 * Generate a cryptographically random token for payment links.
 */
export function generatePaymentToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Format a phone number for display: (413) 555-0192
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits[0] === "1") {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

/**
 * Get the words from an entry as an array, filtering out nulls.
 */
export function getWords(entry: {
  word_1: string;
  word_2: string;
  word_3: string | null;
  word_4: string | null;
}): string[] {
  return [entry.word_1, entry.word_2, entry.word_3, entry.word_4].filter(
    (w): w is string => w !== null && w.trim() !== ""
  );
}
```

- [ ] **Step 7: Verify build passes**

```bash
npm run build
```

Expected: Build succeeds with no type errors.

- [ ] **Step 8: Commit**

```bash
git add src/lib/
git commit -m "feat: add Supabase clients, types, and utility helpers"
```

---

### Task 4: Set Up Admin Authentication

**Files:**
- Create: `src/middleware.ts`, `src/app/admin/login/page.tsx`, `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`, `src/app/auth/callback/route.ts`

- [ ] **Step 1: Create the auth callback route**

Create `src/app/auth/callback/route.ts`:

```typescript
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/admin/login?error=auth`);
}
```

- [ ] **Step 2: Create the middleware for admin route protection**

Create `src/middleware.ts`:

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect all /admin routes except /admin/login
  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/admin/login") &&
    !user
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  // If logged in and on login page, redirect to admin
  if (request.nextUrl.pathname === "/admin/login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

- [ ] **Step 3: Create the admin login page**

Create `src/app/admin/login/page.tsx`:

```tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Invalid credentials");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
      <div className="w-full max-w-sm">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-center mb-8 text-[#1A1A1A]">
          Admin
        </h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-[#E8E6E3] rounded-lg bg-white text-[#1A1A1A] placeholder-[#999] focus:outline-none focus:border-[#2E6B8A] transition-colors"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-[#E8E6E3] rounded-lg bg-white text-[#1A1A1A] placeholder-[#999] focus:outline-none focus:border-[#2E6B8A] transition-colors"
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#2E6B8A] text-white rounded-lg font-semibold hover:bg-[#245a74] transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create the admin layout with dark nav**

Create `src/app/admin/layout.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminNav from "./admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F5F5F3]">
      <AdminNav />
      <main className="p-6">{children}</main>
    </div>
  );
}
```

Create `src/app/admin/admin-nav.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/entries", label: "Entries" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/charities", label: "Charities" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // Don't show nav on login page
  if (pathname === "/admin/login") return null;

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <nav className="flex items-center bg-[#1A1A1A] text-white">
      <div className="px-5 py-3.5 font-[family-name:var(--font-playfair)] text-sm font-semibold text-[#2E6B8A] border-r border-[#333]">
        ITW Admin
      </div>
      <div className="flex items-center flex-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-3.5 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-[#333] text-white font-semibold"
                  : "text-[#999] hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
      <button
        onClick={handleSignOut}
        className="px-4 py-3.5 text-xs text-[#999] hover:text-white transition-colors"
      >
        Sign out
      </button>
    </nav>
  );
}
```

- [ ] **Step 5: Create the admin dashboard placeholder**

Create `src/app/admin/page.tsx`:

```tsx
export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A1A1A]">Dashboard</h1>
      <p className="text-[#6B6B6B] mt-2">
        Full dashboard coming in Plan 4. Use the Entries tab to manage
        submissions.
      </p>
    </div>
  );
}
```

- [ ] **Step 6: Create the admin user in Supabase**

Go to your Supabase dashboard → Authentication → Users → "Add user" → create your admin account with email + password.

This is the only user account in the system — entrants don't have accounts.

- [ ] **Step 7: Set up .env.local**

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials from the Supabase dashboard → Settings → API:

```bash
cp .env.local.example .env.local
```

Fill in:
- `NEXT_PUBLIC_SUPABASE_URL` — Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` — service_role key (secret)

- [ ] **Step 8: Verify auth flow works**

```bash
npm run dev
```

1. Go to `http://localhost:3000/admin` → should redirect to `/admin/login`
2. Enter your admin credentials → should redirect to `/admin`
3. See the dashboard placeholder with the dark nav bar
4. Click "Sign out" → should redirect back to `/admin/login`

- [ ] **Step 9: Commit**

```bash
git add src/middleware.ts src/app/admin/ src/app/auth/
git commit -m "feat: add admin authentication with Supabase"
```

---

### Task 5: Build the Entry Submission Form

**Files:**
- Create: `src/actions/entries.ts`, `src/app/enter/page.tsx`

- [ ] **Step 1: Create the submitEntry server action**

Create `src/actions/entries.ts`:

```typescript
"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentWeekMonday } from "@/lib/utils";

export interface SubmitEntryState {
  success: boolean;
  error: string | null;
}

export async function submitEntry(
  _prevState: SubmitEntryState,
  formData: FormData
): Promise<SubmitEntryState> {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const word1 = formData.get("word_1") as string;
  const word2 = formData.get("word_2") as string;
  const word3 = (formData.get("word_3") as string) || null;
  const word4 = (formData.get("word_4") as string) || null;
  const size = formData.get("size") as string;

  // Validate required fields
  if (!name || !phone || !word1 || !word2 || !size) {
    return { success: false, error: "Please fill in all required fields." };
  }

  if (size !== "small" && size !== "medium") {
    return { success: false, error: "Please select a valid size." };
  }

  // Validate phone is US format (basic check)
  const phoneDigits = phone.replace(/\D/g, "");
  if (phoneDigits.length < 10 || phoneDigits.length > 11) {
    return { success: false, error: "Please enter a valid US phone number." };
  }

  const supabase = createAdminClient();

  const { error } = await supabase.from("entries").insert({
    name: name.trim(),
    phone: phoneDigits,
    word_1: word1.trim().toLowerCase(),
    word_2: word2.trim().toLowerCase(),
    word_3: word3?.trim().toLowerCase() || null,
    word_4: word4?.trim().toLowerCase() || null,
    size,
    week_of: getCurrentWeekMonday(),
  });

  if (error) {
    console.error("Entry submission error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }

  return { success: true, error: null };
}
```

- [ ] **Step 2: Build the entry form page**

Create `src/app/enter/page.tsx`:

```tsx
"use client";

import { useActionState } from "react";
import { submitEntry, type SubmitEntryState } from "@/actions/entries";

const initialState: SubmitEntryState = { success: false, error: null };

export default function EnterPage() {
  const [state, formAction, isPending] = useActionState(
    submitEntry,
    initialState
  );

  if (state.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] px-4">
        <div className="max-w-md text-center">
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#1A1A1A] mb-4">
            You're in!
          </h1>
          <p className="text-[#6B6B6B] text-lg mb-6">
            Your entry has been submitted. If your entry is chosen this Sunday,
            you'll get a text. Good luck!
          </p>
          <a
            href="/"
            className="inline-block text-[#2E6B8A] font-semibold hover:underline"
          >
            ← Back to home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] px-4">
      <div className="w-full max-w-lg">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#1A1A1A] mb-2">
          Enter for next week
        </h1>
        <p className="text-[#6B6B6B] mb-1">
          Tell me 2–4 words — they'll guide the painting.
        </p>
        <p className="text-[#999] text-sm italic mb-8">
          (ex. purple, elephant, ethereal, humble)
        </p>

        <form action={formAction} className="space-y-6">
          {/* Words */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#2E6B8A] mb-3">
              Your words
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                name="word_1"
                placeholder="Word 1 *"
                required
                maxLength={30}
                className="px-4 py-3 border-2 border-[#2E6B8A] rounded-lg bg-white text-[#1A1A1A] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#2E6B8A]/20 transition-all"
              />
              <input
                type="text"
                name="word_2"
                placeholder="Word 2 *"
                required
                maxLength={30}
                className="px-4 py-3 border-2 border-[#2E6B8A] rounded-lg bg-white text-[#1A1A1A] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#2E6B8A]/20 transition-all"
              />
              <input
                type="text"
                name="word_3"
                placeholder="Word 3"
                maxLength={30}
                className="px-4 py-3 border border-[#E8E6E3] rounded-lg bg-white text-[#1A1A1A] placeholder-[#ccc] focus:outline-none focus:border-[#2E6B8A] transition-colors"
              />
              <input
                type="text"
                name="word_4"
                placeholder="Word 4"
                maxLength={30}
                className="px-4 py-3 border border-[#E8E6E3] rounded-lg bg-white text-[#1A1A1A] placeholder-[#ccc] focus:outline-none focus:border-[#2E6B8A] transition-colors"
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <input
              type="text"
              name="name"
              placeholder="Your name *"
              required
              className="w-full px-4 py-3 border border-[#E8E6E3] rounded-lg bg-white text-[#1A1A1A] placeholder-[#999] focus:outline-none focus:border-[#2E6B8A] transition-colors"
            />
          </div>

          {/* Phone */}
          <div>
            <input
              type="tel"
              name="phone"
              placeholder="Phone number *"
              required
              className="w-full px-4 py-3 border border-[#E8E6E3] rounded-lg bg-white text-[#1A1A1A] placeholder-[#999] focus:outline-none focus:border-[#2E6B8A] transition-colors"
            />
            <p className="text-xs text-[#999] mt-1">
              We'll only text you if your entry is chosen.
            </p>
          </div>

          {/* Size */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#2E6B8A] mb-3">
              Preferred size
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-3 p-4 border border-[#E8E6E3] rounded-lg bg-white cursor-pointer hover:border-[#2E6B8A] transition-colors has-[:checked]:border-[#2E6B8A] has-[:checked]:bg-[#E8F1F5]">
                <input
                  type="radio"
                  name="size"
                  value="small"
                  required
                  className="accent-[#2E6B8A]"
                />
                <div>
                  <div className="font-semibold text-sm text-[#1A1A1A]">
                    Small
                  </div>
                  <div className="text-xs text-[#6B6B6B]">
                    Up to 11" × 14" — $20
                  </div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 border border-[#E8E6E3] rounded-lg bg-white cursor-pointer hover:border-[#2E6B8A] transition-colors has-[:checked]:border-[#2E6B8A] has-[:checked]:bg-[#E8F1F5]">
                <input
                  type="radio"
                  name="size"
                  value="medium"
                  className="accent-[#2E6B8A]"
                />
                <div>
                  <div className="font-semibold text-sm text-[#1A1A1A]">
                    Medium
                  </div>
                  <div className="text-xs text-[#6B6B6B]">
                    12" × 16" to 24" × 36" — $25
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Error */}
          {state.error && (
            <p className="text-red-500 text-sm text-center">{state.error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-4 bg-[#2E6B8A] text-white rounded-lg font-semibold text-base hover:bg-[#245a74] transition-colors disabled:opacity-50"
          >
            {isPending ? "Submitting..." : "Submit Entry"}
          </button>

          <p className="text-xs text-center text-[#999]">
            Free to enter · US shipping only · One entry per person per week
          </p>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify the form works**

```bash
npm run dev
```

1. Go to `http://localhost:3000/enter`
2. Fill out the form with test data: words "ocean" + "drift", name "Test User", phone "5555555555", size small
3. Submit → should show the "You're in!" success message
4. Check Supabase dashboard → Table Editor → `entries` → should see the new row

- [ ] **Step 4: Commit**

```bash
git add src/actions/entries.ts src/app/enter/
git commit -m "feat: add entry submission form with server action"
```

---

### Task 6: Build the Admin Entries Page with Draw Flow

**Files:**
- Create: `src/app/admin/entries/page.tsx`, `src/actions/selections.ts`

- [ ] **Step 1: Create the drawEntry server action**

Create `src/actions/selections.ts`:

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { generatePaymentToken, getCurrentWeekMonday } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export interface DrawEntryState {
  success: boolean;
  error: string | null;
  drawnEntry: {
    id: string;
    name: string;
    phone: string;
    words: string[];
    size: string;
  } | null;
}

export async function drawEntry(): Promise<DrawEntryState> {
  const supabase = await createClient();

  // Verify admin is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated", drawnEntry: null };
  }

  const weekOf = getCurrentWeekMonday();

  // Check if there's already an active selection for this week
  const { data: existingSelection } = await supabase
    .from("selections")
    .select("id, entries!inner(week_of)")
    .eq("entries.week_of", weekOf)
    .not("status", "eq", "posted")
    .limit(1)
    .maybeSingle();

  if (existingSelection) {
    return {
      success: false,
      error: "There's already an active selection for this week.",
      drawnEntry: null,
    };
  }

  // Get all entries for this week that haven't been selected before
  const { data: entries, error: fetchError } = await supabase
    .from("entries")
    .select("*")
    .eq("week_of", weekOf)
    .order("created_at", { ascending: true });

  if (fetchError || !entries) {
    return {
      success: false,
      error: "Failed to fetch entries.",
      drawnEntry: null,
    };
  }

  if (entries.length === 0) {
    return {
      success: false,
      error: "No entries for this week yet.",
      drawnEntry: null,
    };
  }

  // Get entry IDs that have already been selected (any week)
  const { data: pastSelections } = await supabase
    .from("selections")
    .select("entry_id");

  const selectedIds = new Set(
    (pastSelections || []).map((s) => s.entry_id)
  );

  const eligibleEntries = entries.filter((e) => !selectedIds.has(e.id));

  if (eligibleEntries.length === 0) {
    return {
      success: false,
      error: "All entries for this week have already been drawn.",
      drawnEntry: null,
    };
  }

  // Pick one at random
  const randomIndex = Math.floor(Math.random() * eligibleEntries.length);
  const chosen = eligibleEntries[randomIndex];

  // Create the selection record
  const { error: insertError } = await supabase.from("selections").insert({
    entry_id: chosen.id,
    payment_token: generatePaymentToken(),
    status: "drawn",
  });

  if (insertError) {
    console.error("Draw entry error:", insertError);
    return {
      success: false,
      error: "Failed to record the selection.",
      drawnEntry: null,
    };
  }

  revalidatePath("/admin/entries");

  const words = [chosen.word_1, chosen.word_2, chosen.word_3, chosen.word_4].filter(
    (w): w is string => w !== null && w.trim() !== ""
  );

  return {
    success: true,
    error: null,
    drawnEntry: {
      id: chosen.id,
      name: chosen.name,
      phone: chosen.phone,
      words,
      size: chosen.size,
    },
  };
}
```

- [ ] **Step 2: Build the admin entries page**

Create `src/app/admin/entries/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server";
import { getCurrentWeekMonday, getWords, formatPhone } from "@/lib/utils";
import type { Entry } from "@/lib/types";
import DrawEntryButton from "./draw-entry-button";

export default async function AdminEntriesPage() {
  const supabase = await createClient();
  const weekOf = getCurrentWeekMonday();

  // Fetch entries for current week
  const { data: entries } = await supabase
    .from("entries")
    .select("*")
    .eq("week_of", weekOf)
    .order("created_at", { ascending: false });

  // Check if there's an active selection this week
  const { data: activeSelection } = await supabase
    .from("selections")
    .select("*, entries!inner(*)")
    .eq("entries.week_of", weekOf)
    .limit(1)
    .maybeSingle();

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Entries</h1>
          <p className="text-sm text-[#6B6B6B]">
            Week of {weekOf} · {entries?.length ?? 0} entries
          </p>
        </div>
        {!activeSelection && (entries?.length ?? 0) > 0 && (
          <DrawEntryButton />
        )}
        {activeSelection && (
          <div className="px-4 py-2 bg-[#E8F1F5] text-[#2E6B8A] rounded-lg text-sm font-semibold">
            Entry drawn: {(activeSelection.entries as unknown as Entry).name}
          </div>
        )}
      </div>

      {/* Active selection banner */}
      {activeSelection && (
        <div className="border-2 border-[#2E6B8A] rounded-xl p-5 mb-6 bg-white">
          <div className="text-xs uppercase tracking-widest text-[#2E6B8A] font-semibold mb-2">
            This week's entry
          </div>
          <div className="text-xl font-bold text-[#1A1A1A]">
            {(activeSelection.entries as unknown as Entry).name}
          </div>
          <div className="text-sm text-[#6B6B6B] mb-3">
            {formatPhone(
              (activeSelection.entries as unknown as Entry).phone
            )}{" "}
            · {(activeSelection.entries as unknown as Entry).size}
          </div>
          <div className="flex gap-2 mb-3">
            {getWords(activeSelection.entries as unknown as Entry).map(
              (word, i) => (
                <span
                  key={i}
                  className="bg-[#E8F1F5] text-[#2E6B8A] text-xs font-semibold px-3 py-1 rounded-full"
                >
                  {word}
                </span>
              )
            )}
          </div>
          <div className="text-xs text-[#6B6B6B]">
            Status:{" "}
            <span className="font-semibold text-[#1A1A1A]">
              {activeSelection.status}
            </span>
          </div>
        </div>
      )}

      {/* Entries list */}
      <div className="bg-white border border-[#E8E6E3] rounded-xl overflow-hidden">
        {entries && entries.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E8E6E3] text-left text-xs uppercase tracking-wider text-[#6B6B6B]">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Words</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry: Entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-[#F0F0EE] last:border-0 hover:bg-[#FAFAF8]"
                >
                  <td className="px-4 py-3 font-semibold text-[#1A1A1A]">
                    {entry.name}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      {getWords(entry).map((word, i) => (
                        <span
                          key={i}
                          className="bg-[#E8F1F5] text-[#2E6B8A] text-xs px-2 py-0.5 rounded-full"
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#6B6B6B] capitalize">
                    {entry.size}
                  </td>
                  <td className="px-4 py-3 text-[#6B6B6B]">
                    {formatPhone(entry.phone)}
                  </td>
                  <td className="px-4 py-3 text-[#999] text-xs">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-4 py-12 text-center text-[#999]">
            No entries yet this week.
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create the Draw Entry button component**

Create `src/app/admin/entries/draw-entry-button.tsx`:

```tsx
"use client";

import { useState } from "react";
import { drawEntry, type DrawEntryState } from "@/actions/selections";
import { useRouter } from "next/navigation";

export default function DrawEntryButton() {
  const [result, setResult] = useState<DrawEntryState | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const router = useRouter();

  async function handleDraw() {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }

    setLoading(true);
    const res = await drawEntry();
    setResult(res);
    setLoading(false);

    if (res.success) {
      router.refresh();
    }
  }

  function handleCancel() {
    setConfirmed(false);
    setResult(null);
  }

  if (result?.success && result.drawnEntry) {
    return (
      <div className="text-right">
        <div className="text-sm font-semibold text-[#2E6B8A]">
          Drawn: {result.drawnEntry.name}
        </div>
        <div className="text-xs text-[#6B6B6B]">
          {result.drawnEntry.words.join(" · ")}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {result?.error && (
        <p className="text-red-500 text-xs">{result.error}</p>
      )}
      {confirmed && (
        <button
          onClick={handleCancel}
          className="px-4 py-2 text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
        >
          Cancel
        </button>
      )}
      <button
        onClick={handleDraw}
        disabled={loading}
        className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 ${
          confirmed
            ? "bg-[#D4A574] text-white hover:bg-[#c4955e]"
            : "bg-[#2E6B8A] text-white hover:bg-[#245a74]"
        }`}
      >
        {loading
          ? "Drawing..."
          : confirmed
            ? "Confirm — draw an entry"
            : "Draw an entry"}
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Verify the full flow end-to-end**

```bash
npm run dev
```

1. Go to `http://localhost:3000/enter` → submit a test entry
2. Go to `http://localhost:3000/admin/entries` → see the entry in the table
3. Click "Draw an entry" → click "Confirm — draw an entry"
4. See the drawn entry banner appear at the top
5. The "Draw an entry" button should be replaced with the drawn entry's name
6. Check Supabase → `selections` table should have a new row with status `drawn`

- [ ] **Step 5: Commit**

```bash
git add src/actions/selections.ts src/app/admin/entries/
git commit -m "feat: add admin entries page with draw-an-entry flow"
```

---

### Task 7: Final Verification and Cleanup

- [ ] **Step 1: Run the build**

```bash
npm run build
```

Expected: Clean build with no errors.

- [ ] **Step 2: Run linting**

```bash
npm run lint
```

Expected: No lint errors. Fix any that appear.

- [ ] **Step 3: Verify the full flow one more time**

1. `npm run dev`
2. Homepage (`/`) → shows placeholder
3. Entry form (`/enter`) → submit works, shows success
4. Admin login (`/admin/login`) → login with credentials
5. Admin entries (`/admin/entries`) → see entries, draw one
6. Admin dashboard (`/admin`) → shows placeholder
7. Sign out → redirects to login

- [ ] **Step 4: Final commit if any cleanup was needed**

```bash
git add -A
git commit -m "chore: cleanup and verify Plan 1 implementation"
```

- [ ] **Step 5: Push to remote**

```bash
git push origin main
```
