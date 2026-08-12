import { expect, test } from "@playwright/test";
import { openDialog, signIn, waitForUrl } from "./helpers/admin";
import { countGuests, countParties, guestsIn, resetDatabase } from "./helpers/db";

/**
 * The view toggle and the Add dialog.
 *
 * Assertions go to the database rather than the rendered list: "the name is on
 * screen" would also pass if the row were client-side only, and the point of
 * these flows is that the write lands.
 */

test.beforeEach(async ({ page }) => {
  resetDatabase();
  await signIn(page);
});

test.describe("view toggle", () => {
  test("renders both positions with the guest list active", async ({ page }) => {
    await page.goto("/admin/guests");
    const toggle = page.locator('[role="group"][aria-label="Choose a view"] a');
    await expect(toggle).toHaveCount(2);
    await expect(page.locator('a[aria-current="true"]').first()).toHaveText("Guest list");
  });

  test("switches to groups and back", async ({ page }) => {
    await page.goto("/admin/guests");
    await page.click('a:has-text("Groups")');
    await waitForUrl(page, (url) => url.includes("view=groups"));
    await expect(page.locator('a[aria-current="true"]').first()).toHaveText("Groups");
  });

  test("carries the active search across", async ({ page }) => {
    await page.goto("/admin/guests?q=Rao");
    await page.click('a:has-text("Groups")');
    await waitForUrl(page, (url) => url.includes("view=groups"));
    expect(page.url()).toContain("q=Rao");
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
    await page.goto("/admin/guests");
    const guestsBefore = countGuests();
    const partiesBefore = countParties();

    await page.click('button:has-text("Add")');
    await expect(openDialog(page)).toBeVisible();

    await page.fill('input[name="first_name"]', "Testguest");
    await page.fill('input[name="last_name"]', "Alpha");
    await page.selectOption('select[name="party_id"]', { label: "The Mitchell Family" });
    await page.click('button:has-text("Add guest")');

    await expect(openDialog(page)).toHaveCount(0);
    await expect(page.locator('[role="status"]')).toBeVisible();

    expect(countGuests()).toBe(guestsBefore + 1);
    expect(countParties()).toBe(partiesBefore);
    expect(guestsIn("The Mitchell Family").map((g) => g.first_name)).toContain("Testguest");
  });

  test("adds a guest and their new group in one submission", async ({ page }) => {
    await page.goto("/admin/guests");
    const guestsBefore = countGuests();
    const partiesBefore = countParties();

    await page.click('button:has-text("Add")');
    await expect(openDialog(page)).toBeVisible();

    await page.fill('input[name="first_name"]', "Testguest");
    await page.fill('input[name="last_name"]', "Beta");
    await page.locator('input[type="radio"]').nth(1).check(); // Create a new group
    await page.fill('input[name="new_group_name"]', "The Beta Household");
    await page.selectOption('select[name="new_group_side"]', "groom");
    await page.click('button:has-text("Add guest")');

    await expect(openDialog(page)).toHaveCount(0);
    expect(countParties()).toBe(partiesBefore + 1);
    expect(countGuests()).toBe(guestsBefore + 1);
    expect(guestsIn("The Beta Household").map((g) => g.first_name)).toContain("Testguest");
  });

  test("creates a group with its members, no empty group first", async ({ page }) => {
    await page.goto("/admin/guests");
    const guestsBefore = countGuests();
    const partiesBefore = countParties();

    await page.click('button:has-text("Add")');
    await expect(openDialog(page)).toBeVisible();
    await page.click('button:has-text("A new group")');

    await page.fill('input[name="name"]', "The Gamma Family");
    await page.fill('input[name="address"]', "1 Test Lane");

    const firstNames = page.locator('input[placeholder="First name"]');
    const lastNames = page.locator('input[placeholder="Last name"]');
    await firstNames.nth(0).fill("Gamma");
    await lastNames.nth(0).fill("One");
    await firstNames.nth(1).fill("Gamma");
    await lastNames.nth(1).fill("Two");

    await page.click('button:has-text("Add another person")');
    await firstNames.nth(2).fill("Gamma");
    await lastNames.nth(2).fill("Kid");
    await page.locator('dialog input[type="checkbox"]').nth(2).check();

    // The button counts the people it is about to create.
    await expect(page.locator('dialog button[type="submit"]').last()).toHaveText(/3/);
    await page.click('dialog button[type="submit"]:has-text("Create group")');

    await expect(openDialog(page)).toHaveCount(0);
    expect(countParties()).toBe(partiesBefore + 1);
    expect(countGuests()).toBe(guestsBefore + 3);

    const members = guestsIn("The Gamma Family");
    expect(members).toHaveLength(3);
    expect(members.filter((g) => g.is_child === 1).map((g) => g.last_name)).toEqual(["Kid"]);

    // Visible immediately, without having to go and search for it.
    await page.goto("/admin/guests?view=groups");
    await expect(page.locator('h3:text("The Gamma Family")')).toBeVisible();
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
