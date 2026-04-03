import { createClient } from "@/lib/supabase/server";
import { getCurrentWeekMonday, getWords, formatPhone } from "@/lib/utils";
import type { Entry, SelectionWithEntry } from "@/lib/types";
import DrawEntryButton from "./draw-entry-button";

export default async function AdminEntriesPage() {
  const supabase = await createClient();
  const weekOf = getCurrentWeekMonday();

  // Fetch entries for current week
  const { data: entries } = await supabase
    .from("entries")
    .select("*")
    .eq("week_of", weekOf)
    .order("created_at", { ascending: false });

  // Check if there's an active selection this week
  const { data: activeSelection } = await supabase
    .from("selections")
    .select("*, entries!inner(*)")
    .eq("entries.week_of", weekOf)
    .not("status", "eq", "posted")
    .limit(1)
    .maybeSingle() as { data: SelectionWithEntry | null; error: unknown };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Entries</h1>
          <p className="text-sm text-[#6B6B6B]">
            Week of {weekOf} · {entries?.length ?? 0} entries
          </p>
        </div>
        {!activeSelection && (entries?.length ?? 0) > 0 && (
          <DrawEntryButton />
        )}
        {activeSelection && (
          <div className="px-4 py-2 bg-[#E8F1F5] text-[#2E6B8A] rounded-lg text-sm font-semibold">
            Entry drawn: {activeSelection.entries.name}
          </div>
        )}
      </div>

      {/* Active selection banner */}
      {activeSelection && (
        <div className="border-2 border-[#2E6B8A] rounded-xl p-5 mb-6 bg-white">
          <div className="text-xs uppercase tracking-widest text-[#2E6B8A] font-semibold mb-2">
            This week&apos;s entry
          </div>
          <div className="text-xl font-bold text-[#1A1A1A]">
            {activeSelection.entries.name}
          </div>
          <div className="text-sm text-[#6B6B6B] mb-3">
            {formatPhone(activeSelection.entries.phone)}{" "}
            · {activeSelection.entries.size}
          </div>
          <div className="flex gap-2 mb-3">
            {getWords(activeSelection.entries).map(
              (word, i) => (
                <span
                  key={i}
                  className="bg-[#E8F1F5] text-[#2E6B8A] text-xs font-semibold px-3 py-1 rounded-full"
                >
                  {word}
                </span>
              )
            )}
          </div>
          <div className="text-xs text-[#6B6B6B]">
            Status:{" "}
            <span className="font-semibold text-[#1A1A1A]">
              {activeSelection.status}
            </span>
          </div>
        </div>
      )}

      {/* Entries list */}
      <div className="bg-white border border-[#E8E6E3] rounded-xl overflow-hidden">
        {entries && entries.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E8E6E3] text-left text-xs uppercase tracking-wider text-[#6B6B6B]">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Words</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry: Entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-[#F0F0EE] last:border-0 hover:bg-[#FAFAF8]"
                >
                  <td className="px-4 py-3 font-semibold text-[#1A1A1A]">
                    {entry.name}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      {getWords(entry).map((word, i) => (
                        <span
                          key={i}
                          className="bg-[#E8F1F5] text-[#2E6B8A] text-xs px-2 py-0.5 rounded-full"
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#6B6B6B] capitalize">
                    {entry.size}
                  </td>
                  <td className="px-4 py-3 text-[#6B6B6B]">
                    {formatPhone(entry.phone)}
                  </td>
                  <td className="px-4 py-3 text-[#999] text-xs">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-4 py-12 text-center text-[#999]">
            No entries yet this week.
          </div>
        )}
      </div>
    </div>
  );
}
