import { expect, test } from "@playwright/test";
import {
  dialogSave,
  groupCard,
  groupCards,
  guestRows,
  openDialog,
  signIn,
} from "./helpers/admin";
import { resetDatabase } from "./helpers/db";

/**
 * The group card: header icons, the edit and delete modals, the collapsed
 * add-guest row, and the per-guest editor.
 */

test.beforeEach(async ({ page }) => {
  resetDatabase();
  await signIn(page);
  await page.goto("/admin/guests?view=groups");
});

test.describe("card layout", () => {
  test("the old inline controls are gone", async ({ page }) => {
    await expect(page.locator('summary:has-text("Edit this group")')).toHaveCount(0);
    await expect(page.locator('select:has(option:text("Move to…"))')).toHaveCount(0);
    // The add-guest form is collapsed, so no name fields are on screen.
    await expect(page.locator('input[placeholder="First name"]')).toHaveCount(0);
  });

  test("each group has edit and delete icons and a slim Add guest row", async ({ page }) => {
    await expect(groupCards(page)).toHaveCount(14);
    await expect(page.locator('button[aria-label^="Delete "]')).toHaveCount(14);
    // One edit icon per group plus one per guest.
    await expect(page.locator('button[aria-label^="Edit "]')).toHaveCount(14 + 31);
    await expect(page.locator('button:has-text("Add guest")')).toHaveCount(14);

    const row = await groupCard(page, "Margaret Whitfield")
      .locator('button:has-text("Add guest")')
      .boundingBox();
    expect(row!.height).toBeLessThan(44);
  });

  test("shows an envelope override, and nothing when it is inherited", async ({ page }) => {
    await expect(
      groupCard(page, "The Mitchell Family").getByText("Mr. & Mrs. David Mitchell"),
    ).toBeVisible();
    await expect(
      groupCard(page, "The Okonkwo Family").getByText("Envelope:"),
    ).toHaveCount(0);
  });
});

test.describe("edit group", () => {
  test("Save stays disabled until something actually changes", async ({ page }) => {
    await page.click('button[aria-label="Edit The Okonkwo Family"]');
    await expect(openDialog(page)).toBeVisible();
    await expect(dialogSave(page)).toBeDisabled();

    const name = openDialog(page).locator('input[name="name"]');
    await name.fill("The Okonkwo Family!");
    await expect(dialogSave(page)).toBeEnabled();

    // Editing back to the original value is not a change.
    await name.fill("The Okonkwo Family");
    await expect(dialogSave(page)).toBeDisabled();
  });

  test("Cancel discards, and reopening re-seeds from the database", async ({ page }) => {
    await page.click('button[aria-label="Edit The Okonkwo Family"]');
    await openDialog(page).locator('input[name="name"]').fill("Discard me");
    await openDialog(page).locator('button:has-text("Cancel")').click();

    await expect(groupCard(page, "The Okonkwo Family")).toHaveCount(1);
    await page.click('button[aria-label="Edit The Okonkwo Family"]');
    await expect(openDialog(page).locator('input[name="name"]')).toHaveValue(
      "The Okonkwo Family",
    );
  });

  test("saves every field", async ({ page }) => {
    await page.click('button[aria-label="Edit The Okonkwo Family"]');
    const dialog = openDialog(page);
    await dialog.locator('input[name="name"]').fill("The Okonkwo Household");
    await dialog.locator('select[name="side"]').selectOption("bride");
    await dialog.locator('input[name="envelope_name"]').fill("Chief & Mrs. Emeka Okonkwo");
    await dialog.locator('input[name="address"]').fill("9 Larkspur Way, Summit, NJ 07901");
    await dialog.locator('textarea[name="notes"]').fill("Seat them near the Mitchells.");
    await dialogSave(page).click();
    await expect(openDialog(page)).toHaveCount(0);

    const card = groupCard(page, "The Okonkwo Household");
    await expect(card).toHaveCount(1);
    await expect(card.getByText("Bride's side")).toBeVisible();
    await expect(card.getByText("Chief & Mrs. Emeka Okonkwo")).toBeVisible();
    await expect(card.getByText("9 Larkspur Way, Summit, NJ 07901")).toBeVisible();
    await expect(card.getByText("Seat them near the Mitchells.")).toBeVisible();
  });

  test("clearing the envelope restores the inherit-from-name fallback", async ({ page }) => {
    await page.click('button[aria-label="Edit The Mitchell Family"]');
    await openDialog(page).locator('input[name="envelope_name"]').fill("");
    await dialogSave(page).click();
    await expect(openDialog(page)).toHaveCount(0);

    await expect(groupCard(page, "The Mitchell Family").getByText("Envelope:")).toHaveCount(0);
  });

  test("an empty name is rejected with our own message, not a browser bubble", async ({ page }) => {
    await page.click('button[aria-label="Edit The Okonkwo Family"]');
    await openDialog(page).locator('input[name="name"]').fill("");
    await dialogSave(page).click();

    await expect(
      openDialog(page).locator('[role="alert"]:has-text("A group needs a name")'),
    ).toBeVisible();
  });
});

