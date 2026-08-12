import type { Page } from "@playwright/test";

/**
 * Shared page helpers for the admin screens.
 */

/**
 * Signs in to the admin. The demo login accepts anything, so this is one click
 * — cheap enough to run per test rather than sharing a storageState fixture.
 */
export async function signIn(page: Page): Promise<void> {
  await page.goto("/admin/login");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("**/admin");
}

/** Hides Next's dev overlay, which otherwise floats over the bottom-left UI. */
export async function hideDevOverlay(page: Page): Promise<void> {
  await page
    .addStyleTag({ content: "nextjs-portal{display:none!important}" })
    .catch(() => {
      // Production builds have no overlay to hide.
    });
}

/**
 * Waits for a debounced navigation to actually land.
 *
 * The filter bar waits 300ms before navigating and the round trip after that is
 * unbounded, so asserting on a fixed sleep is the main source of flake in these
 * specs. Always wait on the URL you expect instead.
 *
 * The predicate runs here in Node, not in the page. An earlier version
 * stringified it and evaluated it in the browser, which quietly turned every
 * captured variable into `undefined` — `(url) => url !== before` waited on a
 * comparison against nothing and timed out with no clue why.
 */
export async function waitForUrl(
  page: Page,
  predicate: (url: string) => boolean,
  timeout = 15_000,
): Promise<void> {
  const deadline = Date.now() + timeout;

  while (!predicate(page.url())) {
    if (Date.now() > deadline) {
      throw new Error(
        `Timed out after ${timeout}ms waiting for the URL to change. It is still ${page.url()}`,
      );
    }
    await page.waitForTimeout(50);
  }

  // The URL changes first; give the server component its render.
  await page.waitForLoadState("networkidle");
}

// ── Guest screen locators ───────────────────────────────────────────────────

export const guestRows = (page: Page) => page.locator("details:has(summary)");

export const groupCards = (page: Page) =>
  page.locator('section:has(button[aria-label^="Delete "])');

export const groupCard = (page: Page, name: string) =>
  page.locator(`section:has(button[aria-label="Delete ${name}"])`);

export const openDialog = (page: Page) => page.locator("dialog[open]");

export const dialogSave = (page: Page) =>
  openDialog(page).locator('button[type="submit"]');

export const perPageSelect = (page: Page) =>
  page.locator('select[aria-label="Rows per page"]');

/** Opens one of the filter-bar dropdowns by its label. */
export async function openFilterMenu(
  page: Page,
  label: "Status" | "Seating",
): Promise<void> {
  await page.getByRole("button", { name: new RegExp(`^${label}`) }).click();
  await page.waitForTimeout(150);
}
