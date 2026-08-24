import { countGuests, countParties, readDb, writeDb } from "./helpers/db";
import { createParty } from "./helpers/fixtures";
import { expect, test } from "./helpers/test";

/**
 * The promise every other spec in this directory is written against: a test may
 * add, edit and delete as freely as a user can, and the next test starts from
 * the database as it was.
 *
 * It is worth a test of its own because nothing else would notice it breaking.
 * If the restore quietly stopped working, the suite would not fail — it would
 * go on passing while eating the developer's data, which is precisely the
 * behaviour the snapshot exists to end.
 *
 * Two tests, in order, sharing module state: the first makes a mess of all
 * three kinds, the second checks that none of it survived. Writing SQL by hand
 * is a deliberate exception here — everywhere else that belongs to
 * helpers/fixtures, but this file is about the mechanism rather than the UI.
 */

type PartyRow = { id: number; name: string };

const RENAMED = "Renamed by the restore check";

let before:
  | {
      parties: number;
      guests: number;
      renamed: PartyRow;
      deleted: PartyRow;
      added: string;
    }
  | undefined;

const nameOf = (id: number): string | undefined =>
  readDb(
    (db) =>
      (db.prepare("SELECT name FROM parties WHERE id = ?").get(id) as
        | { name: string }
        | undefined)?.name,
  );

const exists = (name: string): boolean =>
  readDb(
    (db) =>
      db.prepare("SELECT 1 FROM parties WHERE name = ?").get(name) !== undefined,
  );

test("a test may add, rename and delete rows", () => {
  const [renamed, deleted] = readDb((db) =>
    db.prepare("SELECT id, name FROM parties ORDER BY id LIMIT 2").all(),
  ) as PartyRow[];

  expect(renamed, "the baseline needs at least two groups").toBeDefined();
  expect(deleted, "the baseline needs at least two groups").toBeDefined();

  const party = createParty({ guests: 2 });
  before = {
    parties: countParties(),
    guests: countGuests(),
    renamed,
    deleted,
    added: party.name,
  };

  writeDb((db) => {
    db.prepare("UPDATE parties SET name = ? WHERE id = ?").run(RENAMED, renamed.id);
    db.prepare("DELETE FROM parties WHERE id = ?").run(deleted.id);
  });

  expect(exists(party.name), "the addition did not land").toBe(true);
  expect(nameOf(renamed.id), "the edit did not land").toBe(RENAMED);
  expect(nameOf(deleted.id), "the deletion did not land").toBeUndefined();
});

test("and none of it survives into the next test", () => {
  expect(before, "the previous test did not run").toBeDefined();
  const state = before!;

  // The addition is gone, the deletion is back, the edit is undone.
  expect(exists(state.added), "an added group outlived its test").toBe(false);
  expect(nameOf(state.renamed.id), "an edit outlived its test").toBe(
    state.renamed.name,
  );
  expect(nameOf(state.deleted.id), "a deleted group did not come back").toBe(
    state.deleted.name,
  );

  // And the counts are back where the fixture found them, less the two guests
  // and one group the fixture itself contributed.
  expect(countParties()).toBe(state.parties - 1);
  expect(countGuests()).toBe(state.guests - 2);
});
