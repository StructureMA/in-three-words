import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

interface CreateCheckoutParams {
  selectionId: string;
  paymentToken: string;
  entryName: string;
  size: "small" | "medium";
}

export async function createCheckoutSession({
  selectionId,
  paymentToken,
  entryName,
  size,
}: CreateCheckoutParams): Promise<string> {
  const price = size === "small" ? 2000 : 2500; // cents
  const label =
    size === "small" ? "Small (up to 11×14)" : "Medium (12×16 to 24×36)";

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `In a Few Words — Original Painting for ${entryName}`,
            description: `${label} original acrylic painting`,
          },
          unit_amount: price,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${baseUrl}/pay/${paymentToken}?success=true`,
    cancel_url: `${baseUrl}/pay/${paymentToken}?canceled=true`,
    metadata: {
      selection_id: selectionId,
      payment_token: paymentToken,
    },
  });

  return session.url!;
}
