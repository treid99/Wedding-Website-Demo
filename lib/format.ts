/** Formatting helpers shared by the public and admin surfaces. */

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const USD_CENTS = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/** Prices are stored as integer cents. Drops ".00" for whole dollars. */
export function formatPrice(cents: number): string {
  return cents % 100 === 0 ? USD.format(cents / 100) : USD_CENTS.format(cents / 100);
}

/** Parses "1,299.99" / "$1299" / "1299" into integer cents. Returns null if unparseable. */
export function parsePriceToCents(input: string): number | null {
  const cleaned = input.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const value = Number.parseFloat(cleaned);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100);
}

const DATE_TIME = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function formatTimestamp(iso: string): string {
  const parsed = new Date(iso.includes("T") ? iso : iso.replace(" ", "T") + "Z");
  if (Number.isNaN(parsed.getTime())) return iso;
  return DATE_TIME.format(parsed);
}

/** Splits a stored text block on blank lines into paragraphs. */
export function toParagraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

/**
 * The addressee line for a group's envelope.
 *
 * `envelope_name` is optional — an empty one inherits the group name, so
 * "The Mitchell Family" needs no separate entry while "Margaret Whitfield" can
 * be addressed as "Mrs. Margaret Whitfield". Always read the field through
 * this helper so the fallback can't be forgotten at one of the call sites.
 */
export function envelopeName(party: {
  name: string;
  envelope_name?: string | null;
}): string {
  return party.envelope_name?.trim() || party.name;
}
