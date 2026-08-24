import { someRegistryStore, writeDb } from "./db";

/**
 * Rows a spec builds for itself.
 *
 * Every fixture carries a generated token — a surname stem that appears nowhere
 * in real data — and that token is the whole trick. It makes the row findable
 * (`?q=<token>` narrows any admin screen to exactly this fixture, so nothing
 * here depends on which page a group happened to land on), it makes counts
 * exact (a search for the token matches this fixture's guests and no others),
 * and it makes the names unique so two fixtures never collide on a UI label.
 *
 * Specs used to assert against the demo seed instead — "Aria" finds 2 guests,
 * the list holds 47. Every one of those numbers is a fact about seed-data.mjs
 * rather than about the software, so editing the guest list broke eight spec
 * files that had nothing to do with the change. Nothing below reads the seed.
 *
 * Cleanup is not this module's job: the afterEach restore in ./test puts the
 * whole database back, so a fixture lives exactly as long as its test.
 */

export type Side = "bride" | "groom" | "both";
export type RsvpStatus = "pending" | "attending" | "declined";

export type GuestSpec = {
  first?: string;
  last?: string;
  child?: boolean;
  status?: RsvpStatus;
  meal?: string | null;
  dietary?: string;
};

export type PartySpec = {
  /** Defaults to `The <token> Family`. Override to group fixtures under one stem. */
  name?: string;
  envelope?: string;
  address?: string;
  notes?: string;
  side?: Side;
  /** A count for plain pending guests, or one spec per guest. */
  guests?: number | GuestSpec[];
};

export type FixtureGuest = {
  id: number;
  first: string;
  last: string;
  /** "Ada Qfx4b2" — what the UI labels and list rows show. */
  name: string;
  child: boolean;
  status: RsvpStatus;
  meal: string | null;
  dietary: string;
};

export type FixtureParty = {
  id: number;
  name: string;
  token: string;
  inviteCode: string;
  envelope: string;
  guests: FixtureGuest[];
};

/**
 * Given names, so a fixture guest reads like a person in a failure message.
 * Short and unmistakably synthetic — the surname is what has to be unique.
 */
const GIVEN_NAMES = ["Ada", "Bo", "Cyd", "Dev", "Eli", "Fay", "Gil", "Hal"];

/**
 * A stem no real name contains, unique within this worker.
 *
 * The pid is in there for the same reason the filler token carries one: a run
 * that dies before its restore leaves rows behind, and the next run must not
 * collide with them on the unique invite code.
 */
let issued = 0;
export function uniqueToken(): string {
  issued += 1;
  return `Qfx${(process.pid % 997).toString(36)}${issued}`;
}

/**
 * Inserts a party and its guests, and hands back what the UI will show for
 * them — names for locators, ids for nothing in particular, and the token for
 * the `?q=` that narrows a screen to this fixture alone.
 */
export function createParty(spec: PartySpec = {}): FixtureParty {
  const token = uniqueToken();
  const name = spec.name ?? `The ${token} Family`;
  const envelope = spec.envelope ?? "";

  const specs: GuestSpec[] =
    typeof spec.guests === "number"
      ? Array.from({ length: spec.guests }, () => ({}))
      : (spec.guests ?? [{}, {}]);

  return writeDb((db) => {
    const { lastInsertRowid } = db
      .prepare(
        `INSERT INTO parties (name, invite_code, envelope_name, address, notes, side)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(
        name,
        token.toUpperCase(),
        envelope,
        spec.address ?? "",
        spec.notes ?? "",
        spec.side ?? "both",
      );

    const partyId = Number(lastInsertRowid);
    const insertGuest = db.prepare(
      `INSERT INTO guests
         (party_id, first_name, last_name, is_child, rsvp_status, meal_choice, dietary_notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );

    const guests = specs.map((guest, index): FixtureGuest => {
      const first = guest.first ?? GIVEN_NAMES[index] ?? `Guest${index}`;
      const last = guest.last ?? token;
      const child = guest.child ?? false;
      const status = guest.status ?? "pending";
      const meal = guest.meal ?? null;
      const dietary = guest.dietary ?? "";

      const inserted = insertGuest.run(
        partyId,
        first,
        last,
        child ? 1 : 0,
        status,
        meal,
        dietary,
      );

      return {
        id: Number(inserted.lastInsertRowid),
        first,
        last,
        name: `${first} ${last}`,
        child,
        status,
        meal,
        dietary,
      };
    });

    return {
      id: partyId,
      name,
      token,
      inviteCode: token.toUpperCase(),
      envelope,
      guests,
    };
  });
}

/**
 * Two or more parties sharing one stem, so `?q=<stem>` puts all of them on the
 * same screen. Moving a guest between groups needs both cards visible at once,
 * and paging is not what that test is about.
 */
export function createRelatedParties(
  ...specs: PartySpec[]
): { stem: string; parties: FixtureParty[] } {
  const stem = uniqueToken();
  const parties = specs.map((spec, index) =>
    createParty({ ...spec, name: spec.name ?? `The ${stem} ${index + 1} Family` }),
  );

  return { stem, parties };
}

/**
 * Sits guests at a table.
 *
 * The seating specs need a table that is genuinely occupied — an empty one
 * renders no meal tally, so an assertion about the tally would pass by matching
 * nothing. Seating a fixture is the only way to be sure without depending on
 * who the seed happened to sit where.
 */
export function seatGuests(tableId: number, guests: FixtureGuest[]): void {
  writeDb((db) => {
    const seat = db.prepare("UPDATE guests SET table_id = ? WHERE id = ?");
    db.transaction(() => {
      for (const guest of guests) seat.run(tableId, guest.id);
    })();
  });
}

export type FixtureRegistryItem = {
  id: number;
  title: string;
  token: string;
  priceCents: number;
  store: string;
};

export type RegistryItemSpec = {
  priceCents?: number;
  /** Defaults to whichever store the registry already stocks most of. */
  store?: string;
  purchased?: boolean;
  purchasedBy?: string;
};

/** One registry item, titled with a token so a search finds it and nothing else. */
export function createRegistryItem(
  spec: RegistryItemSpec = {},
): FixtureRegistryItem {
  const token = uniqueToken();
  const title = `${token} Teapot`;
  const priceCents = spec.priceCents ?? 4250;
  const store = spec.store ?? someRegistryStore();

  return writeDb((db) => {
    const { lastInsertRowid } = db
      .prepare(
        `INSERT INTO registry_items
           (title, description, price_cents, store, category, external_url,
            purchased, purchased_by, sort_order)
         VALUES (?, ?, ?, ?, 'home', ?, ?, ?, 0)`,
      )
      .run(
        title,
        "Added by the e2e suite.",
        priceCents,
        store,
        `https://example.com/${token}`,
        spec.purchased ? 1 : 0,
        spec.purchasedBy ?? "",
      );

    return { id: Number(lastInsertRowid), title, token, priceCents, store };
  });
}
