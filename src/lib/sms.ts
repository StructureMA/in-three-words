import twilio from "twilio";
import type { Twilio } from "twilio";

let _client: Twilio | null = null;

function getClient(): Twilio {
  if (!_client) {
    _client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );
  }
  return _client;
}

interface SendSelectionSMSParams {
  to: string;
  name: string;
  words: string[];
  paymentUrl: string;
  venmoHandle: string;
}

export async function sendSelectionSMS({
  to,
  name,
  words,
  paymentUrl,
  venmoHandle,
}: SendSelectionSMSParams): Promise<{
  success: boolean;
  error: string | null;
}> {
  const formattedPhone = to.startsWith("+1") ? to : `+1${to}`;
  const wordList = words.join(", ");

  const message = [
    `Hey ${name}! Your entry was chosen this week on In a Few Words.`,
    ``,
    `Your words: ${wordList}`,
    ``,
    `Confirm and pay here: ${paymentUrl}`,
    venmoHandle ? `Or Venmo: @${venmoHandle}` : "",
    ``,
    `You have 3 hours to confirm. If we don't hear back, we'll draw the next entry.`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await getClient().messages.create({
      body: message,
      from: process.env.TWILIO_FROM_NUMBER!,
      to: formattedPhone,
    });
    return { success: true, error: null };
  } catch (err) {
    console.error("SMS send error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to send SMS",
    };
  }
}
