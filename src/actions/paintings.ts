"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadFile } from "@/lib/storage";
import { revalidatePath } from "next/cache";

export async function uploadPainting(
  selectionId: string,
  formData: FormData
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const file = formData.get("photo") as File | null;
  const description = formData.get("description") as string;

  if (!file || file.size === 0) {
    return { success: false, error: "Please select a photo" };
  }

  if (!selectionId) {
    return { success: false, error: "Please select an entry" };
  }

  // Upload to Supabase Storage
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${selectionId}-${Date.now()}.${ext}`;
  const { url, error: uploadError } = await uploadFile("paintings", path, file);

  if (uploadError || !url) {
    return { success: false, error: uploadError || "Upload failed" };
  }

  // Create painting record using admin client
  const admin = createAdminClient();
  const { error: insertError } = await admin.from("paintings").insert({
    selection_id: selectionId,
    image_url: url,
    description: description?.trim() || null,
    featured: false,
  });

  if (insertError) {
    console.error("Insert painting error:", insertError);
    return { success: false, error: "Failed to save painting record" };
  }

  // Update selection status to "painting"
  const { error: updateError } = await admin
    .from("selections")
    .update({ status: "painting" })
    .eq("id", selectionId);

  if (updateError) {
    console.error("Update selection error:", updateError);
  }

  revalidatePath("/admin/gallery");
  revalidatePath("/admin/entries");
  revalidatePath("/gallery");
  return { success: true, error: null };
}

export async function toggleFeatured(
  paintingId: string,
  featured: boolean
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("paintings")
    .update({ featured })
    .eq("id", paintingId);

  if (error) {
    console.error("Toggle featured error:", error);
    return { success: false, error: "Failed to update painting" };
  }

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return { success: true, error: null };
}
