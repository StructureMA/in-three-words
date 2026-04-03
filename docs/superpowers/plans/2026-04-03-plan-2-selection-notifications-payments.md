# Plan 2: Selection + Notifications + Payments

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the SMS notification flow (Resend), the payment/checkout page (Stripe + Venmo), the 3-hour countdown timer, and the admin payments tracking page — completing the full selection-to-payment loop.

**Architecture:** Extends the existing Next.js + Supabase setup from Plan 1. Adds Resend for SMS, Stripe for card payments. The payment page uses a token-based URL that's time-limited. The admin can approve sending SMS, track the 3-hour window, and mark Venmo payments manually.

**Tech Stack:** Next.js 16, Supabase, Resend (SMS), Stripe (Checkout), TypeScript, Tailwind CSS 4

---

## File Structure (new/modified files only)

```
src/
├── app/
│   ├── pay/
│   │   └── [token]/
│   │       └── page.tsx               # Public payment/checkout page
│   └── admin/
│       └── (authenticated)/
│           └── entries/
│               ├── page.tsx           # Modified: add "Send SMS" button after draw
│               └── draw-entry-button.tsx  # Modified: add approve/notify flow
│           └── payments/
│               └── page.tsx           # Admin payments tracking page
├── actions/
│   ├── selections.ts                  # Modified: add approveAndNotify, redraw actions
│   └── payments.ts                    # New: confirmPayment, markVenmoPaid actions
├── lib/
│   ├── resend.ts                      # Resend SMS client
│   └── stripe.ts                      # Stripe client + checkout helpers
└── components/
    └── countdown-timer.tsx            # Reusable 3-hour countdown component
```

---

### Task 1: Set Up Resend SMS Client

**Files:**
- Create: `src/lib/resend.ts`
- Modify: `.env.local.example`

- [ ] **Step 1: Install Resend**

```bash
npm install resend
```

- [ ] **Step 2: Add env vars to .env.local.example**

Add to `.env.local.example`:

```
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_PHONE=+1xxxxxxxxxx
```

- [ ] **Step 3: Create the Resend SMS helper**

Create `src/lib/resend.ts`:

```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendSelectionSMSParams {
  to: string;
  name: string;
  words: string[];
  paymentUrl: string;
  venmoHandle: string;
}

export async function sendSelectionSMS({
  to,
  name,
  words,
  paymentUrl,
  venmoHandle,
}: SendSelectionSMSParams): Promise<{ success: boolean; error: string | null }> {
  const formattedPhone = to.startsWith("+1") ? to : `+1${to}`;
  const wordList = words.join(", ");

  const message = [
    `Hey ${name}! Your entry was chosen this week on In a Few Words.`,
    ``,
    `Your words: ${wordList}`,
    ``,
    `Confirm and pay here: ${paymentUrl}`,
    `Or Venmo: @${venmoHandle}`,
    ``,
    `You have 3 hours to confirm. If we don't hear back, we'll draw the next entry.`,
  ].join("\n");

  try {
    await resend.messages.send({
      from: process.env.RESEND_FROM_PHONE!,
      to: formattedPhone,
      text: message,
    });
    return { success: true, error: null };
  } catch (err) {
    console.error("SMS send error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to send SMS",
    };
  }
}
```

Note: Resend's SMS API may differ from the above. Check the Resend docs for the actual SMS sending method and adjust accordingly. The key shape (from phone, to phone, text body) is what matters.

- [ ] **Step 4: Commit**

```bash
git add src/lib/resend.ts .env.local.example
git commit -m "feat: add Resend SMS client for selection notifications"
```

---

### Task 2: Add Approve & Notify Flow to Admin

**Files:**
- Modify: `src/actions/selections.ts`
- Modify: `src/app/admin/(authenticated)/entries/page.tsx`
- Create: `src/components/countdown-timer.tsx`

- [ ] **Step 1: Add approveAndNotify action**

Add to `src/actions/selections.ts`:

