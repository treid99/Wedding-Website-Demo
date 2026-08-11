import type { Metadata } from "next";
import { AdminHeader, Card, StatTile } from "@/components/admin/ui";
import RegistryItemArt from "@/components/RegistryItemArt";
import {
  createRegistryItem,
  deleteRegistryItem,
  setRegistryPurchased,
  updateRegistryItem,
} from "@/lib/admin-actions";
import { formatPrice, formatTimestamp } from "@/lib/format";
import {
  getAllPhotos,
  getAllRegistryItems,
  getRegistryStats,
  getRegistryStores,
} from "@/lib/queries";
import type { RegistryItem } from "@/lib/types";

export const metadata: Metadata = { title: "Registry" };

const CATEGORIES = [
  "kitchen",
  "dining",
  "glassware",
  "bedding",
  "bath",
  "decor",
  "furniture",
  "outdoor",
  "home",
];

export default function AdminRegistryPage() {
  const items = getAllRegistryItems();
  const stats = getRegistryStats();
  const stores = getRegistryStores();
  const photos = getAllPhotos();

  const available = items.filter((item) => item.purchased === 0);
  const purchased = items.filter((item) => item.purchased === 1);

  return (
    <>
      <AdminHeader
        title="Registry"
        subtitle="Add, edit, and remove items. Anything marked purchased moves to the end of the public grid."
      />

      {/* Shared option lists — referenced by every row's editor, rendered once.
          Per-row <select> elements would repeat 59 photo options 40 times. */}
      <datalist id="store-list">
        {stores.map((store) => (
          <option key={store.store} value={store.store} />
        ))}
      </datalist>
      <datalist id="photo-list">
        {photos.map((photo) => (
          <option key={photo.id} value={photo.slug}>
            {photo.caption || photo.orientation}
          </option>
        ))}
      </datalist>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile value={stats.total} label="Items listed" />
        <StatTile value={stats.available} label="Still available" tone="good" />
        <StatTile value={stats.purchased} label="Claimed" tone="muted" />
        <StatTile
          value={formatPrice(stats.purchasedValueCents)}
          label="Value claimed"
        />
      </div>

      {/* ── Add an item ─────────────────────────────────────────────── */}
      <div className="mt-6">
        <Card title="Add an item">
          <form action={createRegistryItem} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr_1fr]">
              <div>
                <label className="label" htmlFor="new-title">
                  Title
                </label>
                <input
                  id="new-title"
                  name="title"
                  placeholder="Copper Stockpot, 8 qt"
                  required
                  className="field"
                />
              </div>
              <div>
                <label className="label" htmlFor="new-price">
                  Price
                </label>
                <input
                  id="new-price"
                  name="price"
                  placeholder="149.00"
                  inputMode="decimal"
                  required
                  className="field"
                />
              </div>
              <div>
                <label className="label" htmlFor="new-store">
                  Store
                </label>
                <input
                  id="new-store"
                  name="store"
                  list="store-list"
                  placeholder="Crate & Barrel"
                  required
                  className="field"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="new-description">
                Description
              </label>
              <input
                id="new-description"
                name="description"
                placeholder="One line about why you want it"
                className="field"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr_1fr]">
              <div>
                <label className="label" htmlFor="new-url">
                  Link to the store
                </label>
                <input
                  id="new-url"
                  name="external_url"
                  type="url"
                  placeholder="https://…"
                  required
                  className="field"
                />
              </div>
              <div>
                <label className="label" htmlFor="new-category">
                  Category
                </label>
                <select
                  id="new-category"
                  name="category"
                  defaultValue="kitchen"
                  className="field"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button type="submit" className="btn btn-primary w-full">
                  Add to registry
                </button>
              </div>
            </div>

            <p className="text-xs text-muted">
              Category picks the placeholder artwork. To use one of your photos
              instead, set a photo in the item&apos;s editor below.
            </p>
          </form>
        </Card>
      </div>

      {/* ── Available ───────────────────────────────────────────────── */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-medium tracking-[0.1em] text-ink uppercase">
          Available · {available.length}
        </h2>
        <div className="border border-line bg-white">
          {available.map((item) => (
            <ItemRow key={item.id} item={item} stores={stores.map((s) => s.store)} photos={photos} />
          ))}
          {available.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted">
              Every item has been claimed.
            </p>
          ) : null}
        </div>
      </section>

      {/* ── Purchased ───────────────────────────────────────────────── */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-medium tracking-[0.1em] text-ink uppercase">
          Already purchased · {purchased.length}
        </h2>
        <div className="border border-line bg-white">
          {purchased.map((item) => (
            <ItemRow key={item.id} item={item} stores={stores.map((s) => s.store)} photos={photos} />
          ))}
          {purchased.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted">
              Nothing claimed yet.
            </p>
          ) : null}
        </div>
      </section>
    </>
  );
}

