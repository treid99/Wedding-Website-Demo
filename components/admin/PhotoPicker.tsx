"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { updatePhoto } from "@/lib/admin-actions";
import type { Photo } from "@/lib/types";

type Filter = "all" | "gallery" | "carousel" | "unused";

/**
 * Picks which photos appear in the gallery collage and the home carousel, and
 * edits their captions.
 *
 * Toggles apply optimistically and call the server per photo. The server rejects
 * a portrait in the carousel (the hero is a wide crop), so that failure is
 * surfaced rather than silently swallowed.
 */
export default function PhotoPicker({ photos }: { photos: Photo[] }) {
  const [items, setItems] = useState(photos);
  const [filter, setFilter] = useState<Filter>("all");
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Adopt fresh server data after a revalidation.
  const signature = photos
    .map((p) => `${p.id}:${p.in_gallery}${p.in_carousel}:${p.caption}`)
    .join("|");
  const [seenSignature, setSeenSignature] = useState(signature);
  if (seenSignature !== signature) {
    setSeenSignature(signature);
    setItems(photos);
  }

  const galleryCount = items.filter((p) => p.in_gallery === 1).length;
  const carouselCount = items.filter((p) => p.in_carousel === 1).length;

  const patch = (id: number, changes: Partial<Photo>) =>
    setItems((current) =>
      current.map((photo) => (photo.id === id ? { ...photo, ...changes } : photo)),
    );

  const toggle = (photo: Photo, field: "in_gallery" | "in_carousel") => {
    setError(null);
    const next = photo[field] === 1 ? 0 : 1;
    patch(photo.id, { [field]: next } as Partial<Photo>);

    startTransition(async () => {
      const result = await updatePhoto(photo.id, {
        [field === "in_gallery" ? "in_gallery" : "in_carousel"]: next === 1,
      });
      if (!result.ok) {
        setError(result.error ?? "Could not update that photo.");
        patch(photo.id, { [field]: photo[field] } as Partial<Photo>);
      }
    });
  };

  const saveCaption = (photo: Photo, caption: string) => {
    if (caption === photo.caption) return;
    patch(photo.id, { caption });
    startTransition(async () => {
      await updatePhoto(photo.id, { caption });
    });
  };

  const visible = items.filter((photo) => {
    if (filter === "gallery") return photo.in_gallery === 1;
    if (filter === "carousel") return photo.in_carousel === 1;
    if (filter === "unused") return photo.in_gallery === 0 && photo.in_carousel === 0;
    return true;
  });

  const FILTERS: { value: Filter; label: string; count: number }[] = [
    { value: "all", label: "All photos", count: items.length },
    { value: "gallery", label: "In gallery", count: galleryCount },
    { value: "carousel", label: "In carousel", count: carouselCount },
    {
      value: "unused",
      label: "Unused",
      count: items.filter((p) => p.in_gallery === 0 && p.in_carousel === 0).length,
    },
  ];

  return (
    <div>
      {error ? (
        <p
          role="alert"
          className="mb-4 flex items-start justify-between gap-4 border-l-2 border-gold bg-cream px-4 py-3 text-sm text-ink"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="Dismiss"
            className="shrink-0 text-muted hover:text-ink"
          >
            ×
          </button>
        </p>
      ) : null}

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFilter(option.value)}
            className={`border px-3 py-1.5 text-xs tracking-[0.1em] uppercase transition-colors ${
              filter === option.value
                ? "border-sage bg-sage text-ivory"
                : "border-line bg-white text-ink/70 hover:border-gold"
            }`}
          >
            {option.label}
            <span className="ml-1.5 opacity-70">{option.count}</span>
          </button>
        ))}
      </div>

      <p className="mb-5 text-xs leading-relaxed text-muted">
        The gallery page shows every photo marked <strong>Gallery</strong>; the
        home hero rotates every photo marked <strong>Carousel</strong>. Only
        landscape photos can go in the carousel.
      </p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {visible.map((photo) => (
          <div key={photo.id} className="border border-line bg-white">
            <div className="relative aspect-[4/3] overflow-hidden bg-cream">
              <Image
                src={photo.thumb_path}
                alt={photo.caption || photo.slug}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover"
              />
              <span className="absolute top-0 right-0 bg-ivory/90 px-1.5 py-0.5 text-[0.6rem] tracking-[0.1em] text-muted uppercase">
                {photo.orientation === "landscape" ? "wide" : "tall"}
              </span>
            </div>

            <div className="space-y-2 p-2.5">
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => toggle(photo, "in_gallery")}
                  aria-pressed={photo.in_gallery === 1}
                  className={`flex-1 border px-2 py-1.5 text-[0.65rem] tracking-[0.1em] uppercase transition-colors ${
                    photo.in_gallery === 1
                      ? "border-sage bg-sage text-ivory"
                      : "border-line bg-white text-muted hover:border-gold"
                  }`}
                >
                  Gallery
                </button>
                <button
                  type="button"
                  onClick={() => toggle(photo, "in_carousel")}
                  aria-pressed={photo.in_carousel === 1}
                  disabled={photo.orientation !== "landscape"}
                  title={
                    photo.orientation !== "landscape"
                      ? "Only landscape photos work in the hero carousel"
                      : undefined
                  }
                  className={`flex-1 border px-2 py-1.5 text-[0.65rem] tracking-[0.1em] uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                    photo.in_carousel === 1
                      ? "border-gold bg-gold text-ivory"
                      : "border-line bg-white text-muted hover:border-gold"
                  }`}
                >
                  Carousel
                </button>
              </div>

              <label>
                <span className="sr-only">Caption for {photo.slug}</span>
                <input
                  type="text"
                  defaultValue={photo.caption}
                  placeholder="Add a caption…"
                  maxLength={300}
                  onBlur={(event) => saveCaption(photo, event.target.value)}
                  className="field !px-2 !py-1.5 !text-xs"
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted">
          No photos in this filter.
        </p>
      ) : null}
    </div>
  );
}
