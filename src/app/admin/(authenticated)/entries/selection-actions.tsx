"use client";

import { useState } from "react";
import { approveAndNotify } from "@/actions/selections";
import { markShipped } from "@/actions/shipping";
import { useRouter } from "next/navigation";
import CountdownTimer from "@/components/countdown-timer";

interface SelectionActionsProps {
  selectionId: string;
  status: string;
  expiresAt: string | null;
  shippingProvider?: string | null;
  trackingNumber?: string | null;
}

export default function SelectionActions({
  selectionId,
  status,
  expiresAt,
  shippingProvider,
  trackingNumber,
}: SelectionActionsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showShippingForm, setShowShippingForm] = useState(false);
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

  async function handleShip(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const result = await markShipped(selectionId, formData);
    setLoading(false);
    if (result.success) {
      setShowShippingForm(false);
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

  if (status === "paid") {
    return (
      <div className="mt-4">
        <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
          Paid
        </span>
      </div>
    );
  }

  if (status === "painting") {
    return (
      <div className="mt-4">
        {error && <p className="text-red-500 text-xs mb-2">{error}</p>}

        {!showShippingForm ? (
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#2E6B8A] bg-[#E8F1F5] px-3 py-1 rounded-full">
              Painting complete
            </span>
            <button
              onClick={() => setShowShippingForm(true)}
              className="px-4 py-2 bg-[#2E6B8A] text-white rounded-lg font-semibold text-xs hover:bg-[#245a74] transition-colors"
            >
              Mark as shipped
            </button>
          </div>
        ) : (
          <form onSubmit={handleShip} className="space-y-3 max-w-sm">
            <div>
              <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">
                Shipping provider *
              </label>
              <select
                name="provider"
                required
                className="w-full px-3 py-2 border border-[#E8E6E3] rounded-lg bg-white text-sm text-[#1A1A1A] focus:outline-none focus:border-[#2E6B8A] transition-colors"
              >
                <option value="">Select provider...</option>
                <option value="USPS">USPS</option>
                <option value="UPS">UPS</option>
                <option value="FedEx">FedEx</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">
                Tracking number
              </label>
              <input
                type="text"
                name="tracking_number"
                placeholder="Optional"
                className="w-full px-3 py-2 border border-[#E8E6E3] rounded-lg bg-white text-sm text-[#1A1A1A] placeholder-[#ccc] focus:outline-none focus:border-[#2E6B8A] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">
                Expected arrival
              </label>
              <input
                type="date"
                name="expected_arrival"
                className="w-full px-3 py-2 border border-[#E8E6E3] rounded-lg bg-white text-sm text-[#1A1A1A] focus:outline-none focus:border-[#2E6B8A] transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-[#2E6B8A] text-white rounded-lg font-semibold text-xs hover:bg-[#245a74] transition-colors disabled:opacity-50"
              >
                {loading ? "Saving..." : "Submit"}
              </button>
              <button
                type="button"
                onClick={() => setShowShippingForm(false)}
                disabled={loading}
                className="text-xs text-[#999] hover:text-[#6B6B6B] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  if (status === "shipped") {
    return (
      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
          Shipped
        </span>
        {shippingProvider && (
          <span className="text-xs text-[#6B6B6B]">
            via {shippingProvider}
          </span>
        )}
        {trackingNumber && (
          <span className="text-xs text-[#999]">
            #{trackingNumber}
          </span>
        )}
      </div>
    );
  }

  if (status === "posted") {
    return (
      <div className="mt-4">
        <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
          Complete
        </span>
      </div>
    );
  }

  return null;
}
