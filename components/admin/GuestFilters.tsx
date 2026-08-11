"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import type { GuestFilters as Filters } from "@/lib/queries";

const DEBOUNCE_MS = 300;

type Status = NonNullable<Filters["status"]>;
type Seated = NonNullable<Filters["seated"]>;

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "attending", label: "Attending" },
  { value: "pending", label: "Pending" },
  { value: "declined", label: "Declined" },
];

const SEATED_OPTIONS: { value: Seated; label: string }[] = [
  { value: "all", label: "Everyone" },
  { value: "seated", label: "Seated" },
  { value: "unseated", label: "Not seated" },
];

/**
 * Filter bar for the guest list and group view.
 *
 * Typing searches on its own once you pause; Enter and the Search button fire
 * immediately without waiting. Debounced keystrokes use router.replace so a
 * six-letter name doesn't leave six entries in the back stack, while explicit
 * submits and dropdown changes push, so Back undoes them as a user expects.
 *
 * The form still has a real action/method, so it degrades to a plain GET form
 * when JavaScript is unavailable.
 */
export default function GuestFilters({
  view,
  q,
  status,
  seated,
  summary,
}: {
  view: "list" | "groups";
  q: string;
  status: Status;
  seated: Seated;
  summary: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * The text box owns its own value. It is deliberately seeded from `q` once and
   * never re-synced from props afterwards.
   *
   * Re-syncing is the obvious thing to write and it corrupts fast typing: each
   * debounced navigation re-renders this component with whatever `q` the server
   * knew at that moment, which lags what has since been typed. Assigning that
   * back to the input makes it visibly snap to a stale value ("Demir" -> "Rao"
   * -> "Demir"), and any keystroke landing during the snap-back is applied to
   * the wrong base string, so characters are lost.
   *
   * The URL is downstream of this input, never upstream — except on a genuine
   * history navigation, which the popstate listener below handles.
   */
  const [value, setValue] = useState(q);

  // Latest filter state, readable from inside a debounce callback without
  // making the timer depend on the render that scheduled it.
  const latest = useRef({ value, status, seated });
  latest.current = { value, status, seated };

  useEffect(() => {
    // Back/forward is the one case where the URL should drive the input.
    // router.push/replace do not emit popstate, so our own navigations are
    // correctly ignored here.
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      setValue(params.get("q") ?? "");
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const hrefFor = (next: { q: string; status: Status; seated: Seated }) => {
    const params = new URLSearchParams();
    if (view === "groups") params.set("view", "groups");
    if (next.q.trim()) params.set("q", next.q.trim());
    if (next.status !== "all") params.set("status", next.status);
    if (next.seated !== "all") params.set("seated", next.seated);
    const query = params.toString();
    return `/admin/guests${query ? `?${query}` : ""}`;
  };

  const navigate = (
    next: { q: string; status: Status; seated: Seated },
    mode: "push" | "replace",
  ) => {
    if (timer.current) clearTimeout(timer.current);
    const href = hrefFor(next);

    // Skip a redundant round trip when nothing about the query actually moved.
    if (href === hrefFor({ q, status, seated })) return;

    startTransition(() => {
      if (mode === "replace") router.replace(href);
      else router.push(href);
    });
  };

  const onSearchChange = (next: string) => {
    setValue(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const now = latest.current;
      navigate({ q: now.value, status: now.status, seated: now.seated }, "replace");
    }, DEBOUNCE_MS);
  };

  // Covers both the Search button and Enter in the text field.
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate({ q: value, status, seated }, "push");
  };

  const hasFilters = Boolean(value.trim() || status !== "all" || seated !== "all");

  return (
    <form
      action="/admin/guests"
      method="get"
      onSubmit={onSubmit}
      className="mt-6 border border-line bg-white px-4 py-4"
    >
      {view === "groups" ? <input type="hidden" name="view" value="groups" /> : null}

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-52 flex-1">
          <label className="label" htmlFor="guest-search">
            Search name or group
          </label>
          <div className="relative">
            <svg
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
              width="14"
              height="14"
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
              placeholder="Daniel, Rao, Okonkwo…"
              autoComplete="off"
              className="field px-9"
            />

            {value ? (
              <button
                type="button"
                onClick={() => {
                  setValue("");
                  navigate({ q: "", status, seated }, "replace");
                }}
                aria-label="Clear search"
                className="absolute top-1/2 right-2.5 -translate-y-1/2 px-1 text-muted hover:text-ink"
              >
                ×
              </button>
            ) : null}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="guest-status">
            Status
          </label>
          <select
            id="guest-status"
            name="status"
            value={status}
            onChange={(event) =>
              navigate(
                { q: value, status: event.target.value as Status, seated },
                "push",
              )
            }
            className="field w-auto"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="guest-seated">
            Seating
          </label>
          <select
            id="guest-seated"
            name="seated"
            value={seated}
            onChange={(event) =>
              navigate(
                { q: value, status, seated: event.target.value as Seated },
                "push",
              )
            }
            className="field w-auto"
          >
            {SEATED_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-primary !px-5 !py-2.5">
          Search
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        <span
          className={`transition-opacity ${pending ? "text-gold" : "text-muted"}`}
          // Announced politely so the count reaches screen readers as it changes.
          aria-live="polite"
        >
          {pending ? "Searching…" : summary}
        </span>

        {hasFilters ? (
          <button
            type="button"
            onClick={() => {
              setValue("");
              navigate({ q: "", status: "all", seated: "all" }, "push");
            }}
            className="tracking-[0.1em] text-muted uppercase underline underline-offset-4 hover:text-ink"
          >
            Clear filters
          </button>
        ) : null}
      </div>
    </form>
  );
}
