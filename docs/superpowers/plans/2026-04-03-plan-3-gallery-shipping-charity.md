# Plan 3: Post-Payment + Gallery + Charity

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the post-payment admin workflow (painting upload, shipping with provider/tracking/arrival form, gallery management) and the charity tracking system with receipt upload. Also build the public gallery page.

**Architecture:** Extends the existing Next.js + Supabase setup. Uses Supabase Storage for painting photos and donation receipts. Admin pages follow the existing route group pattern under `(authenticated)`.

**Tech Stack:** Next.js 16, Supabase (DB + Storage), TypeScript, Tailwind CSS 4

---

## File Structure (new/modified files only)

```
src/
├── app/
│   ├── gallery/
│   │   └── page.tsx                   # Public gallery page
│   └── admin/
│       └── (authenticated)/
│           ├── entries/
│           │   └── page.tsx           # Modified: add ship/upload actions
│           ├── gallery/
│           │   └── page.tsx           # Admin gallery management
│           └── charities/
│               └── page.tsx           # Admin charity management
├── actions/
│   ├── paintings.ts                   # Upload photo, manage gallery
│   ├── shipping.ts                    # Mark shipped with tracking info
│   └── charities.ts                   # Manage charities, upload receipts
└── lib/
    └── storage.ts                     # Supabase Storage helpers
```

---

### Task 1: Set Up Supabase Storage

**Files:**
- Create: `src/lib/storage.ts`

- [ ] **Step 1: Create Storage helper**

Create `src/lib/storage.ts` with functions to upload files to Supabase Storage:

```typescript
import { createAdminClient } from "@/lib/supabase/admin";

export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  const supabase = createAdminClient();

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });

  if (error) {
    console.error("Upload error:", error);
    return { url: null, error: error.message };
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return { url: urlData.publicUrl, error: null };
}
```

Note: You'll need to create two storage buckets in the Supabase dashboard:
- `paintings` — for painting photos (public)
- `receipts` — for donation receipts (private, admin only)

- [ ] **Step 2: Commit**

```bash
git add src/lib/storage.ts
git commit -m "feat: add Supabase Storage upload helper"
```

---

### Task 2: Build Shipping Flow

**Files:**
- Create: `src/actions/shipping.ts`
- Modify: `src/app/admin/(authenticated)/entries/page.tsx` — add shipping actions to the selection banner

- [ ] **Step 1: Create shipping action**

Create `src/actions/shipping.ts`:

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function markShipped(
  selectionId: string,
  formData: FormData
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const provider = formData.get("provider") as string;
  const trackingNumber = formData.get("tracking_number") as string;
  const expectedArrival = formData.get("expected_arrival") as string;

  if (!provider) {
    return { success: false, error: "Please select a shipping provider" };
  }

  const { error } = await supabase
    .from("selections")
    .update({
      status: "shipped",
      shipping_provider: provider,
      tracking_number: trackingNumber || null,
      expected_arrival: expectedArrival || null,
      shipped_at: new Date().toISOString(),
    })
    .eq("id", selectionId);

  if (error) return { success: false, error: "Failed to update shipping" };

  revalidatePath("/admin/entries");
  return { success: true, error: null };
}
```

- [ ] **Step 2: Add ship button and form to selection-actions.tsx**

Modify `src/app/admin/(authenticated)/entries/selection-actions.tsx` to add a "Mark as shipped" button for the `painting` status. When clicked, it should expand into a form with:
- Shipping provider dropdown (USPS, UPS, FedEx, Other)
- Tracking number (optional text input)
- Expected arrival date (date input)
- Submit button

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/actions/shipping.ts src/app/admin/
git commit -m "feat: add shipping flow with provider and tracking"
```

---

### Task 3: Build Painting Upload and Gallery Management

**Files:**
- Create: `src/actions/paintings.ts`
- Create: `src/app/admin/(authenticated)/gallery/page.tsx`
- Create: `src/app/admin/(authenticated)/gallery/upload-painting.tsx` (client component)

- [ ] **Step 1: Create painting actions**

Create `src/actions/paintings.ts`:

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { uploadFile } from "@/lib/storage";
import { revalidatePath } from "next/cache";

export async function uploadPainting(
  selectionId: string,
  formData: FormData
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const file = formData.get("photo") as File;
  const description = formData.get("description") as string;

  if (!file || file.size === 0) {
    return { success: false, error: "Please select a photo" };
  }

  // Upload to Supabase Storage
  const ext = file.name.split(".").pop();
  const path = `${selectionId}.${ext}`;
  const { url, error: uploadError } = await uploadFile("paintings", path, file);

  if (uploadError || !url) {
    return { success: false, error: uploadError || "Upload failed" };
  }

  // Create painting record
  const { error: dbError } = await supabase.from("paintings").insert({
    selection_id: selectionId,
    image_url: url,
    description: description?.trim() || null,
    featured: true,
  });

  if (dbError) {
    return { success: false, error: "Failed to save painting record" };
  }

  // Update selection status
  await supabase
    .from("selections")
    .update({ status: "painting" })
    .eq("id", selectionId)
    .eq("status", "paid");

  revalidatePath("/admin/gallery");
  revalidatePath("/admin/entries");
  return { success: true, error: null };
}

