"use client";

import { useState } from "react";
import { approveAndNotify } from "@/actions/selections";
import { useRouter } from "next/navigation";
import CountdownTimer from "@/components/countdown-timer";

interface SelectionActionsProps {
  selectionId: string;
  status: string;
  expiresAt: string | null;
}

export default function SelectionActions({
  selectionId,
  status,
  expiresAt,
}: SelectionActionsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleApprove() {
    setLoading(true);
    setError(null);
    const result = await approveAndNotify(selectionId);
    setLoading(false);
    if (result.success) {
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  if (status === "drawn") {
    return (
      <div className="mt-4">
        {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
        <button
          onClick={handleApprove}
          disabled={loading}
          className="px-5 py-2.5 bg-[#2E6B8A] text-white rounded-lg font-semibold text-sm hover:bg-[#245a74] transition-colors disabled:opacity-50"
        >
          {loading ? "Sending SMS..." : "Approve & Send SMS"}
        </button>
      </div>
    );
  }

  if (status === "notified" && expiresAt) {
    return (
      <div className="mt-4 flex items-center gap-3">
        <span className="text-xs text-[#6B6B6B]">
          Waiting for response —
        </span>
        <CountdownTimer
          expiresAt={expiresAt}
          onExpired={() => router.refresh()}
        />
      </div>
    );
  }

  if (status === "confirmed") {
    return (
      <div className="mt-4">
        <span className="text-xs font-semibold text-[#D4A574] bg-[#D4A574]/10 px-3 py-1 rounded-full">
          Confirmed — awaiting payment
        </span>
      </div>
    );
  }

  if (
    status === "paid" ||
    status === "painting" ||
    status === "shipped" ||
    status === "posted"
  ) {
    return (
      <div className="mt-4">
        <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
          Paid
        </span>
      </div>
    );
  }

  return null;
}
