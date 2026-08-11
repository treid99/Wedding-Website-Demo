/**
 * The /admin/guests query string: one parser and one URL builder.
 *
 * Client-safe on purpose — the filter bar, the view toggle and the pagination
 * controls all build hrefs, and if each did it by hand they would drift on the
 * details that matter (which params survive a filter change, which reset the
 * page, which are omitted at their default).
 */

export type View = "list" | "groups";
export type RsvpStatusFilter = "attending" | "pending" | "declined";
export type SeatedFilter = "all" | "seated" | "unseated";

export const STATUS_FILTERS: { value: RsvpStatusFilter; label: string }[] = [
  { value: "attending", label: "Attending" },
  { value: "pending", label: "Pending" },
  { value: "declined", label: "Declined" },
];

export const SEATED_FILTERS: { value: SeatedFilter; label: string }[] = [
  { value: "all", label: "Everyone" },
  { value: "seated", label: "Seated" },
  { value: "unseated", label: "Not seated" },
];

/** Rows per page offered by each view. The first entry is that view's default. */
export const PER_PAGE_OPTIONS: Record<View, number[]> = {
  list: [50, 100, 200],
  groups: [15, 25, 50],
};

export function defaultPerPage(view: View): number {
  return PER_PAGE_OPTIONS[view][0];
}

export type GuestQuery = {
  view: View;
  q: string;
  /** Empty means "every status" — the All checkbox is the absence of a filter. */
  statuses: RsvpStatusFilter[];
  seated: SeatedFilter;
  page: number;
  per: number;
};

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export const ALL_STATUSES: RsvpStatusFilter[] = STATUS_FILTERS.map(
  (option) => option.value,
);

/** Keeps the stored order canonical so two equivalent URLs compare equal. */
export function normalizeStatuses(values: string[]): RsvpStatusFilter[] {
  const chosen = new Set(values);
  const kept = ALL_STATUSES.filter((status) => chosen.has(status));
  // Every status selected is the same query as none selected; store the shorter
  // form so ticking the last box collapses back to "All".
  return kept.length === ALL_STATUSES.length ? [] : kept;
}

export function parseGuestQuery(raw: RawParams): GuestQuery {
  const view: View = first(raw.view) === "groups" ? "groups" : "list";

  const statuses = normalizeStatuses(
    first(raw.status)
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );

  const seatedRaw = first(raw.seated);
  const seated: SeatedFilter = (["seated", "unseated"] as const).includes(
    seatedRaw as never,
  )
    ? (seatedRaw as SeatedFilter)
    : "all";

  const options = PER_PAGE_OPTIONS[view];
  const perRaw = Number.parseInt(first(raw.per), 10);
  const per = options.includes(perRaw) ? perRaw : options[0];

  const pageRaw = Number.parseInt(first(raw.page), 10);
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  return { view, q: first(raw.q), statuses, seated, page, per };
}

/** Serializes a query back to a URL, omitting everything left at its default. */
export function buildGuestHref(query: GuestQuery): string {
  const params = new URLSearchParams();

  if (query.view === "groups") params.set("view", "groups");
  if (query.q.trim()) params.set("q", query.q.trim());
  if (query.statuses.length > 0) params.set("status", query.statuses.join(","));
  if (query.seated !== "all") params.set("seated", query.seated);
  if (query.per !== defaultPerPage(query.view)) params.set("per", String(query.per));
  if (query.page > 1) params.set("page", String(query.page));

  const search = params.toString();
  return `/admin/guests${search ? `?${search}` : ""}`;
}

export function hasActiveFilters(query: {
  q: string;
  statuses: RsvpStatusFilter[];
  seated: SeatedFilter;
}): boolean {
  return Boolean(
    query.q.trim() || query.statuses.length > 0 || query.seated !== "all",
  );
}

/** "Attending, Declined" / "All statuses" — the dropdown's button label. */
export function statusSummary(statuses: RsvpStatusFilter[]): string {
  if (statuses.length === 0) return "All statuses";
  return STATUS_FILTERS.filter((option) => statuses.includes(option.value))
    .map((option) => option.label)
    .join(", ");
}
