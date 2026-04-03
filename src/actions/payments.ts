"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createCheckoutSession } from "@/lib/stripe";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function initiateStripePayment(paymentToken: string) {
  const supabase = createAdminClient();

  const { data: selection } = await supabase
    .from("selections")
    .select("*, entries!inner(*)")
    .eq("payment_token", paymentToken)
    .single();

  if (!selection) return { error: "Invalid payment link" };

  const entry = selection.entries as any;

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

  revalidatePath(`/pay/${paymentToken}`);
  return { success: true, error: null };
}
