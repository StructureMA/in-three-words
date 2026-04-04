"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteEntry(
  entryId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Check if this entry has a selection — can't delete if drawn
  const { data: selection } = await supabase
    .from("selections")
    .select("id")
    .eq("entry_id", entryId)
    .maybeSingle();

  if (selection) {
    return { success: false, error: "Can't delete — this entry has been drawn" };
  }

  const { error } = await supabase
    .from("entries")
    .delete()
    .eq("id", entryId);

  if (error) return { success: false, error: "Failed to delete entry" };

  revalidatePath("/admin/entries");
  return { success: true, error: null };
}

export async function updateEntryNote(
  entryId: string,
  note: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("entries")
    .update({ admin_note: note.trim() })
    .eq("id", entryId);

  if (error) return { success: false, error: "Failed to save note" };

  revalidatePath("/admin/entries");
  return { success: true, error: null };
}
