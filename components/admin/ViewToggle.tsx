import Link from "next/link";

/**
 * Two-position switch between the flat guest list and the group view.
 *
 * Rendered as links rather than a control with state, so the current view stays
 * in the URL and is shareable, and so the active filters ride along in the
 * hrefs the page builds.
 */
export default function ViewToggle({
  view,
  listHref,
  groupsHref,
}: {
  view: "list" | "groups";
  listHref: string;
  groupsHref: string;
}) {
  const options = [
    { key: "list" as const, label: "Guest list", href: listHref },
    { key: "groups" as const, label: "Groups", href: groupsHref },
  ];

  return (
    <div
      role="group"
      aria-label="Choose a view"
      className="relative inline-flex border border-line bg-cream p-0.5"
    >
      {/* Sliding indicator — the thing that makes it read as a switch. */}
      <span
        aria-hidden
        className="absolute inset-y-0.5 w-[calc(50%-0.125rem)] border border-gold/40 bg-white shadow-sm transition-transform duration-200 ease-out"
        style={{
          transform: view === "groups" ? "translateX(100%)" : "translateX(0)",
        }}
      />

      {options.map((option) => {
        const active = view === option.key;
        return (
          <Link
            key={option.key}
            href={option.href}
            aria-current={active ? "true" : undefined}
            className={`relative z-10 min-w-28 px-4 py-2 text-center text-xs font-medium tracking-[0.12em] uppercase transition-colors ${
              active ? "text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
