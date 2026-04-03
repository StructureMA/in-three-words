"use client";

import { useState, useRef } from "react";
import { uploadPainting } from "@/actions/paintings";
import { useRouter } from "next/navigation";

interface AvailableSelection {
  id: string;
  entryName: string;
  words: string[];
}

interface UploadPaintingProps {
  availableSelections: AvailableSelection[];
}

export default function UploadPainting({
  availableSelections,
}: UploadPaintingProps) {
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

    const form = e.currentTarget;
    const formData = new FormData(form);
    const selectionId = formData.get("selection_id") as string;

    const result = await uploadPainting(selectionId, formData);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      formRef.current?.reset();
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error);
    }
  }

  if (availableSelections.length === 0) {
    return (
      <div className="bg-white border border-[#E8E6E3] rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-[#1A1A1A] mb-2">
          Upload Painting
        </h2>
        <p className="text-xs text-[#999]">
          No paid selections without paintings. Upload will be available once an
          entry is paid.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E8E6E3] rounded-xl p-5 mb-6">
      <h2 className="text-sm font-semibold text-[#1A1A1A] mb-4">
        Upload Painting
      </h2>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">
            Entry *
          </label>
          <select
            name="selection_id"
            required
            className="w-full max-w-md px-3 py-2 border border-[#E8E6E3] rounded-lg bg-white text-sm text-[#1A1A1A] focus:outline-none focus:border-[#2E6B8A] transition-colors"
          >
            <option value="">Select an entry...</option>
            {availableSelections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.entryName} — {s.words.join(", ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">
            Photo *
          </label>
          <input
            type="file"
            name="photo"
            accept="image/*"
            required
            className="text-sm text-[#6B6B6B] file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#E8F1F5] file:text-[#2E6B8A] hover:file:bg-[#d8e8ee] file:cursor-pointer file:transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">
            Description
          </label>
          <textarea
            name="description"
            rows={2}
            placeholder="A brief note about this painting..."
            className="w-full max-w-md px-3 py-2 border border-[#E8E6E3] rounded-lg bg-white text-sm text-[#1A1A1A] placeholder-[#ccc] focus:outline-none focus:border-[#2E6B8A] transition-colors resize-none"
          />
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}
        {success && (
          <p className="text-green-600 text-xs">Painting uploaded!</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-[#2E6B8A] text-white rounded-lg font-semibold text-sm hover:bg-[#245a74] transition-colors disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload Painting"}
        </button>
      </form>
    </div>
  );
}
