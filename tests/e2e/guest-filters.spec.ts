import { PER_PAGE_OPTIONS, defaultPerPage } from "@/lib/guest-params";
import {
  groupCards,
  guestRows,
  openFilterMenu,
  perPageSelect,
  signIn,
  waitForUrl,
} from "./helpers/admin";
import { countGuests, countParties, inflateGuestList } from "./helpers/db";
import type { Inflation } from "./helpers/db";
import { createParty } from "./helpers/fixtures";
import { expect, test } from "./helpers/test";
import type { Page } from "./helpers/test";

/**
 * Status colours, the filter bar, and pagination.
 *
 * Pagination is the one thing here that cannot be tested on a real guest list:
 * a wedding's worth of people never fills the first page, so every control
 * renders in its one-and-only-page state and proves nothing. So each test
 * inflates the list first, and the afterEach restore takes the filler away
 * again — inflating per test rather than once per file is what makes those two
 * facts compatible, and it costs a single transaction.
 *
 * Every expected total is read back from the database after inflating. The
 * numbers used to be written down here (195 guests, 57 groups), which made this
 * file a second place to remember whenever the guest list changed, and a file
 * that fails for that reason teaches nobody anything.
 */

let inflated: Inflation;

test.beforeEach(async ({ page }) => {
  inflated = inflateGuestList();
  await signIn(page);
});

/** Computed text colour of the first pill with this label. */
async function pillColour(page: Page, status: string) {
  const value = await page.evaluate((wanted) => {
    const pill = [...document.querySelectorAll("span")].find(
      (node) =>
        node.textContent?.trim() === wanted && node.className.includes("border"),
    );
    return pill ? getComputedStyle(pill).color : null;
  }, status);

  const [r, g, b] = (value ?? "").match(/\d+/g)?.map(Number) ?? [0, 0, 0];
  return { value, r, g, b };
}

test.describe("status pills", () => {
  test("read green for yes, red for no, neutral for not yet", async ({ page }) => {
    // One guest per status, and the screen narrowed to them, so all three pills
    // are certain to be rendered rather than likely to be.
    const party = createParty({
      guests: [
        { status: "attending" },
        { status: "declined" },
        { status: "pending" },
      ],
    });
    await page.goto(`/admin/guests?q=${party.token}`);

    const attending = await pillColour(page, "attending");
    expect(attending.g, `attending was ${attending.value}`).toBeGreaterThan(
      attending.r,
    );
    expect(attending.g).toBeGreaterThan(attending.b);

    const declined = await pillColour(page, "declined");
    expect(declined.r, `declined was ${declined.value}`).toBeGreaterThan(declined.g);
    expect(declined.r).toBeGreaterThan(declined.b);

    const pending = await pillColour(page, "pending");
    const spread =
      Math.max(pending.r, pending.g, pending.b) -
      Math.min(pending.r, pending.g, pending.b);
    expect(spread, `pending was ${pending.value}`).toBeLessThan(30);
  });
});

test.describe("row affordances", () => {
  test("the guest list uses a pencil icon, not the word Edit", async ({ page }) => {
    await page.goto("/admin/guests");

    const onFirstPage = Math.min(inflated.guests, defaultPerPage("list"));
    await expect(page.locator('summary:has-text("Edit")')).toHaveCount(0);
    expect(await page.locator("summary svg").count()).toBeGreaterThanOrEqual(
      onFirstPage,
    );
  });

  test("group names are bold and guest meta sits beside the name", async ({
    page,
  }) => {
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
    await expect(page.locator("#guest-search")).toHaveAttribute(
      "placeholder",
      "Search",
    );
    await expect(page.locator('button:text-is("Search")')).toHaveCount(0);
    await expect(page.locator("#guest-status")).toHaveCount(0);
    await expect(page.locator('button:has-text("Clear filters")')).toHaveCount(0);
  });

  test("filters by several statuses at once", async ({ page }) => {
    await page.goto("/admin/guests");
    await openFilterMenu(page, "Status");

    const boxes = page.locator(
      'button:has-text("Status") + div input[type="checkbox"]',
    );
    await expect(boxes).toHaveCount(4);

    // "Everything" shows as every box ticked, not as four empty boxes above a
    // full list, and All cannot be unticked into an empty result set.
    await expect(boxes.nth(0)).toBeChecked();
    await expect(boxes.nth(1)).toBeChecked();
    await expect(boxes.nth(3)).toBeChecked();
    await expect(boxes.nth(0)).toBeDisabled();

    await page.locator('label:has-text("Pending") input').first().uncheck();
    await waitForUrl(page, (url) => url.includes("status="));
    expect(decodeURIComponent(page.url())).toContain("status=attending,declined");
    await expect(page.locator('summary:has-text("pending")')).toHaveCount(0);
    await expect(page.locator('[aria-live="polite"]').first()).toContainText(
      `of ${inflated.guests} guests match`,
    );
  });

  test("never lets the last status be unticked", async ({ page }) => {
    await page.goto("/admin/guests?status=attending");
    await openFilterMenu(page, "Status");
    await expect(
      page.locator('label:has-text("Attending") input').first(),
    ).toBeDisabled();
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

    expect((await page.evaluate(() => history.length)) - before).toBeLessThanOrEqual(
      1,
    );
  });

  test("Clear filters resets everything", async ({ page }) => {
    await page.goto(
      `/admin/guests?q=${inflated.token}&status=declined&seated=unseated`,
    );
    await page.click('button:has-text("Clear filters")');
    await waitForUrl(page, (url) => url.endsWith("/admin/guests"));
    await expect(guestRows(page)).toHaveCount(
      Math.min(inflated.guests, defaultPerPage("list")),
    );
  });

  test("the seating menu still filters", async ({ page }) => {
    await page.goto("/admin/guests");
    await openFilterMenu(page, "Seating");
    await page.locator('label:has-text("Not seated") input').first().check();
    await waitForUrl(page, (url) => url.includes("seated=unseated"));
  });
});

