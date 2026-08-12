import { expect, test } from "@playwright/test";
import {
  groupCards,
  guestRows,
  openFilterMenu,
  perPageSelect,
  signIn,
  waitForUrl,
} from "./helpers/admin";
import { inflateGuestList, resetDatabase } from "./helpers/db";

/**
 * Status colours, the redesigned filter bar, and pagination.
 *
 * Runs against an inflated guest list (54 groups / 191 guests). The demo seed's
 * 31 guests never fill a 50-row page, so every pagination control would render
 * in its only-one-page state and prove nothing.
 */

// Filtering and paging never write, so the inflated list is built once.
test.beforeAll(() => {
  resetDatabase();
  inflateGuestList();
});

test.beforeEach(async ({ page }) => {
  await signIn(page);
});

/** Computed text colour of the first pill with this label. */
async function pillColour(page: import("@playwright/test").Page, status: string) {
  const value = await page.evaluate((wanted) => {
    const pill = [...document.querySelectorAll("span")].find(
      (node) => node.textContent?.trim() === wanted && node.className.includes("border"),
    );
    return pill ? getComputedStyle(pill).color : null;
  }, status);

  const [r, g, b] = (value ?? "").match(/\d+/g)?.map(Number) ?? [0, 0, 0];
  return { value, r, g, b };
}

test.describe("status pills", () => {
  test("read green for yes, red for no, neutral for not yet", async ({ page }) => {
    await page.goto("/admin/guests");

    const attending = await pillColour(page, "attending");
    expect(attending.g, `attending was ${attending.value}`).toBeGreaterThan(attending.r);
    expect(attending.g).toBeGreaterThan(attending.b);

    const declined = await pillColour(page, "declined");
    expect(declined.r, `declined was ${declined.value}`).toBeGreaterThan(declined.g);
    expect(declined.r).toBeGreaterThan(declined.b);

    const pending = await pillColour(page, "pending");
    const spread = Math.max(pending.r, pending.g, pending.b) - Math.min(pending.r, pending.g, pending.b);
    expect(spread, `pending was ${pending.value}`).toBeLessThan(30);
  });
});

test.describe("row affordances", () => {
  test("the guest list uses a pencil icon, not the word Edit", async ({ page }) => {
    await page.goto("/admin/guests");
    await expect(page.locator('summary:has-text("Edit")')).toHaveCount(0);
    expect(await page.locator("summary svg").count()).toBeGreaterThanOrEqual(50);
  });

  test("group names are bold and guest meta sits beside the name", async ({ page }) => {
    await page.goto("/admin/guests?view=groups");

    const weight = await page
      .locator("section h3")
      .first()
      .evaluate((node) => getComputedStyle(node).fontWeight);
    expect(Number(weight)).toBeGreaterThanOrEqual(600);

    const geometry = await page.evaluate(() => {
      const statuses = ["attending", "pending", "declined"];
      const item = [...document.querySelectorAll("li")].find(
        (node) =>
          node.querySelector("p") &&
          [...node.querySelectorAll("span")].some((s) =>
            statuses.includes(s.textContent?.trim() ?? ""),
          ),
      )!;
      const name = item.querySelector("p")!.getBoundingClientRect();
      const pill = [...item.querySelectorAll("span")]
        .find((s) => statuses.includes(s.textContent?.trim() ?? ""))!
        .getBoundingClientRect();
      return {
        nameRight: name.right,
        nameMid: name.top + name.height / 2,
        pillLeft: pill.left,
        pillMid: pill.top + pill.height / 2,
      };
    });

    expect(geometry.pillLeft).toBeGreaterThanOrEqual(geometry.nameRight - 1);
    expect(Math.abs(geometry.pillMid - geometry.nameMid)).toBeLessThan(8);
  });
});

test.describe("filter bar", () => {
  test("has no Search button and a plain placeholder", async ({ page }) => {
    await page.goto("/admin/guests");
    await expect(page.locator("#guest-search")).toHaveAttribute("placeholder", "Search");
    await expect(page.locator('button:text-is("Search")')).toHaveCount(0);
    await expect(page.locator("#guest-status")).toHaveCount(0);
    await expect(page.locator('button:has-text("Clear filters")')).toHaveCount(0);
  });

  test("filters by several statuses at once", async ({ page }) => {
    await page.goto("/admin/guests");
    await openFilterMenu(page, "Status");

    const boxes = page.locator('button:has-text("Status") + div input[type="checkbox"]');
    await expect(boxes).toHaveCount(4);

    // "Everything" shows as every box ticked, not as four empty boxes above a
    // full list, and All can't be unticked into an empty result set.
    await expect(boxes.nth(0)).toBeChecked();
    await expect(boxes.nth(1)).toBeChecked();
    await expect(boxes.nth(3)).toBeChecked();
    await expect(boxes.nth(0)).toBeDisabled();

    await page.locator('label:has-text("Pending") input').first().uncheck();
    await waitForUrl(page, (url) => url.includes("status="));
    expect(decodeURIComponent(page.url())).toContain("status=attending,declined");
    await expect(page.locator('summary:has-text("pending")')).toHaveCount(0);
    await expect(page.locator('[aria-live="polite"]').first()).toContainText("of 191 guests match");
  });

  test("never lets the last status be unticked", async ({ page }) => {
    await page.goto("/admin/guests?status=attending");
    await openFilterMenu(page, "Status");
    await expect(page.locator('label:has-text("Attending") input').first()).toBeDisabled();
  });

  test("re-ticking every status collapses back to All", async ({ page }) => {
    await page.goto("/admin/guests?status=attending");
    await openFilterMenu(page, "Status");
    await page.locator('label:has-text("Pending") input').first().check();
    await page.locator('label:has-text("Declined") input').first().check();
    await waitForUrl(page, (url) => !url.includes("status="));
  });

  test("debounces two toggles into one navigation", async ({ page }) => {
    await page.goto("/admin/guests");
    const before = await page.evaluate(() => history.length);

    await openFilterMenu(page, "Status");
    await page.locator('label:has-text("Attending") input').first().uncheck();
    await page.locator('label:has-text("Declined") input').first().uncheck();
    await waitForUrl(page, (url) => url.includes("status="));

    expect((await page.evaluate(() => history.length)) - before).toBeLessThanOrEqual(1);
  });

  test("Clear filters resets everything", async ({ page }) => {
    await page.goto("/admin/guests?q=Bulk&status=declined&seated=unseated");
    await page.click('button:has-text("Clear filters")');
    await waitForUrl(page, (url) => url.endsWith("/admin/guests"));
    await expect(guestRows(page)).toHaveCount(50);
  });

  test("the seating menu still filters", async ({ page }) => {
    await page.goto("/admin/guests");
    await openFilterMenu(page, "Seating");
    await page.locator('label:has-text("Not seated") input').first().check();
    await waitForUrl(page, (url) => url.includes("seated=unseated"));
  });
});

