import { defineConfig } from "@playwright/test";

/**
 * Unit tests for the pure helpers in lib/.
 *
 * Playwright's runner is reused rather than adding a second test framework: it
 * already compiles TypeScript and resolves the `@/` alias from tsconfig, so
 * these files import the real modules with no build step and no extra
 * dependency. Nothing here touches a browser or the database.
 */
export default defineConfig({
  testDir: "./tests/unit",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
});
