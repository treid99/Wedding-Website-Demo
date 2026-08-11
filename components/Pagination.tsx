import Link from "next/link";

/**
 * Numbered pagination with prev/next.
 *
 * Collapses to first / neighbours / last with ellipses once there are more than
 * seven pages, so the control stays a single line on mobile.
 */
export default function Pagination({
  page,
  pageCount,
  hrefFor,
}: {
  page: number;
  pageCount: number;
  hrefFor: (page: number) => string;
}) {
  if (pageCount <= 1) return null;

  const pages: (number | "gap")[] = [];
  const window = 1;

  for (let i = 1; i <= pageCount; i++) {
    const isEdge = i === 1 || i === pageCount;
    const isNear = Math.abs(i - page) <= window;

    if (isEdge || isNear) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "gap") {
      pages.push("gap");
    }
  }

  return (
    <nav
      aria-label="Registry pagination"
      className="mt-12 flex items-center justify-center gap-1.5"
    >
      {page > 1 ? (
        <Link
          href={hrefFor(page - 1)}
          rel="prev"
          className="flex h-9 items-center border border-line bg-white px-3 text-xs tracking-[0.1em] text-ink/70 uppercase transition-colors hover:border-gold hover:text-ink"
        >
          ← Prev
        </Link>
      ) : (
        <span className="flex h-9 items-center border border-line/60 px-3 text-xs tracking-[0.1em] text-muted/50 uppercase">
          ← Prev
        </span>
      )}

      {pages.map((entry, index) =>
        entry === "gap" ? (
          <span
            key={`gap-${index}`}
            className="flex h-9 w-6 items-center justify-center text-xs text-muted"
            aria-hidden
          >
            …
          </span>
        ) : entry === page ? (
          <span
            key={entry}
            aria-current="page"
            className="flex h-9 w-9 items-center justify-center border border-sage bg-sage text-xs text-ivory"
          >
            {entry}
          </span>
        ) : (
          <Link
            key={entry}
            href={hrefFor(entry)}
            className="flex h-9 w-9 items-center justify-center border border-line bg-white text-xs text-ink/70 transition-colors hover:border-gold hover:text-ink"
          >
            {entry}
          </Link>
        ),
      )}

      {page < pageCount ? (
        <Link
          href={hrefFor(page + 1)}
          rel="next"
          className="flex h-9 items-center border border-line bg-white px-3 text-xs tracking-[0.1em] text-ink/70 uppercase transition-colors hover:border-gold hover:text-ink"
        >
          Next →
        </Link>
      ) : (
        <span className="flex h-9 items-center border border-line/60 px-3 text-xs tracking-[0.1em] text-muted/50 uppercase">
          Next →
        </span>
      )}
    </nav>
  );
}
