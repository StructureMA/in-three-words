import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — In a Few Words",
  description: "How we handle your information at In a Few Words.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-2xl mx-auto px-4 py-16 sm:py-20">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-2">
          Privacy Policy
        </h1>
        <p className="text-[#6B6B6B] mb-8">
          Short version: we only collect what we need, and we don&apos;t sell your info. Ever.
        </p>

        <div className="prose prose-sm max-w-none text-[#1A1A1A] space-y-6">
          <p className="text-[#6B6B6B]">
            Last updated: April 3, 2026
          </p>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-3">
              What we collect
            </h2>
            <p className="text-[#6B6B6B] leading-relaxed mb-3">
              When you submit an entry, we collect:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#6B6B6B]">
              <li><strong>Your name</strong> &mdash; so we know who you are</li>
              <li><strong>Your phone number</strong> &mdash; so we can text you if you&apos;re selected</li>
              <li><strong>Your words</strong> &mdash; so we can paint your painting</li>
              <li><strong>Your size preference</strong> &mdash; so we know what to paint on</li>
            </ul>
            <p className="text-[#6B6B6B] leading-relaxed mt-3">
              If you&apos;re selected and pay, we also collect:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#6B6B6B]">
              <li><strong>Your shipping address</strong> &mdash; so we can send you the painting</li>
              <li><strong>Payment information</strong> &mdash; processed securely by Stripe (we never see your card number)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-3">
              How we use it
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-[#6B6B6B]">
              <li>To run the weekly selection and notify you if chosen</li>
              <li>To process your payment and ship your painting</li>
              <li>To feature you on social media (first name, last initial, city/state only)</li>
            </ul>
            <p className="text-[#6B6B6B] leading-relaxed mt-3">
              That&apos;s it. No marketing emails. No selling your data. No nonsense.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-3">
              Who sees it
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-[#6B6B6B]">
              <li><strong>The artist</strong> (that&apos;s me) &mdash; I see your entry to manage the selection and shipping</li>
              <li><strong>Stripe</strong> &mdash; processes card payments securely</li>
              <li><strong>Twilio</strong> &mdash; sends the text notification when you&apos;re selected</li>
              <li><strong>Supabase</strong> &mdash; hosts our database securely</li>
              <li><strong>Nobody else</strong> &mdash; we don&apos;t share, sell, or rent your information to anyone</li>
            </ul>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-3">
              What&apos;s shown publicly
            </h2>
            <p className="text-[#6B6B6B] leading-relaxed">
              If your entry is selected, the following may appear on our website and social media:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#6B6B6B] mt-2">
              <li>Your first name and last initial</li>
              <li>Your city and state</li>
              <li>Your words</li>
              <li>The painting created from your words</li>
            </ul>
            <p className="text-[#6B6B6B] leading-relaxed mt-3">
              Your phone number, full name, and shipping address are <strong>never</strong> shared publicly.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-3">
              How we protect it
            </h2>
            <p className="text-[#6B6B6B] leading-relaxed">
              Your data is stored in a secure, encrypted database hosted by Supabase with row-level security. Payment processing is handled entirely by Stripe &mdash; we never store your card details. Access to your information is limited to the artist only.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-3">
              Your choices
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-[#6B6B6B]">
              <li>You can choose not to enter &mdash; no account required to browse the site</li>
              <li>If you&apos;d like your entry data removed, reach out and we&apos;ll delete it</li>
              <li>We don&apos;t use cookies for tracking or advertising</li>
            </ul>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-3">
              Changes
            </h2>
            <p className="text-[#6B6B6B] leading-relaxed">
              We may update this policy as the project grows. If something meaningful changes, we&apos;ll note it here. The date at the top tells you when it was last updated.
            </p>
          </section>

          <section>
            <p className="text-[#6B6B6B] leading-relaxed">
              Questions about your privacy? Reach out on Instagram or through the site. We&apos;re happy to explain anything.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
