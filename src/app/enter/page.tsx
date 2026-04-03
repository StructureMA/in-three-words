"use client";

import { useActionState } from "react";
import { submitEntry, type SubmitEntryState } from "@/actions/entries";

const initialState: SubmitEntryState = { success: false, error: null };

export default function EnterPage() {
  const [state, formAction, isPending] = useActionState(
    submitEntry,
    initialState
  );

  if (state.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] px-4">
        <div className="max-w-md text-center">
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#1A1A1A] mb-4">
            You're in!
          </h1>
          <p className="text-[#6B6B6B] text-lg mb-6">
            Your entry has been submitted. If your entry is chosen this Sunday,
            you'll get a text. Good luck!
          </p>
          <a
            href="/"
            className="inline-block text-[#2E6B8A] font-semibold hover:underline"
          >
            &larr; Back to home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] px-4">
      <div className="w-full max-w-lg">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#1A1A1A] mb-2">
          Enter for next week
        </h1>
        <p className="text-[#6B6B6B] mb-1">
          Tell me 2–4 words — they'll guide the painting.
        </p>
        <p className="text-[#999] text-sm italic mb-8">
          (ex. purple, elephant, ethereal, humble)
        </p>

        <form action={formAction} className="space-y-6">
          {/* Words */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#2E6B8A] mb-3">
              Your words
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                name="word_1"
                placeholder="Word 1 *"
                required
                maxLength={30}
                className="px-4 py-3 border-2 border-[#2E6B8A] rounded-lg bg-white text-[#1A1A1A] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#2E6B8A]/20 transition-all"
              />
              <input
                type="text"
                name="word_2"
                placeholder="Word 2 *"
                required
                maxLength={30}
                className="px-4 py-3 border-2 border-[#2E6B8A] rounded-lg bg-white text-[#1A1A1A] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#2E6B8A]/20 transition-all"
              />
              <input
                type="text"
                name="word_3"
                placeholder="Word 3"
                maxLength={30}
                className="px-4 py-3 border border-[#E8E6E3] rounded-lg bg-white text-[#1A1A1A] placeholder-[#ccc] focus:outline-none focus:border-[#2E6B8A] transition-colors"
              />
              <input
                type="text"
                name="word_4"
                placeholder="Word 4"
                maxLength={30}
                className="px-4 py-3 border border-[#E8E6E3] rounded-lg bg-white text-[#1A1A1A] placeholder-[#ccc] focus:outline-none focus:border-[#2E6B8A] transition-colors"
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <input
              type="text"
              name="name"
              placeholder="Your name *"
              required
              className="w-full px-4 py-3 border border-[#E8E6E3] rounded-lg bg-white text-[#1A1A1A] placeholder-[#999] focus:outline-none focus:border-[#2E6B8A] transition-colors"
            />
          </div>

          {/* Phone */}
          <div>
            <input
              type="tel"
              name="phone"
              placeholder="Phone number *"
              required
              className="w-full px-4 py-3 border border-[#E8E6E3] rounded-lg bg-white text-[#1A1A1A] placeholder-[#999] focus:outline-none focus:border-[#2E6B8A] transition-colors"
            />
            <p className="text-xs text-[#999] mt-1">
              We'll only text you if your entry is chosen.
            </p>
          </div>

          {/* Size */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#2E6B8A] mb-3">
              Preferred size
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-3 p-4 border border-[#E8E6E3] rounded-lg bg-white cursor-pointer hover:border-[#2E6B8A] transition-colors has-[:checked]:border-[#2E6B8A] has-[:checked]:bg-[#E8F1F5]">
                <input
                  type="radio"
                  name="size"
                  value="small"
                  required
                  className="accent-[#2E6B8A]"
                />
                <div>
                  <div className="font-semibold text-sm text-[#1A1A1A]">
                    Small
                  </div>
                  <div className="text-xs text-[#6B6B6B]">
                    Up to 11&quot; &times; 14&quot; — $20
                  </div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 border border-[#E8E6E3] rounded-lg bg-white cursor-pointer hover:border-[#2E6B8A] transition-colors has-[:checked]:border-[#2E6B8A] has-[:checked]:bg-[#E8F1F5]">
                <input
                  type="radio"
                  name="size"
                  value="medium"
                  className="accent-[#2E6B8A]"
                />
                <div>
                  <div className="font-semibold text-sm text-[#1A1A1A]">
                    Medium
                  </div>
                  <div className="text-xs text-[#6B6B6B]">
                    12&quot; &times; 16&quot; to 24&quot; &times; 36&quot; — $25
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Error */}
          {state.error && (
            <p className="text-red-500 text-sm text-center">{state.error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-4 bg-[#2E6B8A] text-white rounded-lg font-semibold text-base hover:bg-[#245a74] transition-colors disabled:opacity-50"
          >
            {isPending ? "Submitting..." : "Submit Entry"}
          </button>

          <p className="text-xs text-center text-[#999]">
            Free to enter &middot; US shipping only &middot; One entry per person per week
          </p>
        </form>
      </div>
    </div>
  );
}
