import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { PageHeader, Prose } from "@/components/Section";
import { getBlock, getBlocksByPrefix, getGalleryPhotos } from "@/lib/queries";
import { WEDDING } from "@/lib/wedding";

export const metadata: Metadata = { title: "Our Story" };

export default function StoryPage() {
  const intro = getBlock("story_intro");
  // Chapters are content blocks keyed story_ch1..story_chN, so the couple can
  // add or remove one from the admin editor without touching this page.
  const chapters = getBlocksByPrefix("story_ch");
  const photos = getGalleryPhotos();

  return (
    <>
      <PageHeader
        eyebrow={intro?.eyebrow}
        title={intro?.title}
        body={intro?.body}
      />

      <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8 sm:py-24">
        <div className="space-y-24 sm:space-y-32">
          {chapters.map((chapter, index) => {
            // Alternate which side the photo sits on.
            const photoRight = index % 2 === 0;
            const photo = photos[(index * 3) % Math.max(1, photos.length)];

            return (
              <article
                key={chapter.key}
                className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16"
              >
                <div className={photoRight ? "lg:order-1" : "lg:order-2"}>
                  <p className="eyebrow">{chapter.eyebrow}</p>
                  <h2 className="display mt-4 text-3xl text-ink sm:text-4xl">
                    {chapter.title}
                  </h2>
                  <div className="hairline mt-6 w-20" />
                  <Prose body={chapter.body} className="mt-7" />
                </div>

                {photo ? (
                  <div className={photoRight ? "lg:order-2" : "lg:order-1"}>
                    <div className="relative aspect-[4/5] overflow-hidden bg-cream">
                      <Image
                        src={photo.thumb_path}
                        alt={photo.caption || chapter.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                    {photo.caption ? (
                      <p className="mt-3 text-xs text-muted italic">
                        {photo.caption}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

        {/* ── Closing ────────────────────────────────────────────────── */}
        <div className="mt-28 border-t border-line pt-16 text-center">
          <p className="eyebrow">And now</p>
          <p className="display mx-auto mt-5 max-w-2xl text-3xl leading-snug text-ink sm:text-4xl">
            {WEDDING.dateLong}
            <br />
            <span className="text-gold">{WEDDING.venue}</span>
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/rsvp" className="btn btn-primary">
              RSVP
            </Link>
            <Link href="/gallery" className="btn btn-outline">
              See the photos
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
