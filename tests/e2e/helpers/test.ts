import { test as base } from "@playwright/test";
import { restoreBaseline } from "./db";

/**
 * The `test` every spec imports, instead of the one from @playwright/test.
 *
 * It carries one auto fixture, and that fixture is the contract the whole suite
 * rests on: after each test — passed, failed, or thrown out of half way — the
 * database goes back to the state globalSetup captured. A spec may add, edit
 * and delete as freely as a user can, because none of it survives the test that
 * did it.
 *
 * Auto, rather than an `afterEach` in each file, precisely so no spec can
 * forget. A file that writes without restoring does not leak into the file
 * after it; it leaks into the developer's database, which is how the suite used
 * to behave and the reason it now works this way.
 */
export const test = base.extend<{ pristineDatabase: void }>({
  pristineDatabase: [
    async ({}, use) => {
      await use();
      restoreBaseline();
    },
    // `auto` runs it for every test in every file that imports this `test`.
    { auto: true },
  ],
});

export { expect } from "@playwright/test";
export type { Page } from "@playwright/test";