test.describe("guest list pagination", () => {
  test("defaults to 50 a page with working steps", async ({ page }) => {
    await page.goto("/admin/guests");
    await expect(guestRows(page)).toHaveCount(50);
    await expect(page.getByText("Showing 1–50 of 191 guests")).toBeVisible();
    await expect(page.locator('span[aria-disabled]:has-text("Prev")')).toHaveCount(1);

    await page.locator('a[aria-label="Next page"]').click();
    await waitForUrl(page, (url) => url.includes("page=2"));
    await expect(page.getByText("Showing 51–100 of 191 guests")).toBeVisible();

    await page.locator('a[aria-label="Previous page"]').click();
    await waitForUrl(page, (url) => !url.includes("page="));
    await expect(page.getByText("Showing 1–50 of 191 guests")).toBeVisible();
  });

  test("offers 50 / 100 / 200 a page", async ({ page }) => {
    await page.goto("/admin/guests");
    await expect(perPageSelect(page).locator("option")).toHaveText(["50", "100", "200"]);

    await perPageSelect(page).selectOption("200");
    await waitForUrl(page, (url) => url.includes("per=200"));
    await expect(guestRows(page)).toHaveCount(191);
    await expect(page.getByText("1 / 1")).toBeVisible();

    await perPageSelect(page).selectOption("100");
    await waitForUrl(page, (url) => url.includes("per=100"));
    await expect(guestRows(page)).toHaveCount(100);
  });

  test("searching reaches guests on other pages", async ({ page }) => {
    // The whole point of filtering before slicing: from page 3, a name that
    // only exists on page 1 still has to be findable.
    await page.goto("/admin/guests?page=3");
    await expect(page.getByText("Showing 101–150 of 191 guests")).toBeVisible();

    await page.fill("#guest-search", "Whitfield");
    await waitForUrl(page, (url) => url.includes("q=Whitfield"));
    await expect(guestRows(page)).toHaveCount(2);
    expect(page.url()).not.toContain("page=");
  });

  test("changing a filter resets to page 1", async ({ page }) => {
    await page.goto("/admin/guests?page=3");
    await openFilterMenu(page, "Status");
    await page.locator('label:has-text("Declined") input').first().uncheck();
    await waitForUrl(page, (url) => url.includes("status="));
    expect(page.url()).not.toContain("page=");
  });
});

test.describe("group pagination", () => {
  test("defaults to 15 a page and offers 15 / 25 / 50", async ({ page }) => {
    await page.goto("/admin/guests?view=groups");
    await expect(groupCards(page)).toHaveCount(15);
    await expect(page.getByText("Showing 1–15 of 54 groups")).toBeVisible();
    await expect(perPageSelect(page).locator("option")).toHaveText(["15", "25", "50"]);

    await perPageSelect(page).selectOption("25");
    await waitForUrl(page, (url) => url.includes("per=25"));
    await expect(groupCards(page)).toHaveCount(25);

    await page.locator('a[aria-label="Next page"]').click();
    await waitForUrl(page, (url) => url.includes("page=2"));
    await expect(page.getByText("Showing 26–50 of 54 groups")).toBeVisible();
    expect(page.url()).toContain("per=25");
  });

  test("searching reaches groups on other pages", async ({ page }) => {
    await page.goto("/admin/guests?view=groups&per=25&page=2");
    await page.fill("#guest-search", "Okonkwo");
    await waitForUrl(page, (url) => url.includes("q=Okonkwo"));
    await expect(groupCards(page)).toHaveCount(1);
    expect(page.url()).not.toContain("page=");
  });

  test("the view toggle keeps the search but drops the other view's page size", async ({ page }) => {
    await page.goto("/admin/guests?view=groups&q=Okonkwo&per=25&page=2");
    await page.locator('[aria-label="Choose a view"] a:has-text("Guest list")').click();
    await waitForUrl(page, (url) => !url.includes("view=groups"));

    expect(page.url()).toContain("q=Okonkwo");
    expect(page.url()).not.toContain("per=");
    expect(page.url()).not.toContain("page=");
  });
});
