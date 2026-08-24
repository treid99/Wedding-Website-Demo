import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { PER_PAGE_OPTIONS } from "@/lib/guest-params";

/**
 * Direct database access for the e2e suite: snapshot the database, put it back,
 * read it for assertions, and inflate it when a spec needs more rows than are
 * there.
 *
 * The suite does not reseed. It used to, and that made running the tests
 * destructive: scripts/seed.mjs drops every table, so anything the developer
 * had entered through the admin UI was gone the moment they ran the suite.
 * Instead the run takes one snapshot of whatever is in data/wedding.db before
 * the first test and replays it after every test, so a finished run leaves the
 * database exactly as it found it — rows a test added are gone, rows it deleted
 * are back, and rows it edited hold their original values.
 *
 * That inverts where test data comes from. Nothing here may assume the demo
 * seed is loaded, or that any particular guest exists: specs build the rows
 * they need through helpers/fixtures and read totals back through the counters
 * below.
 */

const ROOT = path.resolve(__dirname, "..", "..", "..");
const DB_PATH = path.join(ROOT, "data", "wedding.db");

/**
 * The baseline lives on disk rather than in a module variable because
 * globalSetup, each worker and globalTeardown are three separate processes.
 * test-results/ is already git-ignored and already wiped between runs.
 */
const BASELINE_PATH = path.join(ROOT, "test-results", "db-baseline.json");

/**
 * Every value SQLite hands back for this schema. There are no BLOB columns, so
 * the snapshot survives the JSON round trip to disk intact — a Buffer would
 * not, and adding one means switching the baseline to a file copy.
 */
type SqlValue = string | number | bigint | null;

type TableSnapshot = {
  name: string;
  columns: string[];
  /** Positional rows rather than objects: a third of the file size at 200 rows. */
  rows: SqlValue[][];
};

export type DatabaseSnapshot = {
  tables: TableSnapshot[];
  /** AUTOINCREMENT high-water marks, so restored ids do not drift upward. */
  sequences: [name: string, seq: number][];
};

/** Quotes an identifier so a table or column name cannot be read as syntax. */
const quote = (identifier: string) => `"${identifier.replace(/"/g, '""')}"`;

function open(readonly = false): Database.Database {
  if (!fs.existsSync(DB_PATH)) {
    throw new Error(
      `No database at ${path.relative(ROOT, DB_PATH)}. Run "npm run setup" first.`,
    );
  }
  const db = new Database(DB_PATH, { readonly });
  // The app may be rendering a page against this same file. Wait for it rather
  // than throwing SQLITE_BUSY at whichever test happened to be running.
  db.pragma("busy_timeout = 5000");
  return db;
}

/**
 * Reads every user table into memory.
 *
 * Table order comes straight from sqlite_master, which is creation order, which
 * schema.sql writes parents-before-children. The restore leans on that: it
 * deletes in reverse and inserts forward.
 */
export function captureSnapshot(): DatabaseSnapshot {
  const db = open(true);

  try {
    const names = (
      db
        .prepare(
          `SELECT name FROM sqlite_master
            WHERE type = 'table' AND name NOT LIKE 'sqlite_%'`,
        )
        .all() as { name: string }[]
    ).map((row) => row.name);

    const tables = names.map((name) => {
      const columns = (
        db.pragma(`table_info(${quote(name)})`) as { name: string }[]
      ).map((column) => column.name);

      const rows = db
        .prepare(`SELECT ${columns.map(quote).join(", ")} FROM ${quote(name)}`)
        .raw()
        .all() as SqlValue[][];

      return { name, columns, rows };
    });

    const hasSequences =
      db
        .prepare(
          "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'sqlite_sequence'",
        )
        .get() !== undefined;

    const sequences = hasSequences
      ? (
          db.prepare("SELECT name, seq FROM sqlite_sequence").all() as {
            name: string;
            seq: number;
          }[]
        ).map(({ name, seq }): [string, number] => [name, seq])
      : [];

    return { tables, sequences };
  } finally {
    db.close();
  }
}

/**
 * Puts the database back to a captured state.
 *
 * One transaction for the whole thing, for the same reason seed.mjs uses one: a
 * page rendering while this runs sees either the before or the after and never
 * the empty tables in between. Reseeding mid-render used to truncate the RSC
 * payload and surface as "Unexpected end of JSON input" from a page that had
 * nothing wrong with it.
 */
