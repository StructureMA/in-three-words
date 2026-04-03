import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentWeekMonday } from "@/lib/utils";
import type { Charity } from "@/lib/types";
import CharityForms from "./charity-forms";

export default async function AdminCharitiesPage() {
  const supabase = createAdminClient();
  const weekOf = getCurrentWeekMonday();

  // Fetch current week's charity
  const { data: currentCharity } = (await supabase
    .from("charities")
    .select("*")
    .eq("week_of", weekOf)
    .maybeSingle()) as { data: Charity | null; error: unknown };

  // Fetch all charities ordered by week
  const { data: allCharities } = (await supabase
    .from("charities")
    .select("*")
    .order("week_of", { ascending: false })) as {
    data: Charity[] | null;
    error: unknown;
  };

  const pastCharities = (allCharities || []).filter(
    (c) => c.week_of !== weekOf
  );

  const totalDonated = (allCharities || []).reduce(
    (sum, c) => sum + (c.donation_amount || 0),
    0
  );

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Charities</h1>
        <p className="text-sm text-[#6B6B6B]">
          Week of {weekOf}
        </p>
      </div>

      {/* Current week status */}
      {currentCharity && (
        <div className="bg-white border-2 border-[#2E6B8A] rounded-xl p-5 mb-6">
          <div className="text-xs uppercase tracking-widest text-[#2E6B8A] font-semibold mb-2">
            This week&apos;s charity
          </div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xl font-bold text-[#1A1A1A]">
              {currentCharity.name}
            </span>
            {currentCharity.donated_at ? (
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                Donated
              </span>
            ) : (
              <span className="text-xs font-semibold text-[#D4A574] bg-[#D4A574]/10 px-3 py-1 rounded-full">
                Pending donation
              </span>
            )}
          </div>
          {currentCharity.url && (
            <a
              href={currentCharity.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#2E6B8A] hover:underline"
            >
              {currentCharity.url}
            </a>
          )}
          {currentCharity.donated_at && (
            <div className="mt-2 text-sm text-[#6B6B6B]">
              ${currentCharity.donation_amount?.toFixed(2)} donated on{" "}
              {new Date(currentCharity.donated_at).toLocaleDateString()}
              {currentCharity.receipt_url && (
                <>
                  {" "}
                  &middot;{" "}
                  <a
                    href={currentCharity.receipt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2E6B8A] hover:underline"
                  >
                    View receipt
                  </a>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Forms */}
      <CharityForms currentCharity={currentCharity} />

      {/* Running total */}
      <div className="mt-8 mb-6 bg-[#E8F1F5] rounded-xl p-5">
        <div className="text-xs uppercase tracking-widest text-[#2E6B8A] font-semibold mb-1">
          Total donated
        </div>
        <div className="text-3xl font-bold text-[#1A1A1A]">
          ${totalDonated.toFixed(2)}
        </div>
        <p className="text-xs text-[#6B6B6B] mt-1">
          Across {(allCharities || []).filter((c) => c.donated_at).length}{" "}
          donation{(allCharities || []).filter((c) => c.donated_at).length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Past charities */}
      {pastCharities.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[#1A1A1A] mb-3">
            Past Charities
          </h2>
          <div className="bg-white border border-[#E8E6E3] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E8E6E3] text-left text-xs uppercase tracking-wider text-[#6B6B6B]">
                  <th className="px-4 py-3">Week</th>
                  <th className="px-4 py-3">Charity</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {pastCharities.map((charity) => (
                  <tr
                    key={charity.id}
                    className="border-b border-[#F0F0EE] last:border-0 hover:bg-[#FAFAF8]"
                  >
                    <td className="px-4 py-3 text-[#6B6B6B]">
                      {charity.week_of}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#1A1A1A]">
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
                    </td>
                    <td className="px-4 py-3 text-[#6B6B6B]">
                      {charity.donation_amount
                        ? `$${charity.donation_amount.toFixed(2)}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {charity.donated_at ? (
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                          Donated
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-[#999] bg-[#F0F0EE] px-3 py-1 rounded-full">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {charity.receipt_url ? (
                        <a
                          href={charity.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#2E6B8A] hover:underline"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-xs text-[#ccc]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