```typescript
export async function approveAndNotify(
  selectionId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Get the selection with entry data
  const { data: selection } = await supabase
    .from("selections")
    .select("*, entries!inner(*)")
    .eq("id", selectionId)
    .single();

  if (!selection) return { success: false, error: "Selection not found" };
  if (selection.status !== "drawn") {
    return { success: false, error: "Selection already notified" };
  }

  // Get venmo handle from settings
  const { data: venmoSetting } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "venmo_handle")
    .single();

  const entry = selection.entries as unknown as Entry;
  const words = [entry.word_1, entry.word_2, entry.word_3, entry.word_4].filter(
    (w): w is string => w !== null && w.trim() !== ""
  );

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const paymentUrl = `${baseUrl}/pay/${selection.payment_token}`;

  // Send SMS
  const { sendSelectionSMS } = await import("@/lib/resend");
  const smsResult = await sendSelectionSMS({
    to: entry.phone,
    name: entry.name,
    words,
    paymentUrl,
    venmoHandle: venmoSetting?.value || "",
  });

  if (!smsResult.success) {
    return { success: false, error: `SMS failed: ${smsResult.error}` };
  }

  // Update selection status
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 3 * 60 * 60 * 1000); // 3 hours

  await supabase
    .from("selections")
    .update({
      status: "notified",
      notified_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .eq("id", selectionId);

  revalidatePath("/admin/entries");
  return { success: true, error: null };
}
```

Also add a `redrawEntry` action for when the 3-hour window expires:

```typescript
export async function redrawEntry(
  expiredSelectionId: string
): Promise<DrawEntryState> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated", drawnEntry: null };

  // Mark the expired selection
  await supabase
    .from("selections")
    .update({ status: "expired" })
    .eq("id", expiredSelectionId);

  // Draw a new entry (reuse the existing drawEntry logic)
  return drawEntry();
}
```

Note: Add "expired" to the status check constraint if needed, or handle it at the application level.

- [ ] **Step 2: Create the countdown timer component**

Create `src/components/countdown-timer.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  expiresAt: string;
  onExpired?: () => void;
}

export default function CountdownTimer({ expiresAt, onExpired }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    function update() {
      const now = new Date().getTime();
      const target = new Date(expiresAt).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
        setExpired(true);
        onExpired?.();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours}h ${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`
      );
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpired]);

  return (
    <div className={`font-mono text-sm font-semibold ${expired ? "text-red-500" : "text-[#D4A574]"}`}>
      {timeLeft}
    </div>
  );
}
```

- [ ] **Step 3: Update the entries page to show approve/notify flow**

Modify `src/app/admin/(authenticated)/entries/page.tsx` to show:
- After draw: "Send SMS" button (calls approveAndNotify)
- After notify: countdown timer showing time remaining
- After expiry: "Draw again" button

The active selection banner should show different states based on `selection.status`:
- `drawn`: Show "Approve & Send SMS" button
- `notified`: Show countdown timer + "Waiting for confirmation"
- `confirmed`/`paid`: Show payment status

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/actions/selections.ts src/app/admin/ src/components/
git commit -m "feat: add approve & notify flow with 3-hour countdown"
```

---

### Task 3: Set Up Stripe Client

**Files:**
- Create: `src/lib/stripe.ts`
- Modify: `.env.local.example`

- [ ] **Step 1: Install Stripe**

```bash
npm install stripe
```

- [ ] **Step 2: Add env vars**

Add to `.env.local.example`:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] **Step 3: Create the Stripe client and helpers**

Create `src/lib/stripe.ts`:

