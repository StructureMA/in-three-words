export type EntrySize = "small" | "medium";

export type SelectionStatus =
  | "drawn"
  | "notified"
  | "confirmed"
  | "paid"
  | "painting"
  | "shipped"
  | "posted";

export type PaymentMethod = "stripe" | "venmo" | "paypal";

export interface Entry {
  id: string;
  name: string;
  phone: string;
  word_1: string;
  word_2: string;
  word_3: string | null;
  word_4: string | null;
  size: EntrySize;
  week_of: string;
  created_at: string;
}

export interface Selection {
  id: string;
  entry_id: string;
  payment_token: string;
  status: SelectionStatus;
  notified_at: string | null;
  expires_at: string | null;
  payment_method: PaymentMethod | null;
  payment_confirmed_at: string | null;
  shipping_street: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_zip: string | null;
  shipping_provider: string | null;
  tracking_number: string | null;
  expected_arrival: string | null;
  shipped_at: string | null;
  is_gift: boolean;
  gift_recipient_name: string | null;
  gift_note: string | null;
  created_at: string;
}

export interface Painting {
  id: string;
  selection_id: string;
  image_url: string;
  description: string | null;
  featured: boolean;
  created_at: string;
}

export interface Charity {
  id: string;
  name: string;
  url: string | null;
  week_of: string;
  donation_amount: number | null;
  donated_at: string | null;
  receipt_url: string | null;
  created_at: string;
}

export interface SiteSetting {
  key: string;
  value: string;
  updated_at: string;
}

export interface SelectionWithEntry extends Selection {
  entries: Entry;
}
