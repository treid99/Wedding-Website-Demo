"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { Photo } from "@/lib/types";

/**
 * Masonry photo collage with a lightbox.
 *
 * Layout uses CSS multi-columns so every photo keeps its own aspect ratio and
 * portraits sit alongside landscapes without cropping. The grid loads thumbs;
 * the lightbox swaps in the full-size derivative.
 */
export default function GalleryCollage({ photos }: { photos: Photo[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (delta: number) =>
      setOpenIndex((current) =>
        current === null
          ? null
          : (current + delta + photos.length) % photos.length,
      ),
    [photos.length],
  );

  useEffect(() => {
    if (openIndex === null) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };

    window.addEventListener("keydown", onKey);
    // Freeze the page behind the lightbox.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [openIndex, close, step]);

  if (photos.length === 0) {
    return (
      <p className="py-20 text-center text-sm text-muted">
        No photos selected for the gallery yet.
      </p>
    );
  }

  const active = openIndex === null ? null : photos[openIndex];

  return (
    <>
      <div className="columns-2 gap-3 sm:gap-4 lg:columns-3 xl:columns-4">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setOpenIndex(index)}
            className="group mb-3 block w-full cursor-zoom-in overflow-hidden bg-cream sm:mb-4"
            aria-label={photo.caption || `Open photo ${index + 1}`}
          >
            <span className="relative block">
              <Image
                src={photo.thumb_path}
                alt={photo.caption || `Engagement photo ${index + 1}`}
                width={photo.width}
                height={photo.height}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
              <span className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/10" />
            </span>
          </button>
        ))}
      </div>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.caption || "Photograph"}
          className="fixed inset-0 z-100 flex flex-col bg-ink/95 backdrop-blur-sm"
          onClick={close}
        >
          <div className="flex items-center justify-between px-5 py-4 text-white/70">
            <span className="text-xs tracking-[0.16em] uppercase">
              {(openIndex ?? 0) + 1} / {photos.length}
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="p-2 transition-colors hover:text-white"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-2"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous photo"
              className="absolute left-1 z-10 p-3 text-white/60 transition-colors hover:text-white sm:left-4"
            >
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>

            <Image
              key={active.id}
              src={active.full_path}
              alt={active.caption || "Engagement photo"}
              width={active.width}
              height={active.height}
              sizes="100vw"
              className="max-h-full w-auto max-w-full object-contain"
              priority
            />

            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next photo"
              className="absolute right-1 z-10 p-3 text-white/60 transition-colors hover:text-white sm:right-4"
            >
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <p className="px-6 pb-6 pt-2 text-center text-sm text-white/70">
            {active.caption || " "}
          </p>
        </div>
      )}
    </>
  );
}
