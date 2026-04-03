import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentWeekMonday, getWords } from "@/lib/utils";
import EntryCountdown from "@/components/entry-countdown";
import type { Entry, Painting, Selection } from "@/lib/types";

interface PaintingWithDetails extends Painting {
  selections: Selection & {
    entries: Entry;
  };
}

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = createAdminClient();
  const weekOf = getCurrentWeekMonday();

  // Fetch current week's active selection (not yet "posted")
  const { data: activeSelection } = await supabase
    .from("selections")
    .select("*, entries!inner(*)")
    .eq("entries.week_of", weekOf)
    .not("status", "eq", "posted")
    .limit(1)
    .maybeSingle();

  // Fetch current week's charity
  const { data: currentCharity } = await supabase
    .from("charities")
    .select("*")
    .eq("week_of", weekOf)
    .maybeSingle();

  // Fetch last 3 featured paintings for gallery preview
  const { data: recentPaintings } = (await supabase
    .from("paintings")
    .select("*, selections!inner(*, entries!inner(*))")
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(3)) as { data: PaintingWithDetails[] | null; error: unknown };

  const entry = activeSelection?.entries as Entry | undefined;
  const selectionWords = entry ? getWords(entry) : [];

  // Display name: first name + last initial
  let displayName = "";
  let location = "";
  if (entry) {
    const parts = entry.name.trim().split(/\s+/);
    displayName =
      parts.length > 1
        ? `${parts[0]} ${parts[parts.length - 1][0]}.`
        : parts[0];
  }
  if (activeSelection) {
    const city = activeSelection.shipping_city;
    const state = activeSelection.shipping_state;
    if (city && state) location = `${city}, ${state}`;
    else if (city) location = city;
    else if (state) location = state;
  }

  return (
    <main className="min-h-screen bg-[#FAFAF8] relative overflow-hidden">
      {/* ── Spray paint mesh corners ── */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        {/* Top-left corner */}
        <div className="absolute -top-16 -left-16 w-96 h-96 sm:w-[500px] sm:h-[500px]">
          <svg viewBox="0 0 400 400" className="w-full h-full opacity-[0.35]">
            <defs>
              <filter id="spray-tl">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
                <feGaussianBlur stdDeviation="0.5" />
              </filter>
              <pattern id="mesh-tl" width="12" height="12" patternUnits="userSpaceOnUse">
                <rect width="12" height="12" fill="none" />
                <rect x="1" y="1" width="10" height="10" rx="1.5" fill="#2E6B8A" />
                <rect x="3" y="3" width="6" height="6" rx="0.5" fill="none" stroke="rgba(250,250,248,0.6)" strokeWidth="1" />
              </pattern>
              <radialGradient id="fade-tl" cx="0" cy="0" r="0.7">
                <stop offset="0%" stopOpacity="1" />
                <stop offset="60%" stopOpacity="0.7" />
                <stop offset="100%" stopOpacity="0" />
              </radialGradient>
              <mask id="mask-tl">
                <rect width="400" height="400" fill="url(#fade-tl)" />
              </mask>
            </defs>
            <g mask="url(#mask-tl)" filter="url(#spray-tl)">
              <rect width="400" height="400" fill="url(#mesh-tl)" />
            </g>
            {/* Overspray dots */}
            <g opacity="0.4">
              <circle cx="180" cy="45" r="1.5" fill="#2E6B8A" />
              <circle cx="210" cy="80" r="1" fill="#2E6B8A" />
              <circle cx="160" cy="120" r="0.8" fill="#2E6B8A" />
              <circle cx="240" cy="60" r="1.2" fill="#2E6B8A" />
              <circle cx="45" cy="190" r="1" fill="#2E6B8A" />
              <circle cx="80" cy="220" r="1.5" fill="#2E6B8A" />
              <circle cx="120" cy="175" r="0.8" fill="#2E6B8A" />
              <circle cx="250" cy="110" r="1" fill="#2E6B8A" />
              <circle cx="100" cy="250" r="0.7" fill="#2E6B8A" />
              <circle cx="270" cy="140" r="1.3" fill="#2E6B8A" />
            </g>
          </svg>
        </div>
        {/* Bottom-right corner */}
        <div className="absolute -bottom-16 -right-16 w-96 h-96 sm:w-[500px] sm:h-[500px]">
          <svg viewBox="0 0 400 400" className="w-full h-full opacity-[0.35]">
            <defs>
              <filter id="spray-br">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
                <feGaussianBlur stdDeviation="0.5" />
              </filter>
              <pattern id="mesh-br" width="12" height="12" patternUnits="userSpaceOnUse">
                <rect width="12" height="12" fill="none" />
                <rect x="1" y="1" width="10" height="10" rx="1.5" fill="#2E6B8A" />
                <rect x="3" y="3" width="6" height="6" rx="0.5" fill="none" stroke="rgba(250,250,248,0.6)" strokeWidth="1" />
              </pattern>
              <radialGradient id="fade-br" cx="1" cy="1" r="0.7">
                <stop offset="0%" stopOpacity="1" />
                <stop offset="60%" stopOpacity="0.7" />
                <stop offset="100%" stopOpacity="0" />
              </radialGradient>
              <mask id="mask-br">
                <rect width="400" height="400" fill="url(#fade-br)" />
              </mask>
            </defs>
            <g mask="url(#mask-br)" filter="url(#spray-br)">
              <rect width="400" height="400" fill="url(#mesh-br)" />
            </g>
            {/* Overspray dots */}
            <g opacity="0.4">
              <circle cx="220" cy="355" r="1.5" fill="#2E6B8A" />
              <circle cx="190" cy="320" r="1" fill="#2E6B8A" />
              <circle cx="240" cy="280" r="0.8" fill="#2E6B8A" />
              <circle cx="160" cy="340" r="1.2" fill="#2E6B8A" />
              <circle cx="355" cy="210" r="1" fill="#2E6B8A" />
              <circle cx="320" cy="180" r="1.5" fill="#2E6B8A" />
              <circle cx="280" cy="225" r="0.8" fill="#2E6B8A" />
              <circle cx="150" cy="290" r="1" fill="#2E6B8A" />
              <circle cx="300" cy="150" r="0.7" fill="#2E6B8A" />
              <circle cx="130" cy="260" r="1.3" fill="#2E6B8A" />
            </g>
          </svg>
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="max-w-3xl mx-auto px-4 pt-20 pb-16 text-center">
        <h1 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl md:text-6xl font-bold text-[#1A1A1A] leading-tight mb-6">
          Give me a few words.
          <br />
          I&apos;ll paint <em className="text-[#2E6B8A]">you</em> a painting.
        </h1>
        <div className="text-lg sm:text-xl text-[#6B6B6B] max-w-2xl mx-auto leading-relaxed space-y-1 text-center">
          <p>Tell me 2&ndash;4 words &mdash; they&apos;ll guide the painting.</p>
          <p>Each week, one stranger is selected.</p>
          <p>You get the original, shipped to your door.</p>
          <p>A portion goes to charity.</p>
        </div>
      </section>

      {/* ── Painting Now Banner ── */}
      <section className="max-w-3xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-2xl border border-[#E8E6E3] p-6 sm:p-8 text-center shadow-sm">
          {activeSelection && entry ? (
            <>
              <p className="text-xs uppercase tracking-widest text-[#D4A574] font-semibold mb-3">
                Painting now
              </p>
              <p className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#1A1A1A] mb-1">
                This week&apos;s entry: {displayName}
              </p>
              {location && (
                <p className="text-sm text-[#6B6B6B] mb-4">{location}</p>
              )}
              <div className="flex justify-center gap-2 flex-wrap">
                {selectionWords.map((word, i) => (
                  <span
                    key={i}
                    className="bg-[#E8F1F5] text-[#2E6B8A] text-sm font-semibold px-3 py-1.5 rounded-full"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="text-xs uppercase tracking-widest text-[#D4A574] font-semibold mb-3">
                This week
              </p>
              <p className="font-[family-name:var(--font-playfair)] text-xl text-[#6B6B6B]">
                No entry selected yet this week
              </p>
            </>
          )}
        </div>
      </section>

      {/* ── Enter CTA + Countdown ── */}
      <section className="max-w-3xl mx-auto px-4 pb-20 text-center">
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-6">
          Enter for next week
        </h2>
        <div className="mb-8">
          <EntryCountdown />
        </div>
        <Link
          href="/enter"
          className="inline-block px-8 py-4 bg-[#2E6B8A] text-white rounded-xl font-semibold text-base hover:bg-[#245a74] transition-colors shadow-sm"
        >
          Submit your words
        </Link>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-white border-y border-[#E8E6E3]">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:py-20">
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-bold text-[#1A1A1A] text-center mb-12">
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-8 sm:gap-4">
            {[
              {
                step: "1",
                title: "Enter your words",
                desc: "Pick 2\u20134 words that mean something to you.",
              },
              {
                step: "2",
                title: "Get selected Sunday",
                desc: "One entry is chosen at random each week.",
              },
              {
                step: "3",
                title: "Confirm & pay",
                desc: "Small or medium \u2014 $20 or $25. Simple.",
              },
              {
                step: "4",
                title: "I paint your piece",
                desc: "Your words become an original painting.",
              },
              {
                step: "5",
                title: "Art + charity",
                desc: "You get the painting. A portion goes to charity.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-[#E8F1F5] text-[#2E6B8A] font-bold text-sm flex items-center justify-center mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold text-[#1A1A1A] text-sm mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-[#6B6B6B] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Charity Banner ── */}
      <section className="bg-[#2E6B8A]">
        <div className="max-w-3xl mx-auto px-4 py-14 text-center">
          <p className="text-xs uppercase tracking-widest text-[#E8F1F5]/70 font-semibold mb-3">
            Art that gives back
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-bold text-white mb-3">
            Every painting supports a cause
          </h2>
          {currentCharity ? (
            <p className="text-[#E8F1F5] text-lg">
              This week&apos;s charity:{" "}
              <span className="font-semibold text-white">
                {currentCharity.name}
              </span>
            </p>
          ) : (
            <p className="text-[#E8F1F5] text-lg">
              A new charity is chosen each week.
            </p>
          )}
        </div>
      </section>

      {/* ── Gallery Preview ── */}
      <section className="max-w-4xl mx-auto px-4 py-16 sm:py-20">
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-bold text-[#1A1A1A] text-center mb-10">
          Recent paintings
        </h2>
        {recentPaintings && recentPaintings.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              {recentPaintings.map((painting) => {
                const pEntry = painting.selections.entries;
                const words = getWords(pEntry);
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
                      <div className="flex gap-1.5 flex-wrap">
                        {words.map((word, i) => (
                          <span
                            key={i}
                            className="bg-[#E8F1F5] text-[#2E6B8A] text-xs font-semibold px-2.5 py-1 rounded-full"
                          >
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-center">
              <Link
                href="/gallery"
                className="text-[#2E6B8A] font-semibold hover:underline"
              >
                View all paintings &rarr;
              </Link>
            </div>
          </>
        ) : (
          <p className="text-center text-[#999] text-lg">
            No paintings yet &mdash; check back soon!
          </p>
        )}
      </section>
    </main>
  );
}