```typescript
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

interface CreateCheckoutParams {
  selectionId: string;
  paymentToken: string;
  entryName: string;
  size: "small" | "medium";
}

export async function createCheckoutSession({
  selectionId,
  paymentToken,
  entryName,
  size,
}: CreateCheckoutParams): Promise<string> {
  const price = size === "small" ? 2000 : 2500; // cents
  const label = size === "small" ? "Small (up to 11×14)" : "Medium (12×16 to 24×36)";

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `In a Few Words — Original Painting for ${entryName}`,
            description: `${label} original acrylic painting`,
          },
          unit_amount: price,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${baseUrl}/pay/${paymentToken}?success=true`,
    cancel_url: `${baseUrl}/pay/${paymentToken}?canceled=true`,
    metadata: {
      selection_id: selectionId,
      payment_token: paymentToken,
    },
  });

  return session.url!;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/stripe.ts .env.local.example
git commit -m "feat: add Stripe client with checkout session helper"
```

---

### Task 4: Build the Payment Page

**Files:**
- Create: `src/app/pay/[token]/page.tsx`
- Create: `src/actions/payments.ts`

- [ ] **Step 1: Create payment actions**

Create `src/actions/payments.ts`:

```typescript
"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createCheckoutSession } from "@/lib/stripe";
import { redirect } from "next/navigation";
import type { Entry } from "@/lib/types";

export async function initiateStripePayment(paymentToken: string) {
  const supabase = createAdminClient();

  const { data: selection } = await supabase
    .from("selections")
    .select("*, entries!inner(*)")
    .eq("payment_token", paymentToken)
    .single();

  if (!selection) return { error: "Invalid payment link" };

  const entry = selection.entries as unknown as Entry;

  // Verify the selection is in a payable state
  if (!["notified", "confirmed"].includes(selection.status)) {
    return { error: "This payment link is no longer active" };
  }

  // Check expiry
  if (selection.expires_at && new Date(selection.expires_at) < new Date()) {
    return { error: "This payment link has expired" };
  }

  // Update status to confirmed
  await supabase
    .from("selections")
    .update({ status: "confirmed" })
    .eq("id", selection.id);

  const checkoutUrl = await createCheckoutSession({
    selectionId: selection.id,
    paymentToken,
    entryName: entry.name,
    size: entry.size as "small" | "medium",
  });

  redirect(checkoutUrl);
}

export async function submitShippingAddress(
  paymentToken: string,
  formData: FormData
): Promise<{ success: boolean; error: string | null }> {
  const street = formData.get("street") as string;
  const city = formData.get("city") as string;
  const state = formData.get("state") as string;
  const zip = formData.get("zip") as string;

  if (!street || !city || !state || !zip) {
    return { success: false, error: "Please fill in all address fields" };
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("selections")
    .update({
      shipping_street: street.trim(),
      shipping_city: city.trim(),
      shipping_state: state.trim().toUpperCase(),
      shipping_zip: zip.trim(),
    })
    .eq("payment_token", paymentToken);

  if (error) {
    return { success: false, error: "Failed to save address" };
  }

  return { success: true, error: null };
}
```

- [ ] **Step 2: Build the payment page**

Create `src/app/pay/[token]/page.tsx`:

This page has several states:
- **Valid token, not yet paid**: Show payment options (Stripe button + Venmo instructions)
- **success=true query param**: Show "Payment received! Now enter your shipping address" form
- **Address submitted**: Show "All done!" confirmation
- **Expired token**: Show "This link has expired"
- **Invalid token**: Show "Invalid payment link"

```tsx
import { createAdminClient } from "@/lib/supabase/admin";
import type { Entry } from "@/lib/types";
import PaymentClient from "./payment-client";

interface PaymentPageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ success?: string; canceled?: string }>;
}

