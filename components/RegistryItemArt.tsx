/**
 * Placeholder artwork for a registry item.
 *
 * The photo library on this site is the couple's engagement session, not product
 * photography, so using it for a Dutch oven would read as a mistake. Instead each
 * item gets a category glyph on a tinted ground — deliberate, consistent, and it
 * keeps the grid legible. If an item has an `image_slug` the real photo wins
 * (the admin registry editor can set one).
 */

type CategoryArt = { glyph: React.ReactNode; from: string; to: string };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.15,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const CATEGORIES: Record<string, CategoryArt> = {
  kitchen: {
    // Lidded pot
    glyph: (
      <g {...stroke}>
        <path d="M8 15h32v14a5 5 0 0 1-5 5H13a5 5 0 0 1-5-5V15Z" />
        <path d="M5 15h38M18 11h12M24 8v3" />
        <path d="M8 22H4M40 22h4" />
      </g>
    ),
    from: "#f0eadf",
    to: "#e2d6c2",
  },
  dining: {
    // Plate with fork and knife
    glyph: (
      <g {...stroke}>
        <circle cx="24" cy="24" r="13" />
        <circle cx="24" cy="24" r="8.5" />
        <path d="M7 11v9a2.5 2.5 0 0 0 5 0v-9M9.5 11v9M41 11c-2 3-2 6 0 9v17" />
      </g>
    ),
    from: "#efe9e0",
    to: "#ddd2c0",
  },
  glassware: {
    // Wine glass pair
    glyph: (
      <g {...stroke}>
        <path d="M13 8h12l-1.5 11a4.5 4.5 0 0 1-9 0L13 8ZM19 27v11M14 40h10" />
        <path d="M28 14h12l-1.5 9a4.5 4.5 0 0 1-9 0L28 14ZM34 31v7M30 40h8" />
      </g>
    ),
    from: "#eae9e4",
    to: "#d4d6cd",
  },
  bedding: {
    // Bed
    glyph: (
      <g {...stroke}>
        <path d="M5 34V17M43 34V25a4 4 0 0 0-4-4H21v13M5 27h38M5 34h38M8 38v-4M40 38v-4" />
        <path d="M9 21h8a3 3 0 0 1 0 6H9a3 3 0 0 1 0-6Z" />
      </g>
    ),
    from: "#eeeae3",
    to: "#dbd4c6",
  },
  bath: {
    // Folded towels
    glyph: (
      <g {...stroke}>
        <rect x="7" y="12" width="34" height="11" rx="4" />
        <rect x="7" y="25" width="34" height="11" rx="4" />
        <path d="M18 12v11M18 25v11" />
      </g>
    ),
    from: "#e8ece9",
    to: "#d2dad3",
  },
  decor: {
    // Vase with stems
    glyph: (
      <g {...stroke}>
        <path d="M18 20h12l2 12a6 6 0 0 1-6 7h-4a6 6 0 0 1-6-7l2-12Z" />
        <path d="M24 20V9M24 13c-3-2-5-4-5-7M24 13c3-2 5-4 5-7" />
        <path d="M16 26h16" />
      </g>
    ),
    from: "#efe8e5",
    to: "#ddcfc9",
  },
  furniture: {
    // Armchair
    glyph: (
      <g {...stroke}>
        <path d="M11 20v-4a4 4 0 0 1 4-4h18a4 4 0 0 1 4 4v4" />
        <path d="M11 20a4 4 0 0 0 0 8v6h26v-6a4 4 0 0 0 0-8" />
        <path d="M11 28h26M14 34v5M34 34v5" />
      </g>
    ),
    from: "#ece7e0",
    to: "#d8cebe",
  },
  outdoor: {
    // Sun over hills
    glyph: (
      <g {...stroke}>
        <circle cx="24" cy="19" r="7" />
        <path d="M24 6v3M24 29v3M11 19H8M40 19h-3M15 10l-2-2M35 10l2-2M15 28l-2 2M35 28l2 2" />
        <path d="M5 40c5-6 9-6 12-2 3-5 8-5 11 0 3-4 8-4 15 2" />
      </g>
    ),
    from: "#e9ece5",
    to: "#d3d9c8",
  },
  home: {
    // House
    glyph: (
      <g {...stroke}>
        <path d="M7 22 24 8l17 14" />
        <path d="M11 22v18h26V22" />
        <path d="M20 40V29h8v11" />
      </g>
    ),
    from: "#ebe9e4",
    to: "#d6d3c8",
  },
};

const FALLBACK = CATEGORIES.home;

export default function RegistryItemArt({
  category,
  title,
  className = "",
}: {
  category: string;
  title: string;
  className?: string;
}) {
  const art = CATEGORIES[category] ?? FALLBACK;
  const gradientId = `art-${category}`;

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label={`${title} — ${category}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={art.from} />
          <stop offset="100%" stopColor={art.to} />
        </linearGradient>
      </defs>

      <rect width="100" height="100" fill={`url(#${gradientId})`} />

      {/* Thin inset frame, echoing the site's hairline rules */}
      <rect
        x="8"
        y="8"
        width="84"
        height="84"
        fill="none"
        stroke="#b08d57"
        strokeOpacity="0.28"
        strokeWidth="0.6"
      />

      <g transform="translate(26 26) scale(1)" color="#6b7a63" opacity="0.75">
        {art.glyph}
      </g>

      {/* SVG <text> ignores CSS text-transform, so uppercase the string itself. */}
      <text
        x="50"
        y="86"
        textAnchor="middle"
        fontSize="4.2"
        letterSpacing="1.3"
        fill="#2f2c28"
        fillOpacity="0.4"
      >
        {category.toUpperCase()}
      </text>
    </svg>
  );
}
