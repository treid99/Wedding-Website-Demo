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
| `tests/e2e/helpers/` | Sign-in, shared locators, database reset and inspection |

## No browser download

Both configs use `channel: "chrome"`, so the suite drives the Chrome already on
the machine. There is no `npx playwright install` step and no ~500MB of browser
builds in `node_modules`. If Chrome isn't present, install it or swap the
channel in `playwright.config.ts` for a bundled browser.

## The database

E2E specs run against the real SQLite file. `resetDatabase()` reseeds it from
`scripts/seed-data.mjs`, so **running the suite discards whatever is currently
in `data/wedding.db`.**

Two rules keep this stable, both learned the hard way:

- **Reseed in `beforeAll` when a spec only reads, `beforeEach` only when it
  writes.** A reseed costs about a second; doing it per test turned a read-only
  file from 1.3 minutes into 4.7.
- **`workers: 1`, `fullyParallel: false`.** One database, shared by every spec.

Reseeding under a running server used to corrupt whatever page was mid-render —
the browser would report `Unexpected end of JSON input`, a failure that looks
like a bug in the page under test and isn't. That is fixed at the source rather
than worked around here: `scripts/seed.mjs` now does the drop, the recreate and
the inserts in a single transaction, so a concurrent read sees either the old
data or the new and never the empty tables in between. `lib/db.ts` also sets
`busy_timeout`, so a render that lands during the write waits instead of
throwing.

`inflateGuestList()` adds 40 filler groups (54 groups / 191 guests) for the
pagination specs. The demo's 31 guests never fill a 50-row page, so every
pagination control would render in its only-one-page state and prove nothing.

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
  `guestsIn("The Gamma Family")` in `guest-add.spec.ts` would catch a row that
  renders but never persists; "the name is on screen" would not.
- **Know the seeded value you're changing away from.** A dirty-tracking test
  that sets a field to the value it already has proves nothing — Chidi Okonkwo
  is seeded `attending`, so selecting `attending` left Save correctly disabled
  and failed a test that was itself wrong.

Expect roughly 25s of build plus 4-5 minutes for the full e2e suite, and a few
seconds for the unit tests.

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
