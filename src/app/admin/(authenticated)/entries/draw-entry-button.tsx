"use client";

import { useState } from "react";
import { drawEntry, type DrawEntryState } from "@/actions/selections";
import { useRouter } from "next/navigation";

export default function DrawEntryButton() {
  const [result, setResult] = useState<DrawEntryState | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const router = useRouter();

  async function handleDraw() {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }

    setLoading(true);
    const res = await drawEntry();
    setResult(res);
    setLoading(false);

    if (res.success) {
      router.refresh();
    }
  }

  function handleCancel() {
    setConfirmed(false);
    setResult(null);
  }

  if (result?.success && result.drawnEntry) {
    return (
      <div className="text-right">
        <div className="text-sm font-semibold text-[#2E6B8A]">
          Drawn: {result.drawnEntry.name}
        </div>
        <div className="text-xs text-[#6B6B6B]">
          {result.drawnEntry.words.join(" · ")}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {result?.error && (
        <p className="text-red-500 text-xs">{result.error}</p>
      )}
      {confirmed && (
        <button
          onClick={handleCancel}
          className="px-4 py-2 text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
        >
          Cancel
        </button>
      )}
      <button
        onClick={handleDraw}
        disabled={loading}
        className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 ${
          confirmed
            ? "bg-[#D4A574] text-white hover:bg-[#c4955e]"
            : "bg-[#2E6B8A] text-white hover:bg-[#245a74]"
        }`}
      >
        {loading
          ? "Drawing..."
          : confirmed
            ? "Confirm — draw an entry"
            : "Draw an entry"}
      </button>
    </div>
  );
}
