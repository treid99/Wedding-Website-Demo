import {
  dialogSave,
  groupCard,
  groupCards,
  guestRows,
  openDialog,
  signIn,
} from "./helpers/admin";
import { createParty, createRelatedParties } from "./helpers/fixtures";
import { expect, test } from "./helpers/test";

/**
 * The group card: header icons, the edit and delete modals, the collapsed
 * add-guest row, and the per-guest editor.
 *
 * Almost every test here builds its own group and then narrows the screen to it
 * with `?q=<token>`. That is not only about owning the data. The group view
 * pages at 15, so on a real list any given card may or may not be on page one,
 * and an assertion that clicks "the delete icon for that group" was quietly
 * depending on where the group happened to sort. Filtering to the fixture makes
 * the card's presence a fact rather than a coincidence, and leaves paging to
 * guest-filters, which is where it belongs.
 */

test.beforeEach(async ({ page }) => {
  await signIn(page);
});

test.describe("card layout", () => {
  test("the old inline controls are gone", async ({ page }) => {
    await page.goto("/admin/guests?view=groups");

    await expect(page.locator('summary:has-text("Edit this group")')).toHaveCount(0);
    await expect(page.locator('select:has(option:text("Move to…"))')).toHaveCount(0);
    // The add-guest form is collapsed, so no name fields are on screen.
    await expect(page.locator('input[placeholder="First name"]')).toHaveCount(0);
  });

  test("a card carries edit and delete icons and a slim Add guest row", async ({
    page,
  }) => {
    const party = createParty({ guests: 2 });
    await page.goto(`/admin/guests?view=groups&q=${party.token}`);

    await expect(groupCards(page)).toHaveCount(1);
    await expect(page.locator('button[aria-label^="Delete "]')).toHaveCount(1);
    // One edit icon for the group, plus one per guest.
    await expect(page.locator('button[aria-label^="Edit "]')).toHaveCount(
      1 + party.guests.length,
    );

    const row = await groupCard(page, party.name)
      .locator('button:has-text("Add guest")')
      .boundingBox();
    expect(row!.height).toBeLessThan(44);
  });

  test("every card on a real page has the same controls", async ({ page }) => {
    // The counts come off the page rather than out of the seed, so this holds
    // for a demo list, an empty-ish one, or whatever is in there today.
    await page.goto("/admin/guests?view=groups");

    const cards = await groupCards(page).count();
    expect(cards, "the group view rendered nothing to check").toBeGreaterThan(0);
    const members = await groupCards(page).locator("li").count();

    await expect(page.locator('button[aria-label^="Delete "]')).toHaveCount(cards);
    await expect(page.locator('button:has-text("Add guest")')).toHaveCount(cards);
    await expect(page.locator('button[aria-label^="Edit "]')).toHaveCount(
      cards + members,
    );
  });

  test("shows an envelope override, and nothing when it is inherited", async ({
    page,
  }) => {
    const { stem, parties } = createRelatedParties(
      { envelope: "Mr. & Mrs. Fixture" },
      {},
    );
    const [overridden, inherited] = parties;

    await page.goto(`/admin/guests?view=groups&q=${stem}`);

    await expect(
      groupCard(page, overridden.name).getByText(overridden.envelope),
    ).toBeVisible();
    await expect(
      groupCard(page, inherited.name).getByText("Envelope:"),
    ).toHaveCount(0);
  });
});

