import { createAdminClient } from "@/lib/supabase/admin";
import { getWords } from "@/lib/utils";
import type { Entry, Painting, Selection, Charity } from "@/lib/types";
import Link from "next/link";

interface PaintingWithDetails extends Painting {
  selections: Selection & {
    entries: Entry;
  };
}

export const metadata = {
  title: "Gallery — In a Few Words",
  description: "Original paintings inspired by a few words, created for strangers, with a portion going to charity.",
};

export default async function GalleryPage() {
  const supabase = createAdminClient();

  // Fetch featured paintings with their selections and entries
  const { data: paintings } = (await supabase
    .from("paintings")
    .select("*, selections!inner(*, entries!inner(*))")
    .eq("featured", true)
    .order("created_at", { ascending: false })) as {
    data: PaintingWithDetails[] | null;
    error: unknown;
  };

  // Fetch charities to map week_of to charity name
  const { data: charities } = (await supabase
    .from("charities")
    .select("*")) as {
    data: Charity[] | null;
    error: unknown;
  };

  const charityByWeek = new Map(
    (charities || []).map((c) => [c.week_of, c])
  );

  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Link
            href="/"
            className="text-sm text-[#2E6B8A] hover:underline mb-4 inline-block"
          >
            &larr; Back to home
          </Link>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold text-[#1A1A1A] mb-3">
            Gallery
          </h1>
          <p className="text-[#6B6B6B] text-lg max-w-lg mx-auto">
            Each painting starts with a few words from a stranger. Here are the
            ones that have found their homes.
          </p>
        </div>

        {paintings && paintings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paintings.map((painting) => {
              const entry = painting.selections.entries;
              const words = getWords(entry);
              const weekOf = entry.week_of;
              const charity = charityByWeek.get(weekOf);

              // Format buyer name: First name + last initial
              const nameParts = entry.name.trim().split(/\s+/);
              const displayName =
                nameParts.length > 1
                  ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`
                  : nameParts[0];

              // Format location
              const city = painting.selections.shipping_city;
              const state = painting.selections.shipping_state;
              const location =
                city && state ? `${city}, ${state}` : city || state || null;

              return (
                <div
                  key={painting.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-[#F0F0EE]">
                    <img
                      src={painting.image_url}
                      alt={`Painting inspired by: ${words.join(", ")}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex gap-1.5 flex-wrap mb-3">
                      {words.map((word, i) => (
                        <span
                          key={i}
                          className="bg-[#E8F1F5] text-[#2E6B8A] text-xs font-semibold px-2.5 py-1 rounded-full"
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-[#1A1A1A] font-medium">
                      {displayName}
                      {location && (
                        <span className="text-[#999] font-normal">
                          {" "}
                          &middot; {location}
                        </span>
                      )}
                    </p>
                    {charity && (
                      <p className="text-xs text-[#6B6B6B] mt-1">
                        Supporting{" "}
                        {charity.url ? (
                          <a
                            href={charity.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#2E6B8A] hover:underline"
                          >
                            {charity.name}
                          </a>
                        ) : (
                          charity.name
                        )}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-[#999] text-lg">
              No paintings yet — check back soon!
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
