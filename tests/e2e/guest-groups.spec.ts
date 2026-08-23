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
  // per=50 rather than the group view's default 15: the seed has 20 groups, so
  // on the default page size five of them sit on page 2 and every assertion
  // here — the card counts, and each click on a specific group's edit or delete
  // icon — silently depends on which page a group happened to land on. Paging
  // itself is guest-filters' job; this file is about the card.
  await page.goto("/admin/guests?view=groups&per=50");
});

test.describe("card layout", () => {
  test("the old inline controls are gone", async ({ page }) => {
    await expect(page.locator('summary:has-text("Edit this group")')).toHaveCount(0);
    await expect(page.locator('select:has(option:text("Move to…"))')).toHaveCount(0);
    // The add-guest form is collapsed, so no name fields are on screen.
    await expect(page.locator('input[placeholder="First name"]')).toHaveCount(0);
  });

  test("each group has edit and delete icons and a slim Add guest row", async ({ page }) => {
    await expect(groupCards(page)).toHaveCount(20);
    await expect(page.locator('button[aria-label^="Delete "]')).toHaveCount(20);
    // One edit icon per group plus one per guest.
    await expect(page.locator('button[aria-label^="Edit "]')).toHaveCount(20 + 47);
    await expect(page.locator('button:has-text("Add guest")')).toHaveCount(20);

    const row = await groupCard(page, "Steve Harrington")
      .locator('button:has-text("Add guest")')
      .boundingBox();
    expect(row!.height).toBeLessThan(44);
  });

  test("shows an envelope override, and nothing when it is inherited", async ({ page }) => {
    await expect(
      groupCard(page, "The Addams Family").getByText("Mr. & Mrs. Gomez Addams"),
    ).toBeVisible();
    await expect(
      groupCard(page, "Joyce Byers & Jim Hopper").getByText("Envelope:"),
    ).toHaveCount(0);
  });
});

test.describe("edit group", () => {
  test("Save stays disabled until something actually changes", async ({ page }) => {
    await page.click('button[aria-label="Edit Joyce Byers & Jim Hopper"]');
    await expect(openDialog(page)).toBeVisible();
    await expect(dialogSave(page)).toBeDisabled();

    const name = openDialog(page).locator('input[name="name"]');
    await name.fill("Joyce Byers & Jim Hopper!");
    await expect(dialogSave(page)).toBeEnabled();

    // Editing back to the original value is not a change.
    await name.fill("Joyce Byers & Jim Hopper");
    await expect(dialogSave(page)).toBeDisabled();
  });

  test("Cancel discards, and reopening re-seeds from the database", async ({ page }) => {
    await page.click('button[aria-label="Edit Joyce Byers & Jim Hopper"]');
    await openDialog(page).locator('input[name="name"]').fill("Discard me");
    await openDialog(page).locator('button:has-text("Cancel")').click();

    await expect(groupCard(page, "Joyce Byers & Jim Hopper")).toHaveCount(1);
    await page.click('button[aria-label="Edit Joyce Byers & Jim Hopper"]');
    await expect(openDialog(page).locator('input[name="name"]')).toHaveValue(
      "Joyce Byers & Jim Hopper",
    );
  });

  test("saves every field", async ({ page }) => {
    await page.click('button[aria-label="Edit Joyce Byers & Jim Hopper"]');
    const dialog = openDialog(page);
    await dialog.locator('input[name="name"]').fill("The Byers-Hopper Household");
    await dialog.locator('select[name="side"]').selectOption("bride");
    await dialog.locator('input[name="envelope_name"]').fill("Chief Jim Hopper & Ms. Joyce Byers");
    await dialog.locator('input[name="address"]').fill("9 Larkspur Way, Summit, NJ 07901");
    await dialog.locator('textarea[name="notes"]').fill("Seat them near the Addamses.");
    await dialogSave(page).click();
    await expect(openDialog(page)).toHaveCount(0);

    const card = groupCard(page, "The Byers-Hopper Household");
    await expect(card).toHaveCount(1);
    await expect(card.getByText("Bride's side")).toBeVisible();
    await expect(card.getByText("Chief Jim Hopper & Ms. Joyce Byers")).toBeVisible();
    await expect(card.getByText("9 Larkspur Way, Summit, NJ 07901")).toBeVisible();
    await expect(card.getByText("Seat them near the Addamses.")).toBeVisible();
  });

  test("clearing the envelope restores the inherit-from-name fallback", async ({ page }) => {
    await page.click('button[aria-label="Edit The Addams Family"]');
    await openDialog(page).locator('input[name="envelope_name"]').fill("");
    await dialogSave(page).click();
    await expect(openDialog(page)).toHaveCount(0);

    await expect(groupCard(page, "The Addams Family").getByText("Envelope:")).toHaveCount(0);
  });

  test("an empty name is rejected with our own message, not a browser bubble", async ({ page }) => {
    await page.click('button[aria-label="Edit Joyce Byers & Jim Hopper"]');
    await openDialog(page).locator('input[name="name"]').fill("");
    await dialogSave(page).click();

    await expect(
      openDialog(page).locator('[role="alert"]:has-text("A group needs a name")'),
    ).toBeVisible();
  });
});

