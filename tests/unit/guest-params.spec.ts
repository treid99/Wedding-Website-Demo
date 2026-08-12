import { expect, test } from "@playwright/test";
import {
  buildGuestHref,
  defaultPerPage,
  hasActiveFilters,
  normalizeStatuses,
  parseGuestQuery,
  statusSummary,
  type GuestQuery,
} from "@/lib/guest-params";

/**
 * The /admin/guests query string. Every component that builds a URL for that
 * screen goes through here, so a regression shows up as filters silently
 * dropping off a link rather than as a visible error.
 */

const base: GuestQuery = {
  view: "list",
  q: "",
  statuses: [],
  seated: "all",
  page: 1,
  per: 50,
};

test.describe("parseGuestQuery", () => {
  test("defaults an empty query string", () => {
    expect(parseGuestQuery({})).toEqual(base);
  });

  test("reads every parameter", () => {
    expect(
      parseGuestQuery({
        view: "groups",
        q: "Rao",
        status: "attending,declined",
        seated: "unseated",
        per: "25",
        page: "3",
      }),
    ).toEqual({
      view: "groups",
      q: "Rao",
      statuses: ["attending", "declined"],
      seated: "unseated",
      page: 3,
      per: 25,
    });
  });

  test("takes the first value when a param repeats", () => {
    expect(parseGuestQuery({ q: ["Rao", "Demir"] }).q).toBe("Rao");
  });

  test("rejects a per-page the current view doesn't offer", () => {
    // 25 is a group-view size; the flat list offers 50/100/200.
    expect(parseGuestQuery({ per: "25" }).per).toBe(50);
    expect(parseGuestQuery({ view: "groups", per: "25" }).per).toBe(25);
    expect(parseGuestQuery({ view: "groups", per: "200" }).per).toBe(15);
  });

  test("falls back on junk rather than throwing", () => {
    const parsed = parseGuestQuery({
      view: "nonsense",
      status: "married",
      seated: "maybe",
      per: "abc",
      page: "-4",
    });
    expect(parsed).toEqual(base);
  });

  test("clamps page to at least 1", () => {
    expect(parseGuestQuery({ page: "0" }).page).toBe(1);
  });
});

test.describe("normalizeStatuses", () => {
  test("keeps the canonical order regardless of input order", () => {
    expect(normalizeStatuses(["declined", "attending"])).toEqual([
      "attending",
      "declined",
    ]);
  });

  test("drops unknown values", () => {
    expect(normalizeStatuses(["attending", "married"])).toEqual(["attending"]);
  });

  test("de-duplicates", () => {
    expect(normalizeStatuses(["attending", "attending"])).toEqual(["attending"]);
  });

  test("collapses all three to the empty 'everything' form", () => {
    // Selecting every status is the same query as selecting none, and the
    // shorter form is what keeps the All checkbox in sync.
    expect(normalizeStatuses(["attending", "pending", "declined"])).toEqual([]);
  });
});

test.describe("buildGuestHref", () => {
  test("omits everything left at its default", () => {
    expect(buildGuestHref(base)).toBe("/admin/guests");
  });

  test("serializes each non-default", () => {
    expect(
      buildGuestHref({
        view: "groups",
        q: "Rao",
        statuses: ["attending", "declined"],
        seated: "seated",
        page: 2,
        per: 25,
      }),
    ).toBe(
      "/admin/guests?view=groups&q=Rao&status=attending%2Cdeclined&seated=seated&per=25&page=2",
    );
  });

  test("omits a per-page that equals the view's default", () => {
    expect(buildGuestHref({ ...base, per: 50 })).toBe("/admin/guests");
    expect(buildGuestHref({ ...base, view: "groups", per: 15 })).toBe(
      "/admin/guests?view=groups",
    );
  });

  test("trims the search term", () => {
    expect(buildGuestHref({ ...base, q: "  Rao  " })).toBe("/admin/guests?q=Rao");
    expect(buildGuestHref({ ...base, q: "   " })).toBe("/admin/guests");
  });

  test("round-trips through parseGuestQuery", () => {
    const query: GuestQuery = {
      view: "groups",
      q: "Okonkwo",
      statuses: ["pending"],
      seated: "unseated",
      page: 4,
      per: 50,
    };
    const href = buildGuestHref(query);
    const params = Object.fromEntries(new URL(href, "http://x").searchParams);
    expect(parseGuestQuery(params)).toEqual(query);
  });
});

test.describe("hasActiveFilters", () => {
  test("is false for a bare query", () => {
    expect(hasActiveFilters(base)).toBe(false);
    expect(hasActiveFilters({ ...base, q: "   " })).toBe(false);
  });

  test("is true for any one filter", () => {
    expect(hasActiveFilters({ ...base, q: "Rao" })).toBe(true);
    expect(hasActiveFilters({ ...base, statuses: ["pending"] })).toBe(true);
    expect(hasActiveFilters({ ...base, seated: "seated" })).toBe(true);
  });

  test("paging alone is not a filter", () => {
    const paged: GuestQuery = { ...base, page: 3, per: 200 };
    expect(hasActiveFilters(paged)).toBe(false);
  });
});

test.describe("statusSummary", () => {
  test("labels the empty selection as everything", () => {
    expect(statusSummary([])).toBe("All statuses");
  });

  test("joins the chosen labels", () => {
    expect(statusSummary(["attending"])).toBe("Attending");
    expect(statusSummary(["attending", "declined"])).toBe("Attending, Declined");
  });
});

test("defaultPerPage differs per view", () => {
  expect(defaultPerPage("list")).toBe(50);
  expect(defaultPerPage("groups")).toBe(15);
});
