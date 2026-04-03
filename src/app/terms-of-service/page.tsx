import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — In a Few Words",
  description: "Terms of Service for In a Few Words.",
};

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-2xl mx-auto px-4 py-16 sm:py-20">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-2">
          Terms of Service
        </h1>
        <p className="text-[#6B6B6B] mb-8">
          The real stuff. We kept it human.
        </p>

        <div className="prose prose-sm max-w-none text-[#1A1A1A] space-y-6">
          <p className="text-[#6B6B6B]">
            Last updated: April 3, 2026
          </p>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-3">
              What this is
            </h2>
            <p className="text-[#6B6B6B] leading-relaxed">
              In a Few Words (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;the artist&rdquo;) is a recurring art project where one person is selected each week to receive an original acrylic painting based on 2&ndash;4 words they submit. By using this site or submitting an entry, you agree to these terms.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-3">
              Entries
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-[#6B6B6B]">
              <li>Entry is free. No purchase is necessary to enter.</li>
              <li>You must be 18 years or older to enter.</li>
              <li>One entry per person per week. Entries do not roll over.</li>
              <li>Entries accept 2&ndash;4 words.</li>
              <li>One entry is selected at random each Sunday.</li>
              <li>This is not a contest, sweepstakes, or lottery. No money changes hands until after selection.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-3">
              Selection &amp; Payment
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-[#6B6B6B]">
              <li>If your entry is selected, you will be notified via text message.</li>
              <li>You have 3 hours to confirm and pay. If you don&apos;t respond, the next entry is drawn.</li>
              <li>Payment is accepted via credit card (Stripe) or Venmo/PayPal.</li>
              <li>Prices are $20 (small) or $25 (medium). These are final — no hidden fees.</li>
              <li>All sales are final. No refunds once payment is confirmed.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-3">
              The Painting
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-[#6B6B6B]">
              <li>Each painting is the artist&apos;s original interpretation of your words. Full creative freedom is retained by the artist.</li>
              <li>No revision requests will be accepted. That&apos;s part of the magic.</li>
              <li>You receive the one and only original. No copies or prints are made.</li>
              <li>A photo will be sent to you before shipping.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-3">
              Shipping
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-[#6B6B6B]">
              <li>US shipping only at this time.</li>
              <li>Shipping is included in the price.</li>
              <li>We are not responsible for packages lost or damaged by the carrier, though we will do our best to help resolve any issues.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-3">
              Social Media
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-[#6B6B6B]">
              <li>By entering, you agree to be featured on our social media and website with your first name, last initial, and city/state.</li>
              <li>Your phone number and full address are never shared publicly.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-3">
              The Fine Print
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-[#6B6B6B]">
              <li>The artist reserves the right to skip, modify, or cancel any week&apos;s selection.</li>
              <li>We may update these terms at any time. Continued use of the site means you accept the updated terms.</li>
              <li>This site is provided &ldquo;as is&rdquo; without warranties of any kind.</li>
            </ul>
          </section>

          <section>
            <p className="text-[#6B6B6B] leading-relaxed">
              Questions? Reach out on Instagram or through the site. We&apos;re real people — we&apos;ll get back to you.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
