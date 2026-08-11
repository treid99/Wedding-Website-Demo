import Image from "next/image";
import RegistryItemArt from "./RegistryItemArt";
import { formatPrice } from "@/lib/format";
import type { Photo, RegistryItem } from "@/lib/types";

/**
 * One registry item. Purchased items are visibly dimmed and carry a ribbon;
 * their outbound link is removed so nobody buys a duplicate by accident.
 */
export default function RegistryCard({
  item,
  photo,
}: {
  item: RegistryItem;
  photo?: Photo;
}) {
  const purchased = item.purchased === 1;

  return (
    <article
      className={`group relative flex flex-col border bg-white transition-colors ${
        purchased ? "border-line/70" : "border-line hover:border-gold-light"
      }`}
    >
      {/* ── Artwork ─────────────────────────────────────────────────── */}
      <div className="relative aspect-square overflow-hidden bg-cream">
        {photo ? (
          <Image
            src={photo.thumb_path}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={`object-cover transition-all duration-500 ${
              purchased ? "opacity-40 grayscale" : "group-hover:scale-[1.03]"
            }`}
          />
        ) : (
          <RegistryItemArt
            category={item.category}
            title={item.title}
            className={`h-full w-full transition-all duration-500 ${
              purchased ? "opacity-45 grayscale" : "group-hover:scale-[1.03]"
            }`}
          />
        )}

        {purchased ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="border border-sage/40 bg-ivory/95 px-4 py-2 text-[0.65rem] font-medium tracking-[0.2em] text-sage uppercase">
              Purchased
            </span>
          </div>
        ) : null}

        <span className="absolute top-0 left-0 bg-ivory/90 px-2.5 py-1 text-[0.6rem] font-medium tracking-[0.14em] text-muted uppercase">
          {item.store}
        </span>
      </div>

      {/* ── Detail ──────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-5">
        <h3
          className={`display text-lg leading-snug ${
            purchased ? "text-muted" : "text-ink"
          }`}
        >
          {item.title}
        </h3>

        <p
          className={`mt-2 flex-1 text-[0.825rem] leading-relaxed ${
            purchased ? "text-muted/80" : "text-ink/70"
          }`}
        >
          {item.description}
        </p>

        <div className="mt-5 flex items-end justify-between gap-3">
          <p
            className={`display text-2xl ${purchased ? "text-muted line-through" : "text-sage"}`}
          >
            {formatPrice(item.price_cents)}
          </p>

          {purchased ? (
            <span className="text-right text-[0.7rem] leading-tight text-muted">
              Thank you
              {item.purchased_by ? (
                <>
                  ,<br />
                  {item.purchased_by}
                </>
              ) : null}
            </span>
          ) : (
            <a
              href={item.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.7rem] font-medium tracking-[0.12em] text-sage uppercase underline decoration-gold-light underline-offset-4 transition-colors hover:text-gold"
            >
              View
              <span aria-hidden> ↗</span>
              <span className="sr-only"> {item.title} at {item.store}</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
