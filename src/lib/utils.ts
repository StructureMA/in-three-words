/**
 * Get the Monday of the current week as a YYYY-MM-DD string.
 */
export function getCurrentWeekMonday(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return monday.toISOString().split("T")[0];
}

/**
 * Generate a cryptographically random token for payment links.
 */
export function generatePaymentToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Format a phone number for display: (413) 555-0192
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits[0] === "1") {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

/**
 * Get the words from an entry as an array, filtering out nulls.
 */
export function getWords(entry: {
  word_1: string;
  word_2: string;
  word_3: string | null;
  word_4: string | null;
}): string[] {
  return [entry.word_1, entry.word_2, entry.word_3, entry.word_4].filter(
    (w): w is string => w !== null && w.trim() !== ""
  );
}
