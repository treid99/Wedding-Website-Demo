import Link from "next/link";
import type { Metadata } from "next";
import PhotoPicker from "@/components/admin/PhotoPicker";
import { AdminHeader, Card } from "@/components/admin/ui";
import {
  deleteFaqItem,
  deleteScheduleEvent,
  updateContentBlock,
  updateDirection,
  updateHotel,
  upsertFaqItem,
  upsertScheduleEvent,
} from "@/lib/admin-actions";
import { formatTimestamp } from "@/lib/format";
import {
  getAllBlocks,
  getAllPhotos,
  getDirections,
  getFaqItems,
  getHotels,
  getScheduleEvents,
} from "@/lib/queries";

export const metadata: Metadata = { title: "Content & Photos" };

const TABS = [
  { value: "copy", label: "Page copy", hint: "Home, Our Story, intros" },
  { value: "schedule", label: "Schedule", hint: "Weekend timeline" },
  { value: "faq", label: "Q&A", hint: "Questions & answers" },
  { value: "travel", label: "Travel", hint: "Hotels & directions" },
  { value: "photos", label: "Photos", hint: "Gallery & carousel" },
] as const;

type Tab = (typeof TABS)[number]["value"];

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const requested = Array.isArray(raw.tab) ? raw.tab[0] : raw.tab;
  const tab: Tab = TABS.some((t) => t.value === requested)
    ? (requested as Tab)
    : "copy";

  return (
    <>
      <AdminHeader
        title="Content & Photos"
        subtitle="Everything here writes straight to the public site — reload the page to see it."
      />

      {/* ── Tabs ────────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-line pb-4">
        {TABS.map((option) => (
          <Link
            key={option.value}
            href={`/admin/content?tab=${option.value}`}
            className={`border px-4 py-2.5 transition-colors ${
              tab === option.value
                ? "border-gold bg-white"
                : "border-line bg-cream/50 hover:border-gold"
            }`}
          >
            <span
              className={`block text-xs font-medium tracking-[0.1em] uppercase ${
                tab === option.value ? "text-ink" : "text-muted"
              }`}
            >
              {option.label}
            </span>
            <span className="mt-0.5 block text-[0.7rem] text-muted/80">
              {option.hint}
            </span>
          </Link>
        ))}
      </div>

      {tab === "copy" ? <CopyTab /> : null}
      {tab === "schedule" ? <ScheduleTab /> : null}
      {tab === "faq" ? <FaqTab /> : null}
      {tab === "travel" ? <TravelTab /> : null}
      {tab === "photos" ? <PhotosTab /> : null}
    </>
  );
}

// ── Page copy ───────────────────────────────────────────────────────────────

function CopyTab() {
  const blocks = getAllBlocks();

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted">
        Each block below is a titled chunk of text on the public site. Blank lines
        become separate paragraphs.
      </p>

      {blocks.map((block) => (
        <Card
          key={block.key}
          title={block.label}
          description={`Last edited ${formatTimestamp(block.updated_at)}`}
        >
          <form action={updateContentBlock} className="space-y-4">
            <input type="hidden" name="key" value={block.key} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_2fr]">
              <div>
                <label className="label" htmlFor={`eyebrow-${block.key}`}>
                  Kicker (small caps)
                </label>
                <input
                  id={`eyebrow-${block.key}`}
                  name="eyebrow"
                  defaultValue={block.eyebrow}
                  className="field"
                />
              </div>
              <div>
                <label className="label" htmlFor={`title-${block.key}`}>
                  Heading
                </label>
                <input
                  id={`title-${block.key}`}
                  name="title"
                  defaultValue={block.title}
                  className="field"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor={`body-${block.key}`}>
                Body
              </label>
              <textarea
                id={`body-${block.key}`}
                name="body"
                defaultValue={block.body}
                rows={block.body.length > 400 ? 10 : 4}
                className="field resize-y font-[inherit] leading-relaxed"
              />
            </div>

            <button type="submit" className="btn btn-primary !px-5 !py-2">
              Save
            </button>
          </form>
        </Card>
      ))}
    </div>
  );
}

// ── Schedule ────────────────────────────────────────────────────────────────

function ScheduleTab() {
  const events = getScheduleEvents();
  const days = [...new Set(events.map((event) => event.day_label))];

  return (
    <div className="space-y-6">
      <Card title="Add an event">
        <form action={upsertScheduleEvent} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr_1fr]">
            <div>
              <label className="label" htmlFor="ev-day">
                Day heading
              </label>
              <input
                id="ev-day"
                name="day_label"
                list="day-list"
                placeholder="Friday, September 17 — Wedding Day"
                required
                className="field"
              />
              <datalist id="day-list">
                {days.map((day) => (
                  <option key={day} value={day} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="label" htmlFor="ev-dayorder">
                Day order
              </label>
              <input
                id="ev-dayorder"
                name="day_order"
                type="number"
                min={1}
                defaultValue={2}
                className="field"
              />
            </div>
            <div>
              <label className="label" htmlFor="ev-time">
                Time
              </label>
              <input
                id="ev-time"
                name="time_label"
                placeholder="4:30 PM"
                className="field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_auto]">
            <div>
              <label className="label" htmlFor="ev-title">
                Title
              </label>
              <input
                id="ev-title"
                name="title"
                placeholder="Ceremony"
                required
                className="field"
              />
            </div>
            <div>
              <label className="label" htmlFor="ev-location">
                Location
              </label>
              <input id="ev-location" name="location" className="field" />
            </div>
            <div>
              <label className="label" htmlFor="ev-sort">
                Sort
              </label>
              <input
                id="ev-sort"
                name="sort_order"
                type="number"
                defaultValue={99}
                className="field w-24"
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="ev-desc">
              Description
            </label>
            <textarea id="ev-desc" name="description" rows={2} className="field resize-y" />
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1">
              <label className="label" htmlFor="ev-attire">
                Attire note (optional)
              </label>
              <input id="ev-attire" name="attire" className="field" />
            </div>
            <button type="submit" className="btn btn-primary">
              Add event
            </button>
          </div>
        </form>
      </Card>

      <div className="border border-line bg-white">
        {events.map((event) => (
          <details key={event.id} className="border-b border-line last:border-0">
            <summary className="flex cursor-pointer list-none items-center gap-4 px-4 py-3 hover:bg-cream/60">
              <span className="w-32 shrink-0 text-xs text-muted">
                {event.time_label}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-ink">{event.title}</span>
                <span className="block truncate text-xs text-muted">
                  {event.day_label}
                </span>
              </span>
              <span className="hidden shrink-0 text-xs tracking-[0.1em] text-sage uppercase sm:inline">
                Edit
              </span>
            </summary>

            <div className="border-t border-line bg-cream/50 px-4 py-5">
              <form action={upsertScheduleEvent} className="space-y-4">
                <input type="hidden" name="id" value={event.id} />

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr_1fr_1fr]">
                  <div>
                    <label className="label" htmlFor={`sday-${event.id}`}>
                      Day heading
                    </label>
                    <input
                      id={`sday-${event.id}`}
                      name="day_label"
                      defaultValue={event.day_label}
                      required
                      className="field"
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor={`sdayo-${event.id}`}>
                      Day order
                    </label>
                    <input
                      id={`sdayo-${event.id}`}
                      name="day_order"
                      type="number"
                      defaultValue={event.day_order}
                      className="field"
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor={`stime-${event.id}`}>
                      Time
                    </label>
                    <input
                      id={`stime-${event.id}`}
                      name="time_label"
                      defaultValue={event.time_label}
                      className="field"
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor={`ssort-${event.id}`}>
                      Sort
                    </label>
                    <input
                      id={`ssort-${event.id}`}
                      name="sort_order"
                      type="number"
                      defaultValue={event.sort_order}
                      className="field"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor={`stitle-${event.id}`}>
                      Title
                    </label>
                    <input
                      id={`stitle-${event.id}`}
                      name="title"
                      defaultValue={event.title}
                      required
                      className="field"
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor={`sloc-${event.id}`}>
                      Location
                    </label>
                    <input
                      id={`sloc-${event.id}`}
                      name="location"
                      defaultValue={event.location}
                      className="field"
                    />
                  </div>
                </div>

                <div>
                  <label className="label" htmlFor={`sdesc-${event.id}`}>
                    Description
                  </label>
                  <textarea
                    id={`sdesc-${event.id}`}
                    name="description"
                    defaultValue={event.description}
                    rows={3}
                    className="field resize-y"
                  />
                </div>

                <div className="flex flex-wrap items-end gap-4">
                  <div className="flex-1">
                    <label className="label" htmlFor={`sattire-${event.id}`}>
                      Attire note
                    </label>
                    <input
                      id={`sattire-${event.id}`}
                      name="attire"
                      defaultValue={event.attire}
                      className="field"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary !px-5 !py-2">
                    Save
                  </button>
                </div>
              </form>

              <form action={deleteScheduleEvent} className="mt-4 border-t border-line pt-4">
                <input type="hidden" name="id" value={event.id} />
                <button
                  type="submit"
                  className="text-xs tracking-[0.1em] text-muted uppercase underline underline-offset-4 hover:text-ink"
                >
                  Delete this event
                </button>
              </form>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

// ── Q&A ─────────────────────────────────────────────────────────────────────

function FaqTab() {
  const items = getFaqItems();
  const categories = [...new Set(items.map((item) => item.category))];

  return (
    <div className="space-y-6">
      <Card title="Add a question">
        <form action={upsertFaqItem} className="space-y-4">
          <div>
            <label className="label" htmlFor="faq-q">
              Question
            </label>
            <input
              id="faq-q"
              name="question"
              placeholder="Is there parking at the venue?"
              required
              className="field"
            />
          </div>
          <div>
            <label className="label" htmlFor="faq-a">
              Answer
            </label>
            <textarea
              id="faq-a"
              name="answer"
              rows={3}
              required
              className="field resize-y"
            />
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1">
              <label className="label" htmlFor="faq-cat">
                Category
              </label>
              <input
                id="faq-cat"
                name="category"
                list="faq-cat-list"
                defaultValue="General"
                className="field"
              />
              <datalist id="faq-cat-list">
                {categories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>
            <div className="w-24">
              <label className="label" htmlFor="faq-sort">
                Sort
              </label>
              <input
                id="faq-sort"
                name="sort_order"
                type="number"
                defaultValue={99}
                className="field"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Add
            </button>
          </div>
        </form>
      </Card>

      <div className="border border-line bg-white">
        {items.map((item) => (
          <details key={item.id} className="border-b border-line last:border-0">
            <summary className="flex cursor-pointer list-none items-center gap-4 px-4 py-3 hover:bg-cream/60">
              <span className="w-20 shrink-0 text-[0.65rem] tracking-[0.1em] text-gold uppercase">
                {item.category}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-ink">
                {item.question}
              </span>
              <span className="hidden shrink-0 text-xs tracking-[0.1em] text-sage uppercase sm:inline">
                Edit
              </span>
            </summary>

            <div className="border-t border-line bg-cream/50 px-4 py-5">
              <form action={upsertFaqItem} className="space-y-4">
                <input type="hidden" name="id" value={item.id} />

                <div>
                  <label className="label" htmlFor={`fq-${item.id}`}>
                    Question
                  </label>
                  <input
                    id={`fq-${item.id}`}
                    name="question"
                    defaultValue={item.question}
                    required
                    className="field"
                  />
                </div>

                <div>
                  <label className="label" htmlFor={`fa-${item.id}`}>
                    Answer
                  </label>
                  <textarea
                    id={`fa-${item.id}`}
                    name="answer"
                    defaultValue={item.answer}
                    rows={4}
                    required
                    className="field resize-y leading-relaxed"
                  />
                </div>

                <div className="flex flex-wrap items-end gap-4">
                  <div className="flex-1">
                    <label className="label" htmlFor={`fc-${item.id}`}>
                      Category
                    </label>
                    <input
                      id={`fc-${item.id}`}
                      name="category"
                      defaultValue={item.category}
                      list="faq-cat-list"
                      className="field"
                    />
                  </div>
                  <div className="w-24">
                    <label className="label" htmlFor={`fs-${item.id}`}>
                      Sort
                    </label>
                    <input
                      id={`fs-${item.id}`}
                      name="sort_order"
                      type="number"
                      defaultValue={item.sort_order}
                      className="field"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary !px-5 !py-2">
                    Save
                  </button>
                </div>
              </form>

              <form action={deleteFaqItem} className="mt-4 border-t border-line pt-4">
                <input type="hidden" name="id" value={item.id} />
                <button
                  type="submit"
                  className="text-xs tracking-[0.1em] text-muted uppercase underline underline-offset-4 hover:text-ink"
                >
                  Delete this question
                </button>
              </form>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

// ── Travel ──────────────────────────────────────────────────────────────────

function TravelTab() {
  const hotels = getHotels();
  const directions = getDirections();

  return (
    <div className="space-y-6">
      {hotels.map((hotel) => (
        <Card key={hotel.id} title={`Hotel — ${hotel.name}`}>
          <form action={updateHotel} className="space-y-4">
            <input type="hidden" name="id" value={hotel.id} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr]">
              <div>
                <label className="label" htmlFor={`hname-${hotel.id}`}>
                  Name
                </label>
                <input
                  id={`hname-${hotel.id}`}
                  name="name"
                  defaultValue={hotel.name}
                  required
                  className="field"
                />
              </div>
              <div>
                <label className="label" htmlFor={`hrate-${hotel.id}`}>
                  Rate
                </label>
                <input
                  id={`hrate-${hotel.id}`}
                  name="rate"
                  defaultValue={hotel.rate}
                  className="field"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor={`haddr-${hotel.id}`}>
                Address
              </label>
              <input
                id={`haddr-${hotel.id}`}
                name="address"
                defaultValue={hotel.address}
                className="field"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div>
                <label className="label" htmlFor={`hphone-${hotel.id}`}>
                  Phone
                </label>
                <input
                  id={`hphone-${hotel.id}`}
                  name="phone"
                  defaultValue={hotel.phone}
                  className="field"
                />
              </div>
              <div>
                <label className="label" htmlFor={`hblock-${hotel.id}`}>
                  Block code
                </label>
                <input
                  id={`hblock-${hotel.id}`}
                  name="block_code"
                  defaultValue={hotel.block_code}
                  className="field"
                />
              </div>
              <div>
                <label className="label" htmlFor={`hcut-${hotel.id}`}>
                  Booking deadline
                </label>
                <input
                  id={`hcut-${hotel.id}`}
                  name="cutoff"
                  defaultValue={hotel.cutoff}
                  className="field"
                />
              </div>
              <div>
                <label className="label" htmlFor={`hdist-${hotel.id}`}>
                  Distance
                </label>
                <input
                  id={`hdist-${hotel.id}`}
                  name="distance"
                  defaultValue={hotel.distance}
                  className="field"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor={`hurl-${hotel.id}`}>
                Booking link
              </label>
              <input
                id={`hurl-${hotel.id}`}
                name="booking_url"
                type="url"
                defaultValue={hotel.booking_url}
                className="field"
              />
            </div>

            <div>
              <label className="label" htmlFor={`hnotes-${hotel.id}`}>
                Description
              </label>
              <textarea
                id={`hnotes-${hotel.id}`}
                name="notes"
                defaultValue={hotel.notes}
                rows={4}
                className="field resize-y leading-relaxed"
              />
            </div>

            <button type="submit" className="btn btn-primary !px-5 !py-2">
              Save hotel
            </button>
          </form>
        </Card>
      ))}

      {directions.map((direction) => (
        <Card key={direction.id} title={`Directions — ${direction.heading}`}>
          <form action={updateDirection} className="space-y-4">
            <input type="hidden" name="id" value={direction.id} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor={`dhead-${direction.id}`}>
                  Heading
                </label>
                <input
                  id={`dhead-${direction.id}`}
                  name="heading"
                  defaultValue={direction.heading}
                  required
                  className="field"
                />
              </div>
              <div>
                <label className="label" htmlFor={`dsum-${direction.id}`}>
                  Subheading
                </label>
                <input
                  id={`dsum-${direction.id}`}
                  name="summary"
                  defaultValue={direction.summary}
                  className="field"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor={`dbody-${direction.id}`}>
                Steps — one per line
              </label>
              <textarea
                id={`dbody-${direction.id}`}
                name="body"
                defaultValue={direction.body}
                rows={7}
                className="field resize-y leading-relaxed"
              />
            </div>

            <button type="submit" className="btn btn-primary !px-5 !py-2">
              Save directions
            </button>
          </form>
        </Card>
      ))}
    </div>
  );
}

// ── Photos ──────────────────────────────────────────────────────────────────

function PhotosTab() {
  const photos = getAllPhotos();
  return (
    <Card
      title="Gallery & carousel"
      description={`${photos.length} photos in the library`}
    >
      <PhotoPicker photos={photos} />
    </Card>
  );
}
