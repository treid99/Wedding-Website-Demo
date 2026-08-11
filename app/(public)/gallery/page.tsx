import type { Metadata } from "next";
import GalleryCollage from "@/components/GalleryCollage";
import { PageHeader } from "@/components/Section";
import { getBlock, getGalleryPhotos } from "@/lib/queries";
import { pluralize } from "@/lib/format";

export const metadata: Metadata = { title: "Gallery" };

export default function GalleryPage() {
  const intro = getBlock("gallery_intro");
  const photos = getGalleryPhotos();

  return (
    <>
      <PageHeader
        eyebrow={intro?.eyebrow}
        title={intro?.title}
        body={intro?.body}
      />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-5 sm:py-20 lg:px-8">
        <GalleryCollage photos={photos} />

        <p className="mt-10 text-center text-xs tracking-[0.14em] text-muted uppercase">
          {photos.length} {pluralize(photos.length, "photograph")} · Click any
          photo to enlarge
        </p>
      </div>
    </>
  );
}
