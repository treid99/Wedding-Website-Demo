import { defaultPerPage } from "@/lib/guest-params";
import {
  groupCards,
  guestRows,
  openFilterMenu,
  signIn,
  waitForUrl,
} from "./helpers/admin";
import { countGuests, countParties } from "./helpers/db";
import { createParty, uniqueToken } from "./helpers/fixtures";
import { expect, test } from "./helpers/test";

/**
 * Guest and group search — the parts of it that only a browser can prove.
 *
 * What the matcher *matches* is not tested here. tests/unit/search.spec.ts
 * drives lib/search directly and covers folding, substrings, token order and
 * the empty query far more cheaply than a page load can. Repeating that matrix
 * end to end bought nothing and cost everything: each case needed a real guest
 * whose name had the right shape, so the assertions were really assertions
 * about seed-data.mjs, and editing the guest list broke them all.
 *
 * What is left is the wiring, which the unit tests cannot see:
 *
 *   · the typed query reaches the flat list
 *   · the typed query reaches the group view — this one shipped broken once,
 *     the view ignored `q` entirely
 *   · a group survives a status filter when any one member qualifies
 *   · the debounce keeps every keystroke and does not bury the back button
 *
 * Each test builds the guests it needs, so the expected counts are facts about
 * the fixture two lines up rather than about whoever is in the database.
 */

test.beforeEach(async ({ page }) => {
  await signIn(page);
});

test.describe("the query reaches both views", () => {
  test("the flat list narrows to the searched name", async ({ page }) => {
    const party = createParty({ guests: 2 });
    const onFirstPage = Math.min(countGuests(), defaultPerPage("list"));

    await page.goto("/admin/guests");
    await expect(guestRows(page)).toHaveCount(onFirstPage);

    await page.fill("#guest-search", party.token);
    await waitForUrl(page, (url) => url.includes(party.token));
    await expect(guestRows(page)).toHaveCount(party.guests.length);
  });

  test("the group view narrows to the searched name", async ({ page }) => {
    const party = createParty({ guests: 2 });
    const onFirstPage = Math.min(countParties(), defaultPerPage("groups"));

    await page.goto("/admin/guests?view=groups");
    await expect(groupCards(page)).toHaveCount(onFirstPage);

    await page.fill("#guest-search", party.token);
    await waitForUrl(page, (url) => url.includes(party.token));
    await expect(groupCards(page)).toHaveCount(1);
  });

  test("a query nothing matches empties both views", async ({ page }) => {
    // Never handed to a fixture, so nothing in the database carries it.
    const missing = uniqueToken();

    await page.goto(`/admin/guests?q=${missing}`);
    await expect(guestRows(page)).toHaveCount(0);

    await page.goto(`/admin/guests?view=groups&q=${missing}`);
    await expect(groupCards(page)).toHaveCount(0);
  });

  test("a status filter keeps a group when any one member qualifies", async ({
    page,
  }) => {
    const party = createParty({
      guests: [
        { status: "attending" },
        { status: "attending" },
        { status: "declined" },
      ],
    });

    // Scoped to this fixture by `q`, so the assertion is "the group survives"
    // rather than "some number of groups survived", which was true either way.
    await page.goto(`/admin/guests?view=groups&q=${party.token}`);
    await expect(groupCards(page)).toHaveCount(1);

    await openFilterMenu(page, "Status");
    await page.locator('label:has-text("Attending") input').first().uncheck();
    await page.locator('label:has-text("Pending") input').first().uncheck();
    await waitForUrl(page, (url) => url.includes("status=declined"));

    await expect(groupCards(page)).toHaveCount(1);
  });
});

/**
 * Regression cover for the input itself: fast typing used to lose characters,
 * because the field re-synced from a prop that lagged the keystrokes. These
 * assert the value *while* typing continues, not just where it settles — the
 * original test only checked the settled value and passed against genuinely
 * broken behaviour.
 */
test.describe("debounce", () => {
  test("typing alone searches — there is no Search button", async ({ page }) => {
    const party = createParty({ guests: 3 });

    await page.goto("/admin/guests");
    await expect(page.locator('button:text-is("Search")')).toHaveCount(0);

    await page.fill("#guest-search", party.token);
    await waitForUrl(page, (url) => url.includes(party.token));
    await expect(guestRows(page)).toHaveCount(party.guests.length);
  });

  test("Enter submits without waiting out the timer", async ({ page }) => {
    const party = createParty();

    await page.goto("/admin/guests");
    await page.click("#guest-search");
    await page.keyboard.type(party.token);
    await page.keyboard.press("Enter");
    await waitForUrl(page, (url) => url.includes(party.token));
  });

  test("keeps focus and every character while typing through a search", async ({
    page,
  }) => {
    const party = createParty({ guests: 2 });
    // Split so a navigation lands mid-word: this is exactly where re-syncing
    // the input from props used to eat keystrokes and snap the field back.
    const head = party.token.slice(0, 3);
    const tail = party.token.slice(3);

    await page.goto("/admin/guests");
    await page.click("#guest-search");

    await page.keyboard.type(head, { delay: 60 });
    await waitForUrl(page, (url) => url.includes(head));
    await page.keyboard.type(tail, { delay: 60 });

    await expect(page.locator("#guest-search")).toHaveValue(party.token);
    await expect(page.locator("#guest-search")).toBeFocused();
    await waitForUrl(page, (url) => url.includes(party.token));
    await expect(guestRows(page)).toHaveCount(party.guests.length);
  });

  test("does not flood the back stack while typing", async ({ page }) => {
    const party = createParty();

    await page.goto("/admin/guests");
    const before = await page.evaluate(() => history.length);

    await page.click("#guest-search");
    await page.keyboard.type(party.token, { delay: 40 });
    await waitForUrl(page, (url) => url.includes(party.token));

    // Every keystroke, at most one history entry: debounced text edits replace.
    const after = await page.evaluate(() => history.length);
    expect(after - before).toBeLessThanOrEqual(1);
  });

  test("the inline clear button resets the search", async ({ page }) => {
    const party = createParty();
    const onFirstPage = Math.min(countGuests(), defaultPerPage("list"));

    await page.goto(`/admin/guests?q=${party.token}`);
    await expect(guestRows(page)).toHaveCount(party.guests.length);

    await page.click('button[aria-label="Clear search"]');
    await waitForUrl(page, (url) => !url.includes("q="));
    await expect(guestRows(page)).toHaveCount(onFirstPage);
  });
});

test("the search survives the view toggle", async ({ page }) => {
  const party = createParty();

  await page.goto(`/admin/guests?q=${party.token}`);
  await page.locator('[aria-label="Choose a view"] a:has-text("Groups")').click();
  await waitForUrl(page, (url) => url.includes("view=groups"));

  expect(page.url()).toContain(`q=${party.token}`);
  await expect(groupCards(page)).toHaveCount(1);
  await expect(page.locator('[aria-live="polite"]').first()).toContainText(/match/i);
});
