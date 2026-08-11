/**
 * The admin icon set, inline so there's no sprite to load and no icon package.
 *
 * Deliberately not a client module: these are plain stateless elements, so they
 * can be rendered from server and client components alike.
 */

type IconProps = { size?: number; className?: string };

function Icon({
  size = 16,
  className = "",
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function PencilIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 20h4L20 8l-4-4L4 16v4Z" />
      <path d="M14 6l4 4" />
    </Icon>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
      <path d="M10 11v6M14 11v6" />
    </Icon>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Icon>
  );
}

export function WarningIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3l9 16H3l9-16Z" />
      <path d="M12 9v5" />
      <path d="M12 17h.01" />
    </Icon>
  );
}

/**
 * A square icon-only button.
 *
 * `label` is mandatory and becomes both the accessible name and the tooltip —
 * an icon with no text is unusable without it.
 */
export function IconButton({
  label,
  onClick,
  tone = "neutral",
  children,
}: {
  label: string;
  onClick?: () => void;
  tone?: "neutral" | "danger";
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "danger"
      ? "text-muted hover:border-clay hover:text-clay"
      : "text-muted hover:border-gold hover:text-ink";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`inline-flex h-8 w-8 items-center justify-center border border-line bg-white transition-colors ${toneClass}`}
    >
      {children}
    </button>
  );
}
