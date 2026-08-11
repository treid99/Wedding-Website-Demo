"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Photo } from "@/lib/types";

const INTERVAL_MS = 5500;

/**
 * Full-bleed crossfading hero carousel.
 *
 * Every slide is mounted and stacked; only opacity changes, which keeps the
 * transition smooth and avoids re-decoding images on each advance. Autoplay
 * pauses on hover/focus and is disabled entirely under prefers-reduced-motion.
 */
export default function Carousel({
  photos,
  children,
}: {
  photos: Photo[];
  children?: React.ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const count = photos.length;

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = () => setReducedMotion(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || count <= 1) return;
    timer.current = setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, reducedMotion, count]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  if (count === 0) {
    return (
      <section className="relative flex min-h-[70vh] items-center justify-center bg-cream">
        <div className="px-6 text-center">
          {children}
          <p className="mt-8 text-xs tracking-[0.14em] text-muted uppercase">
            No carousel photos selected — pick some in the admin content editor
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative -mt-[73px] h-[100svh] min-h-[560px] w-full overflow-hidden bg-ink"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Engagement photographs"
    >
      {photos.map((photo, i) => (
        <div
          key={photo.id}
          className="absolute inset-0 transition-opacity duration-[1400ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ opacity: i === index ? 1 : 0 }}
          aria-hidden={i !== index}
        >
          <Image
            src={photo.full_path}
            alt={photo.caption || "Jenna and Tom"}
            fill
            sizes="100vw"
            priority={i === 0}
            className="object-cover"
            style={{
              // A very slow drift keeps a static photo from feeling like a poster.
              animation:
                i === index ? "hero-drift 14s ease-out both" : undefined,
            }}
          />
        </div>
      ))}

      {/* Legibility scrim — darker at the edges, lighter through the middle */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/45 via-ink/20 to-ink/55" />

      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center text-white">
        {children}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous photo"
            className="absolute top-1/2 left-3 z-10 -translate-y-1/2 p-3 text-white/70 transition-colors hover:text-white sm:left-6"
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next photo"
            className="absolute top-1/2 right-3 z-10 -translate-y-1/2 p-3 text-white/70 transition-colors hover:text-white sm:right-6"
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2.5">
            {photos.map((photo, i) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to photo ${i + 1} of ${count}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? "w-8 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}

      <style>{`
        @keyframes hero-drift {
          from { transform: scale(1.06); }
          to   { transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes hero-drift { from { transform: none; } to { transform: none; } }
        }
      `}</style>
    </section>
  );
}
