import { createAdminClient } from "@/lib/supabase/admin";
import { getWords } from "@/lib/utils";
import type { Entry, Painting, Selection } from "@/lib/types";
import UploadPainting from "./upload-painting";
import FeaturedToggle from "./featured-toggle";

interface PaintingWithDetails extends Painting {
  selections: Selection & {
    entries: Entry;
  };
}

export default async function AdminGalleryPage() {
  const supabase = createAdminClient();

  // Fetch all paintings with their selections and entries
  const { data: paintings } = (await supabase
    .from("paintings")
    .select("*, selections!inner(*, entries!inner(*))")
    .order("created_at", { ascending: false })) as {
    data: PaintingWithDetails[] | null;
    error: unknown;
  };

  // Fetch paid selections that don't have paintings yet
  const { data: paidSelections } = (await supabase
    .from("selections")
    .select("*, entries!inner(*)")
    .eq("status", "paid")) as {
    data: (Selection & { entries: Entry })[] | null;
    error: unknown;
  };

  const availableSelections = (paidSelections || []).map((s) => ({
    id: s.id,
    entryName: s.entries.name,
    words: getWords(s.entries),
  }));

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Gallery</h1>
        <p className="text-sm text-[#6B6B6B]">
          {paintings?.length ?? 0} painting{(paintings?.length ?? 0) !== 1 ? "s" : ""}
        </p>
      </div>

      <UploadPainting availableSelections={availableSelections} />

      {paintings && paintings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {paintings.map((painting) => {
            const entry = painting.selections.entries;
            const words = getWords(entry);

            return (
              <div
                key={painting.id}
                className="bg-white border border-[#E8E6E3] rounded-xl overflow-hidden"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#F0F0EE]">
                  <img
                    src={painting.image_url}
                    alt={`Painting for ${entry.name}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-[#1A1A1A]">
                      {entry.name}
                    </span>
                    <FeaturedToggle
                      paintingId={painting.id}
                      initialFeatured={painting.featured}
                    />
                  </div>
                  <div className="flex gap-1.5 flex-wrap mb-2">
                    {words.map((word, i) => (
                      <span
                        key={i}
                        className="bg-[#E8F1F5] text-[#2E6B8A] text-xs px-2 py-0.5 rounded-full"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                  {painting.description && (
                    <p className="text-xs text-[#6B6B6B]">
                      {painting.description}
                    </p>
                  )}
                  <p className="text-xs text-[#999] mt-2">
                    {new Date(painting.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-[#E8E6E3] rounded-xl px-4 py-12 text-center text-[#999]">
          No paintings yet.
        </div>
      )}
    </div>
  );
}
