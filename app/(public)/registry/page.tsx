import Link from "next/link";
import type { Metadata } from "next";
import Pagination from "@/components/Pagination";
import RegistryCard from "@/components/RegistryCard";
import RegistryControls from "@/components/RegistryControls";
import { PageHeader } from "@/components/Section";
import { formatPrice, pluralize } from "@/lib/format";
import {
  getAllPhotos,
  getBlock,
  getRegistryPriceBounds,
  getRegistryStats,
  getRegistryStores,
  queryRegistry,
} from "@/lib/queries";
import {
  PER_PAGE,
  parseRegistryParams,
  registryHref,
  type RawSearchParams,
} from "@/lib/registry-params";

export const metadata: Metadata = { title: "Registry" };

export default async function RegistryPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = parseRegistryParams(await searchParams);

  const intro = getBlock("registry_intro");
  const stats = getRegistryStats();
  const storeFacets = getRegistryStores();
  const bounds = getRegistryPriceBounds();

  const result = queryRegistry({
    q: params.q,
    stores: params.stores,
    minPrice: params.minCents,
    maxPrice: params.maxCents,
    availability: params.availability,
    sort: params.sort,
    page: params.page,
    perPage: PER_PAGE,
  });

  // Items may carry an explicit photo override set in the admin editor.
  const photosBySlug = new Map(getAllPhotos().map((photo) => [photo.slug, photo]));

  const resultLine =
    result.total === 0
      ? "No items match those filters"
      : `Showing ${result.from}–${result.to} of ${result.total} ${pluralize(result.total, "item")}`;

  return (
    <>
      <PageHeader
        eyebrow={intro?.eyebrow}
        title={intro?.title}
        body={intro?.body}
      />

      {/* ── Progress strip ──────────────────────────────────────────── */}
      <div className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-5 py-5 text-center lg:px-8">
          <Stat value={String(stats.total)} label="Items" />
          <Divider />
          <Stat value={String(stats.available)} label="Still available" />
          <Divider />
          <Stat value={String(stats.purchased)} label="Already claimed" />
          <Divider />
          <Stat
            value={`${formatPrice(bounds.min)}–${formatPrice(bounds.max)}`}
            label="Price range"
          />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 sm:py-16">
        <RegistryControls
          params={params}
          storeFacets={storeFacets}
          bounds={bounds}
          resultLine={resultLine}
        >
          {result.items.length === 0 ? (
            <div className="border border-line bg-white px-8 py-20 text-center">
              <p className="display text-2xl text-ink">Nothing here</p>
              <p className="mx-auto mt-3 max-w-sm text-sm text-muted">
                No registry items match that combination. Try widening the price
                range or clearing a filter.
              </p>
              <Link href="/registry" className="btn btn-outline mt-8">
                Clear all filters
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {result.items.map((item) => (
                  <RegistryCard
                    key={item.id}
                    item={item}
                    photo={
                      item.image_slug
                        ? photosBySlug.get(item.image_slug)
                        : undefined
                    }
                  />
                ))}
              </div>

              <Pagination
                page={result.page}
                pageCount={result.pageCount}
                hrefFor={(page) => registryHref(params, { page })}
              />

              <p className="mt-8 text-center text-xs leading-relaxed text-muted">
                Every item links out to the store — there&apos;s no checkout here.
                Purchased items stay listed at the end so you can see what&apos;s
                already been taken care of.
              </p>
            </>
          )}
        </RegistryControls>
      </div>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="display text-2xl text-ink">{value}</p>
      <p className="mt-0.5 text-[0.65rem] tracking-[0.16em] text-muted uppercase">
        {label}
      </p>
    </div>
  );
}

function Divider() {
  return <span className="hidden h-8 w-px bg-line sm:block" aria-hidden />;
}
