"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadFile } from "@/lib/storage";
import { revalidatePath } from "next/cache";

export async function uploadExample(
  formData: FormData
): Promise<{ success: boolean; error: string | null }> {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const supabase = createAdminClient();

  const file = formData.get("photo") as File;
  const note = formData.get("note") as string;

  if (!file || file.size === 0) {
    return { success: false, error: "Please select an image" };
  }

  const ext = file.name.split(".").pop();
  const path = `examples/${Date.now()}.${ext}`;
  const { url, error: uploadError } = await uploadFile("paintings", path, file);

  if (uploadError || !url) {
    return { success: false, error: uploadError || "Upload failed" };
  }

  // Get the next sort order
  const { data: existing } = await supabase
    .from("example_paintings")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

  const { error: dbError } = await supabase.from("example_paintings").insert({
    image_url: url,
    note: note?.trim() || null,
    sort_order: nextOrder,
  });

  if (dbError) return { success: false, error: "Failed to save" };

  revalidatePath("/admin/examples");
  revalidatePath("/gallery");
  return { success: true, error: null };
}

export async function updateExampleNote(
  id: string,
  note: string
): Promise<{ success: boolean; error: string | null }> {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("example_paintings")
    .update({ note: note.trim() || null })
    .eq("id", id);

  if (error) return { success: false, error: "Failed to update" };

  revalidatePath("/admin/examples");
  revalidatePath("/gallery");
  return { success: true, error: null };
}

export async function deleteExample(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("example_paintings")
    .delete()
    .eq("id", id);

  if (error) return { success: false, error: "Failed to delete" };

  revalidatePath("/admin/examples");
  revalidatePath("/gallery");
  return { success: true, error: null };
}
