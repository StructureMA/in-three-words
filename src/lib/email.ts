import { Resend } from "resend";

export async function notifyNewEntry({
  name,
  words,
  size,
  charityPreference,
}: {
  name: string;
  words: string[];
  size: string;
  charityPreference: string | null;
}) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const wordList = words.join(", ");
  const sizeLabel = size === "small" ? "Small (up to 11×14)" : "Medium (12×16 to 24×36)";

  await resend.emails.send({
    from: "In a Few Words <onboarding@resend.dev>",
    to: process.env.ADMIN_EMAIL || "jonathanlucia@icloud.com",
    subject: `New entry: ${name} — ${wordList}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px;">
        <h2 style="color: #2E6B8A;">New entry submitted</h2>
        <p><strong>${name}</strong> just entered for this week.</p>
        <p><strong>Words:</strong> ${wordList}</p>
        <p><strong>Size:</strong> ${sizeLabel}</p>
        ${charityPreference ? `<p><strong>Charity preference:</strong> ${charityPreference}</p>` : ""}
        <hr style="border: none; border-top: 1px solid #E8E6E3; margin: 20px 0;" />
        <p style="color: #999; font-size: 13px;">
          <a href="https://inafewwords.art/admin/entries" style="color: #2E6B8A;">View all entries →</a>
        </p>
      </div>
    `,
  });
}