export function applySnapshot(snapshot: DatabaseSnapshot): void {
  const db = open();

  try {
    // Outside the transaction on purpose: SQLite ignores this pragma inside one,
    // and the restore deletes parents before children on the way through.
    db.pragma("foreign_keys = OFF");

    db.transaction(() => {
      for (const table of [...snapshot.tables].reverse()) {
        db.prepare(`DELETE FROM ${quote(table.name)}`).run();
      }

      for (const table of snapshot.tables) {
        if (table.rows.length === 0) continue;

        const insert = db.prepare(
          `INSERT INTO ${quote(table.name)} (${table.columns.map(quote).join(", ")})
           VALUES (${table.columns.map(() => "?").join(", ")})`,
        );
        for (const row of table.rows) insert.run(...row);
      }

      // Without this, every restore leaves the counters where the deleted rows
      // pushed them, so ids climb all run and any assertion that reads one is
      // only true the first time.
      if (snapshot.sequences.length > 0) {
        db.prepare("DELETE FROM sqlite_sequence").run();
        const insert = db.prepare(
          "INSERT INTO sqlite_sequence (name, seq) VALUES (?, ?)",
        );
        for (const [name, seq] of snapshot.sequences) insert.run(name, seq);
      }
    })();
  } finally {
    db.close();
  }
}

/**
 * Captures the baseline for the run. Called once, from globalSetup.
 *
 * The precondition check is deliberate. With no reseed, an empty database no
 * longer fails loudly — every count assertion would compare 0 against 0 and the
 * suite would go green having tested nothing.
 */
export function writeBaseline(): void {
  const snapshot = captureSnapshot();
  const rows = (name: string) =>
    snapshot.tables.find((table) => table.name === name)?.rows.length ?? 0;

  if (rows("parties") === 0 || rows("guests") === 0) {
    throw new Error(
      "The database has no guest list, so the e2e suite would assert nothing.\n" +
        'Run "npm run setup" (or "npm run db:reset") and try again.',
    );
  }

  fs.mkdirSync(path.dirname(BASELINE_PATH), { recursive: true });
  fs.writeFileSync(BASELINE_PATH, JSON.stringify(snapshot));
}

let cached: DatabaseSnapshot | undefined;

/** Restores the baseline. Runs after every test, through the fixture in ./test. */
export function restoreBaseline(): void {
  if (!cached) {
    if (!fs.existsSync(BASELINE_PATH)) {
      throw new Error(
        `No baseline at ${path.relative(ROOT, BASELINE_PATH)}. ` +
          'It is written by globalSetup — run the suite through "npm run test:e2e".',
      );
    }
    cached = JSON.parse(
      fs.readFileSync(BASELINE_PATH, "utf8"),
    ) as DatabaseSnapshot;
  }

  applySnapshot(cached);
}

/** Drops the baseline file once the run is over. */
export function discardBaseline(): void {
  fs.rmSync(BASELINE_PATH, { force: true });
}

// ── Reading back ────────────────────────────────────────────────────────────

/** Runs `fn` against a read-only connection and always closes it. */
export function readDb<T>(fn: (db: Database.Database) => T): T {
  const db = open(true);
  try {
    return fn(db);
  } finally {
    db.close();
  }
}

/**
 * Runs `fn` against a writable connection and always closes it.
 *
 * Only helpers/fixtures should reach for this. A spec writing its own SQL is a
 * spec that has stopped describing the UI, and the restore only knows how to
 * undo what the baseline covers — which is everything, but only if the write
 * went to this database rather than somewhere else.
 */
export function writeDb<T>(fn: (db: Database.Database) => T): T {
  const db = open();
  try {
    return fn(db);
  } finally {
    db.close();
  }
}

const scalar = (sql: string, params: SqlValue[] = []): number =>
  readDb((db) => (db.prepare(sql).get(...params) as { n: number }).n);

export const countGuests = () => scalar("SELECT COUNT(*) AS n FROM guests");

export const countParties = () => scalar("SELECT COUNT(*) AS n FROM parties");

export const countGalleryPhotos = () =>
  scalar("SELECT COUNT(*) AS n FROM photos WHERE in_gallery = 1");

export const countRegistryItems = (purchased?: 0 | 1) =>
  purchased === undefined
    ? scalar("SELECT COUNT(*) AS n FROM registry_items")
    : scalar("SELECT COUNT(*) AS n FROM registry_items WHERE purchased = ?", [
        purchased,
      ]);

/** A store that really is in the registry, for the filter specs. */
export const someRegistryStore = (): string =>
  readDb(
    (db) =>
      (
        db
          .prepare(
            "SELECT store FROM registry_items GROUP BY store ORDER BY COUNT(*) DESC, store LIMIT 1",
          )
          .get() as { store: string }
      ).store,
  );

export type SeatingTable = { id: number; name: string; capacity: number };

/** The first table on the seating chart, for specs that need a real one. */
export const firstSeatingTable = (): SeatingTable => {
  const table = readDb(
    (db) =>
      db
        .prepare(
          "SELECT id, name, capacity FROM seating_tables ORDER BY sort_order, id LIMIT 1",
        )
        .get() as SeatingTable | undefined,
  );

  if (!table) {
    throw new Error(
      "There are no seating tables, so the seating specs have nothing to drive.",
    );
  }

  return table;
};

