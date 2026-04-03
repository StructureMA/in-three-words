"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentWeekMonday } from "@/lib/utils";

export interface SubmitEntryState {
  success: boolean;
  error: string | null;
}

export async function submitEntry(
  _prevState: SubmitEntryState,
  formData: FormData
): Promise<SubmitEntryState> {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const word1 = formData.get("word_1") as string;
  const word2 = formData.get("word_2") as string;
  const word3 = (formData.get("word_3") as string) || null;
  const word4 = (formData.get("word_4") as string) || null;
  const size = formData.get("size") as string;
  const comment = (formData.get("comment") as string) || null;
  const charityPreference = (formData.get("charity_preference") as string) || null;
  const charityOther = (formData.get("charity_other") as string) || null;

  if (!name || !phone || !word1 || !word2 || !size) {
    return { success: false, error: "Please fill in all required fields." };
  }

  if (size !== "small" && size !== "medium") {
    return { success: false, error: "Please select a valid size." };
  }

  const phoneDigits = phone.replace(/\D/g, "");
  if (phoneDigits.length < 10 || phoneDigits.length > 11) {
    return { success: false, error: "Please enter a valid US phone number." };
  }

  const supabase = createAdminClient();

  const { error } = await supabase.from("entries").insert({
    name: name.trim(),
    phone: phoneDigits,
    word_1: word1.trim().toLowerCase(),
    word_2: word2.trim().toLowerCase(),
    word_3: word3?.trim().toLowerCase() || null,
    word_4: word4?.trim().toLowerCase() || null,
    size,
    comment: comment?.trim() || null,
    charity_preference: charityPreference === "other" ? charityOther?.trim() || "other" : charityPreference,
    week_of: getCurrentWeekMonday(),
  });

  if (error) {
    console.error("Entry submission error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }

  return { success: true, error: null };
}