function ItemRow({
  item,
  stores,
  photos,
}: {
  item: RegistryItem;
  stores: string[];
  photos: { id: number; slug: string; caption: string }[];
}) {
  const purchased = item.purchased === 1;

  return (
    <details className="group border-b border-line last:border-0">
      <summary className="flex cursor-pointer list-none items-center gap-4 px-4 py-3 transition-colors hover:bg-cream/60">
        <div className="h-12 w-12 shrink-0 overflow-hidden border border-line">
          <RegistryItemArt
            category={item.category}
            title={item.title}
            className={`h-full w-full ${purchased ? "opacity-50 grayscale" : ""}`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`truncate text-sm font-medium ${purchased ? "text-muted" : "text-ink"}`}
          >
            {item.title}
          </p>
          <p className="truncate text-xs text-muted">
            {item.store} · {item.category}
            {purchased && item.purchased_by ? ` · ${item.purchased_by}` : ""}
            {purchased && item.purchased_at
              ? ` · ${formatTimestamp(item.purchased_at)}`
              : ""}
          </p>
        </div>

        <p
          className={`shrink-0 text-sm ${purchased ? "text-muted line-through" : "text-sage"}`}
        >
          {formatPrice(item.price_cents)}
        </p>

        <span className="hidden shrink-0 text-xs tracking-[0.1em] text-sage uppercase sm:inline">
          Edit
        </span>
      </summary>

      <div className="space-y-5 border-t border-line bg-cream/50 px-4 py-5">
        {/* ── Purchased toggle ─────────────────────────────────────── */}
        <form
          action={setRegistryPurchased}
          className="flex flex-wrap items-end gap-3 border border-line bg-white px-4 py-3"
        >
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="purchased" value={purchased ? "0" : "1"} />

          {purchased ? (
            <>
              <p className="flex-1 text-sm text-ink/75">
                Marked as purchased
                {item.purchased_by ? ` by ${item.purchased_by}` : ""}. Put it back
                on the list if that was a mistake.
              </p>
              <button type="submit" className="btn btn-outline !px-4 !py-2.5">
                Mark available
              </button>
            </>
          ) : (
            <>
              <div className="min-w-40 flex-1">
                <label className="label" htmlFor={`by-${item.id}`}>
                  Purchased by (optional)
                </label>
                <input
                  id={`by-${item.id}`}
                  name="purchased_by"
                  placeholder="The Mitchell Family"
                  className="field"
                />
              </div>
              <button type="submit" className="btn btn-primary !px-4 !py-2.5">
                Mark purchased
              </button>
            </>
          )}
        </form>

        {/* ── Edit ────────────────────────────────────────────────── */}
        <form action={updateRegistryItem} className="space-y-4">
          <input type="hidden" name="id" value={item.id} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr_1fr]">
            <div>
              <label className="label" htmlFor={`title-${item.id}`}>
                Title
              </label>
              <input
                id={`title-${item.id}`}
                name="title"
                defaultValue={item.title}
                required
                className="field"
              />
            </div>
            <div>
              <label className="label" htmlFor={`price-${item.id}`}>
                Price
              </label>
              <input
                id={`price-${item.id}`}
                name="price"
                defaultValue={(item.price_cents / 100).toFixed(2)}
                inputMode="decimal"
                required
                className="field"
              />
            </div>
            <div>
              <label className="label" htmlFor={`store-${item.id}`}>
                Store
              </label>
              <input
                id={`store-${item.id}`}
                name="store"
                defaultValue={item.store}
                list="store-list"
                required
                className="field"
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor={`desc-${item.id}`}>
              Description
            </label>
            <textarea
              id={`desc-${item.id}`}
              name="description"
              defaultValue={item.description}
              rows={2}
              className="field resize-y"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr_1fr]">
            <div>
              <label className="label" htmlFor={`url-${item.id}`}>
                Store link
              </label>
              <input
                id={`url-${item.id}`}
                name="external_url"
                type="url"
                defaultValue={item.external_url}
                required
                className="field"
              />
            </div>
            <div>
              <label className="label" htmlFor={`cat-${item.id}`}>
                Category
              </label>
              <select
                id={`cat-${item.id}`}
                name="category"
                defaultValue={item.category}
                className="field"
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor={`img-${item.id}`}>
                Photo slug (optional)
              </label>
              <input
                id={`img-${item.id}`}
                name="image_slug"
                list="photo-list"
                defaultValue={item.image_slug ?? ""}
                placeholder="Category artwork"
                className="field"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <a
              href={item.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs tracking-[0.1em] text-sage uppercase underline underline-offset-4 hover:text-gold"
            >
              Test this link ↗
            </a>
            <button type="submit" className="btn btn-primary !px-5 !py-2">
              Save changes
            </button>
          </div>
        </form>

        <form action={deleteRegistryItem} className="border-t border-line pt-4">
          <input type="hidden" name="id" value={item.id} />
          <button
            type="submit"
            className="text-xs tracking-[0.1em] text-muted uppercase underline underline-offset-4 hover:text-ink"
          >
            Remove this item from the registry
          </button>
        </form>
      </div>
    </details>
  );
}