test.describe("edit group", () => {
  test("Save stays disabled until something actually changes", async ({ page }) => {
    const party = createParty();
    await page.goto(`/admin/guests?view=groups&q=${party.token}`);

    await page.click(`button[aria-label="Edit ${party.name}"]`);
    await expect(openDialog(page)).toBeVisible();
    await expect(dialogSave(page)).toBeDisabled();

    const name = openDialog(page).locator('input[name="name"]');
    await name.fill(`${party.name}!`);
    await expect(dialogSave(page)).toBeEnabled();

    // Editing back to the original value is not a change.
    await name.fill(party.name);
    await expect(dialogSave(page)).toBeDisabled();
  });

  test("Cancel discards, and reopening re-seeds from the database", async ({
    page,
  }) => {
    const party = createParty();
    await page.goto(`/admin/guests?view=groups&q=${party.token}`);

    await page.click(`button[aria-label="Edit ${party.name}"]`);
    await openDialog(page).locator('input[name="name"]').fill("Discard me");
    await openDialog(page).locator('button:has-text("Cancel")').click();

    await expect(groupCard(page, party.name)).toHaveCount(1);
    await page.click(`button[aria-label="Edit ${party.name}"]`);
    await expect(openDialog(page).locator('input[name="name"]')).toHaveValue(
      party.name,
    );
  });

  test("saves every field", async ({ page }) => {
    const party = createParty();
    // The token stays in the new name, but it would not have to: the guests
    // still carry it, and group search matches member names too.
    const renamed = `The ${party.token} Household`;
    const envelope = `Ms. ${party.guests[0].name}`;
    const address = "9 Larkspur Way, Summit, NJ 07901";
    const notes = "Seat them by the door.";

    await page.goto(`/admin/guests?view=groups&q=${party.token}`);
    await page.click(`button[aria-label="Edit ${party.name}"]`);

    const dialog = openDialog(page);
    await dialog.locator('input[name="name"]').fill(renamed);
    await dialog.locator('select[name="side"]').selectOption("bride");
    await dialog.locator('input[name="envelope_name"]').fill(envelope);
    await dialog.locator('input[name="address"]').fill(address);
    await dialog.locator('textarea[name="notes"]').fill(notes);
    await dialogSave(page).click();
    await expect(openDialog(page)).toHaveCount(0);

    const card = groupCard(page, renamed);
    await expect(card).toHaveCount(1);
    await expect(card.getByText("Bride's side")).toBeVisible();
    await expect(card.getByText(envelope)).toBeVisible();
    await expect(card.getByText(address)).toBeVisible();
    await expect(card.getByText(notes)).toBeVisible();
  });

  test("clearing the envelope restores the inherit-from-name fallback", async ({
    page,
  }) => {
    const party = createParty({ envelope: "Mr. & Mrs. Fixture" });
    await page.goto(`/admin/guests?view=groups&q=${party.token}`);
    await expect(groupCard(page, party.name).getByText("Envelope:")).toBeVisible();

    await page.click(`button[aria-label="Edit ${party.name}"]`);
    await openDialog(page).locator('input[name="envelope_name"]').fill("");
    await dialogSave(page).click();
    await expect(openDialog(page)).toHaveCount(0);

    await expect(groupCard(page, party.name).getByText("Envelope:")).toHaveCount(0);
  });

  test("an empty name is rejected with our own message, not a browser bubble", async ({
    page,
  }) => {
    const party = createParty();
    await page.goto(`/admin/guests?view=groups&q=${party.token}`);

    await page.click(`button[aria-label="Edit ${party.name}"]`);
    await openDialog(page).locator('input[name="name"]').fill("");
    await dialogSave(page).click();

    await expect(
      openDialog(page).locator('[role="alert"]:has-text("A group needs a name")'),
    ).toBeVisible();
  });
});

test.describe("add a guest inline", () => {
  test("expands on click, needs a name, and collapses again", async ({ page }) => {
    const party = createParty({ guests: 2 });
    await page.goto(`/admin/guests?view=groups&q=${party.token}`);

    const card = groupCard(page, party.name);
    const before = await card.locator("li").count();
    expect(before).toBe(party.guests.length);

    await card.locator('button:has-text("Add guest")').click();
    const save = card.locator('button[type="submit"]:has-text("Save")');
    await expect(card.locator('input[name="first_name"]')).toBeVisible();
    await expect(save).toBeDisabled();

    await card.locator('input[name="first_name"]').fill("Zed");
    await expect(save).toBeEnabled();

    await card.locator('button:has-text("Cancel")').click();
    await expect(card.locator('input[name="first_name"]')).toHaveCount(0);

    await card.locator('button:has-text("Add guest")').click();
    await card.locator('input[name="first_name"]').fill("Zed");
    await card.locator('input[name="last_name"]').fill(party.token);
    await card.locator('label:has-text("Child") input[type="checkbox"]').check();
    await card.locator('button[type="submit"]:has-text("Save")').click();

    const added = `Zed ${party.token}`;
    const after = groupCard(page, party.name);
    await expect(after.locator(`li:has-text("${added}")`)).toHaveCount(1);
    await expect(
      after.locator(`li:has-text("${added}")`).getByText("child"),
    ).toBeVisible();
    await expect(after.locator("li")).toHaveCount(before + 1);
    await expect(after.locator('input[name="first_name"]')).toHaveCount(0);
  });
});

