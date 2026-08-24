import { defineConfig, devices } from "@playwright/test";

/**
 * The suite builds the app and serves it in production mode on its own port,
 * out of its own build directory.
 *
 * Running against `next dev` looked simpler and was the source of every
 * intermittent failure this suite has had. The dev server compiles routes on
 * demand and rewrites manifests inside `.next` while it serves; a request that
 * lands mid-write fails with "Unexpected end of JSON input" from the server,
 * on a page that has nothing wrong with it. Production output is built once and
 * never rewritten, so the same specs that failed at random now don't — and they
 * run faster, because nothing is compiled on the first hit.
 *
 * Set BASE_URL to point at a server you're already running instead — handy for
 * `--headed` against `npm run dev`, at the cost of that flakiness.
 */
const BASE_URL = process.env.BASE_URL ?? "http://localhost:3100";

/**
 * End-to-end config. Unit tests use playwright.unit.config.ts, which has no
 * browser and no server — keeping them apart means `npm run test:unit` doesn't
 * pay to boot Next just to check a string helper.
 *
 *   npm test            both suites
 *   npm run test:e2e    this one
 *   npm run test:e2e -- guest-search      one file
 *   npm run test:e2e -- --headed --debug  watch it happen
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },

  /**
   * Captures data/wedding.db before the first test and puts it back after the
   * last one. Between tests, the auto fixture in tests/e2e/helpers/test.ts
   * replays the same snapshot, so the suite never destroys local data — see the
   * header of tests/e2e/helpers/db.ts.
   */
  globalSetup: "./tests/e2e/helpers/global-setup.ts",
  globalTeardown: "./tests/e2e/helpers/global-teardown.ts",

  /**
   * Serial on purpose. Every spec drives the same SQLite file and most of them
   * write to it, so parallel workers would see each other's guests appear and
   * disappear mid-assertion — and each worker's restore would undo the others'
   * fixtures. The suite is small enough that this is cheap.
   */
  fullyParallel: false,
  workers: 1,

  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // The system Chrome, so a checkout doesn't have to download ~500MB of
        // browser builds before it can run the suite.
        channel: "chrome",
        viewport: { width: 1500, height: 1000 },
      },
    },
  ],

  // With BASE_URL set, the server is yours to manage and we start nothing.
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: "npm run build && npm run start -- --port 3100",
        url: `${BASE_URL}/admin/login`,
        // Port 3100 and .next-test keep this clear of a dev server on 3000, so
        // the two can run at once without touching each other's build output.
        env: { NEXT_DIST_DIR: ".next-test" },
        reuseExistingServer: false,
        // Generous: the first run pays for a full production build.
        timeout: 300_000,
        stdout: "ignore",
        stderr: "pipe",
      },
});
