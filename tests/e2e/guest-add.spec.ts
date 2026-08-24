import { openDialog, signIn, waitForUrl } from "./helpers/admin";
import { countGuests, countParties, guestsIn } from "./helpers/db";
import { createParty, uniqueToken } from "./helpers/fixtures";
import { expect, test } from "./helpers/test";

/**
 * The view toggle and the Add dialog.
 *
 * Assertions go to the database rather than the rendered list: "the name is on
 * screen" would also pass if the row were client-side only, and the point of
 * these flows is that the write lands. The counts are read immediately before
 * the dialog opens, so they are deltas against whatever is there rather than
 * against a number written down here.
 */

test.beforeEach(async ({ page }) => {
  await signIn(page);
});

test.describe("view toggle", () => {
  test("renders both positions with the guest list active", async ({ page }) => {
    await page.goto("/admin/guests");
    const toggle = page.locator('[role="group"][aria-label="Choose a view"] a');
    await expect(toggle).toHaveCount(2);
    await expect(page.locator('a[aria-current="true"]').first()).toHaveText(
      "Guest list",
    );
  });

  test("switches to groups and back", async ({ page }) => {
    await page.goto("/admin/guests");
    await page.click('a:has-text("Groups")');
    await waitForUrl(page, (url) => url.includes("view=groups"));
    await expect(page.locator('a[aria-current="true"]').first()).toHaveText("Groups");
  });

  test("carries the active search across", async ({ page }) => {
    const party = createParty();

    await page.goto(`/admin/guests?q=${party.token}`);
    await page.click('a:has-text("Groups")');
    await waitForUrl(page, (url) => url.includes("view=groups"));
    expect(page.url()).toContain(`q=${party.token}`);
  });

  test("the Add button is present in both views", async ({ page }) => {
    for (const url of ["/admin/guests", "/admin/guests?view=groups"]) {
      await page.goto(url);
      await expect(page.locator('button:has-text("Add")').first()).toBeVisible();
    }
  });
});

test.describe("Add dialog", () => {
  test("adds one guest to an existing group", async ({ page }) => {
    const party = createParty({ guests: 2 });
    const guestsBefore = countGuests();
    const partiesBefore = countParties();
    const first = "Zed";

    await page.goto("/admin/guests");
    await page.click('button:has-text("Add")');
    await expect(openDialog(page)).toBeVisible();

    await page.fill('input[name="first_name"]', first);
    await page.fill('input[name="last_name"]', party.token);
    await page.selectOption('select[name="party_id"]', { label: party.name });
    await page.click('button:has-text("Add guest")');

    await expect(openDialog(page)).toHaveCount(0);
    await expect(page.locator('[role="status"]')).toBeVisible();

    expect(countGuests()).toBe(guestsBefore + 1);
    expect(countParties()).toBe(partiesBefore);
    expect(guestsIn(party.name).map((guest) => guest.first_name)).toContain(first);
  });

  test("adds a guest and their new group in one submission", async ({ page }) => {
    const token = uniqueToken();
    const group = `The ${token} Household`;
    const guestsBefore = countGuests();
    const partiesBefore = countParties();

    await page.goto("/admin/guests");
    await page.click('button:has-text("Add")');
    await expect(openDialog(page)).toBeVisible();

    await page.fill('input[name="first_name"]', "Zed");
    await page.fill('input[name="last_name"]', token);
    await page.locator('input[type="radio"]').nth(1).check(); // Create a new group
    await page.fill('input[name="new_group_name"]', group);
    await page.selectOption('select[name="new_group_side"]', "groom");
    await page.click('button:has-text("Add guest")');

    await expect(openDialog(page)).toHaveCount(0);
    expect(countParties()).toBe(partiesBefore + 1);
    expect(countGuests()).toBe(guestsBefore + 1);
    expect(guestsIn(group).map((guest) => guest.first_name)).toContain("Zed");
  });

  test("creates a group with its members, no empty group first", async ({ page }) => {
    const token = uniqueToken();
    const group = `The ${token} Family`;
    const guestsBefore = countGuests();
    const partiesBefore = countParties();

    await page.goto("/admin/guests");
    await page.click('button:has-text("Add")');
    await expect(openDialog(page)).toBeVisible();
    await page.click('button:has-text("A new group")');

    await page.fill('input[name="name"]', group);
    await page.fill('input[name="address"]', "1 Test Lane");

    const firstNames = page.locator('input[placeholder="First name"]');
    const lastNames = page.locator('input[placeholder="Last name"]');
    await firstNames.nth(0).fill("Ada");
    await lastNames.nth(0).fill(token);
    await firstNames.nth(1).fill("Bo");
    await lastNames.nth(1).fill(token);

    await page.click('button:has-text("Add another person")');
    await firstNames.nth(2).fill("Cyd");
    await lastNames.nth(2).fill(token);
    await page.locator('dialog input[type="checkbox"]').nth(2).check();

    // The button counts the people it is about to create.
    await expect(page.locator('dialog button[type="submit"]').last()).toHaveText(/3/);
    await page.click('dialog button[type="submit"]:has-text("Create group")');

    await expect(openDialog(page)).toHaveCount(0);
    expect(countParties()).toBe(partiesBefore + 1);
    expect(countGuests()).toBe(guestsBefore + 3);

    const members = guestsIn(group);
    expect(members).toHaveLength(3);
    expect(members.filter((guest) => guest.is_child === 1)).toHaveLength(1);

    // Visible immediately, without having to go hunting for it. Narrowed by the
    // token rather than a big page size: whether a brand new group lands on
    // page one is a paging fact, and not the bug this covers.
    await page.goto(`/admin/guests?view=groups&q=${token}`);
    await expect(page.locator(`h3:text-is("${group}")`)).toBeVisible();
  });

  test("blocks a group with no name and closes on Escape", async ({ page }) => {
    await page.goto("/admin/guests");
    await page.click('button:has-text("Add")');
    await expect(openDialog(page)).toBeVisible();
    await page.click('button:has-text("A new group")');

    await page.fill('input[name="name"]', "");
    await page.click('dialog button[type="submit"]:has-text("Create group")');
    await expect(openDialog(page)).toHaveCount(1);

    await page.keyboard.press("Escape");
    await expect(openDialog(page)).toHaveCount(0);
  });
});
