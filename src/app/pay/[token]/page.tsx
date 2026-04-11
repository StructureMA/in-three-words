import QRCode from "qrcode";
import { createAdminClient } from "@/lib/supabase/admin";
import PaymentClient from "./payment-client";

interface PaymentPageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{
    success?: string;
    canceled?: string;
    preview?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function PaymentPage({
  params,
  searchParams,
}: PaymentPageProps) {
  const { token } = await params;
  const { success, canceled, preview } = await searchParams;
  const isPreview = preview === "1";

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
  const hasShipping = !!selection.shipping_street;

  // Preview mode (admin) bypasses every gate below and renders the payment UI
  // with buttons disabled. Auth is the payment_token itself.
  if (!isPreview) {
    // Fully complete — paid + shipping submitted
    if (isPaid && hasShipping) {
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

    // Notification hasn't been sent yet — link isn't live
    if (selection.status === "drawn") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] px-4">
          <div className="text-center max-w-md">
            <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#1A1A1A] mb-2">
              This link isn&apos;t active yet
            </h1>
            <p className="text-[#6B6B6B]">
              Your confirmation window hasn&apos;t started. Hold tight —
              we&apos;ll reach out when it&apos;s ready.
            </p>
          </div>
        </div>
      );
    }

    // Confirmation window closed before payment
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

  const priceDollars = entry.size === "small" ? 20 : 25;
  const price = `$${priceDollars}`;

  // If payment is done but shipping wasn't entered (e.g. tab closed after
  // Stripe success), drop the user straight into the address form.
  const needsShippingAfterPayment = isPaid && !hasShipping;

  // Build a Venmo payment deeplink with prefilled amount + note. When scanned
  // or tapped on a phone with Venmo installed, iOS/Android hand off to the app.
  const venmoHandle = venmoSetting?.value?.trim() || "";
  const venmoPaymentUrl = venmoHandle
    ? `https://venmo.com/u/${encodeURIComponent(venmoHandle)}?txn=pay&amount=${priceDollars}&note=${encodeURIComponent(`${entry.name} - In a Few Words`)}`
    : "";
  const venmoQrDataUrl = venmoPaymentUrl
    ? await QRCode.toDataURL(venmoPaymentUrl, {
        width: 240,
        margin: 1,
        color: { dark: "#1A1A1A", light: "#FFFFFF" },
      })
    : "";

  return (
    <PaymentClient
      token={token}
      entryName={entry.name}
      words={words}
      size={entry.size}
      price={price}
      venmoHandle={venmoHandle}
      venmoPaymentUrl={venmoPaymentUrl}
      venmoQrDataUrl={venmoQrDataUrl}
      hasShippingAddress={hasShipping}
      paymentSuccess={success === "true" || needsShippingAfterPayment}
      paymentCanceled={canceled === "true"}
      preview={isPreview}
    />
  );
}
