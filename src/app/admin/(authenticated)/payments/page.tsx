import { createClient } from "@/lib/supabase/server";
import { getWords } from "@/lib/utils";
import type { SelectionWithEntry, PaymentMethod } from "@/lib/types";
import MarkPaidButton from "./mark-paid-button";

function statusBadge(status: string) {
  switch (status) {
    case "paid":
    case "painting":
    case "shipped":
    case "posted":
      return (
        <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
          Paid
        </span>
      );
    case "confirmed":
      return (
        <span className="text-xs font-semibold text-[#D4A574] bg-[#D4A574]/10 px-3 py-1 rounded-full">
          Confirmed
        </span>
      );
    default:
      return (
        <span className="text-xs font-semibold text-[#6B6B6B] bg-[#F0F0EE] px-3 py-1 rounded-full">
          Pending
        </span>
      );
  }
}

function methodLabel(method: PaymentMethod | null) {
  if (!method) return null;
  const labels: Record<PaymentMethod, string> = {
    stripe: "Stripe",
    venmo: "Venmo",
    paypal: "PayPal",
  };
  return labels[method];
}

function isPaid(status: string) {
  return ["paid", "painting", "shipped", "posted"].includes(status);
}

export default async function AdminPaymentsPage() {
  const supabase = await createClient();

  const { data: selections } = (await supabase
    .from("selections")
    .select("*, entries!inner(*)")
    .order("created_at", { ascending: false })) as {
    data: SelectionWithEntry[] | null;
    error: unknown;
  };

  const paidCount =
    selections?.filter((s) => isPaid(s.status)).length ?? 0;
  const pendingCount = (selections?.length ?? 0) - paidCount;

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Payments</h1>
        <p className="text-sm text-[#6B6B6B]">
          {selections?.length ?? 0} total &middot; {paidCount} paid &middot;{" "}
          {pendingCount} pending
        </p>
      </div>

      <div className="bg-white border border-[#E8E6E3] rounded-xl overflow-hidden">
        {selections && selections.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E8E6E3] text-left text-xs uppercase tracking-wider text-[#6B6B6B]">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Words</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Paid At</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {selections.map((selection) => {
                const entry = selection.entries;
                const paid = isPaid(selection.status);

                return (
                  <tr
                    key={selection.id}
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
                    <td className="px-4 py-3">
                      {statusBadge(selection.status)}
                    </td>
                    <td className="px-4 py-3 text-[#6B6B6B]">
                      {paid && methodLabel(selection.payment_method)
                        ? methodLabel(selection.payment_method)
                        : paid
                          ? "—"
                          : ""}
                    </td>
                    <td className="px-4 py-3 text-[#999] text-xs">
                      {selection.payment_confirmed_at
                        ? new Date(
                            selection.payment_confirmed_at
                          ).toLocaleString()
                        : ""}
                    </td>
                    <td className="px-4 py-3">
                      {!paid && (
                        <MarkPaidButton selectionId={selection.id} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="px-4 py-12 text-center text-[#999]">
            No selections yet.
          </div>
        )}
      </div>
    </div>
  );
}
