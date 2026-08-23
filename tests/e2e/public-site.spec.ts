import { expect, test } from "@playwright/test";
import { waitForUrl } from "./helpers/admin";
import { resetDatabase } from "./helpers/db";

/** The guest-facing site: every page, the carousel, the gallery, the registry. */

const PAGES = [
  "/",
  "/story",
  "/gallery",
  "/travel",
  "/schedule",
  "/faq",
  "/registry",
  "/rsvp",
];

test.beforeAll(() => {
  resetDatabase();
});

test.describe("every page renders", () => {
  for (const path of PAGES) {
    test(`${path} has content and no broken images`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));

      await page.goto(path, { waitUntil: "networkidle" });

      const broken = await page.evaluate(
        () =>
          [...document.images].filter((img) => img.complete && img.naturalWidth === 0)
            .length,
      );
      expect(broken, "broken images").toBe(0);
      expect(await page.evaluate(() => document.body.scrollHeight)).toBeGreaterThan(500);
      expect(errors).toEqual([]);
    });
  }
});

test("the carousel advances", async ({ page }) => {
  await page.goto("/");
  const carousel = page.locator('section:has(button[aria-label="Next photo"])').first();
  const dots = carousel.locator('button[aria-label^="Go to photo"]');

  // Hovering pauses the 5s autoplay; without that, the slide can advance on its
  // own between reading the current dot and asserting on it.
  await carousel.hover();
  const current = () =>
    dots.evaluateAll((nodes) => nodes.findIndex((n) => n.getAttribute("aria-current") === "true"));

  const before = await current();
  await carousel.locator('button[aria-label="Next photo"]').click();
  await expect.poll(current).not.toBe(before);
});

test("the countdown renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/Until we say I do/i)).toBeVisible();
});

test("the gallery lightbox arrows through and closes on Escape", async ({ page }) => {
  await page.goto("/gallery");
  // Tiles are labelled with the photo's caption when it has one, so target them
  // structurally rather than by an "Open photo N" label most of them don't use.
  await page.locator("main button:has(img)").first().click();

  const dialog = page.locator('div[role="dialog"]');
  await expect(dialog).toBeVisible();
  const counter = dialog.locator("span").first();
  await expect(counter).toHaveText("1 / 16");

  await page.keyboard.press("ArrowRight");
  await expect(counter).toHaveText("2 / 16");

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

test.describe("registry", () => {
  test("search auto-submits to a shareable URL", async ({ page }) => {
    await page.goto("/registry");
    await page.fill("#registry-search", "knife");
    await waitForUrl(page, (url) => url.includes("q=knife"));
    await expect(page.getByText("Showing 1–1 of 1")).toBeVisible();
  });

  test("store and price filters compose, and chips remove one at a time", async ({ page }) => {
    await page.goto("/registry");
    await page.click('input[name="store"][value="Target"]');
    await waitForUrl(page, (url) => url.includes("store=Target"));

    await page.click('button:has-text("Under $50")');
    await waitForUrl(page, (url) => url.includes("max=50"));

    // No empty params left behind by the submit.
    expect(page.url()).not.toMatch(/[?&](q|min|max)=(&|$)/);

    await page.locator('a[href*="/registry"]:has-text("Target")').first().click();
    await waitForUrl(page, (url) => !url.includes("store=Target"));

    expect(page.url()).not.toContain("store=Target");
    expect(page.url(), "removing one chip keeps the others").toContain("max=50");
  });

  test("purchased items sort last and lose their buy link", async ({ page }) => {
    await page.goto("/registry?page=4");
    const cards = await page.locator("article").count();
    const ribbons = await page.locator('span:text-is("Purchased")').count();
    expect(ribbons).toBe(cards);
    expect(ribbons).toBeGreaterThan(0);
    await expect(page.locator('article a[target="_blank"]')).toHaveCount(0);

    await page.goto("/registry");
    await expect(page.locator('article a[target="_blank"][rel*="noopener"]')).toHaveCount(12);
  });
});

test.describe("RSVP", () => {
  test("looks up a party, submits, and pre-fills on return", async ({ page }) => {
    await page.goto("/rsvp");
    await page.fill("#rsvp-lookup", "Schitt");
    await page.click('button:has-text("Search")');
    await expect(page.getByText("Roland & Jocelyn Schitt")).toBeVisible();

    const members = page.locator("fieldset");
    await expect(members).toHaveCount(3);

    await members.nth(0).locator('label:has-text("Joyfully accepts")').click();
    await members.nth(0).locator("select").selectOption("filet");
    await members.nth(0).locator('input[type="text"]').fill("No blue cheese, please");
    await members.nth(1).locator('label:has-text("Joyfully accepts")').click();
    await members.nth(1).locator("select").selectOption("salmon");
    await members.nth(2).locator('label:has-text("Regretfully declines")').click();
    await page.fill("#rsvp-message", "Driving down from Schitt's Creek — Roland Jr. has a school thing.");
    await page.click('button:has-text("Send our response")');

    await expect(page.getByText(/Thank you/)).toBeVisible();
    await expect(page.getByText(/2 attending/)).toBeVisible();
    await expect(page.getByText(/1 unable/)).toBeVisible();

    // Coming back shows what they already told us.
    await page.goto("/rsvp");
    await page.fill("#rsvp-lookup", "Schitt");
    await page.click('button:has-text("Search")');
    await expect(page.getByText("Roland & Jocelyn Schitt")).toBeVisible();
    await expect(page.locator("fieldset").nth(0).locator("select")).toHaveValue("filet");
    await expect(page.locator("fieldset").nth(0).locator('input[type="text"]')).toHaveValue(
      "No blue cheese, please",
    );
  });

  test("blocks an attending guest with no meal chosen", async ({ page }) => {
    await page.goto("/rsvp");
    await page.fill("#rsvp-lookup", "Sinclair");
    await page.click('button:has-text("Search")');
    await expect(page.locator('button:has-text("Send our response")')).toBeVisible();

    await page.locator("fieldset").nth(0).locator('label:has-text("Joyfully accepts")').click();
    await page.click('button:has-text("Send our response")');

    // Our own message, not a native validation bubble, which can't be read here.
    await expect(page.locator('[role="alert"]').first()).toBeVisible();
  });
});

test.describe("responsive", () => {
  for (const [label, width, height] of [
    ["mobile", 375, 812],
    ["tablet", 768, 1024],
  ] as const) {
    test(`${label} has no horizontal scroll`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      for (const path of ["/", "/registry", "/gallery", "/schedule"]) {
        await page.goto(path, { waitUntil: "networkidle" });
        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow, `${path} overflowed`).toBeLessThanOrEqual(1);
      }
    });
  }
});
