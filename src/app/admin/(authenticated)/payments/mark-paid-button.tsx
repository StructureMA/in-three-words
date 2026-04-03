"use client";

import { useState } from "react";
import { markVenmoPaid } from "@/actions/payments";
import { useRouter } from "next/navigation";

interface MarkPaidButtonProps {
  selectionId: string;
}

export default function MarkPaidButton({ selectionId }: MarkPaidButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleMark(method: "venmo" | "paypal") {
    setLoading(true);
    setError(null);
    const result = await markVenmoPaid(selectionId, method);
    setLoading(false);

    if (result.success) {
      setOpen(false);
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-semibold text-[#2E6B8A] hover:text-[#245a74] transition-colors"
      >
        Mark paid
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <button
        onClick={() => handleMark("venmo")}
        disabled={loading}
        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#008CFF]/10 text-[#008CFF] hover:bg-[#008CFF]/20 transition-colors disabled:opacity-50"
      >
        Venmo
      </button>
      <button
        onClick={() => handleMark("paypal")}
        disabled={loading}
        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#003087]/10 text-[#003087] hover:bg-[#003087]/20 transition-colors disabled:opacity-50"
      >
        PayPal
      </button>
      <button
        onClick={() => setOpen(false)}
        disabled={loading}
        className="text-xs text-[#999] hover:text-[#6B6B6B] transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}
