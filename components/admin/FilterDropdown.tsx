"use client";

import { useEffect, useId, useRef, useState } from "react";

/**
 * A labelled button that opens a small panel of checkboxes or radios.
 *
 * A native <select> can't express "attending *and* declined", and stacking
 * three loose checkboxes into the bar would crowd out the search field. This
 * keeps the bar to one control per facet while still allowing several values.
 */
export default function FilterDropdown({
  label,
  summary,
  active,
  children,
}: {
  label: string;
  /** What's currently chosen, shown on the closed button. */
  summary: string;
  /** Whether anything is filtered — drives the highlighted state. */
  active: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={wrapper} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls={id}
        className={`flex min-w-40 items-center justify-between gap-3 border bg-white px-3 py-2.5 text-sm transition-colors ${
          active
            ? "border-gold text-ink"
            : "border-line text-ink/80 hover:border-gold/60"
        }`}
      >
        <span className="truncate">
          <span className="mr-1.5 text-[0.65rem] tracking-[0.12em] text-muted uppercase">
            {label}
          </span>
          {summary}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open ? (
        <div
          id={id}
          className="absolute top-full left-0 z-30 mt-1 min-w-56 border border-line bg-white p-1.5 shadow-lg"
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

/** One row inside a FilterDropdown panel. */
export function FilterOption({
  type,
  name,
  checked,
  disabled = false,
  onChange,
  children,
}: {
  type: "checkbox" | "radio";
  name?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`flex items-center gap-2.5 px-2.5 py-2 text-sm transition-colors ${
        disabled
          ? "cursor-default text-ink/40"
          : "cursor-pointer text-ink/80 hover:bg-cream/70"
      }`}
    >
      <input
        type={type}
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="accent-sage"
      />
      {children}
    </label>
  );
}
