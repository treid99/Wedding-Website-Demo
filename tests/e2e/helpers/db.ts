import { execFileSync } from "node:child_process";
import path from "node:path";
import Database from "better-sqlite3";

/**
 * Direct database access for the e2e suite: reset it to a known state, read it
 * back to prove a write really landed, and inflate it when a test needs more
 * rows than the demo seed provides.
 */

const ROOT = path.resolve(__dirname, "..", "..", "..");
const DB_PATH = path.join(ROOT, "data", "wedding.db");

/**
 * Reseeds from scripts/seed-data.mjs.
 *
 * Safe to run against a live server: seed.mjs does the drop, the recreate and
 * the inserts in one transaction, so a page rendering at that moment sees
 * either the old data or the new — never the empty tables in between. Before
 * that was true, reseeding mid-render truncated the RSC payload and the browser
 * reported "Unexpected end of JSON input", which looks like a bug in the page
 * under test and isn't.
 *
 * Still worth calling from beforeAll rather than beforeEach when a spec only
 * reads: it's a second per call, and it turned a read-only file from 1.3
 * minutes into 4.7.
 */
export function resetDatabase(): void {
  try {
    execFileSync(process.execPath, [path.join("scripts", "seed.mjs")], {
      cwd: ROOT,
      // Keep stderr: a silent failure here surfaces later as an inexplicable
      // assertion about the wrong number of guests.
      stdio: ["ignore", "ignore", "pipe"],
    });
  } catch (error) {
    const detail =
      (error as { stderr?: Buffer }).stderr?.toString().trim() || String(error);
    throw new Error(`Could not reseed the database:\n${detail}`);
  }
}

/** Opens the database read-only for assertions. Callers must close it. */
export function openDb(): Database.Database {
  return new Database(DB_PATH, { readonly: true });
}

/** Runs `fn` against a read-only connection and always closes it. */
export function readDb<T>(fn: (db: Database.Database) => T): T {
  const db = openDb();
  try {
    return fn(db);
  } finally {
    db.close();
  }
}

export const countGuests = () =>
  readDb((db) => (db.prepare("SELECT COUNT(*) AS n FROM guests").get() as { n: number }).n);

export const countParties = () =>
  readDb((db) => (db.prepare("SELECT COUNT(*) AS n FROM parties").get() as { n: number }).n);

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

/**
 * Adds 37 filler groups of 4, taking the seed's 20/47 to 57 groups and 195
 * guests.
 *
 * Pagination can't be tested on the demo data at all: 47 guests never fills a
 * 50-row page, so every control would render in its one-and-only-page state and
 * the test would prove nothing. Filler surnames are prefixed "Bulk" so a search
 * assertion can tell them from seeded guests.
 *
 * The group count is sized so the total stays *under* the largest page size the
 * guest list offers (200). At 200 or more the "offers 50 / 100 / 200 a page"
 * assertion stops testing what it says it does — the full list no longer fits on
 * one page, so it would be asserting a truncated count and a second page. Grow
 * the seed and this number has to come down to match.
 */
const FILLER_GROUPS = 37;

export function inflateGuestList(): void {
  const db = new Database(DB_PATH);

  const insertParty = db.prepare(
    `INSERT INTO parties (name, invite_code, envelope_name, address, notes, side)
     VALUES (?, ?, '', '', '', 'both')`,
  );
  const insertGuest = db.prepare(
    `INSERT INTO guests (party_id, first_name, last_name, is_child, rsvp_status)
     VALUES (?, ?, ?, 0, ?)`,
  );

  const statuses = ["attending", "pending", "declined"];

  try {
    db.transaction(() => {
      for (let i = 0; i < FILLER_GROUPS; i += 1) {
        const surname = `Bulk${String(i).padStart(2, "0")}`;
        const { lastInsertRowid } = insertParty.run(
          `The ${surname} Family`,
          `BULK${String(i).padStart(3, "0")}`,
        );
        for (let j = 0; j < 4; j += 1) {
          insertGuest.run(
            lastInsertRowid,
            `Filler${j}`,
            surname,
            statuses[(i + j) % 3],
          );
        }
      }
    })();
  } finally {
    db.close();
  }
}
