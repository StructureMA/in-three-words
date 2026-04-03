import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Stuff — In a Few Words",
  description: "The simple rules for In a Few Words.",
};

const rules = [
  "Entry is free. You only pay if your entry is selected.",
  "One entry per person per week. Duplicate entries will be removed.",
  "You must be 18 or older to enter.",
  "US shipping only for now. We\u2019ll let you know when that changes.",
  "If you\u2019re selected, you have 3 hours to confirm and pay via the link we text you. After that, the spot may go to someone else.",
  "The painting is an original, one-of-a-kind piece inspired by your words. It won\u2019t be an exact literal representation \u2014 it\u2019s an artistic interpretation.",
  "Once the painting is finished, we\u2019ll send you a photo. You can\u2019t request changes \u2014 that\u2019s part of the deal.",
  "A portion of every payment goes to the charity listed that week. The exact amount is shown on the pricing page.",
  'By entering, you agree to let us feature your painting and first name on our site and social media. We\u2019ll never share your phone number or last name publicly.',
  "We reserve the right to skip a week, change the schedule, or stop the project at any time. This is an art project, not a guaranteed service.",
  "By entering, you agree to these terms. If something comes up that isn\u2019t covered here, we\u2019ll handle it like reasonable people.",
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-2xl mx-auto px-4 py-16 sm:py-20">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-2">
          Terms &amp; Stuff
        </h1>
        <p className="text-[#6B6B6B] mb-10">
          The short version: be cool, have fun, get art.
        </p>

        <ol className="space-y-5">
          {rules.map((rule, i) => (
            <li key={i} className="flex gap-4 text-sm leading-relaxed">
              <span className="font-[family-name:var(--font-playfair)] text-lg font-bold text-[#2E6B8A] flex-shrink-0 w-7 text-right">
                {i + 1}.
              </span>
              <span className="text-[#1A1A1A]">{rule}</span>
            </li>
          ))}
        </ol>

        <div className="mt-12 pt-8 border-t border-[#E8E6E3] text-sm text-[#999]">
          <p>Last updated April 2026.</p>
        </div>
      </div>
    </main>
  );
}
