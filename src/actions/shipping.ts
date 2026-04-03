"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function markShipped(
  selectionId: string,
  formData: FormData
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const provider = formData.get("provider") as string;
  const trackingNumber = formData.get("tracking_number") as string;
  const expectedArrival = formData.get("expected_arrival") as string;

  if (!provider) {
    return { success: false, error: "Shipping provider is required" };
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

  if (error) {
    console.error("Mark shipped error:", error);
    return { success: false, error: "Failed to update shipping status" };
  }

  revalidatePath("/admin/entries");
  return { success: true, error: null };
}
