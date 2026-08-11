"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { WEDDING } from "@/lib/wedding";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/story", label: "Our Story" },
  { href: "/gallery", label: "Gallery" },
  { href: "/travel", label: "Travel" },
  { href: "/schedule", label: "Schedule" },
  { href: "/faq", label: "Q&A" },
  { href: "/registry", label: "Registry" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  // On the home page the header floats over the hero carousel until you scroll.
  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  const transparent = isHome && !scrolled && !open;

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        transparent
          ? "bg-transparent"
          : "border-b border-line bg-ivory/95 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link
          href="/"
          className={`display text-2xl tracking-[0.14em] transition-colors ${
            transparent ? "text-white drop-shadow-sm" : "text-ink"
          }`}
        >
          J <span className="text-gold">&</span> T
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[0.7rem] font-medium tracking-[0.16em] uppercase transition-colors ${
                  transparent
                    ? "text-white/90 drop-shadow-sm hover:text-white"
                    : active
                      ? "text-gold"
                      : "text-muted hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/rsvp"
            className={`btn ${transparent ? "border border-white/70 text-white hover:bg-white hover:text-ink" : "btn-primary"} !px-6 !py-2.5`}
          >
            RSVP
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className={`lg:hidden ${transparent ? "text-white" : "text-ink"}`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M3 7h18M3 12h18M3 17h18" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-ivory lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-5 py-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-b border-line/60 py-3 text-xs font-medium tracking-[0.16em] text-ink uppercase last:border-0"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/rsvp" className="btn btn-primary my-3">
              RSVP
            </Link>
            <p className="pb-3 text-center text-[0.7rem] text-muted">
              {WEDDING.dateShort} · {WEDDING.venueLocation}
            </p>
          </nav>
        </div>
      )}
    </header>
  );
}
