# Tests

```bash
npm test              # unit, then e2e
npm run test:unit     # pure helpers in lib/ — fast, no browser, no database
npm run test:e2e      # the running site, in Chrome
npm run test:report   # open the HTML report from the last e2e run
```

Narrowing a run:

```bash
npm run test:e2e -- guest-filters              # one file
npm run test:e2e -- -g "pagination"            # by test name
npm run test:e2e -- --headed                   # watch it happen
npm run test:e2e -- --debug                    # step through it
npm run test:e2e:ui                            # the Playwright UI
```

## Layout

| Path | What it covers |
|---|---|
| `tests/unit/` | `lib/search`, `lib/guest-params`, `lib/format`, `lib/paginate` |
| `tests/e2e/public-site.spec.ts` | Every guest-facing page, carousel, lightbox, registry filters, RSVP round trip, responsive |
| `tests/e2e/admin-console.spec.ts` | Auth gate, dashboard, seating, content editing, registry CRUD |
| `tests/e2e/guest-search.spec.ts` | Guest and group search, debounce, typing behaviour |
| `tests/e2e/guest-add.spec.ts` | View toggle and the Add dialog |
| `tests/e2e/guest-groups.spec.ts` | Group cards: edit, delete, inline add, per-guest editor |
| `tests/e2e/guest-filters.spec.ts` | Status pills, the filter bar, pagination |
| `tests/e2e/db-restore.spec.ts` | That a test's writes do not outlive it |
| `tests/e2e/helpers/` | Sign-in, shared locators, the snapshot, and fixtures |

## No browser download

Both configs use `channel: "chrome"`, so the suite drives the Chrome already on
the machine. There is no `npx playwright install` step and no ~500MB of browser
builds in `node_modules`. If Chrome isn't present, install it or swap the
channel in `playwright.config.ts` for a bundled browser.

## The database

E2E specs run against the real SQLite file, and **the suite does not reseed.**
`globalSetup` photographs every table before the first test; an auto fixture in
`helpers/test.ts` replays that snapshot after every test; `globalTeardown` does
it once more on the way out. A test may add, edit and delete as freely as a user
can, because none of it survives the test that did it — additions are gone,
deletions are back, edits are undone. Run the suite on a database you have been
entering real data into and you get it back exactly as it was.

That is a deliberate reversal. The suite used to call `resetDatabase()`, which
runs `scripts/seed.mjs`, which drops every table — so typing `npm run test:e2e`
silently destroyed whatever was in `data/wedding.db`. It was also slow: each
reseed spawns a Node process and costs about a second, and the full suite ran
for roughly 17 minutes. Replaying a snapshot in-process takes single-digit
milliseconds, and the suite now finishes in about two and a half.

Three rules keep it honest:

- **Never write SQL from a spec.** Build rows through `helpers/fixtures` so
  cleanup stays the snapshot's business. `db-restore.spec.ts` is the one
  exception, because it is testing the mechanism itself.
- **Never assert a number that came from the seed.** Read totals back with
  `countGuests()`, `countParties()` and friends, or assert against a fixture you
  built two lines up. See *Fixtures, not seed data* below.
- **`workers: 1`, `fullyParallel: false`.** One database, shared by every spec —
  and parallel workers would each restore over the others' fixtures.

Writing under a running server used to corrupt whatever page was mid-render, and
the browser would report `Unexpected end of JSON input` — a failure that looks
like a bug in the page under test and isn't. Both writers avoid it the same way:
`scripts/seed.mjs` and `applySnapshot()` each do all their work in a single
transaction, so a concurrent read sees either the old data or the new and never
the empty tables in between. `lib/db.ts` sets `busy_timeout` as well, so a
render that lands during the write waits instead of throwing.

`inflateGuestList()` is the exception that adds rather than builds: pagination
cannot be tested on a wedding-sized guest list at all, because it never fills
the first page and every control renders in its one-and-only-page state. It
pads the list out and returns the resulting totals for the spec to assert on.
How far it pads is derived from `PER_PAGE_OPTIONS` — above twice the default
page size so `?page=3` is real, below the largest size on offer so selecting
that size collapses the pager to one page — rather than written down, so adding
a page size to the admin cannot leave it quietly wrong.

## Fixtures, not seed data

Specs build the rows they assert on:

```ts
const party = createParty({ guests: 4 });
await page.goto(`/admin/guests?view=groups&q=${party.token}`);
await expect(dialog).toContainText(`${party.guests.length} guests will be removed`);
```

Every fixture carries a generated token — a surname stem that appears nowhere in
real data. That token does three jobs. It makes counts exact, because a search
for it matches this fixture and nothing else. It makes names unique, so two
fixtures never collide on a UI label. And `?q=<token>` narrows any admin screen
to exactly this group, which removes a whole class of accidental dependency:
the group view pages at 15, so an assertion that clicks "that group's delete
icon" was previously relying on where the group happened to sort.

The specs used to assert against the seed instead — `"Aria"` finds 2 guests, the
list holds 47, the four-person group is the Byers-Hoppers. Every one of those is
a fact about `scripts/seed-data.mjs` rather than about the software, so editing
the guest list broke eight spec files that had nothing to do with the change.

The corollary is that **matcher semantics belong in `tests/unit/`.** Accent
folding, token order and substring matching are covered there against
`lib/search` directly, far more cheaply than a page load. `guest-search.spec.ts`
keeps only what a browser can prove: that the typed query reaches the flat list
and the group view, that a group survives a status filter when one member
qualifies, and that the debounce keeps every keystroke.

## Waiting

Use `waitForUrl(page, predicate)` from `helpers/admin`, never a fixed sleep.
The filter bar waits 300ms before navigating and the round trip after that is
unbounded, so `waitForTimeout` was the single largest source of flake while
these were being written.

## Writing assertions that can fail

Three habits, each from a test that lied:

- **Assert intermediate states, not just settled ones.** The typing test types
  through a debounced navigation and checks the field *mid-word*. An earlier
  version only checked the final value and passed while keystrokes were being
  dropped in front of the user.
- **Assert against the database when the point is that a write landed.**
  `guestsIn(group)` in `guest-add.spec.ts` would catch a row that renders but
  never persists; "the name is on screen" would not.
- **Know the value you're changing away from.** A dirty-tracking test that sets
  a field to the value it already has proves nothing. Fixtures make this
  checkable rather than remembered: `createParty({ guests: [{ status:
  "attending", meal: "chicken" }] })` states the starting value in the test that
  depends on it, so selecting `declined` is provably a change.

Expect roughly 25s of build plus about two and a half minutes for the full e2e
suite, and a few seconds for the unit tests.

## The server

`npm run test:e2e` builds the app and serves it in **production mode on port
3100**, out of its own `.next-test` directory. It costs ~25s of build up front
and needs no coordination with the dev server you have open on 3000 — both can
run at once.

That indirection is not incidental. Running the suite against `next dev` was the
source of every intermittent failure it has had: the dev server compiles routes
on demand and rewrites manifests inside `.next` while it is serving, and a
request landing mid-write fails with `Unexpected end of JSON input` **from the
server**, on a page with nothing wrong with it. Failures moved between files
from run to run, which reads exactly like a flaky application and isn't one.
Production output is built once and never rewritten. It's also faster overall,
since nothing compiles on first hit.

To drive a server you're already running instead — useful with `--headed` —
set `BASE_URL`, and Playwright will start nothing:

```bash
BASE_URL=http://localhost:3000 npm run test:e2e -- --headed
```

Expect occasional dev-server flake if you do.
