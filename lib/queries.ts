import { all, one } from "./db";
import { matchesSearch } from "./search";
import type { RsvpStatusFilter, SeatedFilter } from "./guest-params";
import {
  REGISTRY_SORTS,
  type RegistryAvailability,
  type RegistrySort,
} from "./registry-params";
import type {
  ContentBlock,
  Direction,
  FaqItem,
  Guest,
  GuestWithContext,
  Hotel,
  Party,
  Photo,
  RegistryItem,
  RsvpSubmission,
  ScheduleEvent,
  SeatingTable,
  StoreFacet,
} from "./types";

// ── Content blocks ───────────────────────────────────────────────────────────

export function getBlock(key: string): ContentBlock | undefined {
  return one<ContentBlock>("SELECT * FROM content_blocks WHERE key = ?", [key]);
}

/** Fetches several blocks at once, keyed for easy lookup. */
export function getBlocks(keys: string[]): Record<string, ContentBlock> {
  if (keys.length === 0) return {};
  const placeholders = keys.map(() => "?").join(", ");
  const rows = all<ContentBlock>(
    `SELECT * FROM content_blocks WHERE key IN (${placeholders})`,
    keys,
  );
  return Object.fromEntries(rows.map((row) => [row.key, row]));
}

/** Blocks whose key starts with `prefix`, in editorial order. */
export function getBlocksByPrefix(prefix: string): ContentBlock[] {
  return all<ContentBlock>(
    "SELECT * FROM content_blocks WHERE key LIKE ? ORDER BY sort_order, key",
    [`${prefix}%`],
  );
}

export function getAllBlocks(): ContentBlock[] {
  return all<ContentBlock>("SELECT * FROM content_blocks ORDER BY sort_order, key");
}

// ── Photos ───────────────────────────────────────────────────────────────────

export function getCarouselPhotos(): Photo[] {
  return all<Photo>(
    "SELECT * FROM photos WHERE in_carousel = 1 ORDER BY sort_order, id",
  );
}

export function getGalleryPhotos(): Photo[] {
  return all<Photo>(
    "SELECT * FROM photos WHERE in_gallery = 1 ORDER BY sort_order, id",
  );
}

export function getAllPhotos(): Photo[] {
  return all<Photo>("SELECT * FROM photos ORDER BY sort_order, id");
}

export function getPhotoBySlug(slug: string): Photo | undefined {
  return one<Photo>("SELECT * FROM photos WHERE slug = ?", [slug]);
}

/** A handful of gallery photos for use as page accents. */
export function getAccentPhotos(limit: number): Photo[] {
  return all<Photo>(
    "SELECT * FROM photos WHERE in_gallery = 1 ORDER BY sort_order, id LIMIT ?",
    [limit],
  );
}

// ── Registry ─────────────────────────────────────────────────────────────────

export type RegistryQuery = {
  q?: string;
  stores?: string[];
  minPrice?: number | null;
  maxPrice?: number | null;
  availability?: RegistryAvailability;
  sort?: RegistrySort;
  page?: number;
  perPage?: number;
};

