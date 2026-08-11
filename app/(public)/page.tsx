import Image from "next/image";
import Link from "next/link";
import Carousel from "@/components/Carousel";
import Countdown from "@/components/Countdown";
import { Prose, SectionHeading } from "@/components/Section";
import { getAccentPhotos, getBlock, getCarouselPhotos } from "@/lib/queries";
import { WEDDING } from "@/lib/wedding";

const QUICK_LINKS = [
  {
    href: "/travel",
    label: "Travel & Stay",
    detail: "Directions, hotels, and the shuttle",
  },
  {
    href: "/schedule",
    label: "The Weekend",
    detail: "Three days, start to finish",
  },
  {
    href: "/registry",
    label: "Registry",
    detail: "Only if you'd like to",
  },
];

export default function HomePage() {
  const carouselPhotos = getCarouselPhotos();
  const welcome = getBlock("home_welcome");
  const accents = getAccentPhotos(3);

  return (
    <>
      <Carousel photos={carouselPhotos}>
        <div className="animate-fade-up">
          <p className="text-[0.7rem] tracking-[0.35em] text-white/80 uppercase">
            We&apos;re getting married
          </p>

          <h1 className="display mt-6 text-6xl leading-none tracking-[0.06em] sm:text-8xl lg:text-[7.5rem]">
            {WEDDING.brideFirst}
            <span className="mx-3 font-light text-white/70 italic sm:mx-5">&</span>
            {WEDDING.groomFirst}
          </h1>

          <div className="mx-auto mt-8 flex max-w-md items-center gap-5">
            <span className="h-px flex-1 bg-white/40" />
            <span className="text-xs tracking-[0.28em] whitespace-nowrap uppercase">
              {WEDDING.dateShort}
            </span>
            <span className="h-px flex-1 bg-white/40" />
          </div>

          <p className="mt-6 text-sm tracking-[0.14em] text-white/90 uppercase">
            {WEDDING.venue}
          </p>
          <p className="mt-1.5 text-sm text-white/75">{WEDDING.venueLocation}</p>

          <Link
            href="/rsvp"
            className="btn mt-10 border border-white/70 text-white hover:bg-white hover:text-ink"
          >
            RSVP by {WEDDING.rsvpDeadline}
          </Link>
        </div>
      </Carousel>

      {/* ── Countdown ─────────────────────────────────────────────────── */}
      <section className="border-b border-line bg-cream py-16">
        <div className="mx-auto max-w-4xl px-5 text-center lg:px-8">
          <p className="eyebrow">Until we say I do</p>
          <div className="mt-8">
            <Countdown targetIso={WEDDING.date.toISOString()} />
          </div>
        </div>
      </section>

      {/* ── Welcome note ──────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <SectionHeading eyebrow={welcome?.eyebrow} title={welcome?.title} />
          {welcome ? (
            <Prose body={welcome.body} className="mt-9" />
          ) : null}
          <p className="display mt-10 text-center text-3xl text-gold">
            {WEDDING.brideFirst} &amp; {WEDDING.groomFirst}
          </p>
        </div>
      </section>

      {/* ── Photo triptych ───────────────────────────────────────────────── */}
      {accents.length === 3 && (
        <section className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {accents.map((photo) => (
              <Link
                key={photo.id}
                href="/gallery"
                className="group relative block aspect-[3/4] overflow-hidden bg-cream"
              >
                <Image
                  src={photo.thumb_path}
                  alt={photo.caption || "Engagement photo"}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-ink/10 transition-colors group-hover:bg-ink/25" />
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/gallery"
              className="text-xs tracking-[0.18em] text-sage uppercase underline decoration-gold-light underline-offset-4 hover:text-gold"
            >
              See the whole gallery
            </Link>
          </div>
        </section>
      )}

      {/* ── Quick links ───────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <div className="grid grid-cols-1 gap-px overflow-hidden border border-line bg-line sm:grid-cols-3">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group bg-ivory px-8 py-12 text-center transition-colors hover:bg-cream"
              >
                <h3 className="display text-2xl text-ink">{link.label}</h3>
                <p className="mt-3 text-sm text-muted">{link.detail}</p>
                <span className="mt-5 inline-block text-xs tracking-[0.18em] text-gold uppercase">
                  View
                  <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
