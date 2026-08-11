"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { formatPrice } from "@/lib/format";
import type { StoreFacet } from "@/lib/types";
import {
  PRICE_PRESETS,
  REGISTRY_SORTS,
  hasActiveFilters,
  parseRegistryParams,
  registryHref,
  type RegistryParams,
} from "@/lib/registry-params";

const AVAILABILITY_OPTIONS = [
  { value: "all", label: "Everything" },
  { value: "available", label: "Still available" },
  { value: "purchased", label: "Already purchased" },
] as const;

/**
 * Registry search, filters, sort, and the results toolbar.
 *
 * Implemented as one plain GET form so filter state lives entirely in the URL —
 * shareable, bookmarkable, back-button friendly, and it works with JavaScript
 * disabled. The client-side part is only the convenience layer: auto-submit on
 * change and a debounce on the search box.
 *
 * `children` is the server-rendered grid + pagination, nested inside the form so
 * the sort control can share it.
 */
export default function RegistryControls({
  params,
  storeFacets,
  bounds,
  resultLine,
  children,
}: {
  params: RegistryParams;
  storeFacets: StoreFacet[];
  bounds: { min: number; max: number };
  resultLine: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const submit = () => formRef.current?.requestSubmit();

  /**
   * A native GET submit would put every field in the URL, including the empty
   * ones (`?q=&min=&max=&sort=curated`). Intercepting lets us push the same
   * canonical, default-stripped URL the filter chips and pagination links use,
   * so a shared link is clean and identical however it was produced. Without
   * JavaScript the form still submits natively and everything works.
   */
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const raw: Record<string, string | string[]> = {
      q: String(data.get("q") ?? ""),
      avail: String(data.get("avail") ?? "all"),
      sort: String(data.get("sort") ?? "curated"),
      min: String(data.get("min") ?? ""),
      max: String(data.get("max") ?? ""),
      store: data.getAll("store").map(String),
    };

    // Re-parse through the same normalizer the server uses, then re-serialize.
    // Any filter change resets to page 1.
    router.push(registryHref(parseRegistryParams(raw), { page: 1 }));
  };

  const submitDebounced = () => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(submit, 400);
  };

  /** Preset chips write into the min/max inputs, then submit the form. */
  const applyPreset = (minCents: number | null, maxCents: number | null) => {
    const form = formRef.current;
    if (!form) return;
    const min = form.elements.namedItem("min") as HTMLInputElement | null;
    const max = form.elements.namedItem("max") as HTMLInputElement | null;
    if (min) min.value = minCents == null ? "" : String(minCents / 100);
    if (max) max.value = maxCents == null ? "" : String(maxCents / 100);
    submit();
  };

  const presetActive = (minCents: number | null, maxCents: number | null) =>
    params.minCents === minCents && params.maxCents === maxCents;

  const active = hasActiveFilters(params);

  const filterPanel = (
    <div className="space-y-8">
      {/* ── Search ─────────────────────────────────────────────────── */}
      <div>
        <label className="label" htmlFor="registry-search">
          Search
        </label>
        <div className="relative">
          <input
            id="registry-search"
            type="search"
            name="q"
            defaultValue={params.q}
            onChange={submitDebounced}
            placeholder="Towels, knife, lamp…"
            className="field pl-9"
          />
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
        </div>
      </div>

      {/* ── Availability ───────────────────────────────────────────── */}
      <fieldset>
        <legend className="label">Availability</legend>
        <div className="space-y-2">
          {AVAILABILITY_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-ink/80"
            >
              <input
                type="radio"
                name="avail"
                value={option.value}
                defaultChecked={params.availability === option.value}
                onChange={submit}
                className="accent-sage"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      {/* ── Store ──────────────────────────────────────────────────── */}
      <fieldset>
        <legend className="label">Store</legend>
        <div className="space-y-2">
          {storeFacets.map((facet) => (
            <label
              key={facet.store}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-ink/80"
            >
              <input
                type="checkbox"
                name="store"
                value={facet.store}
                defaultChecked={params.stores.includes(facet.store)}
                onChange={submit}
                className="accent-sage"
              />
              <span className="flex-1">{facet.store}</span>
              <span className="text-xs text-muted">{facet.count}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* ── Price ──────────────────────────────────────────────────── */}
      <fieldset>
        <legend className="label">Price range</legend>

        <div className="mb-3 flex flex-wrap gap-1.5">
          {PRICE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset.minCents, preset.maxCents)}
              className={`border px-2.5 py-1 text-[0.7rem] tracking-wide transition-colors ${
                presetActive(preset.minCents, preset.maxCents)
                  ? "border-sage bg-sage text-ivory"
                  : "border-line bg-white text-ink/70 hover:border-gold"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted">
              $
            </span>
            <input
              type="number"
              name="min"
              min={0}
              step={1}
              inputMode="numeric"
              defaultValue={params.minCents == null ? "" : params.minCents / 100}
              onChange={submitDebounced}
              placeholder={String(Math.floor(bounds.min / 100))}
              aria-label="Minimum price in dollars"
              className="field pl-6"
            />
          </div>
          <span className="text-muted">–</span>
          <div className="relative flex-1">
            <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted">
              $
            </span>
            <input
              type="number"
              name="max"
              min={0}
              step={1}
              inputMode="numeric"
              defaultValue={params.maxCents == null ? "" : params.maxCents / 100}
              onChange={submitDebounced}
              placeholder={String(Math.ceil(bounds.max / 100))}
              aria-label="Maximum price in dollars"
              className="field pl-6"
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-muted">
          Registry spans {formatPrice(bounds.min)} – {formatPrice(bounds.max)}
        </p>
      </fieldset>

      {/* Fallback for no-JS: every control above auto-submits, but this is the
          explicit escape hatch. */}
      <div className="flex flex-col gap-2">
        <button type="submit" className="btn btn-primary w-full">
          Apply filters
        </button>
        {active ? (
          <Link
            href="/registry"
            className="text-center text-xs tracking-[0.12em] text-muted uppercase underline underline-offset-4 hover:text-ink"
          >
            Clear all
          </Link>
        ) : null}
      </div>
    </div>
  );

  return (
    <form ref={formRef} action="/registry" method="get" onSubmit={onSubmit}>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-4 lg:gap-12">
        {/* ── Sidebar ────────────────────────────────────────────────── */}
        <aside className="lg:col-span-1">
          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            className="flex w-full items-center justify-between border border-line bg-white px-4 py-3 text-xs tracking-[0.14em] uppercase lg:hidden"
          >
            <span>Search &amp; filters</span>
            <span className="flex items-center gap-2">
              {active ? (
                <span className="rounded-full bg-sage px-2 py-0.5 text-[0.65rem] text-ivory">
                  on
                </span>
              ) : null}
              <span className={filtersOpen ? "rotate-180" : ""} aria-hidden>
                ▾
              </span>
            </span>
          </button>

          <div
            className={`${filtersOpen ? "block" : "hidden"} mt-4 border border-line bg-white p-5 lg:mt-0 lg:block lg:border-0 lg:bg-transparent lg:p-0`}
          >
            {filterPanel}
          </div>
        </aside>

        {/* ── Results ───────────────────────────────────────────────── */}
        <div className="lg:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
            <p className="text-sm text-muted">{resultLine}</p>

            <label className="flex items-center gap-2.5">
              <span className="text-xs tracking-[0.12em] text-muted uppercase">
                Sort
              </span>
              <select
                name="sort"
                defaultValue={params.sort}
                onChange={submit}
                className="field w-auto py-1.5 text-xs"
              >
                {Object.entries(REGISTRY_SORTS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Active filter chips — each removes just its own filter */}
          {active ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {params.q.trim() ? (
                <Chip href={registryHref(params, { q: "", page: 1 })}>
                  “{params.q.trim()}”
                </Chip>
              ) : null}

              {params.stores.map((store) => (
                <Chip
                  key={store}
                  href={registryHref(params, {
                    stores: params.stores.filter((s) => s !== store),
                    page: 1,
                  })}
                >
                  {store}
                </Chip>
              ))}

              {params.minCents != null || params.maxCents != null ? (
                <Chip
                  href={registryHref(params, {
                    minCents: null,
                    maxCents: null,
                    page: 1,
                  })}
                >
                  {params.minCents != null ? formatPrice(params.minCents) : "Any"} –{" "}
                  {params.maxCents != null ? formatPrice(params.maxCents) : "Any"}
                </Chip>
              ) : null}

              {params.availability !== "all" ? (
                <Chip
                  href={registryHref(params, { availability: "all", page: 1 })}
                >
                  {params.availability === "available"
                    ? "Still available"
                    : "Already purchased"}
                </Chip>
              ) : null}

              {params.sort !== "curated" ? (
                <Chip href={registryHref(params, { sort: "curated", page: 1 })}>
                  {REGISTRY_SORTS[params.sort]}
                </Chip>
              ) : null}

              <Link
                href="/registry"
                className="ml-1 text-xs tracking-[0.12em] text-muted uppercase underline underline-offset-4 hover:text-ink"
              >
                Clear all
              </Link>
            </div>
          ) : null}

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </form>
  );
}

function Chip({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 border border-line bg-cream px-2.5 py-1 text-xs text-ink/75 transition-colors hover:border-gold"
    >
      {children}
      <span className="text-muted transition-colors group-hover:text-gold" aria-hidden>
        ×
      </span>
      <span className="sr-only">Remove filter</span>
    </Link>
  );
}