export type RegistryPage = {
  items: RegistryItem[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
  from: number;
  to: number;
};

const SORT_SQL: Record<RegistrySort, string> = {
  curated: "sort_order ASC, id ASC",
  "price-asc": "price_cents ASC, title ASC",
  "price-desc": "price_cents DESC, title ASC",
  "name-asc": "title COLLATE NOCASE ASC",
};

/**
 * Filtered, sorted, paginated registry read. All of it happens in SQL.
 *
 * Purchased items always sort after available ones regardless of the chosen
 * sort — the `purchased ASC` leading term is deliberate and not overridable.
 */
export function queryRegistry(query: RegistryQuery = {}): RegistryPage {
  const {
    q = "",
    stores = [],
    minPrice = null,
    maxPrice = null,
    availability = "all",
    sort = "curated",
    page = 1,
    perPage = 12,
  } = query;

  const where: string[] = [];
  const params: unknown[] = [];

  const term = q.trim();
  if (term) {
    where.push("(title LIKE ? OR description LIKE ? OR category LIKE ?)");
    const like = `%${term}%`;
    params.push(like, like, like);
  }

  if (stores.length > 0) {
    where.push(`store IN (${stores.map(() => "?").join(", ")})`);
    params.push(...stores);
  }

  if (minPrice != null) {
    where.push("price_cents >= ?");
    params.push(minPrice);
  }

  if (maxPrice != null) {
    where.push("price_cents <= ?");
    params.push(maxPrice);
  }

  if (availability === "available") where.push("purchased = 0");
  if (availability === "purchased") where.push("purchased = 1");

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const total =
    one<{ n: number }>(`SELECT COUNT(*) AS n FROM registry_items ${whereSql}`, params)
      ?.n ?? 0;

  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const offset = (safePage - 1) * perPage;

  const items = all<RegistryItem>(
    `SELECT * FROM registry_items
     ${whereSql}
     ORDER BY purchased ASC, ${SORT_SQL[sort] ?? SORT_SQL.curated}
     LIMIT ? OFFSET ?`,
    [...params, perPage, offset],
  );

  return {
    items,
    total,
    page: safePage,
    perPage,
    pageCount,
    from: total === 0 ? 0 : offset + 1,
    to: Math.min(offset + perPage, total),
  };
}

export function getRegistryStores(): StoreFacet[] {
  return all<StoreFacet>(
    `SELECT store, COUNT(*) AS count
     FROM registry_items
     GROUP BY store
     ORDER BY store`,
  );
}

export function getRegistryPriceBounds(): { min: number; max: number } {
  const row = one<{ min: number | null; max: number | null }>(
    "SELECT MIN(price_cents) AS min, MAX(price_cents) AS max FROM registry_items",
  );
  return { min: row?.min ?? 0, max: row?.max ?? 0 };
}

export function getRegistryStats() {
  const row = one<{ total: number; purchased: number; value: number }>(
    `SELECT COUNT(*) AS total,
            SUM(purchased) AS purchased,
            COALESCE(SUM(CASE WHEN purchased = 1 THEN price_cents END), 0) AS value
     FROM registry_items`,
  );
  return {
    total: row?.total ?? 0,
    purchased: row?.purchased ?? 0,
    available: (row?.total ?? 0) - (row?.purchased ?? 0),
    purchasedValueCents: row?.value ?? 0,
  };
}

export function getAllRegistryItems(): RegistryItem[] {
  return all<RegistryItem>(
    "SELECT * FROM registry_items ORDER BY purchased ASC, sort_order ASC, id ASC",
  );
}

export function getRegistryItem(id: number): RegistryItem | undefined {
  return one<RegistryItem>("SELECT * FROM registry_items WHERE id = ?", [id]);
}

// ── Schedule / Q&A / Travel ──────────────────────────────────────────────────

export function getScheduleEvents(): ScheduleEvent[] {
  return all<ScheduleEvent>(
    "SELECT * FROM schedule_events ORDER BY day_order, sort_order, id",
  );
}

/** Schedule grouped into timeline sections by day. */
export function getScheduleByDay(): { day: string; events: ScheduleEvent[] }[] {
  const grouped = new Map<string, ScheduleEvent[]>();
  for (const event of getScheduleEvents()) {
    const bucket = grouped.get(event.day_label);
    if (bucket) bucket.push(event);
    else grouped.set(event.day_label, [event]);
  }
  return [...grouped.entries()].map(([day, events]) => ({ day, events }));
}

export function getFaqItems(): FaqItem[] {
  return all<FaqItem>("SELECT * FROM faq_items ORDER BY sort_order, id");
}

export function getFaqByCategory(): { category: string; items: FaqItem[] }[] {
  const grouped = new Map<string, FaqItem[]>();
  for (const item of getFaqItems()) {
    const bucket = grouped.get(item.category);
    if (bucket) bucket.push(item);
    else grouped.set(item.category, [item]);
  }
  return [...grouped.entries()].map(([category, items]) => ({ category, items }));
}

export function getHotels(): Hotel[] {
  return all<Hotel>("SELECT * FROM hotels ORDER BY sort_order, id");
}

export function getDirections(): Direction[] {
  return all<Direction>("SELECT * FROM directions ORDER BY sort_order, id");
}

// ── RSVP ─────────────────────────────────────────────────────────────────────

export type PartyWithGuests = Party & {
  guests: Guest[];
  latestSubmission: RsvpSubmission | undefined;
};

export function getPartyWithGuests(partyId: number): PartyWithGuests | undefined {
  const party = one<Party>("SELECT * FROM parties WHERE id = ?", [partyId]);
  if (!party) return undefined;

  return {
    ...party,
    guests: all<Guest>(
      "SELECT * FROM guests WHERE party_id = ? ORDER BY is_child, id",
      [partyId],
    ),
    latestSubmission: one<RsvpSubmission>(
      "SELECT * FROM rsvp_submissions WHERE party_id = ? ORDER BY submitted_at DESC, id DESC LIMIT 1",
      [partyId],
    ),
  };
}

/**
 * Resolves a typed name to candidate parties.
 *
 * Matches against first name, last name, the concatenated full name, and the
 * party name, so "Mitchell", "Sarah", "sarah mitchell" and "The Mitchell
 * Family" all find the same invitation.
 */
export function findPartiesByName(search: string): (Party & { guests: Guest[] })[] {
  const term = search.trim();
  if (term.length < 2) return [];

  const like = `%${term}%`;
  const parties = all<Party>(
    `SELECT DISTINCT p.*
     FROM parties p
     LEFT JOIN guests g ON g.party_id = p.id
     WHERE g.first_name LIKE ?
        OR g.last_name LIKE ?
        OR (g.first_name || ' ' || g.last_name) LIKE ?
        OR p.name LIKE ?
        OR p.invite_code = ?
     ORDER BY p.name
     LIMIT 8`,
    [like, like, like, like, term.toUpperCase()],
  );

  return parties.map((party) => ({
    ...party,
    guests: all<Guest>(
      "SELECT * FROM guests WHERE party_id = ? ORDER BY is_child, id",
      [party.id],
    ),
  }));
}

// ── Admin: guests ────────────────────────────────────────────────────────────

export type GuestFilters = {
  q?: string;
  /** Empty (or omitted) means every status — see lib/guest-params. */
  statuses?: RsvpStatusFilter[];
  partyId?: number | null;
  seated?: SeatedFilter;
};

export function getGuests(filters: GuestFilters = {}): GuestWithContext[] {
  const { q = "", statuses = [], partyId = null, seated = "all" } = filters;

  const where: string[] = [];
  const params: unknown[] = [];

  if (statuses.length > 0) {
    where.push(`g.rsvp_status IN (${statuses.map(() => "?").join(", ")})`);
    params.push(...statuses);
  }

  if (partyId != null) {
    where.push("g.party_id = ?");
    params.push(partyId);
  }

  if (seated === "seated") where.push("g.table_id IS NOT NULL");
  if (seated === "unseated") where.push("g.table_id IS NULL");

  const rows = all<GuestWithContext>(
    `SELECT g.*, p.name AS party_name, p.side AS party_side, t.name AS table_name
     FROM guests g
     JOIN parties p ON p.id = g.party_id
     LEFT JOIN seating_tables t ON t.id = g.table_id
     ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
     ORDER BY p.name, g.is_child, g.id`,
    params,
  );

  // Name matching happens here rather than in SQL — see lib/search.ts for why.
  return rows.filter((guest) =>
    matchesSearch(q, guest.first_name, guest.last_name, guest.party_name),
  );
}

export type PartyWithDetail = Party & {
  guests: Guest[];
  latestSubmission: RsvpSubmission | undefined;
  attending: number;
  declined: number;
  pending: number;
};

/**
 * Invitation groups for the admin group view.
 *
 * Honours the same filter bar as the flat guest list: a group is kept when its
 * own name matches the query, or when any member does. Status and seating
 * filters keep a group if at least one member qualifies — the group is the unit
 * being listed, so hiding it because one member doesn't match would be wrong.
 */
export function getPartiesWithGuests(
  filters: GuestFilters = {},
): PartyWithDetail[] {
  const { q = "", statuses = [], seated = "all" } = filters;

  const parties = all<Party>("SELECT * FROM parties ORDER BY name");
  const guests = all<Guest>("SELECT * FROM guests ORDER BY is_child, id");
  const submissions = all<RsvpSubmission>(
    "SELECT * FROM rsvp_submissions ORDER BY submitted_at DESC, id DESC",
  );

  const byParty = new Map<number, Guest[]>();
  for (const guest of guests) {
    const bucket = byParty.get(guest.party_id);
    if (bucket) bucket.push(guest);
    else byParty.set(guest.party_id, [guest]);
  }

  const latestByParty = new Map<number, RsvpSubmission>();
  for (const submission of submissions) {
    if (!latestByParty.has(submission.party_id)) {
      latestByParty.set(submission.party_id, submission);
    }
  }

  const matchesStatus = (guest: Guest) =>
    statuses.length === 0 ||
    statuses.includes(guest.rsvp_status as RsvpStatusFilter);

  const matchesSeated = (guest: Guest) =>
    seated === "all" ||
    (seated === "seated" ? guest.table_id != null : guest.table_id == null);

  return parties
    .map((party) => {
      const members = byParty.get(party.id) ?? [];
      return {
        ...party,
        guests: members,
        latestSubmission: latestByParty.get(party.id),
        attending: members.filter((g) => g.rsvp_status === "attending").length,
        declined: members.filter((g) => g.rsvp_status === "declined").length,
        pending: members.filter((g) => g.rsvp_status === "pending").length,
      };
    })
    .filter((party) => {
      const nameHit =
        matchesSearch(q, party.name) ||
        party.guests.some((guest) =>
          matchesSearch(q, guest.first_name, guest.last_name, party.name),
        );

      const qualifying = party.guests.filter(
        (guest) => matchesStatus(guest) && matchesSeated(guest),
      );

      // An empty group has no members to qualify, so judge it on its name alone
      // rather than hiding it the moment any status filter is on.
      const statusHit =
        (statuses.length === 0 && seated === "all") ||
        qualifying.length > 0 ||
        party.guests.length === 0;

      return nameHit && statusHit;
    });
}

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
 */
export function paginate<T>(rows: T[], page: number, perPage: number): Paged<T> {
  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / perPage));
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

