"use client";

import { useState, useRef } from "react";
import { setWeeklyCharity, markDonated } from "@/actions/charities";
import { useRouter } from "next/navigation";
import type { Charity } from "@/lib/types";

interface CharityFormsProps {
  currentCharity: Charity | null;
}

export default function CharityForms({ currentCharity }: CharityFormsProps) {
  return (
    <div className="space-y-4">
      <SetCharityForm currentCharity={currentCharity} />
      {currentCharity && !currentCharity.donated_at && (
        <MarkDonatedForm charity={currentCharity} />
      )}
    </div>
  );
}

function SetCharityForm({
  currentCharity,
}: {
  currentCharity: Charity | null;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await setWeeklyCharity(formData);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="bg-white border border-[#E8E6E3] rounded-xl p-5">
      <h2 className="text-sm font-semibold text-[#1A1A1A] mb-4">
        {currentCharity
          ? "Update this week's charity"
          : "Set this week's charity"}
      </h2>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">
            Charity name *
          </label>
          <input
            type="text"
            name="name"
            required
            defaultValue={currentCharity?.name || ""}
            placeholder="e.g. Local Food Bank"
            className="w-full max-w-md px-3 py-2 border border-[#E8E6E3] rounded-lg bg-white text-sm text-[#1A1A1A] placeholder-[#ccc] focus:outline-none focus:border-[#2E6B8A] transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">
            Website URL
          </label>
          <input
            type="url"
            name="url"
            defaultValue={currentCharity?.url || ""}
            placeholder="https://..."
            className="w-full max-w-md px-3 py-2 border border-[#E8E6E3] rounded-lg bg-white text-sm text-[#1A1A1A] placeholder-[#ccc] focus:outline-none focus:border-[#2E6B8A] transition-colors"
          />
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}
        {success && (
          <p className="text-green-600 text-xs">Charity saved!</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-[#2E6B8A] text-white rounded-lg font-semibold text-sm hover:bg-[#245a74] transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}

function MarkDonatedForm({ charity }: { charity: Charity }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await markDonated(charity.id, formData);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="bg-white border border-[#E8E6E3] rounded-xl p-5">
      <h2 className="text-sm font-semibold text-[#1A1A1A] mb-1">
        Mark donation to {charity.name}
      </h2>
      <p className="text-xs text-[#999] mb-4">
        Record the donation amount and optionally upload a receipt.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">
            Amount *
          </label>
          <div className="relative max-w-[200px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6B6B6B]">
              $
            </span>
            <input
              type="number"
              name="amount"
              required
              min="0.01"
              step="0.01"
              defaultValue="5.00"
              className="w-full pl-7 pr-3 py-2 border border-[#E8E6E3] rounded-lg bg-white text-sm text-[#1A1A1A] focus:outline-none focus:border-[#2E6B8A] transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">
            Receipt
          </label>
          <input
            type="file"
            name="receipt"
            accept="image/*,.pdf"
            className="text-sm text-[#6B6B6B] file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#E8F1F5] file:text-[#2E6B8A] hover:file:bg-[#d8e8ee] file:cursor-pointer file:transition-colors"
          />
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}
        {success && (
          <p className="text-green-600 text-xs">Donation recorded!</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-[#2E6B8A] text-white rounded-lg font-semibold text-sm hover:bg-[#245a74] transition-colors disabled:opacity-50"
        >
          {loading ? "Recording..." : "Record Donation"}
        </button>
      </form>
    </div>
  );
}
