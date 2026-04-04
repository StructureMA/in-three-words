"use client";

import { useState } from "react";
import { deleteEntry, updateEntryNote } from "@/actions/entries-admin";
import { useRouter } from "next/navigation";

interface EntryActionsProps {
  entryId: string;
  currentNote: string | null;
}

export default function EntryActions({ entryId, currentNote }: EntryActionsProps) {
  const [showActions, setShowActions] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState(currentNote || "");
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setLoading(true);
    const result = await deleteEntry(entryId);
    setLoading(false);
    if (result.success) {
      router.refresh();
    } else {
      setError(result.error);
      setConfirmDelete(false);
    }
  }

  async function handleSaveNote() {
    setLoading(true);
    const result = await updateEntryNote(entryId, note);
    setLoading(false);
    if (result.success) {
      setShowNote(false);
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="flex items-center gap-1">
      {error && <span className="text-red-500 text-xs mr-1">{error}</span>}

      {/* Note indicator */}
      {currentNote && !showNote && (
        <button
          onClick={() => { setShowNote(true); setShowActions(false); }}
          title={currentNote}
          className="text-[#D4A574] hover:text-[#c4955e] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}

      {/* Toggle actions */}
      <button
        onClick={() => { setShowActions(!showActions); setConfirmDelete(false); setShowNote(false); }}
        className="text-[#999] hover:text-[#6B6B6B] transition-colors p-1"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>

      {/* Actions dropdown */}
      {showActions && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setShowNote(true); setShowActions(false); }}
            className="text-xs text-[#2E6B8A] hover:underline"
          >
            {currentNote ? "Edit note" : "Add note"}
          </button>
          <span className="text-[#E8E6E3]">|</span>
          {!confirmDelete ? (
            <button
              onClick={handleDelete}
              className="text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              Delete
            </button>
          ) : (
            <button
              onClick={handleDelete}
              disabled={loading}
              className="text-xs text-red-600 font-semibold hover:underline disabled:opacity-50"
            >
              {loading ? "..." : "Confirm delete"}
            </button>
          )}
        </div>
      )}

      {/* Note editor */}
      {showNote && (
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note..."
            maxLength={200}
            className="px-2 py-1 text-xs border border-[#E8E6E3] rounded bg-white text-[#1A1A1A] w-40 focus:outline-none focus:border-[#2E6B8A]"
          />
          <button
            onClick={handleSaveNote}
            disabled={loading}
            className="text-xs text-[#2E6B8A] font-semibold hover:underline disabled:opacity-50"
          >
            {loading ? "..." : "Save"}
          </button>
          <button
            onClick={() => setShowNote(false)}
            className="text-xs text-[#999] hover:text-[#6B6B6B]"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