test.describe("guest list pagination", () => {
  test("defaults to the first page size with working steps", async ({ page }) => {
    const per = defaultPerPage("list");
    const total = inflated.guests;

    await page.goto("/admin/guests");
    await expect(guestRows(page)).toHaveCount(per);
    await expect(page.getByText(`Showing 1–${per} of ${total} guests`)).toBeVisible();
    await expect(page.locator('span[aria-disabled]:has-text("Prev")')).toHaveCount(1);

    await page.locator('a[aria-label="Next page"]').click();
    await waitForUrl(page, (url) => url.includes("page=2"));
    await expect(
      page.getByText(
        `Showing ${per + 1}–${Math.min(per * 2, total)} of ${total} guests`,
      ),
    ).toBeVisible();

    await page.locator('a[aria-label="Previous page"]').click();
    await waitForUrl(page, (url) => !url.includes("page="));
    await expect(page.getByText(`Showing 1–${per} of ${total} guests`)).toBeVisible();
  });

  test("offers every page size it advertises", async ({ page }) => {
    const sizes = PER_PAGE_OPTIONS.list;
    const largest = Math.max(...sizes);
    const total = inflated.guests;

    await page.goto("/admin/guests");
    await expect(perPageSelect(page).locator("option")).toHaveText(sizes.map(String));

    // The list is inflated to fit inside the largest page size, so picking it
    // has to collapse the pager to a single page.
    await perPageSelect(page).selectOption(String(largest));
    await waitForUrl(page, (url) => url.includes(`per=${largest}`));
    await expect(guestRows(page)).toHaveCount(total);
    await expect(page.getByText("1 / 1")).toBeVisible();

    const middle = sizes[1];
    await perPageSelect(page).selectOption(String(middle));
    await waitForUrl(page, (url) => url.includes(`per=${middle}`));
    await expect(guestRows(page)).toHaveCount(Math.min(middle, total));
  });

  test("searching reaches guests on other pages", async ({ page }) => {
    // The whole point of filtering before slicing: from a later page, a name
    // that only exists on the first one still has to be findable.
    const party = createParty({ guests: 2 });
    const per = defaultPerPage("list");
    const total = countGuests();

    await page.goto("/admin/guests?page=3");
    await expect(
      page.getByText(
        `Showing ${2 * per + 1}–${Math.min(3 * per, total)} of ${total} guests`,
      ),
    ).toBeVisible();

    await page.fill("#guest-search", party.token);
    await waitForUrl(page, (url) => url.includes(`q=${party.token}`));
    await expect(guestRows(page)).toHaveCount(party.guests.length);
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
  test("defaults to the first page size and offers the rest", async ({ page }) => {
    const sizes = PER_PAGE_OPTIONS.groups;
    const per = defaultPerPage("groups");
    const total = inflated.parties;

    await page.goto("/admin/guests?view=groups");
    await expect(groupCards(page)).toHaveCount(per);
    await expect(page.getByText(`Showing 1–${per} of ${total} groups`)).toBeVisible();
    await expect(perPageSelect(page).locator("option")).toHaveText(sizes.map(String));

    const middle = sizes[1];
    await perPageSelect(page).selectOption(String(middle));
    await waitForUrl(page, (url) => url.includes(`per=${middle}`));
    await expect(groupCards(page)).toHaveCount(Math.min(middle, total));

    await page.locator('a[aria-label="Next page"]').click();
    await waitForUrl(page, (url) => url.includes("page=2"));
    await expect(
      page.getByText(
        `Showing ${middle + 1}–${Math.min(middle * 2, total)} of ${total} groups`,
      ),
    ).toBeVisible();
    expect(page.url()).toContain(`per=${middle}`);
  });

  test("searching reaches groups on other pages", async ({ page }) => {
    const party = createParty();
    const middle = PER_PAGE_OPTIONS.groups[1];
    expect(countParties()).toBeGreaterThan(middle);

    await page.goto(`/admin/guests?view=groups&per=${middle}&page=2`);
    await page.fill("#guest-search", party.token);
    await waitForUrl(page, (url) => url.includes(`q=${party.token}`));
    await expect(groupCards(page)).toHaveCount(1);
    expect(page.url()).not.toContain("page=");
  });

  test("the view toggle keeps the search but drops the other view's page size", async ({
    page,
  }) => {
    const party = createParty();
    const middle = PER_PAGE_OPTIONS.groups[1];

    await page.goto(
      `/admin/guests?view=groups&q=${party.token}&per=${middle}&page=2`,
    );
    await page
      .locator('[aria-label="Choose a view"] a:has-text("Guest list")')
      .click();
    await waitForUrl(page, (url) => !url.includes("view=groups"));

    expect(page.url()).toContain(`q=${party.token}`);
    expect(page.url()).not.toContain("per=");
    expect(page.url()).not.toContain("page=");
  });
});
