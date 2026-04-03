"use server";

import { createClient } from "@/lib/supabase/server";
import { generatePaymentToken, getCurrentWeekMonday } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export interface DrawEntryState {
  success: boolean;
  error: string | null;
  drawnEntry: {
    id: string;
    name: string;
    phone: string;
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
      phone: chosen.phone,
      words,
      size: chosen.size,
    },
  };
}
