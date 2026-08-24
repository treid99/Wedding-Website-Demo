import { hideDevOverlay, signIn } from "./helpers/admin";
import {
  countGalleryPhotos,
  firstSeatingTable,
  someRegistryStore,
} from "./helpers/db";
import { createParty, seatGuests, uniqueToken } from "./helpers/fixtures";
import { expect, test } from "./helpers/test";

/** The auth gate, seating, content editing, and registry CRUD. */

test.describe("auth", () => {
  test("gates the admin, lets any credentials in, and re-gates on sign out", async ({
    page,
  }) => {
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
    await signIn(page);
  });

  test("the dashboard surfaces a submitted RSVP", async ({ page }) => {
    // Three pending guests with no submission on record: the shape the public
    // RSVP form is built for, and the one the dashboard has to pick up.
    const party = createParty({ guests: 3 });
    const dietary = "No blue cheese, please";
    const message = `Driving down — ${party.token} party of three.`;

    // Submit as a guest first, then check the couple can see it.
    await page.goto("/rsvp");
    await page.fill("#rsvp-lookup", party.token);
    await page.click('button:has-text("Search")');
    await expect(page.getByText(party.name)).toBeVisible();

    const members = page.locator("fieldset");
    await expect(members).toHaveCount(party.guests.length);

    await members.nth(0).locator('label:has-text("Joyfully accepts")').click();
    await members.nth(0).locator("select").selectOption("filet");
    await members.nth(0).locator('input[type="text"]').fill(dietary);
    await members.nth(1).locator('label:has-text("Regretfully declines")').click();
    await members.nth(2).locator('label:has-text("Regretfully declines")').click();
    await page.fill("#rsvp-message", message);
    await page.click('button:has-text("Send our response")');
    await expect(page.getByText(/Thank you/)).toBeVisible();

    await page.goto("/admin");
    await expect(page.getByText(message)).toBeVisible();
    await expect(page.getByText(dietary)).toBeVisible();

    await page.goto(`/admin/guests?q=${party.token}`);
    await expect(page.locator('summary:has-text("attending")')).toHaveCount(1);
    await expect(page.locator('summary:has-text("declined")')).toHaveCount(2);
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
    // Seat a fixture rather than trusting that somebody is already sitting
    // there: an empty table renders no tally at all, so the assertion below
    // would pass by matching nothing.
    const table = firstSeatingTable();
    const party = createParty({
      guests: [
        { status: "attending", meal: "filet" },
        { status: "attending", meal: "salmon" },
      ],
    });
    seatGuests(table.id, party.guests);

    await page.goto("/admin/seating");
    const card = page
      .locator(`div:has(> header h3:text-is("${table.name}"))`)
      .first();

    await expect(card.locator("header span").first()).toHaveText(/\d+\/\d+/);
    await expect(card).toContainText(/Kids|Beef|Chicken|Salmon|Veg/);
    await expect(card).toContainText(party.guests[0].name);
  });

  test("a FAQ edit reaches the public page", async ({ page }) => {
    const token = uniqueToken();

    await page.goto("/admin/content?tab=faq");
    const first = page.locator("details").first();
    await first.locator("summary").click();
    await first
      .locator('textarea[name="answer"]')
      .fill(`${token} — garden formal, and please wear block heels.`);
    await first.locator('button:has-text("Save")').click();
    await page.waitForLoadState("networkidle");

    await page.goto("/faq");
    await expect(page.getByText(token, { exact: false })).toBeVisible();
  });

  test("removing a photo from the gallery takes effect publicly", async ({
    page,
  }) => {
    const before = countGalleryPhotos();
    expect(before, "the gallery is empty, so there is nothing to remove").toBeGreaterThan(0);

    await page.goto("/admin/content?tab=photos");
    await page
      .locator('button[aria-pressed="true"]:has-text("Gallery")')
      .first()
      .click();
    await page.waitForLoadState("networkidle");
    expect(countGalleryPhotos()).toBe(before - 1);

    await page.goto("/gallery");
    await expect(page.locator("main img")).toHaveCount(before - 1);
  });

  test("portraits cannot be added to the hero carousel", async ({ page }) => {
    await page.goto("/admin/content?tab=photos");
    await hideDevOverlay(page);
    expect(
      await page.locator('button:has-text("Carousel")[disabled]').count(),
    ).toBeGreaterThan(0);
  });

  test("registry add / purchase / delete round trip", async ({ page }) => {
    const token = uniqueToken();
    const title = `${token} Teapot`;
    const buyer = `The ${token} Family`;
    const store = someRegistryStore();

    await page.goto("/admin/registry");
    await page.fill("#new-title", title);
    await page.fill("#new-price", "42.50");
    await page.fill("#new-store", store);
    await page.fill("#new-description", "Added by the e2e suite.");
    await page.fill("#new-url", `https://example.com/${token}`);
    await page.click('button:has-text("Add to registry")');
    await page.waitForLoadState("networkidle");

    // Scoped to the cards: the filter sidebar carries the words "Purchased"
    // and a price range too, and an unscoped getByText matches both.
    const card = page.locator(`article:has-text("${title}")`);

    await page.goto(`/registry?q=${token}`);
    await expect(card).toHaveCount(1);
    await expect(card).toContainText("$42.50");

    await page.goto("/admin/registry");
    const row = page.locator(`details:has-text("${title}")`).first();
    await row.locator("summary").click();
    await row.locator('input[name="purchased_by"]').fill(buyer);
    await row.locator('button:has-text("Mark purchased")').click();
    await page.waitForLoadState("networkidle");

    await page.goto(`/registry?q=${token}`);
    await expect(card).toContainText("Purchased");
    await expect(card).toContainText(buyer);

    await page.goto("/admin/registry");
    const again = page.locator(`details:has-text("${title}")`).first();
    await again.locator("summary").click();
    await again.locator('button:has-text("Remove this item")').click();
    await page.waitForLoadState("networkidle");

    await page.goto(`/registry?q=${token}`);
    await expect(card).toHaveCount(0);
    await expect(page.getByText(/Nothing here/).first()).toBeVisible();
  });
});
