/** Single source of truth for the wedding's fixed facts. */

export const WEDDING = {
  brideFirst: "Jenna",
  groomFirst: "Tom",
  couple: "Jenna & Tom",
  hashtag: "#JennaAndTom2027",

  /** Ceremony start, in venue-local time. Month is 0-indexed. */
  date: new Date(2027, 8, 17, 16, 30),
  dateLong: "Friday, September 17, 2027",
  dateShort: "09.17.2027",

  venue: "David's Country Inn",
  venueStreet: "217 Main Street",
  venueCity: "Hackettstown",
  venueState: "NJ",
  venueZip: "07840",
  venueLocation: "Hackettstown, New Jersey",

  rsvpDeadline: "August 1, 2027",

  contactEmail: "jenna.and.tom@example.com",
  contactPhone: "(908) 555-0142",
} as const;

export const VENUE_ADDRESS = `${WEDDING.venue}, ${WEDDING.venueStreet}, ${WEDDING.venueCity}, ${WEDDING.venueState} ${WEDDING.venueZip}`;

/** Keyless Google Maps embed — no API key required for the `output=embed` form. */
export const MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(
  VENUE_ADDRESS,
)}&z=15&output=embed`;

export const MAP_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  VENUE_ADDRESS,
)}`;

/** Meal options offered on the RSVP form and tallied in the admin seating view. */
export const MEAL_CHOICES = [
  { value: "filet", label: "Filet of Beef" },
  { value: "chicken", label: "Herb Roasted Chicken" },
  { value: "salmon", label: "Pan Seared Salmon" },
  { value: "vegetarian", label: "Wild Mushroom Risotto (v)" },
  { value: "kids", label: "Kids' Meal" },
] as const;

export type MealValue = (typeof MEAL_CHOICES)[number]["value"];

export function mealLabel(value: string | null | undefined): string {
  if (!value) return "—";
  return MEAL_CHOICES.find((m) => m.value === value)?.label ?? value;
}

/** Short label for dense UI like seating-table tallies. */
export function mealShortLabel(value: string): string {
  const short: Record<string, string> = {
    filet: "Beef",
    chicken: "Chicken",
    salmon: "Salmon",
    vegetarian: "Veg",
    kids: "Kids",
  };
  return short[value] ?? value;
}

export const RSVP_STATUSES = ["pending", "attending", "declined"] as const;
export type RsvpStatus = (typeof RSVP_STATUSES)[number];
