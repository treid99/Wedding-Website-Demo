import { expect, test } from "@playwright/test";
import { matchesSearch, normalizeForSearch } from "@/lib/search";

/**
 * Guest-name matching. This exists in JS rather than SQL precisely because
 * SQLite's LIKE is ASCII-case-insensitive only, so the accent and case cases
 * below are the whole reason the module exists.
 */

test.describe("normalizeForSearch", () => {
  test("folds case", () => {
    expect(normalizeForSearch("DaNiEl")).toBe("daniel");
  });

  test("strips combining marks so Tomás matches tomas", () => {
    expect(normalizeForSearch("Tomás")).toBe("tomas");
    expect(normalizeForSearch("Zoë Ferreira")).toBe("zoe ferreira");
  });

  test("collapses runs of whitespace and trims", () => {
    expect(normalizeForSearch("  Rao   Daniel \n")).toBe("rao daniel");
  });

  test("handles precomposed and decomposed forms identically", () => {
    // "á" as one code point vs "a" + U+0301.
    expect(normalizeForSearch("á")).toBe(normalizeForSearch("á"));
  });
});

test.describe("matchesSearch", () => {
  test("an empty query matches everything", () => {
    expect(matchesSearch("", "Daniel", "Rao")).toBe(true);
    expect(matchesSearch("   ", "Daniel", "Rao")).toBe(true);
  });

  test("matches on either name", () => {
    expect(matchesSearch("Daniel", "Daniel", "Rao")).toBe(true);
    expect(matchesSearch("Rao", "Daniel", "Rao")).toBe(true);
  });

  test("matches a substring, not just a prefix", () => {
    expect(matchesSearch("niel", "Daniel", "Rao")).toBe(true);
    expect(matchesSearch("NiEl", "Daniel", "Rao")).toBe(true);
  });

  test("ignores word order", () => {
    expect(matchesSearch("rao daniel", "Daniel", "Rao")).toBe(true);
  });

  test("requires every token to hit", () => {
    expect(matchesSearch("daniel demir", "Daniel", "Rao")).toBe(false);
  });

  test("searches across all supplied fields", () => {
    expect(matchesSearch("Mitchell Family", "Sarah", "Mitchell", "The Mitchell Family")).toBe(true);
  });

  test("skips null and undefined fields", () => {
    expect(matchesSearch("sarah", "Sarah", null, undefined)).toBe(true);
    expect(matchesSearch("x", null, undefined)).toBe(false);
  });

  test("folds accents on both sides", () => {
    expect(matchesSearch("tomas", "Tomás", "Ferreira")).toBe(true);
    expect(matchesSearch("Tomás", "tomas", "ferreira")).toBe(true);
  });

  test("does not match an unrelated query", () => {
    expect(matchesSearch("zzzz", "Daniel", "Rao")).toBe(false);
  });
});