test.describe("add a guest inline", () => {
  test("expands on click, needs a name, and collapses again", async ({ page }) => {
    const card = groupCard(page, "Joyce Byers & Jim Hopper");
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
    await card.locator('input[name="last_name"]').fill("Byers");
    await card.locator('label:has-text("Child") input[type="checkbox"]').check();
    await card.locator('button[type="submit"]:has-text("Save")').click();

    const after = groupCard(page, "Joyce Byers & Jim Hopper");
    await expect(after.locator("li:has-text('Ada Byers')")).toHaveCount(1);
    await expect(after.locator("li:has-text('Ada Byers')").getByText("child")).toBeVisible();
    await expect(after.locator("li")).toHaveCount(before + 1);
    await expect(after.locator('input[name="first_name"]')).toHaveCount(0);
  });
});

test.describe("edit a guest", () => {
  test("renames, restatuses, re-meals and moves in one save", async ({ page }) => {
    await page.click('button[aria-label="Edit Joyce Byers"]');
    const dialog = openDialog(page);
    await expect(dialogSave(page)).toBeDisabled();

    // Joyce is seeded attending on chicken, so both of these are real changes.
    // Re-selecting the value a field already has is not an edit, and Save is
    // meant to stay dark for it.
    await dialog.locator('select[name="rsvp_status"]').selectOption("declined");
    await expect(dialogSave(page)).toBeEnabled();
    await dialog.locator('select[name="meal_choice"]').selectOption("kids");
    await dialog.locator('input[name="first_name"]').fill("Joycelyn");
    await dialog.locator('select[name="party_id"]').selectOption({ label: "The Addams Family" });
    await expect(dialog.getByText("will move this guest")).toBeVisible();

    await dialogSave(page).click();
    await expect(openDialog(page)).toHaveCount(0);

    const addamses = groupCard(page, "The Addams Family");
    const moved = addamses.locator("li:has-text('Joycelyn Byers')");
    await expect(moved).toHaveCount(1);
    await expect(moved.getByText("declined")).toBeVisible();
    await expect(moved.getByText("Kids' Meal")).toBeVisible();
    await expect(
      groupCard(page, "Joyce Byers & Jim Hopper").locator("li:has-text('Joycelyn')"),
    ).toHaveCount(0);
  });

  test("preserves the dietary note the flat list owns", async ({ page }) => {
    // This editor has no dietary-notes input; a shared UPDATE with the flat
    // list's editor would blank the column on every rename.
    await page.click('button[aria-label="Edit Stewie Griffin"]');
    await openDialog(page).locator('select[name="rsvp_status"]').selectOption("pending");
    await dialogSave(page).click();
    await expect(openDialog(page)).toHaveCount(0);

    await expect(
      groupCard(page, "The Griffin Family").getByText("No nuts of any kind", { exact: false }),
    ).toBeVisible();
  });
});

test.describe("delete a group", () => {
  test("names the cascade and takes two clicks", async ({ page }) => {
    await page.click('button[aria-label="Delete Joyce Byers & Jim Hopper"]');
    const dialog = openDialog(page);

    await expect(dialog).toContainText(
      /delete all guests within the group, RSVP status, table assignments, and any notes/i,
    );
    await expect(dialog).toContainText(/4 guests will be removed from the guest list/i);

    await dialog.locator('button:has-text("Cancel")').click();
    await expect(groupCards(page)).toHaveCount(20);
  });

  test("removes the group and its guests", async ({ page }) => {
    await page.click('button[aria-label="Delete Joyce Byers & Jim Hopper"]');
    await openDialog(page).locator('button:has-text("Delete group")').click();

    await expect(groupCards(page)).toHaveCount(19);
    await expect(page.locator("li:has-text('Joyce Byers')")).toHaveCount(0);

    // The flat list agrees, so the cascade really reached the database.
    await page.goto("/admin/guests?q=Hopper");
    await expect(guestRows(page)).toHaveCount(0);
  });
});
