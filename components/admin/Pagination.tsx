"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * Page controls for the guest list and the group view.
 *
 * Every href is precomputed by the page rather than built here: URL assembly
 * for this screen lives in lib/guest-params so the filter bar, the view toggle
 * and these controls can't disagree about which params survive a page change.
 */
export default function Pagination({
  page,
  pageCount,
  from,
  to,
  total,
  noun,
  perPage,
  perOptions,
  prevHref,
  nextHref,
  hint,
}: {
  page: number;
  pageCount: number;
  from: number;
  to: number;
  total: number;
  /** Plural noun for the count line, e.g. "guests". */
  noun: string;
  perPage: number;
  perOptions: { value: number; href: string }[];
  prevHref: string | null;
  nextHref: string | null;
  /** Optional aside shown next to the count, e.g. "click any row to edit". */
  hint?: string;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-line bg-cream/40 px-4 py-3">
      <p className="text-xs text-muted">
        {total === 0 ? `No ${noun}` : `Showing ${from}–${to} of ${total} ${noun}`}
        {hint ? <span className="text-muted/70"> · {hint}</span> : null}
      </p>

      <div className="ml-auto flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-xs text-muted">
          <span className="tracking-[0.1em] uppercase">Per page</span>
          <select
            aria-label="Rows per page"
            value={perPage}
            onChange={(event) => {
              const next = perOptions.find(
                (option) => option.value === Number(event.target.value),
              );
              if (next) router.push(next.href);
            }}
            className="border border-line bg-white px-2 py-1 text-xs text-ink"
          >
            {perOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.value}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-2">
          <PageLink href={prevHref} label="Previous page">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="m15 18-6-6 6-6" />
            </svg>
            Prev
          </PageLink>

          <span className="px-1 text-xs whitespace-nowrap text-muted">
            {page} / {pageCount}
          </span>

          <PageLink href={nextHref} label="Next page">
            Next
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="m9 18 6-6-6-6" />
            </svg>
          </PageLink>
        </div>
      </div>
    </div>
  );
}

/**
 * A page step. Renders as a disabled <span> at either end rather than a link
 * to nowhere, so keyboard and screen-reader users don't land on a dead control.
 */
function PageLink({
  href,
  label,
  children,
}: {
  href: string | null;
  label: string;
  children: React.ReactNode;
}) {
  const shared =
    "inline-flex items-center gap-1 border px-2.5 py-1.5 text-xs font-medium tracking-[0.08em] uppercase";

  if (!href) {
    return (
      <span
        aria-disabled
        className={`${shared} border-line/70 text-muted/40`}
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className={`${shared} border-line bg-white text-ink/80 transition-colors hover:border-gold hover:text-ink`}
    >
      {children}
    </Link>
  );
}
