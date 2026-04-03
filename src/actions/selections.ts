"use server";

import { createClient } from "@/lib/supabase/server";
import { generatePaymentToken, getCurrentWeekMonday } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import type { Entry } from "@/lib/types";

export interface DrawEntryState {
  success: boolean;
  error: string | null;
  drawnEntry: {
    id: string;
    name: string;
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

  // Get all entries for this week
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

  // Get entry IDs that have already been selected
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
      words,
      size: chosen.size,
    },
  };
}

export async function approveAndNotify(
  selectionId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
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

  const entry = selection.entries as Entry;
  const words = [entry.word_1, entry.word_2, entry.word_3, entry.word_4].filter(
    (w: string | null): w is string => w !== null && w.trim() !== ""
  );

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const paymentUrl = `${baseUrl}/pay/${selection.payment_token}`;

  // Send SMS via Plivo
  const { sendSelectionSMS } = await import("@/lib/sms");
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

  // Update selection status with 3-hour expiry
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 3 * 60 * 60 * 1000);

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
