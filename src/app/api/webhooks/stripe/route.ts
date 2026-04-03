import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

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
      await supabase
        .from("selections")
        .update({
          status: "paid",
          payment_method: "stripe",
          payment_confirmed_at: new Date().toISOString(),
        })
        .eq("id", selectionId);
    }
  }

  return NextResponse.json({ received: true });
}
