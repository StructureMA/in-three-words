import { createClient } from "@/lib/supabase/server";
import { getCurrentWeekMonday, formatPhone, getWords } from "@/lib/utils";
import type { Entry, SelectionStatus } from "@/lib/types";
import AdminCountdown from "./admin-countdown";

const STATUS_STEPS: { key: SelectionStatus; label: string }[] = [
  { key: "drawn", label: "Drawn" },
  { key: "notified", label: "Notified" },
  { key: "paid", label: "Paid" },
  { key: "painting", label: "Painting" },
  { key: "shipped", label: "Shipped" },
  { key: "posted", label: "Posted" },
];

function getStepIndex(status: SelectionStatus): number {
  return STATUS_STEPS.findIndex((s) => s.key === status);
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default async function AdminDashboard() {
  const supabase = await createClient();
  const weekOf = getCurrentWeekMonday();

  // Format week label
  const weekDate = new Date(weekOf + "T00:00:00");
  const weekLabel = weekDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Fetch all data in parallel
  const [
    entriesResult,
    paintingsResult,
    charitiesResult,
    selectionResult,
    currentCharityResult,
    recentEntriesResult,
  ] = await Promise.all([
    // This week's entry count
    supabase
      .from("entries")
      .select("id", { count: "exact", head: true })
      .eq("week_of", weekOf),
    // Total paintings
    supabase
      .from("paintings")
      .select("id", { count: "exact", head: true }),
    // Total donated
    supabase
      .from("charities")
      .select("donation_amount")
      .not("donated_at", "is", null),
    // Current week's active selection
    supabase
      .from("selections")
      .select("*, entries!inner(*)")
      .eq("entries.week_of", weekOf)
      .not("status", "eq", "posted")
      .limit(1)
      .maybeSingle(),
    // Current week's charity
    supabase
      .from("charities")
      .select("*")
      .eq("week_of", weekOf)
      .maybeSingle(),
    // Next week entries preview (last 4)
    supabase
      .from("entries")
      .select("*")
      .eq("week_of", weekOf)
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  const entryCount = entriesResult.count ?? 0;
  const paintingCount = paintingsResult.count ?? 0;

  const totalDonated = (charitiesResult.data || []).reduce(
    (sum, c) => sum + (c.donation_amount ?? 0),
    0
  );

  const selection = selectionResult.data;
  const selectedEntry = selection?.entries as Entry | undefined;
  const currentCharity = currentCharityResult.data;
  const recentEntries = (recentEntriesResult.data || []) as Entry[];

  // Determine status text
  let statusText = "No entry selected yet";
  if (selection) {
    const step = STATUS_STEPS.find((s) => s.key === selection.status);
    statusText = `Status: ${step?.label ?? selection.status}`;
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Top bar */}
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">
            Week of {weekLabel}
          </h1>
          <p className="text-sm text-[#6B6B6B] mt-0.5">{statusText}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-[#E8E6E3] p-4">
          <p className="text-xs uppercase tracking-wider text-[#6B6B6B] mb-1">
            This week&apos;s entries
          </p>
          <p className="text-2xl font-bold text-[#1A1A1A]">{entryCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E8E6E3] p-4">
          <p className="text-xs uppercase tracking-wider text-[#6B6B6B] mb-1">
            Total paintings
          </p>
          <p className="text-2xl font-bold text-[#1A1A1A]">{paintingCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E8E6E3] p-4">
          <p className="text-xs uppercase tracking-wider text-[#6B6B6B] mb-1">
            Total donated
          </p>
          <p className="text-2xl font-bold text-[#1A1A1A]">
            ${totalDonated.toFixed(0)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-[#E8E6E3] p-4">
          <p className="text-xs uppercase tracking-wider text-[#6B6B6B] mb-1">
            Entries close in
          </p>
          <AdminCountdown />
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: This week's entry */}
        <div className="bg-white rounded-xl border border-[#E8E6E3] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#2E6B8A] mb-4">
            This week&apos;s entry
          </h2>
          {selection && selectedEntry ? (
            <div>
              <div className="mb-4">
                <p className="font-semibold text-[#1A1A1A] text-lg">
                  {selectedEntry.name}
                </p>
                <p className="text-sm text-[#6B6B6B]">
                  {formatPhone(selectedEntry.phone)}
                </p>
                <div className="flex gap-1.5 flex-wrap mt-2">
                  {getWords(selectedEntry).map((word, i) => (
                    <span
                      key={i}
                      className="bg-[#E8F1F5] text-[#2E6B8A] text-xs font-semibold px-2.5 py-1 rounded-full"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>

              {/* Payment status badge */}
              <div className="mb-5">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    selection.payment_confirmed_at
                      ? "bg-green-50 text-green-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {selection.payment_confirmed_at
                    ? `Paid via ${selection.payment_method ?? "unknown"}`
                    : "Awaiting payment"}
                </span>
              </div>

              {/* Progress tracker */}
              <div className="space-y-3">
                {STATUS_STEPS.map((step, i) => {
                  const currentIndex = getStepIndex(
                    selection.status as SelectionStatus
                  );
                  const isCompleted = i < currentIndex;
                  const isCurrent = i === currentIndex;
                  return (
                    <div key={step.key} className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          isCompleted
                            ? "bg-[#2E6B8A] text-white"
                            : isCurrent
                              ? "bg-[#D4A574] text-white"
                              : "bg-[#F0F0EE] text-[#999]"
                        }`}
                      >
                        {isCompleted ? "\u2713" : i + 1}
                      </div>
                      <span
                        className={`text-sm ${
                          isCompleted
                            ? "text-[#6B6B6B] line-through"
                            : isCurrent
                              ? "text-[#1A1A1A] font-semibold"
                              : "text-[#999]"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-[#999] text-sm">
              No entry selected yet this week.
            </p>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Charity this week */}
          <div className="bg-white rounded-xl border border-[#E8E6E3] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#2E6B8A] mb-4">
              Charity this week
            </h2>
            {currentCharity ? (
              <div>
                <p className="font-semibold text-[#1A1A1A]">
                  {currentCharity.name}
                </p>
                {currentCharity.donation_amount !== null && (
                  <p className="text-sm text-[#6B6B6B] mt-1">
                    Donation: ${currentCharity.donation_amount}
                  </p>
                )}
                <span
                  className={`inline-block mt-2 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    currentCharity.donated_at
                      ? "bg-green-50 text-green-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {currentCharity.donated_at ? "Donated" : "Not yet donated"}
                </span>
              </div>
            ) : (
              <p className="text-[#999] text-sm">
                No charity set for this week.
              </p>
            )}
          </div>

          {/* Recent entries preview */}
          <div className="bg-white rounded-xl border border-[#E8E6E3] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#2E6B8A] mb-4">
              Recent entries
            </h2>
            {recentEntries.length > 0 ? (
              <div className="space-y-3">
                {recentEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between gap-3 py-2 border-b border-[#F0F0EE] last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#1A1A1A] truncate">
                        {entry.name}
                      </p>
                      <div className="flex gap-1 flex-wrap mt-0.5">
                        {getWords(entry).map((word, i) => (
                          <span
                            key={i}
                            className="text-xs text-[#2E6B8A]"
                          >
                            {word}
                            {i < getWords(entry).length - 1 ? "," : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-[#999] flex-shrink-0">
                      {timeAgo(entry.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#999] text-sm">No entries yet this week.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
