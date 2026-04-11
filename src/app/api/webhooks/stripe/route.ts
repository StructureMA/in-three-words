import { notifyPaymentReceived } from "@/lib/email";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

const PAID_STATUSES = ["paid", "painting", "shipped", "posted"];

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const selectionId = session.metadata?.selection_id;

    if (selectionId) {
      const supabase = createAdminClient();

      // Load current state first so we can skip duplicate notifications on
      // webhook retries. Stripe retries on any non-2xx response.
      const { data: existing } = await supabase
        .from("selections")
        .select("*, entries!inner(*)")
        .eq("id", selectionId)
        .single();

      if (existing && !PAID_STATUSES.includes(existing.status)) {
        await supabase
          .from("selections")
          .update({
            status: "paid",
            payment_method: "stripe",
            payment_confirmed_at: new Date().toISOString(),
          })
          .eq("id", selectionId);

        const entry = existing.entries as Record<string, string>;
        const words = [
          entry.word_1,
          entry.word_2,
          entry.word_3,
          entry.word_4,
        ].filter(
          (w: string | null): w is string => w !== null && w.trim() !== ""
        );

        try {
          await notifyPaymentReceived({
            name: entry.name,
            words,
            size: entry.size,
            amountCents: session.amount_total ?? 0,
            method: "stripe",
          });
        } catch (err) {
          // Don't fail the webhook if the email bounces — Stripe would retry
          // and we'd double-update. The DB state is already correct.
          console.error("Failed to send payment notification:", err);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
