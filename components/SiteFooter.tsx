import Link from "next/link";
import { WEDDING } from "@/lib/wedding";

export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-cream">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <p className="display text-4xl tracking-[0.12em]">
            {WEDDING.brideFirst} <span className="text-gold">&</span> {WEDDING.groomFirst}
          </p>
          <div className="hairline w-40" />
          <p className="text-xs tracking-[0.2em] text-muted uppercase">
            {WEDDING.dateLong}
          </p>
          <p className="text-sm text-muted">
            {WEDDING.venue} · {WEDDING.venueLocation}
          </p>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs tracking-[0.14em] uppercase">
            <Link href="/rsvp" className="text-sage hover:text-gold">
              RSVP
            </Link>
            <Link href="/registry" className="text-sage hover:text-gold">
              Registry
            </Link>
            <Link href="/travel" className="text-sage hover:text-gold">
              Travel
            </Link>
            <Link href="/faq" className="text-sage hover:text-gold">
              Q&A
            </Link>
          </div>

          <p className="mt-4 text-xs text-muted">
            Questions? Reach us at{" "}
            <a href={`mailto:${WEDDING.contactEmail}`} className="text-sage underline decoration-gold-light underline-offset-2">
              {WEDDING.contactEmail}
            </a>
          </p>

          <p className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[0.7rem] text-muted/70">
            <span>{WEDDING.hashtag}</span>
            <span aria-hidden>·</span>
            <span>Demo site</span>
            <span aria-hidden>·</span>
            <Link href="/admin" className="underline underline-offset-2 hover:text-ink">
              Couple&apos;s dashboard
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
