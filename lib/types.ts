export type ContentBlock = {
  key: string;
  label: string;
  eyebrow: string;
  title: string;
  body: string;
  sort_order: number;
  updated_at: string;
};

export type Photo = {
  id: number;
  slug: string;
  filename: string;
  full_path: string;
  thumb_path: string;
  width: number;
  height: number;
  orientation: "landscape" | "portrait";
  caption: string;
  in_gallery: 0 | 1;
  in_carousel: 0 | 1;
  sort_order: number;
};

export type RegistryItem = {
  id: number;
  title: string;
  description: string;
  price_cents: number;
  store: string;
  category: string;
  external_url: string;
  image_slug: string | null;
  purchased: 0 | 1;
  purchased_by: string;
  purchased_at: string | null;
  sort_order: number;
  created_at: string;
};

/** Store name plus its item count, for the registry store filter. */
export type StoreFacet = { store: string; count: number };

export type RsvpStatus = "pending" | "attending" | "declined";

export type Party = {
  id: number;
  name: string;
  invite_code: string;
  /** Envelope addressee. Blank inherits `name` — read it via envelopeName(). */
  envelope_name: string;
  address: string;
  notes: string;
  side: "bride" | "groom" | "both";
  created_at: string;
};

export type Guest = {
  id: number;
  party_id: number;
  first_name: string;
  last_name: string;
  is_child: 0 | 1;
  rsvp_status: RsvpStatus;
  meal_choice: string | null;
  dietary_notes: string;
  table_id: number | null;
  responded_at: string | null;
};

export type GuestWithContext = Guest & {
  party_name: string;
  party_side: Party["side"];
  table_name: string | null;
};

export type SeatingTable = {
  id: number;
  name: string;
  shape: "round" | "rect";
  capacity: number;
  sort_order: number;
};

export type RsvpSubmission = {
  id: number;
  party_id: number;
  message: string;
  attending: number;
  declined: number;
  submitted_at: string;
};

export type ScheduleEvent = {
  id: number;
  day_label: string;
  day_order: number;
  time_label: string;
  title: string;
  location: string;
  description: string;
  attire: string;
  sort_order: number;
};

export type FaqItem = {
  id: number;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
};

export type Hotel = {
  id: number;
  name: string;
  address: string;
  phone: string;
  rate: string;
  block_code: string;
  cutoff: string;
  distance: string;
  booking_url: string;
  notes: string;
  sort_order: number;
};

export type Direction = {
  id: number;
  heading: string;
  summary: string;
  body: string;
  sort_order: number;
};
