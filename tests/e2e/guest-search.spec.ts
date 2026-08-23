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
   * is a field the matcher searches: "Aria" finds Ezra Fitz too, because his
   * invitation is called "Aria Montgomery & Ezra Fitz".
   */
  const cases: [query: string, expected: number, why: string][] = [
    ["Aria", 2, "first name, and their group"],
    ["Montgomery", 2, "last name"],
    ["gOmEr", 2, "mixed-case substring"],
    ["montgomery aria", 2, "reversed word order"],
    ["zoe", 2, "accent folded (Zoë)"],
    ["griffin", 5, "whole family, including the one regret"],
    ["zzzz", 0, "no match"],
  ];

  for (const [query, expected, why] of cases) {
    test(`finds "${query}" — ${why}`, async ({ page }) => {
      await page.goto("/admin/guests");
      await expect(guestRows(page)).toHaveCount(47);

      await page.fill("#guest-search", query);
      await waitForUrl(page, (url) => url.includes("q="));
      await expect(guestRows(page)).toHaveCount(expected);
    });
  }
});

/**
 * The group view pages at 15 by default and the seed has 20 groups, so these
 * navigate with per=50. Landing on page 1 would make the pre-search assertion
 * read 15 — the page size, not the group count — and a query whose only match
 * sat on page 2 would still be found, quietly proving nothing about filtering
 * before slicing. Paging has its own cover in guest-filters.
 */
test.describe("group view", () => {
  const cases: [query: string, expected: number, why: string][] = [
    ["Montgomery", 1, "member last name"],
    ["Spencer", 1, "member first name"],
    ["uckle", 1, "member substring"],
    ["Addams Family", 1, "group's own name"],
    ["zzzz", 0, "no match"],
  ];

  for (const [query, expected, why] of cases) {
    test(`finds "${query}" — ${why}`, async ({ page }) => {
      await page.goto("/admin/guests?view=groups&per=50");
      await expect(groupCards(page)).toHaveCount(20);

      await page.fill("#guest-search", query);
      await waitForUrl(page, (url) => url.includes("q="));
      await expect(groupCards(page)).toHaveCount(expected);
    });
  }

  test("a status filter keeps a group when any one member qualifies", async ({ page }) => {
    await page.goto("/admin/guests?view=groups&per=50");
    await openFilterMenu(page, "Status");
    await page.locator('label:has-text("Attending") input').first().uncheck();
    await page.locator('label:has-text("Pending") input').first().uncheck();
    await waitForUrl(page, (url) => url.includes("status=declined"));

    const matching = await groupCards(page).count();
    expect(matching).toBeGreaterThan(0);
    expect(matching).toBeLessThan(20);
  });
});

test.describe("debounce", () => {
  test("typing alone searches — there is no Search button", async ({ page }) => {
    await page.goto("/admin/guests");
    await expect(page.locator('button:text-is("Search")')).toHaveCount(0);

    await page.fill("#guest-search", "Hopper");
    await waitForUrl(page, (url) => url.includes("Hopper"));
    await expect(guestRows(page)).toHaveCount(4);
  });

  test("Enter submits without waiting out the timer", async ({ page }) => {
    await page.goto("/admin/guests");
    await page.click("#guest-search");
    await page.keyboard.type("Buckley");
    await page.keyboard.press("Enter");
    await waitForUrl(page, (url) => url.includes("Buckley"));
  });

  test("keeps focus and every character while typing through a search", async ({ page }) => {
    await page.goto("/admin/guests");
    await page.click("#guest-search");

    // Type past the debounce so a navigation lands mid-word, then keep going:
    // this is exactly where re-syncing the input from props used to eat
    // keystrokes and visibly snap the field back to a stale value.
    await page.keyboard.type("Gil", { delay: 60 });
    await waitForUrl(page, (url) => url.includes("Gil"));
    await page.keyboard.type("more", { delay: 60 });

    await expect(page.locator("#guest-search")).toHaveValue("Gilmore");
    await expect(page.locator("#guest-search")).toBeFocused();
    await waitForUrl(page, (url) => url.includes("Gilmore"));
    await expect(guestRows(page)).toHaveCount(3);
  });

  test("does not flood the back stack while typing", async ({ page }) => {
    await page.goto("/admin/guests");
    const before = await page.evaluate(() => history.length);

    await page.click("#guest-search");
    await page.keyboard.type("Harrington", { delay: 40 });
    await waitForUrl(page, (url) => url.includes("Harrington"));

    // Ten keystrokes, at most one history entry: debounced text edits replace.
    const after = await page.evaluate(() => history.length);
    expect(after - before).toBeLessThanOrEqual(1);
  });

  test("the inline clear button resets the search", async ({ page }) => {
    await page.goto("/admin/guests?q=Harrington");
    await page.click('button[aria-label="Clear search"]');
    await waitForUrl(page, (url) => !url.includes("q="));
    await expect(guestRows(page)).toHaveCount(47);
  });
});

test("filters survive the view toggle", async ({ page }) => {
  await page.goto("/admin/guests?q=Rose");
  await page.locator('[aria-label="Choose a view"] a:has-text("Groups")').click();
  await waitForUrl(page, (url) => url.includes("view=groups"));

  expect(page.url()).toContain("q=Rose");
  await expect(page.locator('[aria-live="polite"]').first()).toContainText(/match/i);
});
