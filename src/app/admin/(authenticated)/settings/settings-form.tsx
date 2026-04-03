"use client";

import { useState } from "react";
import { updateSetting } from "@/actions/settings";
import type { SiteSetting } from "@/lib/types";

interface SettingsFormProps {
  settings: SiteSetting[];
}

export default function SettingsForm({ settings }: SettingsFormProps) {
  const settingsMap = new Map(settings.map((s) => [s.key, s.value]));

  const [venmoHandle, setVenmoHandle] = useState(
    settingsMap.get("venmo_handle") ?? ""
  );
  const [entriesOpen, setEntriesOpen] = useState(
    settingsMap.get("entries_open") !== "false"
  );
  const [saving, setSaving] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    key: string;
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function handleSave(key: string, value: string) {
    setSaving(key);
    setFeedback(null);

    const result = await updateSetting(key, value);

    if (result.success) {
      setFeedback({ key, type: "success", message: "Saved" });
    } else {
      setFeedback({
        key,
        type: "error",
        message: result.error ?? "Failed to save",
      });
    }

    setSaving(null);
    setTimeout(() => setFeedback(null), 3000);
  }

  return (
    <div className="space-y-6">
      {/* Venmo Handle */}
      <div className="bg-white rounded-xl border border-[#E8E6E3] p-5">
        <label className="block text-sm font-semibold text-[#1A1A1A] mb-1">
          Venmo Handle
        </label>
        <p className="text-xs text-[#6B6B6B] mb-3">
          Shown on the payment page so the selected person can pay via Venmo.
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            value={venmoHandle}
            onChange={(e) => setVenmoHandle(e.target.value)}
            placeholder="@your-venmo"
            className="flex-1 px-3 py-2 border border-[#E8E6E3] rounded-lg bg-white text-[#1A1A1A] text-sm placeholder-[#999] focus:outline-none focus:border-[#2E6B8A] transition-colors"
          />
          <button
            onClick={() => handleSave("venmo_handle", venmoHandle)}
            disabled={saving === "venmo_handle"}
            className="px-4 py-2 bg-[#2E6B8A] text-white rounded-lg text-sm font-medium hover:bg-[#245a74] transition-colors disabled:opacity-50"
          >
            {saving === "venmo_handle" ? "Saving..." : "Save"}
          </button>
        </div>
        {feedback?.key === "venmo_handle" && (
          <p
            className={`text-xs mt-2 ${feedback.type === "success" ? "text-green-600" : "text-red-500"}`}
          >
            {feedback.message}
          </p>
        )}
      </div>

      {/* Entries Open/Closed Toggle */}
      <div className="bg-white rounded-xl border border-[#E8E6E3] p-5">
        <label className="block text-sm font-semibold text-[#1A1A1A] mb-1">
          Entries
        </label>
        <p className="text-xs text-[#6B6B6B] mb-3">
          Manually open or close entries. When closed, the entry form is
          disabled.
        </p>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              const next = !entriesOpen;
              setEntriesOpen(next);
              handleSave("entries_open", String(next));
            }}
            disabled={saving === "entries_open"}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              entriesOpen ? "bg-[#2E6B8A]" : "bg-[#E8E6E3]"
            }`}
            role="switch"
            aria-checked={entriesOpen}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                entriesOpen ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-sm text-[#1A1A1A]">
            {entriesOpen ? "Open" : "Closed"}
          </span>
        </div>
        {feedback?.key === "entries_open" && (
          <p
            className={`text-xs mt-2 ${feedback.type === "success" ? "text-green-600" : "text-red-500"}`}
          >
            {feedback.message}
          </p>
        )}
      </div>
    </div>
  );
}
