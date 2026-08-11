/**
 * Name matching for the guest list and RSVP lookup.
 *
 * This runs in JavaScript rather than SQL on purpose. SQLite's LIKE is
 * case-insensitive for ASCII only, so it can't match "tomas" against "Tomás",
 * and matching tokens in any order would need one clause per token. A wedding
 * guest list is a few hundred rows at most, so folding and comparing in process
 * is instant and buys much better matching. (The registry is paginated over an
 * open-ended catalogue and stays in SQL.)
 */

/** Lowercases, strips accents, and collapses whitespace. */
export function normalizeForSearch(value: string): string {
  return (
    value
      // NFD splits "á" into "a" + a combining acute, which \p{M} then removes.
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * True when every whitespace-separated token in `query` appears somewhere in
 * `fields`, in any order.
 *
 *   "niel"        -> matches "Daniel Rao"       (substring, any case)
 *   "rao daniel"  -> matches "Daniel Rao"       (order independent)
 *   "tomas"       -> matches "Tomás Ferreira"   (accent folded)
 *   ""            -> matches everything         (no filter applied)
 */
export function matchesSearch(
  query: string,
  ...fields: (string | null | undefined)[]
): boolean {
  const tokens = normalizeForSearch(query).split(" ").filter(Boolean);
  if (tokens.length === 0) return true;

  const haystack = normalizeForSearch(fields.filter(Boolean).join(" "));
  return tokens.every((token) => haystack.includes(token));
}
