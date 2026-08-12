import { expect, test } from "@playwright/test";
import {
  groupCards,
  guestRows,
  openFilterMenu,
  signIn,
  waitForUrl,
} from "./helpers/admin";
import { resetDatabase } from "./helpers/db";

/**
 * Guest and group search.
 *
 * Regression cover for two bugs: group view ignored the query entirely, and
 * fast typing lost characters because the input was re-synced from a prop that
 * lagged the keystrokes. The typing assertions check the value *while* typing
 * continues, not just where it settles — the original test only asserted the
 * settled value and passed against genuinely broken behaviour.
 */

// Search never writes, so one reseed for the whole file.
test.beforeAll(() => resetDatabase());

test.beforeEach(async ({ page }) => {
  await signIn(page);
});

test.describe("flat guest list", () => {
  /**
   * Counts include everyone the query reaches through their *group* name, which
   * is a field the matcher searches: "Daniel" finds Priya Rao too, because her
   * invitation is called "Daniel & Priya Rao".
   */
  const cases: [query: string, expected: number, why: string][] = [
    ["Daniel", 2, "first name, and their group"],
    ["Rao", 2, "last name"],
    ["NiEl", 2, "mixed-case substring"],
    ["rao daniel", 2, "reversed word order"],
    ["tomas", 2, "accent folded (Tomás)"],
    ["okonkwo", 4, "whole family"],
    ["zzzz", 0, "no match"],
  ];

  for (const [query, expected, why] of cases) {
    test(`finds "${query}" — ${why}`, async ({ page }) => {
      await page.goto("/admin/guests");
      await expect(guestRows(page)).toHaveCount(31);

      await page.fill("#guest-search", query);
      await waitForUrl(page, (url) => url.includes("q="));
      await expect(guestRows(page)).toHaveCount(expected);
    });
  }
});

test.describe("group view", () => {
  const cases: [query: string, expected: number, why: string][] = [
    ["Rao", 1, "member last name"],
    ["Daniel", 1, "member first name"],
    ["niel", 1, "member substring"],
    ["Mitchell Family", 1, "group's own name"],
    ["zzzz", 0, "no match"],
  ];

  for (const [query, expected, why] of cases) {
    test(`finds "${query}" — ${why}`, async ({ page }) => {
      await page.goto("/admin/guests?view=groups");
      await expect(groupCards(page)).toHaveCount(14);

      await page.fill("#guest-search", query);
      await waitForUrl(page, (url) => url.includes("q="));
      await expect(groupCards(page)).toHaveCount(expected);
    });
  }

  test("a status filter keeps a group when any one member qualifies", async ({ page }) => {
    await page.goto("/admin/guests?view=groups");
    await openFilterMenu(page, "Status");
    await page.locator('label:has-text("Attending") input').first().uncheck();
    await page.locator('label:has-text("Pending") input').first().uncheck();
    await waitForUrl(page, (url) => url.includes("status=declined"));

    const matching = await groupCards(page).count();
    expect(matching).toBeGreaterThan(0);
    expect(matching).toBeLessThan(14);
  });
});

test.describe("debounce", () => {
  test("typing alone searches — there is no Search button", async ({ page }) => {
    await page.goto("/admin/guests");
    await expect(page.locator('button:text-is("Search")')).toHaveCount(0);

    await page.fill("#guest-search", "Brennan");
    await waitForUrl(page, (url) => url.includes("Brennan"));
    await expect(guestRows(page)).toHaveCount(4);
  });

  test("Enter submits without waiting out the timer", async ({ page }) => {
    await page.goto("/admin/guests");
    await page.click("#guest-search");
    await page.keyboard.type("Demir");
    await page.keyboard.press("Enter");
    await waitForUrl(page, (url) => url.includes("Demir"));
  });

  test("keeps focus and every character while typing through a search", async ({ page }) => {
    await page.goto("/admin/guests");
    await page.click("#guest-search");

    // Type past the debounce so a navigation lands mid-word, then keep going:
    // this is exactly where re-syncing the input from props used to eat
    // keystrokes and visibly snap the field back to a stale value.
    await page.keyboard.type("Mit", { delay: 60 });
    await waitForUrl(page, (url) => url.includes("Mit"));
    await page.keyboard.type("chell", { delay: 60 });

    await expect(page.locator("#guest-search")).toHaveValue("Mitchell");
    await expect(page.locator("#guest-search")).toBeFocused();
    await waitForUrl(page, (url) => url.includes("Mitchell"));
    await expect(guestRows(page)).toHaveCount(3);
  });

  test("does not flood the back stack while typing", async ({ page }) => {
    await page.goto("/admin/guests");
    const before = await page.evaluate(() => history.length);

    await page.click("#guest-search");
    await page.keyboard.type("Ferreira", { delay: 40 });
    await waitForUrl(page, (url) => url.includes("Ferreira"));

    // Eight keystrokes, at most one history entry: debounced text edits replace.
    const after = await page.evaluate(() => history.length);
    expect(after - before).toBeLessThanOrEqual(1);
  });

  test("the inline clear button resets the search", async ({ page }) => {
    await page.goto("/admin/guests?q=Ferreira");
    await page.click('button[aria-label="Clear search"]');
    await waitForUrl(page, (url) => !url.includes("q="));
    await expect(guestRows(page)).toHaveCount(31);
  });
});

test("filters survive the view toggle", async ({ page }) => {
  await page.goto("/admin/guests?q=Rao");
  await page.locator('[aria-label="Choose a view"] a:has-text("Groups")').click();
  await waitForUrl(page, (url) => url.includes("view=groups"));

  expect(page.url()).toContain("q=Rao");
  await expect(page.locator('[aria-live="polite"]').first()).toContainText(/match/i);
});
