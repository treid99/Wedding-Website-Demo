import { parsePriceToCents } from "./format";

/**
 * Registry filter vocabulary.
 *
 * These live here rather than in lib/queries.ts because the client-side filter
 * UI needs them, and importing anything from lib/queries would pull the
 * better-sqlite3 native module into the browser bundle.
 */
export const REGISTRY_SORTS = {
  curated: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  "name-asc": "Name: A–Z",
} as const;

export type RegistrySort = keyof typeof REGISTRY_SORTS;

export type RegistryAvailability = "all" | "available" | "purchased";

export const PER_PAGE = 12;

/** Normalized registry filter state, shared by the page, filters, and pagination. */
export type RegistryParams = {
  q: string;
  stores: string[];
  minCents: number | null;
  maxCents: number | null;
  availability: RegistryAvailability;
  sort: RegistrySort;
  page: number;
};

export type RawSearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function allValues(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value.filter(Boolean);
  return value ? [value] : [];
}

const AVAILABILITY: RegistryAvailability[] = ["all", "available", "purchased"];

/**
 * Parses raw searchParams into a validated filter state.
 *
 * Everything is bounds-checked here so the page and the SQL layer can trust the
 * values — a hand-edited URL can't produce a bad query.
 */
export function parseRegistryParams(raw: RawSearchParams): RegistryParams {
  const availabilityRaw = firstValue(raw.avail) as RegistryAvailability;
  const sortRaw = firstValue(raw.sort) as RegistrySort;
  const pageRaw = Number.parseInt(firstValue(raw.page), 10);

  const minCents = parsePriceToCents(firstValue(raw.min));
  const maxCents = parsePriceToCents(firstValue(raw.max));

  // A reversed range would silently return nothing; swap it instead.
  const [lo, hi] =
    minCents != null && maxCents != null && minCents > maxCents
      ? [maxCents, minCents]
      : [minCents, maxCents];

  return {
    q: firstValue(raw.q).slice(0, 120),
    stores: allValues(raw.store),
    minCents: lo,
    maxCents: hi,
    availability: AVAILABILITY.includes(availabilityRaw) ? availabilityRaw : "all",
    sort: sortRaw in REGISTRY_SORTS ? sortRaw : "curated",
    page: Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1,
  };
}

/** Serializes filter state back to a query string, omitting defaults. */
export function buildRegistryQuery(
  params: RegistryParams,
  overrides: Partial<RegistryParams> = {},
): string {
  const merged = { ...params, ...overrides };
  const search = new URLSearchParams();

  if (merged.q.trim()) search.set("q", merged.q.trim());
  for (const store of merged.stores) search.append("store", store);
  if (merged.minCents != null) search.set("min", String(merged.minCents / 100));
  if (merged.maxCents != null) search.set("max", String(merged.maxCents / 100));
  if (merged.availability !== "all") search.set("avail", merged.availability);
  if (merged.sort !== "curated") search.set("sort", merged.sort);
  if (merged.page > 1) search.set("page", String(merged.page));

  const query = search.toString();
  return query ? `?${query}` : "";
}

export function registryHref(
  params: RegistryParams,
  overrides: Partial<RegistryParams> = {},
): string {
  return `/registry${buildRegistryQuery(params, overrides)}`;
}

export function hasActiveFilters(params: RegistryParams): boolean {
  return Boolean(
    params.q.trim() ||
      params.stores.length ||
      params.minCents != null ||
      params.maxCents != null ||
      params.availability !== "all" ||
      params.sort !== "curated",
  );
}

/** Quick-pick price bands offered above the min/max inputs. */
export const PRICE_PRESETS = [
  { label: "Under $50", minCents: null, maxCents: 5000 },
  { label: "$50 – $100", minCents: 5000, maxCents: 10000 },
  { label: "$100 – $250", minCents: 10000, maxCents: 25000 },
  { label: "$250 & up", minCents: 25000, maxCents: null },
] as const;