export default async function PaymentPage({
  params,
  searchParams,
}: PaymentPageProps) {
  const { token } = await params;
  const { success, canceled } = await searchParams;

  const supabase = createAdminClient();

  const { data: selection } = await supabase
    .from("selections")
    .select("*, entries!inner(*)")
    .eq("payment_token", token)
    .single();

  if (!selection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] px-4">
        <div className="text-center">
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#1A1A1A] mb-2">
            Invalid link
          </h1>
          <p className="text-[#6B6B6B]">This payment link is not valid.</p>
        </div>
      </div>
    );
  }

  const entry = selection.entries as unknown as Entry;
  const isExpired = selection.expires_at && new Date(selection.expires_at) < new Date();
  const isPaid = ["paid", "painting", "shipped", "posted"].includes(selection.status);

  if (isExpired && !isPaid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] px-4">
        <div className="text-center">
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#1A1A1A] mb-2">
            This link has expired
          </h1>
          <p className="text-[#6B6B6B]">The 3-hour confirmation window has passed.</p>
        </div>
      </div>
    );
  }

  // Get venmo handle
  const { data: venmoSetting } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "venmo_handle")
    .single();

  const words = [entry.word_1, entry.word_2, entry.word_3, entry.word_4].filter(
    (w): w is string => w !== null && w.trim() !== ""
  );

  const price = entry.size === "small" ? "$20" : "$25";

  return (
    <PaymentClient
      token={token}
      entryName={entry.name}
      words={words}
      size={entry.size}
      price={price}
      venmoHandle={venmoSetting?.value || ""}
      status={selection.status}
      hasShippingAddress={!!selection.shipping_street}
      paymentSuccess={success === "true"}
      paymentCanceled={canceled === "true"}
    />
  );
}
```

Create `src/app/pay/[token]/payment-client.tsx` — the interactive client component that handles payment flow and shipping address form. This should show:
- Entry info (name, words, size, price)
- "Pay with card" button (calls initiateStripePayment server action)
- Venmo instructions with handle
- After Stripe success: shipping address form
- After address submitted: "All done!" confirmation

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/app/pay/ src/actions/payments.ts
git commit -m "feat: add payment page with Stripe checkout and shipping address"
```

---

### Task 5: Add Stripe Webhook for Auto-Confirmation

**Files:**
- Create: `src/app/api/webhooks/stripe/route.ts`

- [ ] **Step 1: Create the webhook handler**

Create `src/app/api/webhooks/stripe/route.ts`:

```typescript
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const selectionId = session.metadata?.selection_id;

    if (selectionId) {
      const supabase = createAdminClient();
      await supabase
        .from("selections")
        .update({
          status: "paid",
          payment_method: "stripe",
          payment_confirmed_at: new Date().toISOString(),
        })
        .eq("id", selectionId);
    }
  }

  return NextResponse.json({ received: true });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/webhooks/stripe/
git commit -m "feat: add Stripe webhook for automatic payment confirmation"
```

---

### Task 6: Build Admin Payments Page

**Files:**
- Create: `src/app/admin/(authenticated)/payments/page.tsx`
- Modify: `src/actions/payments.ts`

- [ ] **Step 1: Add markVenmoPaid action**

Add to `src/actions/payments.ts`:

```typescript
export async function markVenmoPaid(
  selectionId: string,
  method: "venmo" | "paypal"
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("selections")
    .update({
      status: "paid",
      payment_method: method,
      payment_confirmed_at: new Date().toISOString(),
    })
    .eq("id", selectionId);

  if (error) return { success: false, error: "Failed to update payment status" };

  revalidatePath("/admin/payments");
  return { success: true, error: null };
}
```

- [ ] **Step 2: Build the payments page**

Create `src/app/admin/(authenticated)/payments/page.tsx`:

Shows a list of all selections with their payment status. For each selection:
- Entry name, words, size
- Payment status badge (pending/paid)
- Payment method (stripe auto-confirmed / venmo / paypal)
- "Mark as paid" button with dropdown for method (venmo/paypal) — only for unpaid selections
- Timestamp of when payment was confirmed

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/(authenticated)/payments/ src/actions/payments.ts
git commit -m "feat: add admin payments page with manual payment marking"
```

---

### Task 7: Final Verification and Cleanup

- [ ] **Step 1: TypeScript check**

```bash
npx tsc --noEmit
```

- [ ] **Step 2: Lint**

```bash
npm run lint
```

- [ ] **Step 3: Fix any issues found**

- [ ] **Step 4: Commit and push**

```bash
git push origin feature/plan-2-payments
```
