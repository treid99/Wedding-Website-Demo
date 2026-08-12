export type Paged<T> = {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
  from: number;
  to: number;
};

/**
 * Slices an already-filtered list into one page.
 *
 * Deliberately post-filter rather than a SQL LIMIT: name matching runs in JS so
 * that it can fold accents and match substrings (see lib/search.ts), which
 * means SQLite cannot know the result count before the filter has run. Paging
 * in SQL would page the *unfiltered* rows and quietly hide matches — the exact
 * bug this has to avoid. Materialising the full match set costs nothing at a
 * wedding's scale; a list large enough to care would need the matching pushed
 * into SQLite via FTS or a custom collation first.
 *
 * Lives outside lib/queries so it can be unit-tested: queries.ts imports
 * lib/db, which is marked server-only and throws outside a server render.
 */
export function paginate<T>(rows: T[], page: number, perPage: number): Paged<T> {
  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  // A deep link to ?page=99 that a filter has since invalidated must land on a
  // real page rather than an empty screen with no way back.
  const safePage = Math.min(Math.max(1, page), pageCount);
  const offset = (safePage - 1) * perPage;

  return {
    items: rows.slice(offset, offset + perPage),
    total,
    page: safePage,
    perPage,
    pageCount,
    from: total === 0 ? 0 : offset + 1,
    to: Math.min(offset + perPage, total),
  };
}