test.describe("add a guest inline", () => {
  test("expands on click, needs a name, and collapses again", async ({ page }) => {
    const card = groupCard(page, "The Okonkwo Family");
    const before = await card.locator("li").count();

    await card.locator('button:has-text("Add guest")').click();
    const save = card.locator('button[type="submit"]:has-text("Save")');
    await expect(card.locator('input[name="first_name"]')).toBeVisible();
    await expect(save).toBeDisabled();

    await card.locator('input[name="first_name"]').fill("Ada");
    await expect(save).toBeEnabled();

    await card.locator('button:has-text("Cancel")').click();
    await expect(card.locator('input[name="first_name"]')).toHaveCount(0);

    await card.locator('button:has-text("Add guest")').click();
    await card.locator('input[name="first_name"]').fill("Ada");
    await card.locator('input[name="last_name"]').fill("Okonkwo");
    await card.locator('label:has-text("Child") input[type="checkbox"]').check();
    await card.locator('button[type="submit"]:has-text("Save")').click();

    const after = groupCard(page, "The Okonkwo Family");
    await expect(after.locator("li:has-text('Ada Okonkwo')")).toHaveCount(1);
    await expect(after.locator("li:has-text('Ada Okonkwo')").getByText("child")).toBeVisible();
    await expect(after.locator("li")).toHaveCount(before + 1);
    await expect(after.locator('input[name="first_name"]')).toHaveCount(0);
  });
});

test.describe("edit a guest", () => {
  test("renames, restatuses, re-meals and moves in one save", async ({ page }) => {
    await page.click('button[aria-label="Edit Chidi Okonkwo"]');
    const dialog = openDialog(page);
    await expect(dialogSave(page)).toBeDisabled();

    // Chidi is seeded attending on chicken, so both of these are real changes.
    // Re-selecting the value a field already has is not an edit, and Save is
    // meant to stay dark for it.
    await dialog.locator('select[name="rsvp_status"]').selectOption("declined");
    await expect(dialogSave(page)).toBeEnabled();
    await dialog.locator('select[name="meal_choice"]').selectOption("kids");
    await dialog.locator('input[name="first_name"]').fill("Chidinma");
    await dialog.locator('select[name="party_id"]').selectOption({ label: "The Mitchell Family" });
    await expect(dialog.getByText("will move this guest")).toBeVisible();

    await dialogSave(page).click();
    await expect(openDialog(page)).toHaveCount(0);

    const mitchells = groupCard(page, "The Mitchell Family");
    const moved = mitchells.locator("li:has-text('Chidinma Okonkwo')");
    await expect(moved).toHaveCount(1);
    await expect(moved.getByText("declined")).toBeVisible();
    await expect(moved.getByText("Kids' Meal")).toBeVisible();
    await expect(
      groupCard(page, "The Okonkwo Family").locator("li:has-text('Chidinma')"),
    ).toHaveCount(0);
  });

  test("preserves the dietary note the flat list owns", async ({ page }) => {
    // This editor has no dietary-notes input; a shared UPDATE with the flat
    // list's editor would blank the column on every rename.
    await page.click('button[aria-label="Edit Emma Mitchell"]');
    await openDialog(page).locator('select[name="rsvp_status"]').selectOption("pending");
    await dialogSave(page).click();
    await expect(openDialog(page)).toHaveCount(0);

    await expect(
      groupCard(page, "The Mitchell Family").getByText("No nuts of any kind", { exact: false }),
    ).toBeVisible();
  });
});

test.describe("delete a group", () => {
  test("names the cascade and takes two clicks", async ({ page }) => {
    await page.click('button[aria-label="Delete The Okonkwo Family"]');
    const dialog = openDialog(page);

    await expect(dialog).toContainText(
      /delete all guests within the group, RSVP status, table assignments, and any notes/i,
    );
    await expect(dialog).toContainText(/4 guests will be removed from the guest list/i);

    await dialog.locator('button:has-text("Cancel")').click();
    await expect(groupCards(page)).toHaveCount(14);
  });

  test("removes the group and its guests", async ({ page }) => {
    await page.click('button[aria-label="Delete The Okonkwo Family"]');
    await openDialog(page).locator('button:has-text("Delete group")').click();

    await expect(groupCards(page)).toHaveCount(13);
    await expect(page.locator("li:has-text('Chidi Okonkwo')")).toHaveCount(0);

    // The flat list agrees, so the cascade really reached the database.
    await page.goto("/admin/guests?q=Okonkwo");
    await expect(guestRows(page)).toHaveCount(0);
  });
});