test.describe("edit a guest", () => {
  test("renames, restatuses, re-meals and moves in one save", async ({ page }) => {
    // Two groups under one stem so both cards are on screen: the move has to
    // land somewhere visible for the assertion to mean anything.
    const { stem, parties } = createRelatedParties(
      { guests: [{ status: "attending", meal: "chicken" }] },
      { guests: 1 },
    );
    const [from, to] = parties;
    const guest = from.guests[0];
    const renamed = `${guest.first}lyn ${guest.last}`;

    await page.goto(`/admin/guests?view=groups&q=${stem}`);
    await page.click(`button[aria-label="Edit ${guest.name}"]`);

    const dialog = openDialog(page);
    await expect(dialogSave(page)).toBeDisabled();

    // The fixture is attending on chicken, so both of these are real changes.
    // Re-selecting the value a field already has is not an edit, and Save is
    // meant to stay dark for it.
    await dialog.locator('select[name="rsvp_status"]').selectOption("declined");
    await expect(dialogSave(page)).toBeEnabled();
    await dialog.locator('select[name="meal_choice"]').selectOption("kids");
    await dialog.locator('input[name="first_name"]').fill(`${guest.first}lyn`);
    await dialog.locator('select[name="party_id"]').selectOption({ label: to.name });
    await expect(dialog.getByText("will move this guest")).toBeVisible();

    await dialogSave(page).click();
    await expect(openDialog(page)).toHaveCount(0);

    const moved = groupCard(page, to.name).locator(`li:has-text("${renamed}")`);
    await expect(moved).toHaveCount(1);
    await expect(moved.getByText("declined")).toBeVisible();
    await expect(moved.getByText("Kids' Meal")).toBeVisible();
    await expect(
      groupCard(page, from.name).locator(`li:has-text("${renamed}")`),
    ).toHaveCount(0);
  });

  test("preserves the dietary note the flat list owns", async ({ page }) => {
    // This editor has no dietary-notes input; a shared UPDATE with the flat
    // list's editor would blank the column on every rename.
    const dietary = "No nuts of any kind.";
    const party = createParty({
      guests: [{ status: "attending", meal: "filet", dietary }],
    });
    const guest = party.guests[0];

    await page.goto(`/admin/guests?view=groups&q=${party.token}`);
    await page.click(`button[aria-label="Edit ${guest.name}"]`);
    await openDialog(page)
      .locator('select[name="rsvp_status"]')
      .selectOption("pending");
    await dialogSave(page).click();
    await expect(openDialog(page)).toHaveCount(0);

    await expect(groupCard(page, party.name).getByText(dietary)).toBeVisible();
  });
});

test.describe("delete a group", () => {
  test("names the cascade and takes two clicks", async ({ page }) => {
    const party = createParty({ guests: 4 });
    await page.goto(`/admin/guests?view=groups&q=${party.token}`);

    await page.click(`button[aria-label="Delete ${party.name}"]`);
    const dialog = openDialog(page);

    await expect(dialog).toContainText(
      /delete all guests within the group, RSVP status, table assignments, and any notes/i,
    );
    // The headcount is the fixture's, so growing it here cannot leave the
    // warning asserting a stale number.
    await expect(dialog).toContainText(
      new RegExp(`${party.guests.length} guests will be removed from the guest list`, "i"),
    );

    await dialog.locator('button:has-text("Cancel")').click();
    await expect(groupCards(page)).toHaveCount(1);
  });

  test("removes the group and its guests", async ({ page }) => {
    const party = createParty({ guests: 4 });
    await page.goto(`/admin/guests?view=groups&q=${party.token}`);

    await page.click(`button[aria-label="Delete ${party.name}"]`);
    await openDialog(page).locator('button:has-text("Delete group")').click();

    await expect(groupCards(page)).toHaveCount(0);

    // The flat list agrees, so the cascade really reached the database.
    await page.goto(`/admin/guests?q=${party.token}`);
    await expect(guestRows(page)).toHaveCount(0);
  });
});
