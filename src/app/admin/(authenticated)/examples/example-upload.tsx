"use client";

import { useState } from "react";
import { uploadExample } from "@/actions/examples";
import { useRouter } from "next/navigation";

export default function ExampleUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await uploadExample(formData);
    setLoading(false);
    if (result.success) {
      e.currentTarget.reset();
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-[#E8E6E3] rounded-xl p-5"
    >
      <div className="flex items-end gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">
            Photo *
          </label>
          <input
            type="file"
            name="photo"
            accept="image/*"
            required
            className="w-full text-sm text-[#6B6B6B] file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#E8F1F5] file:text-[#2E6B8A] hover:file:bg-[#d4e8f0]"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">
            Note (optional)
          </label>
          <input
            type="text"
            name="note"
            placeholder="A short note about this piece"
            maxLength={200}
            className="w-full px-3 py-2 border border-[#E8E6E3] rounded-lg bg-white text-sm text-[#1A1A1A] placeholder-[#ccc] focus:outline-none focus:border-[#2E6B8A] transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 bg-[#2E6B8A] text-white rounded-lg font-semibold text-sm hover:bg-[#245a74] transition-colors disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </form>
  );
}