export type SeededGuest = {
  first_name: string;
  last_name: string;
  is_child: 0 | 1;
};

export const guestsIn = (partyName: string): SeededGuest[] =>
  readDb(
    (db) =>
      db
        .prepare(
          `SELECT g.first_name, g.last_name, g.is_child
           FROM guests g JOIN parties p ON p.id = g.party_id
           WHERE p.name = ? ORDER BY g.id`,
        )
        .all(partyName) as SeededGuest[],
  );

// ── Inflation, for the pagination specs ─────────────────────────────────────

export type Inflation = {
  /** Search token every filler guest carries, so a spec can select them. */
  token: string;
  /** Totals *after* inflating — what the pagination assertions read. */
  guests: number;
  parties: number;
};

/** Guests per filler group. Four keeps the resulting group count high enough. */
const GUESTS_PER_GROUP = 4;

const LIST_SIZES = PER_PAGE_OPTIONS.list;

/**
 * How large a guest list the pagination specs want. It has to clear two
 * separate bars, and the assertions that depend on them say so:
 *
 *   · above 2 × the list default, so ?page=3 is a real page
 *   · below the largest page size on offer, so selecting that size puts the
 *     whole list on one page and "1 / 1" means something
 *
 * Both bounds are read from PER_PAGE_OPTIONS rather than written down, so
 * adding a page size to the guest list cannot leave this quietly wrong.
 */
const TARGET_GUESTS = Math.floor(
  (Math.max(...LIST_SIZES) + 2 * Math.min(...LIST_SIZES)) / 2,
);

/**
 * The group view has its own bar to clear: one more group than its second
 * largest page size, so selecting that size leaves a real page 2 to walk on to.
 *
 * Guest count alone does not get there. A database of a few very large
 * households can satisfy TARGET_GUESTS while still fitting every group on one
 * page, and the group pagination assertions would then be describing a list
 * that never paged.
 */
const GROUP_SIZES = PER_PAGE_OPTIONS.groups;
const MIN_GROUPS =
  Math.max(...GROUP_SIZES.filter((size) => size !== Math.max(...GROUP_SIZES))) + 1;

/**
 * Adds filler groups until the guest list is big enough to page through.
 *
 * A demo-sized list cannot test pagination at all: it never fills the first
 * page, so every control renders in its one-and-only-page state and the test
 * proves nothing. Filler guests all share a generated surname token so a spec
 * can select exactly them, and the afterEach restore takes them away again.
 */
export function inflateGuestList(): Inflation {
  const existing = countGuests();
  const headroom = Math.max(...LIST_SIZES);

  if (existing >= headroom) {
    throw new Error(
      `The guest list already holds ${existing} guests, which is at or past the ` +
        `largest page size the admin offers (${headroom}). The pagination specs ` +
        "need the whole list to fit on one page at that size.",
    );
  }

  const wanted = Math.max(0, TARGET_GUESTS - existing);
  const groups = Math.max(
    Math.ceil(wanted / GUESTS_PER_GROUP),
    MIN_GROUPS - countParties(),
  );
  const token = fillerToken();
  const db = open();

  const insertParty = db.prepare(
    `INSERT INTO parties (name, invite_code, envelope_name, address, notes, side)
     VALUES (?, ?, '', '', '', 'both')`,
  );
  const insertGuest = db.prepare(
    `INSERT INTO guests (party_id, first_name, last_name, is_child, rsvp_status)
     VALUES (?, ?, ?, 0, ?)`,
  );

  // Spread across all three so a status filter always has rows to remove.
  const statuses = ["attending", "pending", "declined"];

  try {
    db.transaction(() => {
      for (let i = 0; i < groups; i += 1) {
        const surname = `${token}${String(i).padStart(2, "0")}`;
        const { lastInsertRowid } = insertParty.run(
          `The ${surname} Family`,
          `${token.toUpperCase()}${String(i).padStart(3, "0")}`,
        );
        for (let j = 0; j < GUESTS_PER_GROUP; j += 1) {
          insertGuest.run(
            lastInsertRowid,
            `Filler${j}`,
            surname,
            statuses[(i + j) % statuses.length],
          );
        }
      }
    })();
  } finally {
    db.close();
  }

  const inflated: Inflation = {
    token,
    guests: countGuests(),
    parties: countParties(),
  };

  if (inflated.guests > headroom) {
    throw new Error(
      `Inflating overshot: ${inflated.guests} guests will not fit on one ` +
        `${headroom}-row page.`,
    );
  }

  return inflated;
}

/**
 * A surname stem no real name contains, unique within the run.
 *
 * The pid is in there because a crashed run leaves its filler behind — without
 * it the next run's INSERT would collide on the unique invite code and fail
 * somewhere a long way from the cause.
 */
let fillerCount = 0;
function fillerToken(): string {
  fillerCount += 1;
  return `Zqf${(process.pid % 997).toString(36)}${fillerCount}`;
}
