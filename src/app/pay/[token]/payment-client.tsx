"use client";

import { useState } from "react";
import {
  initiateStripePayment,
  submitShippingAddress,
} from "@/actions/payments";

interface PaymentClientProps {
  token: string;
  entryName: string;
  words: string[];
  size: string;
  price: string;
  venmoHandle: string;
  hasShippingAddress: boolean;
  paymentSuccess: boolean;
  paymentCanceled: boolean;
  preview?: boolean;
}

export default function PaymentClient({
  token,
  entryName,
  words,
  size,
  price,
  venmoHandle,
  hasShippingAddress,
  paymentSuccess,
  paymentCanceled,
  preview = false,
}: PaymentClientProps) {
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [addressSubmitted, setAddressSubmitted] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [isGift, setIsGift] = useState(false);

  async function handleStripePay() {
    if (preview) return;
    setStripeLoading(true);
    setStripeError(null);
    try {
      const result = await initiateStripePayment(token);
      // On success the server action redirects and we never reach here.
      // A returned error means the action rejected cleanly (e.g. bad status).
      if (result?.error) {
        setStripeError(result.error);
        setStripeLoading(false);
      }
    } catch {
      // Server action threw (Stripe API error, network issue, etc). Without
      // this catch the button stays stuck in "Redirecting to checkout..."
      setStripeError(
        "Something went wrong starting checkout. Please try again or use Venmo."
      );
      setStripeLoading(false);
    }
  }

  async function handleAddressSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (preview) return;
    setAddressLoading(true);
    setAddressError(null);
    const formData = new FormData(e.currentTarget);
    const result = await submitShippingAddress(token, formData);
    setAddressLoading(false);
    if (result.success) {
      setAddressSubmitted(true);
    } else {
      setAddressError(result.error);
    }
  }

  const previewBanner = preview ? (
    <div className="bg-[#D4A574]/10 border border-[#D4A574]/40 text-[#8B6B3E] text-sm px-4 py-3 rounded-lg mb-6 text-center">
      <strong>Preview mode</strong> — this is what {entryName} will see. Buttons
      are disabled.
    </div>
  ) : null;

  // If address was just submitted, show confirmation
  if (addressSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] px-4">
        <div className="text-center max-w-md">
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#1A1A1A] mb-4">
            You&apos;re all set!
          </h1>
          <p className="text-[#6B6B6B] text-lg">
            Your painting is on its way. We&apos;ll send you a text when it
            ships.
          </p>
        </div>
      </div>
    );
  }

  // After successful Stripe payment — show shipping address form
  if (paymentSuccess && !hasShippingAddress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] px-4">
        <div className="w-full max-w-md">
          {previewBanner}
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#1A1A1A] mb-2">
            Payment received!
          </h1>
          <p className="text-[#6B6B6B] mb-6">
            Now, where should we ship your painting?
          </p>
          <form onSubmit={handleAddressSubmit} className="space-y-4">
            <input type="hidden" name="is_gift" value={isGift ? "true" : "false"} />
            <input
              type="text"
              name="street"
              placeholder="Street address *"
              required
              className="w-full px-4 py-3 border border-[#E8E6E3] rounded-lg bg-white text-[#1A1A1A] placeholder-[#999] focus:outline-none focus:border-[#2E6B8A] transition-colors"
            />
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                name="city"
                placeholder="City *"
                required
                className="col-span-1 px-4 py-3 border border-[#E8E6E3] rounded-lg bg-white text-[#1A1A1A] placeholder-[#999] focus:outline-none focus:border-[#2E6B8A] transition-colors"
              />
              <input
                type="text"
                name="state"
                placeholder="State *"
                required
                maxLength={2}
                className="col-span-1 px-4 py-3 border border-[#E8E6E3] rounded-lg bg-white text-[#1A1A1A] placeholder-[#999] focus:outline-none focus:border-[#2E6B8A] transition-colors"
              />
              <input
                type="text"
                name="zip"
                placeholder="ZIP *"
                required
                maxLength={10}
                className="col-span-1 px-4 py-3 border border-[#E8E6E3] rounded-lg bg-white text-[#1A1A1A] placeholder-[#999] focus:outline-none focus:border-[#2E6B8A] transition-colors"
              />
            </div>

            {/* Gift option */}
            {!isGift ? (
              <button
                type="button"
                onClick={() => setIsGift(true)}
                className="text-sm text-[#2E6B8A] font-medium hover:underline"
              >
                Want to send it to someone else?
              </button>
            ) : (
              <div className="border border-[#E8E6E3] rounded-lg p-4 space-y-3 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#1A1A1A]">
                    Gift recipient
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsGift(false)}
                    className="text-xs text-[#999] hover:text-[#6B6B6B]"
                  >
                    Cancel
                  </button>
                </div>
                <input
                  type="text"
                  name="gift_recipient_name"
                  placeholder="Recipient&apos;s name *"
                  required
                  className="w-full px-4 py-3 border border-[#E8E6E3] rounded-lg bg-[#FAFAF8] text-[#1A1A1A] placeholder-[#999] focus:outline-none focus:border-[#2E6B8A] transition-colors"
                />
                <textarea
                  name="gift_note"
                  placeholder="Add a note (optional)"
                  rows={3}
                  className="w-full px-4 py-3 border border-[#E8E6E3] rounded-lg bg-[#FAFAF8] text-[#1A1A1A] placeholder-[#999] focus:outline-none focus:border-[#2E6B8A] transition-colors resize-none"
                />
                <p className="text-xs text-[#999]">
                  Your name ({entryName}) will be included on the shipment documents. This cannot be changed.
                </p>
              </div>
            )}

            {addressError && (
              <p className="text-red-500 text-sm">{addressError}</p>
            )}
            <button
              type="submit"
              disabled={addressLoading || preview}
              className="w-full py-3 bg-[#2E6B8A] text-white rounded-lg font-semibold hover:bg-[#245a74] transition-colors disabled:opacity-50"
            >
              {addressLoading ? "Saving..." : "Confirm shipping address"}
            </button>
            <p className="text-xs text-center text-[#999]">US shipping only</p>
          </form>
        </div>
      </div>
    );
  }

  // Default: show payment options
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] px-4">
      <div className="w-full max-w-md">
        {previewBanner}
        <div className="text-center mb-8">
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#1A1A1A] mb-2">
            Hey {entryName}!
          </h1>
          <p className="text-[#6B6B6B] mb-4">
            Your entry was chosen this week.
          </p>
          <div className="flex gap-2 justify-center flex-wrap mb-4">
            {words.map((word, i) => (
              <span
                key={i}
                className="bg-[#E8F1F5] text-[#2E6B8A] text-sm font-semibold px-3 py-1 rounded-full"
              >
                {word}
              </span>
            ))}
          </div>
          <p className="text-[#6B6B6B]">
            {size === "small"
              ? "Small (up to 11\u00d714)"
              : "Medium (12\u00d716 to 24\u00d736)"}{" "}
            —{" "}
            <span className="font-semibold text-[#1A1A1A]">{price}</span>
          </p>
        </div>

        {paymentCanceled && (
          <div className="bg-[#D4A574]/10 text-[#D4A574] text-sm font-medium px-4 py-3 rounded-lg mb-4 text-center">
            Payment was canceled. You can try again below.
          </div>
        )}

        {stripeError && (
          <p className="text-red-500 text-sm text-center mb-4">{stripeError}</p>
        )}

        <button
          onClick={handleStripePay}
          disabled={stripeLoading || preview}
          className="w-full py-4 bg-[#2E6B8A] text-white rounded-lg font-semibold text-base hover:bg-[#245a74] transition-colors disabled:opacity-50 mb-4"
        >
          {stripeLoading
            ? "Redirecting to checkout..."
            : `Pay with card \u2014 ${price}`}
        </button>

        {venmoHandle && (
          <div className="text-center border-t border-[#E8E6E3] pt-4">
            <p className="text-sm text-[#6B6B6B] mb-1">Or pay via Venmo</p>
            <p className="text-base font-semibold text-[#1A1A1A]">
              @{venmoHandle}
            </p>
            <p className="text-xs text-[#999] mt-1">
              Include your name in the note. We&apos;ll confirm manually.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
