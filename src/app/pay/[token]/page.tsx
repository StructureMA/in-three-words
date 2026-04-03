import { createAdminClient } from "@/lib/supabase/admin";
import PaymentClient from "./payment-client";

interface PaymentPageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ success?: string; canceled?: string }>;
}

export const dynamic = "force-dynamic";

export default async function PaymentPage({
  params,
  searchParams,
}: PaymentPageProps) {
  const { token } = await params;
  const { success, canceled } = await searchParams;

  const supabase = createAdminClient();

  const { data: selection } = await supabase
    .from("selections")
    .select("*, entries!inner(*)")
    .eq("payment_token", token)
    .single();

  if (!selection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] px-4">
        <div className="text-center">
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#1A1A1A] mb-2">
            Invalid link
          </h1>
          <p className="text-[#6B6B6B]">This payment link is not valid.</p>
        </div>
      </div>
    );
  }

  const entry = selection.entries as Record<string, string>;
  const isExpired =
    selection.expires_at && new Date(selection.expires_at) < new Date();
  const isPaid = ["paid", "painting", "shipped", "posted"].includes(
    selection.status
  );

  if (isExpired && !isPaid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] px-4">
        <div className="text-center">
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#1A1A1A] mb-2">
            This link has expired
          </h1>
          <p className="text-[#6B6B6B]">
            The 3-hour confirmation window has passed.
          </p>
        </div>
      </div>
    );
  }

  // If they already submitted shipping, show confirmation
  if (isPaid && selection.shipping_street) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] px-4">
        <div className="text-center max-w-md">
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#1A1A1A] mb-4">
            You&apos;re all set!
          </h1>
          <p className="text-[#6B6B6B] text-lg mb-2">
            Your painting is on its way. We&apos;ll send you a text when it
            ships.
          </p>
          <p className="text-[#999] text-sm">
            Shipping to {selection.shipping_city}, {selection.shipping_state}
          </p>
        </div>
      </div>
    );
  }

  const { data: venmoSetting } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "venmo_handle")
    .single();

  const words = [
    entry.word_1,
    entry.word_2,
    entry.word_3,
    entry.word_4,
  ].filter((w: string | null): w is string => w !== null && w.trim() !== "");

  const price = entry.size === "small" ? "$20" : "$25";

  return (
    <PaymentClient
      token={token}
      entryName={entry.name}
      words={words}
      size={entry.size}
      price={price}
      venmoHandle={venmoSetting?.value || ""}
      hasShippingAddress={!!selection.shipping_street}
      paymentSuccess={success === "true"}
      paymentCanceled={canceled === "true"}
    />
  );
}
