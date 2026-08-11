"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/lib/auth-actions";

const LINKS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/guests", label: "Guests & RSVPs" },
  { href: "/admin/seating", label: "Seating Chart" },
  { href: "/admin/registry", label: "Registry" },
  { href: "/admin/content", label: "Content & Photos" },
];

export default function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const nav = (
    <nav className="space-y-1">
      {LINKS.map((link) => {
        const active = isActive(link.href, link.exact);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className={`block border-l-2 px-4 py-2.5 text-sm transition-colors ${
              active
                ? "border-gold bg-white font-medium text-ink"
                : "border-transparent text-ink/60 hover:border-line hover:text-ink"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* ── Mobile bar ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-line bg-cream px-4 py-3 lg:hidden">
        <Link href="/admin" className="display text-xl tracking-[0.12em] text-ink">
          J <span className="text-gold">&</span> T
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="text-ink"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 7h18M3 12h18M3 17h18" />}
          </svg>
        </button>
      </div>

      {open ? (
        <div className="border-b border-line bg-cream pb-4 lg:hidden">
          {nav}
          <div className="mt-3 px-4">
            <SignOut />
          </div>
        </div>
      ) : null}

      {/* ── Desktop sidebar ────────────────────────────────────────── */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-cream lg:flex">
        <div className="border-b border-line px-6 py-6">
          <Link href="/admin" className="display text-2xl tracking-[0.12em] text-ink">
            J <span className="text-gold">&</span> T
          </Link>
          <p className="eyebrow mt-2">Dashboard</p>
        </div>

        <div className="flex-1 py-5">{nav}</div>

        <div className="space-y-3 border-t border-line px-4 py-5">
          <p className="truncate px-1 text-xs text-muted" title={email}>
            {email}
          </p>
          <SignOut />
          <Link
            href="/"
            className="block px-1 text-xs text-sage underline underline-offset-4 hover:text-gold"
          >
            View public site →
          </Link>
        </div>
      </aside>
    </>
  );
}

function SignOut() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="w-full border border-line bg-white px-3 py-2 text-xs tracking-[0.12em] text-ink/70 uppercase transition-colors hover:border-gold hover:text-ink"
      >
        Sign out
      </button>
    </form>
  );
}
