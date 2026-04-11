"use server";

import { notifyPaymentReceived } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession } from "@/lib/stripe";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const PAID_STATUSES = ["paid", "painting", "shipped", "posted"];

export async function initiateStripePayment(paymentToken: string) {
  const supabase = createAdminClient();

  const { data: selection } = await supabase
    .from("selections")
    .select("*, entries!inner(*)")
    .eq("payment_token", paymentToken)
    .single();

  if (!selection) return { error: "Invalid payment link" };

  const entry = selection.entries as Record<string, string>;

  // Verify payable state
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
  const isGift = formData.get("is_gift") === "true";
  const giftRecipientName = formData.get("gift_recipient_name") as string;
  const giftNote = formData.get("gift_note") as string;

  if (!street || !city || !state || !zip) {
    return { success: false, error: "Please fill in all address fields" };
  }

  if (isGift && !giftRecipientName) {
    return { success: false, error: "Please enter the recipient's name" };
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("selections")
    .update({
      shipping_street: street.trim(),
      shipping_city: city.trim(),
      shipping_state: state.trim().toUpperCase(),
      shipping_zip: zip.trim(),
      is_gift: isGift,
      gift_recipient_name: isGift ? giftRecipientName.trim() : null,
      gift_note: isGift ? giftNote?.trim() || null : null,
    })
    .eq("payment_token", paymentToken);

  if (error) {
    return { success: false, error: "Failed to save address" };
  }

  revalidatePath(`/pay/${paymentToken}`);
  return { success: true, error: null };
}

export async function markVenmoPaid(
  selectionId: string,
  method: "venmo" | "paypal"
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: existing } = await supabase
    .from("selections")
    .select("*, entries!inner(*)")
    .eq("id", selectionId)
    .single();

  if (!existing) return { success: false, error: "Selection not found" };

  const alreadyPaid = PAID_STATUSES.includes(existing.status);

  const { error } = await supabase
    .from("selections")
    .update({
      status: "paid",
      payment_method: method,
      payment_confirmed_at: new Date().toISOString(),
    })
    .eq("id", selectionId);

  if (error)
    return { success: false, error: "Failed to update payment status" };

  if (!alreadyPaid) {
    const entry = existing.entries as Record<string, string>;
    const words = [
      entry.word_1,
      entry.word_2,
      entry.word_3,
      entry.word_4,
    ].filter(
      (w: string | null): w is string => w !== null && w.trim() !== ""
    );
    const amountCents = entry.size === "small" ? 2000 : 2500;

    try {
      await notifyPaymentReceived({
        name: entry.name,
        words,
        size: entry.size,
        amountCents,
        method,
      });
    } catch (err) {
      console.error("Failed to send payment notification:", err);
    }
  }

  revalidatePath("/admin/payments");
  return { success: true, error: null };
}
