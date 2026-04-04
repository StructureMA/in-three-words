"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadFile } from "@/lib/storage";
import { getCurrentWeekMonday } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function setWeeklyCharity(
  formData: FormData
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const name = formData.get("name") as string;
  const url = formData.get("url") as string;

  if (!name?.trim()) {
    return { success: false, error: "Charity name is required" };
  }

  const weekOf = getCurrentWeekMonday();
  const admin = createAdminClient();

  // Check if a charity already exists for this week
  const { data: existing } = await admin
    .from("charities")
    .select("id")
    .eq("week_of", weekOf)
    .maybeSingle();

  if (existing) {
    // Update existing
    const { error } = await admin
      .from("charities")
      .update({
        name: name.trim(),
        url: url?.trim() || null,
      })
      .eq("id", existing.id);

    if (error) {
      console.error("Update charity error:", error);
      return { success: false, error: "Failed to update charity" };
    }
  } else {
    // Insert new
    const { error } = await admin.from("charities").insert({
      name: name.trim(),
      url: url?.trim() || null,
      week_of: weekOf,
    });

    if (error) {
      console.error("Insert charity error:", error);
      return { success: false, error: "Failed to save charity" };
    }
  }

  revalidatePath("/admin/charities");
  revalidatePath("/gallery");
  return { success: true, error: null };
}

export async function markDonated(
  charityId: string,
  formData: FormData
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const amount = parseFloat(formData.get("amount") as string);
  const receipt = formData.get("receipt") as File | null;

  if (isNaN(amount) || amount <= 0) {
    return { success: false, error: "Please enter a valid amount" };
  }

  let receiptUrl: string | null = null;

  if (receipt && receipt.size > 0) {
    const ext = receipt.name.split(".").pop() || "pdf";
    const path = `${charityId}-${Date.now()}.${ext}`;
    const { url, error: uploadError } = await uploadFile(
      "receipts",
      path,
      receipt
    );

    if (uploadError) {
      return { success: false, error: `Receipt upload failed: ${uploadError}` };
    }
    receiptUrl = url;
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("charities")
    .update({
      donation_amount: amount,
      donated_at: new Date().toISOString(),
      receipt_url: receiptUrl,
    })
    .eq("id", charityId);

  if (error) {
    console.error("Mark donated error:", error);
    return { success: false, error: "Failed to record donation" };
  }

  revalidatePath("/admin/charities");
  return { success: true, error: null };
}

export async function deleteCharity(
  charityId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("charities")
    .delete()
    .eq("id", charityId);

  if (error) return { success: false, error: "Failed to delete charity" };

  revalidatePath("/admin/charities");
  revalidatePath("/");
  return { success: true, error: null };
}
