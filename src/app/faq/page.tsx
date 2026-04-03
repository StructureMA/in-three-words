import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Good Questions — In a Few Words",
  description: "Frequently asked questions about In a Few Words.",
};

const faqs = [
  {
    question: "Does it cost anything to enter?",
    answer:
      "No. Entry is completely free. You only pay if you\u2019re selected \u2014 and even then, it\u2019s just $20 or $25 depending on the size you chose. That\u2019s it. No hidden fees, no subscriptions.",
  },
  {
    question: "What kind of words should I pick?",
    answer:
      "Whatever moves you. Nouns tend to work best \u2014 things I can see and paint \u2014 but abstract concepts work too. Think: \u201Cocean, quiet, gold\u201D or \u201Cchildhood, laughter, blue.\u201D The more evocative, the more interesting the painting tends to be.",
  },
  {
    question: "How is the selection made?",
    answer:
      "One entry is chosen at random each Sunday. No favorites, no algorithms. Just luck. If you\u2019re selected, you\u2019ll get a text message with a link to confirm and pay.",
  },
  {
    question: "Do I get to approve the painting first?",
    answer:
      "I\u2019ll send you a photo when it\u2019s finished, before it ships. But part of the magic is trusting the process \u2014 your words become my guide, and the painting is my interpretation of them. Every piece is a surprise.",
  },
  {
    question: "Is this really the original painting?",
    answer:
      "Yes. You receive the one and only original. No prints, no reproductions. It\u2019s painted by hand, specifically for you, inspired by your words.",
  },
  {
    question: "Can I enter every week?",
    answer:
      "Absolutely. New entries each week. Your odds are fresh every Sunday. Enter as many weeks as you\u2019d like \u2014 one entry per person per week.",
  },
  {
    question: "Which charity does the donation go to?",
    answer:
      "I rotate charities weekly. The current charity is listed on the homepage. A portion of every painting\u2019s cost goes directly to that week\u2019s chosen cause.",
  },
  {
    question: "Do you ship outside the US?",
    answer:
      "Not yet \u2014 US only for now. I\u2019m a one-person operation, and keeping shipping domestic helps me keep costs low and delivery reliable. Hopefully international shipping is coming in the future.",
  },
];

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-2xl mx-auto px-4 py-16 sm:py-20">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-2">
          Good questions
        </h1>
        <p className="text-[#6B6B6B] mb-10">
          Everything you might want to know before entering.
        </p>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="group bg-white rounded-xl border border-[#E8E6E3] overflow-hidden"
            >
              <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-[#1A1A1A] font-medium text-sm hover:bg-[#FAFAF8] transition-colors list-none">
                <span>{faq.question}</span>
                <span className="text-[#6B6B6B] group-open:rotate-45 transition-transform text-lg ml-4 flex-shrink-0">
                  +
                </span>
              </summary>
              <div className="px-5 pb-4 text-sm text-[#6B6B6B] leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </main>
  );
}
