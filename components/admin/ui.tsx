import Link from "next/link";

/** Shared admin chrome: page headers, cards, stat tiles, status pills. */

export function AdminHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
      <div>
        <h1 className="display text-3xl text-ink sm:text-4xl">{title}</h1>
        {subtitle ? <p className="mt-1.5 text-sm text-muted">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Card({
  title,
  description,
  actions,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`border border-line bg-white ${className}`}>
      {title ? (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h2 className="text-sm font-medium tracking-[0.08em] text-ink uppercase">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-xs text-muted">{description}</p>
            ) : null}
          </div>
          {actions}
        </header>
      ) : null}
      <div className="px-5 py-5">{children}</div>
    </section>
  );
}

export function StatTile({
  value,
  label,
  hint,
  tone = "neutral",
  href,
}: {
  value: string | number;
  label: string;
  hint?: string;
  tone?: "neutral" | "good" | "warn" | "muted";
  href?: string;
}) {
  const toneClass = {
    neutral: "text-ink",
    good: "text-sage",
    warn: "text-gold",
    muted: "text-muted",
  }[tone];

  const body = (
    <>
      <p className={`display text-4xl ${toneClass}`}>{value}</p>
      <p className="mt-1.5 text-[0.65rem] font-medium tracking-[0.16em] text-muted uppercase">
        {label}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted/80">{hint}</p> : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="border border-line bg-white px-5 py-6 transition-colors hover:border-gold"
      >
        {body}
      </Link>
    );
  }

  return <div className="border border-line bg-white px-5 py-6">{body}</div>;
}

// Green for yes, red for no, neutral for not-yet — readable at a glance from
// the colour alone, without having to stop and read every pill.
const STATUS_STYLES: Record<string, string> = {
  attending: "border-moss-line bg-moss-soft text-moss",
  pending: "border-line bg-cream text-muted",
  declined: "border-clay-line bg-clay-soft text-clay",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-block border px-2 py-0.5 text-[0.65rem] font-medium tracking-[0.1em] uppercase ${
        STATUS_STYLES[status] ?? "border-line bg-cream text-muted"
      }`}
    >
      {status}
    </span>
  );
}

/** Inline empty-state row for tables and lists. */
export function EmptyRow({
  colSpan,
  children,
}: {
  colSpan: number;
  children: React.ReactNode;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-muted">
        {children}
      </td>
    </tr>
  );
}

/** A simple horizontal bar for meal / status breakdowns. */
export function BarRow({
  label,
  value,
  total,
  suffix,
}: {
  label: string;
  value: number;
  total: number;
  suffix?: string;
}) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-ink/80">{label}</span>
        <span className="text-muted">
          {value}
          {suffix ? ` ${suffix}` : ""}
          <span className="ml-2 text-xs text-muted/70">{percent}%</span>
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full bg-cream">
        <div
          className="h-full bg-sage-light"
          style={{ width: `${percent}%` }}
          role="presentation"
        />
      </div>
    </div>
  );
}