export function getPartyOptions(): { id: number; name: string }[] {
  return all<{ id: number; name: string }>(
    "SELECT id, name FROM parties ORDER BY name",
  );
}

// ── Admin: dashboard ─────────────────────────────────────────────────────────

export function getRsvpStats() {
  const row = one<{
    total: number;
    attending: number;
    declined: number;
    pending: number;
    children: number;
  }>(
    `SELECT COUNT(*) AS total,
            SUM(rsvp_status = 'attending') AS attending,
            SUM(rsvp_status = 'declined')  AS declined,
            SUM(rsvp_status = 'pending')   AS pending,
            SUM(is_child = 1 AND rsvp_status = 'attending') AS children
     FROM guests`,
  );

  const parties =
    one<{ n: number }>("SELECT COUNT(*) AS n FROM parties")?.n ?? 0;
  const respondedParties =
    one<{ n: number }>(
      "SELECT COUNT(DISTINCT party_id) AS n FROM rsvp_submissions",
    )?.n ?? 0;

  return {
    total: row?.total ?? 0,
    attending: row?.attending ?? 0,
    declined: row?.declined ?? 0,
    pending: row?.pending ?? 0,
    children: row?.children ?? 0,
    parties,
    respondedParties,
  };
}

export function getMealCounts(): { meal_choice: string; n: number }[] {
  return all<{ meal_choice: string; n: number }>(
    `SELECT meal_choice, COUNT(*) AS n
     FROM guests
     WHERE rsvp_status = 'attending' AND meal_choice IS NOT NULL
     GROUP BY meal_choice
     ORDER BY n DESC`,
  );
}

