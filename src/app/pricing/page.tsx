import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — In a Few Words",
  description: "Simple, honest pricing for original paintings.",
};

const tiers = [
  {
    name: "Small",
    dimensions: 'Up to 11" \u00d7 14"',
    price: "$20",
    charity: "$5 to charity",
  },
  {
    name: "Medium",
    dimensions: '12" \u00d7 16" to 24" \u00d7 36"',
    price: "$25",
    charity: "$7 to charity",
  },
];

const includes = [
  "Original painting, one of a kind",
  "Your words interpreted on canvas",
  "Shipped to you in the US",
  "Featured on social media",
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-3xl mx-auto px-4 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-2">
            Simple, honest pricing
          </h1>
          <p className="text-[#6B6B6B]">
            Free to enter. You only pay if you&apos;re selected.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className="bg-white rounded-2xl border border-[#E8E6E3] p-6 sm:p-8 hover:shadow-md hover:border-[#2E6B8A]/30 transition-all group"
            >
              <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#1A1A1A] mb-1">
                {tier.name}
              </h2>
              <p className="text-sm text-[#6B6B6B] mb-6">{tier.dimensions}</p>
              <div className="mb-6">
                <span className="font-[family-name:var(--font-playfair)] text-4xl font-bold text-[#1A1A1A]">
                  {tier.price}
                </span>
              </div>
              <div className="inline-block bg-[#E8F1F5] text-[#2E6B8A] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                {tier.charity}
              </div>
              <ul className="space-y-3">
                {includes.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-[#6B6B6B]"
                  >
                    <span className="text-[#2E6B8A] mt-0.5 flex-shrink-0">
                      &#10003;
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center text-sm text-[#999]">
          <p>US shipping only &middot; One entry per person per week</p>
        </div>
      </div>
    </main>
  );
}
