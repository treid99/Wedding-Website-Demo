import { expect, test } from "@playwright/test";
import { hideDevOverlay, signIn } from "./helpers/admin";
import { resetDatabase } from "./helpers/db";

/** The auth gate, seating, content editing, and registry CRUD. */

test.describe("auth", () => {
  test("gates the admin, lets any credentials in, and re-gates on sign out", async ({ page }) => {
    await page.goto("/admin/guests");
    expect(page.url()).toContain("/admin/login");

    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL("**/admin");

    await page.goto("/admin");
    await page.click('button:has-text("Sign out")');
    await page.waitForURL("**/admin/login");

    await page.goto("/admin/seating");
    expect(page.url()).toContain("/admin/login");
  });
});

test.describe("logged in", () => {
  test.beforeEach(async ({ page }) => {
    resetDatabase();
    await signIn(page);
  });

  test("the dashboard surfaces a submitted RSVP", async ({ page }) => {
    // Submit as a guest first, then check the couple can see it.
    await page.goto("/rsvp");
    await page.fill("#rsvp-lookup", "Lindqvist");
    await page.click('button:has-text("Search")');
    await expect(page.getByText("The Lindqvist Family")).toBeVisible();

    const members = page.locator("fieldset");
    await members.nth(0).locator('label:has-text("Joyfully accepts")').click();
    await members.nth(0).locator("select").selectOption("filet");
    await members.nth(0).locator('input[type="text"]').fill("No blue cheese, please");
    await members.nth(1).locator('label:has-text("Regretfully declines")').click();
    await members.nth(2).locator('label:has-text("Regretfully declines")').click();
    await page.fill("#rsvp-message", "Flying in from Stockholm — Otto has school.");
    await page.click('button:has-text("Send our response")');
    await expect(page.getByText(/Thank you/)).toBeVisible();

    await page.goto("/admin");
    await expect(page.getByText(/Stockholm/)).toBeVisible();
    await expect(page.getByText(/blue cheese/i)).toBeVisible();

    await page.goto("/admin/guests?q=Lindqvist");
    await expect(page.locator('summary:has-text("attending")')).not.toHaveCount(0);
    await expect(page.locator('summary:has-text("declined")')).not.toHaveCount(0);
  });

  test("seating assignments persist across a reload", async ({ page }) => {
    await page.goto("/admin/seating");

    // Drive the accessible select rather than a synthetic drag — same action.
    const chip = page.locator("aside div[draggable] p").first();
    const who = (await chip.textContent())!.trim();
    const select = page.locator("aside select").first();
    const options = await select.locator("option").allTextContents();
    const table = options.find((option) => /^Table \d/.test(option.trim()))!.trim();

    await select.selectOption({ label: table });
    await page.waitForLoadState("networkidle");
    await page.reload({ waitUntil: "networkidle" });

    const card = page.locator(`div:has(h3:text-is("${table}"))`).first();
    await expect(card).toContainText(who.split(" kid")[0].trim());
  });

  test("a table reports its occupancy and meal tally", async ({ page }) => {
    await page.goto("/admin/seating");
    const kids = page.locator('div:has(> header h3:text-is("Kids\' Table"))').first();
    await expect(kids.locator("header span").first()).toHaveText(/\d+\/\d+/);
    await expect(kids).toContainText(/Kids|Beef|Chicken|Salmon|Veg/);
  });

  test("a FAQ edit reaches the public page", async ({ page }) => {
    await page.goto("/admin/content?tab=faq");
    const first = page.locator("details").first();
    await first.locator("summary").click();
    await first
      .locator('textarea[name="answer"]')
      .fill("EDITED BY THE TEST SUITE — garden formal, and please wear block heels.");
    await first.locator('button:has-text("Save")').click();
    await page.waitForLoadState("networkidle");

    await page.goto("/faq");
    await expect(page.getByText("EDITED BY THE TEST SUITE", { exact: false })).toBeVisible();
  });

  test("removing a photo from the gallery takes effect publicly", async ({ page }) => {
    await page.goto("/admin/content?tab=photos");
    await page.locator('button[aria-pressed="true"]:has-text("Gallery")').first().click();
    await page.waitForLoadState("networkidle");

    await page.goto("/gallery");
    await expect(page.locator("main img")).toHaveCount(15);
  });

  test("portraits cannot be added to the hero carousel", async ({ page }) => {
    await page.goto("/admin/content?tab=photos");
    await hideDevOverlay(page);
    expect(await page.locator('button:has-text("Carousel")[disabled]').count()).toBeGreaterThan(0);
  });

  test("registry add / purchase / delete round trip", async ({ page }) => {
    await page.goto("/admin/registry");
    await page.fill("#new-title", "Test Suite Teapot");
    await page.fill("#new-price", "42.50");
    await page.fill("#new-store", "Target");
    await page.fill("#new-description", "Added by the e2e suite.");
    await page.fill("#new-url", "https://www.target.com/s?searchTerm=teapot");
    await page.click('button:has-text("Add to registry")');
    await page.waitForLoadState("networkidle");

    // Scoped to the cards: the filter sidebar carries the words "Purchased"
    // and a price range too, and an unscoped getByText matches both.
    const card = page.locator('article:has-text("Test Suite Teapot")');

    await page.goto("/registry?q=Test+Suite");
    await expect(card).toHaveCount(1);
    await expect(card).toContainText("$42.50");

    await page.goto("/admin/registry");
    const row = page.locator('details:has-text("Test Suite Teapot")').first();
    await row.locator("summary").click();
    await row.locator('input[name="purchased_by"]').fill("The Test Family");
    await row.locator('button:has-text("Mark purchased")').click();
    await page.waitForLoadState("networkidle");

    await page.goto("/registry?q=Test+Suite");
    await expect(card).toContainText("Purchased");
    await expect(card).toContainText("The Test Family");

    await page.goto("/admin/registry");
    const again = page.locator('details:has-text("Test Suite Teapot")').first();
    await again.locator("summary").click();
    await again.locator('button:has-text("Remove this item")').click();
    await page.waitForLoadState("networkidle");

    await page.goto("/registry?q=Test+Suite");
    await expect(card).toHaveCount(0);
    await expect(page.getByText(/Nothing here/).first()).toBeVisible();
  });
});