export function getDietaryNotes(): GuestWithContext[] {
  return all<GuestWithContext>(
    `SELECT g.*, p.name AS party_name, p.side AS party_side, t.name AS table_name
     FROM guests g
     JOIN parties p ON p.id = g.party_id
     LEFT JOIN seating_tables t ON t.id = g.table_id
     WHERE TRIM(g.dietary_notes) <> ''
     ORDER BY p.name, g.id`,
  );
}

export type SubmissionWithParty = RsvpSubmission & { party_name: string };

export function getRecentSubmissions(limit = 8): SubmissionWithParty[] {
  return all<SubmissionWithParty>(
    `SELECT s.*, p.name AS party_name
     FROM rsvp_submissions s
     JOIN parties p ON p.id = s.party_id
     ORDER BY s.submitted_at DESC, s.id DESC
     LIMIT ?`,
    [limit],
  );
}

// ── Admin: seating ───────────────────────────────────────────────────────────

export type SeatingBoard = {
  tables: (SeatingTable & { guests: GuestWithContext[] })[];
  unseated: GuestWithContext[];
};

/**
 * Everything the seating board needs in one read.
 *
 * Declined guests are excluded outright — there's no reason to seat someone who
 * isn't coming. Pending guests stay in the unseated pool so the couple can plan
 * ahead of a late response.
 */
export function getSeatingBoard(): SeatingBoard {
  const tables = all<SeatingTable>(
    "SELECT * FROM seating_tables ORDER BY sort_order, id",
  );

  const guests = all<GuestWithContext>(
    `SELECT g.*, p.name AS party_name, p.side AS party_side, t.name AS table_name
     FROM guests g
     JOIN parties p ON p.id = g.party_id
     LEFT JOIN seating_tables t ON t.id = g.table_id
     WHERE g.rsvp_status <> 'declined'
     ORDER BY p.name, g.is_child, g.id`,
  );

  const byTable = new Map<number, GuestWithContext[]>();
  const unseated: GuestWithContext[] = [];

  for (const guest of guests) {
    if (guest.table_id == null) {
      unseated.push(guest);
      continue;
    }
    const bucket = byTable.get(guest.table_id);
    if (bucket) bucket.push(guest);
    else byTable.set(guest.table_id, [guest]);
  }

  return {
    tables: tables.map((table) => ({
      ...table,
      guests: byTable.get(table.id) ?? [],
    })),
    // Attending guests first — they're the ones who actually need a seat.
    unseated: unseated.sort((a, b) => {
      if (a.rsvp_status !== b.rsvp_status) {
        return a.rsvp_status === "attending" ? -1 : 1;
      }
      return a.party_name.localeCompare(b.party_name);
    }),
  };
}

export function getSeatingTables(): SeatingTable[] {
  return all<SeatingTable>("SELECT * FROM seating_tables ORDER BY sort_order, id");
}
