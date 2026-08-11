"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  ALL_STATUSES,
  SEATED_FILTERS,
  STATUS_FILTERS,
  buildGuestHref,
  hasActiveFilters,
  normalizeStatuses,
  statusSummary,
  type GuestQuery,
  type RsvpStatusFilter,
  type SeatedFilter,
} from "@/lib/guest-params";
import FilterDropdown, { FilterOption } from "./FilterDropdown";

const DEBOUNCE_MS = 300;

/**
 * Filter bar for the guest list and group view.
 *
 * Everything here is debounced — typing, ticking a status, changing the seating
 * filter — so there is no Search button to press and no navigation per
 * keystroke. Ticking two statuses inside the window costs one round trip.
 *
 * Text edits navigate with replace so a six-letter name doesn't leave six
 * entries in the back stack; a filter toggle inside the same window upgrades
 * the pending navigation to a push, so Back undoes "show me the declines" as a
 * user expects. Enter fires immediately rather than waiting out the timer.
 */
export default function GuestFilters({
  query,
  summary,
}: {
  query: GuestQuery;
  summary: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pushNext = useRef(false);

  /**
   * The controls own their values. They are deliberately seeded from props once
   * and never re-synced afterwards.
   *
   * Re-syncing is the obvious thing to write and it corrupts fast typing: each
   * debounced navigation re-renders this component with whatever the server
   * knew at that moment, which lags what has since been typed. Assigning that
   * back to the input makes it visibly snap to a stale value ("Demir" -> "Rao"
   * -> "Demir"), and any keystroke landing during the snap-back is applied to
   * the wrong base string, so characters are lost.
   *
   * The URL is downstream of these controls, never upstream — except on a
   * genuine history navigation, which the popstate listener below handles.
   */
  const [value, setValue] = useState(query.q);
  const [statuses, setStatuses] = useState<RsvpStatusFilter[]>(query.statuses);
  const [seated, setSeated] = useState<SeatedFilter>(query.seated);

  // Latest state, readable from inside a debounce callback without making the
  // timer depend on the render that scheduled it.
  const latest = useRef({ value, statuses, seated });
  latest.current = { value, statuses, seated };

  useEffect(() => {
    // Back/forward is the one case where the URL should drive the controls.
    // router.push/replace do not emit popstate, so our own navigations are
    // correctly ignored here.
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      setValue(params.get("q") ?? "");
      setStatuses(normalizeStatuses((params.get("status") ?? "").split(",")));
      const nextSeated = params.get("seated");
      setSeated(nextSeated === "seated" || nextSeated === "unseated" ? nextSeated : "all");
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const hrefFor = (next: {
    q: string;
    statuses: RsvpStatusFilter[];
    seated: SeatedFilter;
  }) =>
    buildGuestHref({
      ...query,
      ...next,
      // Any change to the result set invalidates the current page number: page
      // 4 of the old filter is rarely a page at all under the new one.
      page: 1,
    });

  const navigate = (
    next: { q: string; statuses: RsvpStatusFilter[]; seated: SeatedFilter },
    mode: "push" | "replace",
  ) => {
    if (timer.current) clearTimeout(timer.current);
    pushNext.current = false;

    const href = hrefFor(next);

    // Skip a redundant round trip when nothing about the query actually moved.
    // Compared against the live URL rather than against `query`, which is the
    // last *server-rendered* value: while a navigation is still in flight the
    // prop lags the address bar, and comparing to it would silently swallow the
    // next genuine navigation — Clear filters doing nothing, for instance.
    const currentHref = `${window.location.pathname}${window.location.search}`;
    if (href === currentHref) return;

    startTransition(() => {
      if (mode === "replace") router.replace(href);
      else router.push(href);
    });
  };

  /** Schedules the shared debounce; `push` sticks for the whole window. */
  const schedule = (push: boolean) => {
    if (push) pushNext.current = true;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const now = latest.current;
      navigate(
        { q: now.value, statuses: now.statuses, seated: now.seated },
        pushNext.current ? "push" : "replace",
      );
    }, DEBOUNCE_MS);
  };

  const onSearchChange = (next: string) => {
    setValue(next);
    schedule(false);
  };

  /**
   * Which boxes are ticked. An empty filter means "every status", so all three
   * render ticked — a row of empty boxes above a full list would be a lie.
   */
  const effective = statuses.length === 0 ? ALL_STATUSES : statuses;

  const toggleStatus = (status: RsvpStatusFilter, checked: boolean) => {
    setStatuses(
      normalizeStatuses(
        checked
          ? [...effective, status]
          : effective.filter((value) => value !== status),
      ),
    );
    schedule(true);
  };

  const clearAll = () => {
    setValue("");
    setStatuses([]);
    setSeated("all");
    navigate({ q: "", statuses: [], seated: "all" }, "push");
  };

  const active = hasActiveFilters({ q: value, statuses, seated });
  const seatedLabel =
    SEATED_FILTERS.find((option) => option.value === seated)?.label ?? "Everyone";

  return (
    <form
      action="/admin/guests"
      method="get"
      onSubmit={(event) => {
        // Enter in the text field: go now rather than waiting out the debounce.
        event.preventDefault();
        navigate({ q: value, statuses, seated }, "push");
      }}
      className="mt-6 border border-line bg-white px-4 py-4"
    >
      {query.view === "groups" ? (
        <input type="hidden" name="view" value="groups" />
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-56 flex-1">
          <label className="sr-only" htmlFor="guest-search">
            Search guests and groups
          </label>
          <div className="relative">
            <svg
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4.5-4.5" />
            </svg>

            <input
              id="guest-search"
              name="q"
              type="search"
              value={value}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search"
              autoComplete="off"
              className="field px-9 py-2.5"
            />

            {value ? (
              <button
                type="button"
                onClick={() => {
                  setValue("");
                  navigate({ q: "", statuses, seated }, "replace");
                }}
                aria-label="Clear search"
                className="absolute top-1/2 right-2.5 -translate-y-1/2 px-1 text-muted hover:text-ink"
              >
                ×
              </button>
            ) : null}
          </div>
        </div>

        <FilterDropdown
          label="Status"
          summary={statusSummary(statuses)}
          active={statuses.length > 0}
        >
          <FilterOption
            type="checkbox"
            checked={statuses.length === 0}
            // Already showing everything, so there is nothing for a second
            // click to do; unticking it would have to mean "show nothing".
            disabled={statuses.length === 0}
            onChange={() => {
              setStatuses([]);
              schedule(true);
            }}
          >
            All statuses
          </FilterOption>

          <span className="my-1 block border-t border-line" />

          {STATUS_FILTERS.map((option) => (
            <FilterOption
              key={option.value}
              type="checkbox"
              checked={effective.includes(option.value)}
              // Never let the last one go: an empty status filter matches no
              // guest at all, which is a dead end rather than a useful view.
              disabled={effective.length === 1 && effective.includes(option.value)}
              onChange={(checked) => toggleStatus(option.value, checked)}
            >
              {option.label}
            </FilterOption>
          ))}
        </FilterDropdown>

        <FilterDropdown
          label="Seating"
          summary={seatedLabel}
          active={seated !== "all"}
        >
          {SEATED_FILTERS.map((option) => (
            <FilterOption
              key={option.value}
              type="radio"
              name="seated-filter"
              checked={seated === option.value}
              onChange={() => {
                setSeated(option.value);
                schedule(true);
              }}
            >
              {option.label}
            </FilterOption>
          ))}
        </FilterDropdown>

        {active ? (
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1.5 border border-line px-3 py-2.5 text-xs font-medium tracking-[0.1em] text-muted uppercase transition-colors hover:border-gold hover:text-ink"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
            Clear filters
          </button>
        ) : null}
      </div>

      <p
        className={`mt-3 text-xs transition-opacity ${pending ? "text-gold" : "text-muted"}`}
        // Announced politely so the count reaches screen readers as it changes.
        aria-live="polite"
      >
        {pending ? "Searching…" : summary}
      </p>
    </form>
  );
}
