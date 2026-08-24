import { PER_PAGE } from "@/lib/registry-params";
import { waitForUrl } from "./helpers/admin";
import {
  countGalleryPhotos,
  countRegistryItems,
  someRegistryStore,
} from "./helpers/db";
import { createParty, createRegistryItem } from "./helpers/fixtures";
import { expect, test } from "./helpers/test";

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
      expect(await page.evaluate(() => document.body.scrollHeight)).toBeGreaterThan(
        500,
      );
      expect(errors).toEqual([]);
    });
  }
});

test("the carousel advances", async ({ page }) => {
  await page.goto("/");
  const carousel = page
    .locator('section:has(button[aria-label="Next photo"])')
    .first();
  const dots = carousel.locator('button[aria-label^="Go to photo"]');

  // Hovering pauses the 5s autoplay; without that, the slide can advance on its
  // own between reading the current dot and asserting on it.
  await carousel.hover();
  const current = () =>
    dots.evaluateAll((nodes) =>
      nodes.findIndex((n) => n.getAttribute("aria-current") === "true"),
    );

  const before = await current();
  await carousel.locator('button[aria-label="Next photo"]').click();
  await expect.poll(current).not.toBe(before);
});

test("the countdown renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/Until we say I do/i)).toBeVisible();
});

test("the gallery lightbox arrows through and closes on Escape", async ({ page }) => {
  // The counter reads "n / total", and the total is whatever the couple has put
  // in the gallery rather than a number this file remembers.
  const total = countGalleryPhotos();
  expect(total, "the lightbox needs at least two photos to arrow through").toBeGreaterThan(1);

  await page.goto("/gallery");
  // Tiles are labelled with the photo's caption when it has one, so target them
  // structurally rather than by an "Open photo N" label most of them don't use.
  await page.locator("main button:has(img)").first().click();

  const dialog = page.locator('div[role="dialog"]');
  await expect(dialog).toBeVisible();
  const counter = dialog.locator("span").first();
  await expect(counter).toHaveText(`1 / ${total}`);

  await page.keyboard.press("ArrowRight");
  await expect(counter).toHaveText(`2 / ${total}`);

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

test.describe("registry", () => {
  test("search auto-submits to a shareable URL", async ({ page }) => {
    // One item nothing else can match, so "1 of 1" is a fact about the search
    // rather than about how many knives the couple asked for.
    const item = createRegistryItem();

    await page.goto("/registry");
    await page.fill("#registry-search", item.token);
    await waitForUrl(page, (url) => url.includes(`q=${item.token}`));
    await expect(page.getByText("Showing 1–1 of 1")).toBeVisible();
    await expect(page.locator(`article:has-text("${item.title}")`)).toHaveCount(1);
  });

  test("store and price filters compose, and chips remove one at a time", async ({
    page,
  }) => {
    const store = someRegistryStore();

    await page.goto("/registry");
    await page.click(`input[name="store"][value="${store}"]`);
    await waitForUrl(page, (url) => url.includes("store="));

    await page.click('button:has-text("Under $50")');
    await waitForUrl(page, (url) => url.includes("max=50"));

    // No empty params left behind by the submit.
    expect(page.url()).not.toMatch(/[?&](q|min|max)=(&|$)/);

    await page
      .locator(`a[href*="/registry"]:has-text("${store}")`)
      .first()
      .click();
    await waitForUrl(page, (url) => !url.includes("store="));

    expect(page.url()).not.toContain("store=");
    expect(page.url(), "removing one chip keeps the others").toContain("max=50");
  });

  test("purchased items sort last and lose their buy link", async ({ page }) => {
    const total = countRegistryItems();
    const unpurchased = countRegistryItems(0);
    const purchased = countRegistryItems(1);
    expect(purchased, "nothing is marked purchased, so there is no tail to check").toBeGreaterThan(0);

    const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));
    const onLastPage = total - (lastPage - 1) * PER_PAGE;

    await page.goto(`/registry?page=${lastPage}`);
    await expect(page.locator("article")).toHaveCount(onLastPage);
    // Purchased sorts last, so the tail of the final page is exactly the
    // purchased items that reach it.
    await expect(page.locator('span:text-is("Purchased")')).toHaveCount(
      Math.min(onLastPage, purchased),
    );
    await expect(page.locator('article a[target="_blank"]')).toHaveCount(
      Math.max(0, onLastPage - purchased),
    );

    // And the first page is all still-available items, each with its buy link.
    await page.goto("/registry");
    await expect(
      page.locator('article a[target="_blank"][rel*="noopener"]'),
    ).toHaveCount(Math.min(PER_PAGE, unpurchased));
  });
});

test.describe("RSVP", () => {
  test("looks up a party, submits, and pre-fills on return", async ({ page }) => {
    const party = createParty({ guests: 3 });
    const dietary = "No blue cheese, please";

    await page.goto("/rsvp");
    await page.fill("#rsvp-lookup", party.token);
    await page.click('button:has-text("Search")');
    await expect(page.getByText(party.name)).toBeVisible();

    const members = page.locator("fieldset");
    await expect(members).toHaveCount(party.guests.length);

    await members.nth(0).locator('label:has-text("Joyfully accepts")').click();
    await members.nth(0).locator("select").selectOption("filet");
    await members.nth(0).locator('input[type="text"]').fill(dietary);
    await members.nth(1).locator('label:has-text("Joyfully accepts")').click();
    await members.nth(1).locator("select").selectOption("salmon");
    await members.nth(2).locator('label:has-text("Regretfully declines")').click();
    await page.fill("#rsvp-message", `${party.token} is on the way.`);
    await page.click('button:has-text("Send our response")');

    await expect(page.getByText(/Thank you/)).toBeVisible();
    await expect(page.getByText(/2 attending/)).toBeVisible();
    await expect(page.getByText(/1 unable/)).toBeVisible();

    // Coming back shows what they already told us.
    await page.goto("/rsvp");
    await page.fill("#rsvp-lookup", party.token);
    await page.click('button:has-text("Search")');
    await expect(page.getByText(party.name)).toBeVisible();
    await expect(page.locator("fieldset").nth(0).locator("select")).toHaveValue(
      "filet",
    );
    await expect(
      page.locator("fieldset").nth(0).locator('input[type="text"]'),
    ).toHaveValue(dietary);
  });

  test("blocks an attending guest with no meal chosen", async ({ page }) => {
    const party = createParty({ guests: 1 });

    await page.goto("/rsvp");
    await page.fill("#rsvp-lookup", party.token);
    await page.click('button:has-text("Search")');
    await expect(page.locator('button:has-text("Send our response")')).toBeVisible();

    await page
      .locator("fieldset")
      .nth(0)
      .locator('label:has-text("Joyfully accepts")')
      .click();
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
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        );
        expect(overflow, `${path} overflowed`).toBeLessThanOrEqual(1);
      }
    });
  }
});