export async function toggleFeatured(
  paintingId: string,
  featured: boolean
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("paintings")
    .update({ featured })
    .eq("id", paintingId);

  if (error) return { success: false, error: "Failed to update" };

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return { success: true, error: null };
}
```

- [ ] **Step 2: Build admin gallery page**

Create `src/app/admin/(authenticated)/gallery/page.tsx` — a server component that:
- Fetches all paintings joined with selections and entries
- Shows each painting as a card with: image thumbnail, entry name, words, description
- Toggle for "Featured" (visible on public gallery)
- Upload button that links to the upload flow

Create `src/app/admin/(authenticated)/gallery/upload-painting.tsx` — client component with:
- File input for the painting photo
- Textarea for optional description
- Selection dropdown (which selection is this painting for — show entries that are in "paid" status)
- Upload button with loading state

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/actions/paintings.ts src/app/admin/(authenticated)/gallery/
git commit -m "feat: add painting upload and admin gallery management"
```

---

### Task 4: Build Public Gallery Page

**Files:**
- Create: `src/app/gallery/page.tsx`

- [ ] **Step 1: Build the gallery page**

Create `src/app/gallery/page.tsx` — a server component that:
- Fetches all featured paintings joined with selections, entries, and charities
- Displays a responsive grid of painting cards
- Each card shows: painting image, the 2-4 words as pills, buyer name (first name, last initial) + city/state, charity name
- Clean, warm design matching the site aesthetic
- Empty state: "No paintings yet — check back soon!" if no featured paintings

Use the Supabase anon client (not admin) since this reads public data via RLS.

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/app/gallery/
git commit -m "feat: add public gallery page"
```

---

### Task 5: Build Charity Management

**Files:**
- Create: `src/actions/charities.ts`
- Create: `src/app/admin/(authenticated)/charities/page.tsx`
- Create: `src/app/admin/(authenticated)/charities/charity-forms.tsx` (client component)

- [ ] **Step 1: Create charity actions**

Create `src/actions/charities.ts`:

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { uploadFile } from "@/lib/storage";
import { revalidatePath } from "next/cache";
import { getCurrentWeekMonday } from "@/lib/utils";

export async function setWeeklyCharity(
  formData: FormData
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const name = formData.get("name") as string;
  const url = formData.get("url") as string;

  if (!name) return { success: false, error: "Charity name is required" };

  const weekOf = getCurrentWeekMonday();

  // Upsert — update if charity already set for this week
  const { data: existing } = await supabase
    .from("charities")
    .select("id")
    .eq("week_of", weekOf)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("charities")
      .update({ name: name.trim(), url: url?.trim() || null })
      .eq("id", existing.id);
  } else {
    await supabase.from("charities").insert({
      name: name.trim(),
      url: url?.trim() || null,
      week_of: weekOf,
    });
  }

  revalidatePath("/admin/charities");
  return { success: true, error: null };
}

export async function markDonated(
  charityId: string,
  formData: FormData
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const amount = formData.get("amount") as string;
  const receiptFile = formData.get("receipt") as File;

  if (!amount) return { success: false, error: "Donation amount is required" };
  if (!receiptFile || receiptFile.size === 0) {
    return { success: false, error: "Please upload a receipt" };
  }

  // Upload receipt
  const ext = receiptFile.name.split(".").pop();
  const path = `${charityId}-receipt.${ext}`;
  const { url: receiptUrl, error: uploadError } = await uploadFile(
    "receipts",
    path,
    receiptFile
  );

  if (uploadError || !receiptUrl) {
    return { success: false, error: uploadError || "Receipt upload failed" };
  }

  const { error } = await supabase
    .from("charities")
    .update({
      donation_amount: parseFloat(amount),
      donated_at: new Date().toISOString(),
      receipt_url: receiptUrl,
    })
    .eq("id", charityId);

  if (error) return { success: false, error: "Failed to update charity" };

  revalidatePath("/admin/charities");
  return { success: true, error: null };
}
```

- [ ] **Step 2: Build admin charities page**

Create `src/app/admin/(authenticated)/charities/page.tsx` — server component showing:
- Current week's charity (if set) with donation status
- "Set this week's charity" form (name + URL)
- "Mark donated" form: amount (pre-filled based on painting size), receipt upload, date
- History of past charities with donation amounts and receipt links

Create `src/app/admin/(authenticated)/charities/charity-forms.tsx` — client component for the interactive forms (set charity, mark donated).

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/actions/charities.ts src/app/admin/(authenticated)/charities/
git commit -m "feat: add charity management with receipt upload"
```

---

### Task 6: Final Verification and Cleanup

- [ ] **Step 1: TypeScript check**

```bash
npx tsc --noEmit
```

- [ ] **Step 2: Lint**

```bash
npm run lint
```

- [ ] **Step 3: Fix any issues**

- [ ] **Step 4: Commit and push**

```bash
git push origin feature/plan-3-gallery-charity
```
