"use client";

import { useState } from "react";
import { updateExampleNote, deleteExample } from "@/actions/examples";
import { useRouter } from "next/navigation";

interface ExampleCardProps {
  id: string;
  imageUrl: string;
  note: string | null;
}

export default function ExampleCard({ id, imageUrl, note }: ExampleCardProps) {
  const [editing, setEditing] = useState(false);
  const [noteValue, setNoteValue] = useState(note || "");
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const router = useRouter();

  async function handleSaveNote() {
    setLoading(true);
    await updateExampleNote(id, noteValue);
    setLoading(false);
    setEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setLoading(true);
    await deleteExample(id);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="bg-white border border-[#E8E6E3] rounded-xl overflow-hidden">
      <div className="aspect-square overflow-hidden bg-[#F0F0EE]">
        <img
          src={imageUrl}
          alt={note || "Example painting"}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-3">
        {editing ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={noteValue}
              onChange={(e) => setNoteValue(e.target.value)}
              maxLength={200}
              className="flex-1 px-2 py-1 text-xs border border-[#E8E6E3] rounded bg-white text-[#1A1A1A] focus:outline-none focus:border-[#2E6B8A]"
            />
            <button
              onClick={handleSaveNote}
              disabled={loading}
              className="text-xs text-[#2E6B8A] font-semibold"
            >
              {loading ? "..." : "Save"}
            </button>
          </div>
        ) : (
          <p
            onClick={() => setEditing(true)}
            className="text-xs text-[#6B6B6B] cursor-pointer hover:text-[#1A1A1A] transition-colors min-h-[20px]"
            title="Click to edit note"
          >
            {note || "Click to add a note..."}
          </p>
        )}
        <div className="flex justify-end mt-2">
          {!confirmDelete ? (
            <button
              onClick={handleDelete}
              className="text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              Delete
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-[#999]"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="text-xs text-red-600 font-semibold"
              >
                {loading ? "..." : "Confirm"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
