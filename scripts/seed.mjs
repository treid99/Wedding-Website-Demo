/**
 * Creates data/wedding.db from scripts/schema.sql and fills it with the demo
 * content in scripts/seed-data.mjs.
 *
 * Destructive: drops every table first. Run it any time you want a clean slate.
 *
 *   npm run db:reset
 *
 * Requires data/photos.json, so run `npm run photos:build` first.
 */

import { existsSync, readFileSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import {
  contentBlocks,
  directions,
  faqItems,
  galleryCaptions,
  carouselCaptions,
  hotels,
  initialSeating,
  parties,
  registryItems,
  scheduleEvents,
  seatingTables,
} from "./seed-data.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DB_PATH = path.join(ROOT, "data", "wedding.db");
const SCHEMA_PATH = path.join(ROOT, "scripts", "schema.sql");
const MANIFEST_PATH = path.join(ROOT, "data", "photos.json");

const GALLERY_COUNT = 16;
const CAROUSEL_COUNT = 7;

/**
 * Deterministic PRNG. The photo "random" selection has to be stable across
 * reseeds — otherwise the gallery reshuffles every time and the demo's
 * captions stop matching their photos.
 */
function mulberry32(seed) {
  return function next() {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates using the seeded PRNG. Returns a new array. */
function seededShuffle(items, seed) {
  const random = mulberry32(seed);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Purchased registry items get a plausible buyer, chosen deterministically. */
const PURCHASERS = [
  "Lorelai Gilmore & Luke Danes",
  "Gomez & Morticia Addams",
  "The Griffin Family",
  "Steve Harrington",
  "Johnny & Moira Rose",
  "Rory Gilmore",
  "Joyce Byers & Jim Hopper",
  "Spencer Hastings & Toby Cavanaugh",
  "David Rose & Patrick Brewer",
  "Robin Buckley",
];

function main() {
  if (!existsSync(MANIFEST_PATH)) {
    console.error(
      `✗ Missing ${path.relative(ROOT, MANIFEST_PATH)}\n  Run \`npm run photos:build\` first.`,
    );
    process.exit(1);
  }

  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
  if (!Array.isArray(manifest) || manifest.length === 0) {
    console.error("✗ data/photos.json is empty — re-run `npm run photos:build`.");
    process.exit(1);
  }

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  // Dropping every table needs an exclusive lock. A dev server or a test run
  // may be mid-read, so wait for it rather than failing the whole reseed.
  db.pragma("busy_timeout = 10000");

  // Schema drops everything, so run it with FKs off. The PRAGMA has to be set
  // out here rather than from inside the transaction below, where it is a no-op.
  db.pragma("foreign_keys = OFF");
  const schema = readFileSync(SCHEMA_PATH, "utf8").replace(
    /^\s*PRAGMA[^;]*;/gim,
    "",
  );

  const counts = {};

  /**
   * Drop, recreate and repopulate in ONE transaction.
   *
   * SQLite makes DDL transactional, and that matters here: with the schema
   * applied separately, anything reading the database between the CREATE and
   * the inserts sees every table present and empty. Reseeding under a running
   * dev server would then serve a page with no guests on it, or fail mid-render
   * — which is exactly what it used to do.
   */
  db.transaction(() => {
    db.exec(schema);

    // ── Content blocks ──────────────────────────────────────────────────────
    const insertBlock = db.prepare(
      `INSERT INTO content_blocks (key, label, eyebrow, title, body, sort_order)
       VALUES (@key, @label, @eyebrow, @title, @body, @sort_order)`,
    );
    for (const block of contentBlocks) insertBlock.run(block);
    counts.content_blocks = contentBlocks.length;

    // ── Photos ──────────────────────────────────────────────────────────────
    // Shuffle once, then carve out a carousel set (landscape only — the hero is
    // a wide crop) and a gallery set from what's left.
    const shuffled = seededShuffle(manifest, 20270917);

    const carouselSlugs = new Set(
      shuffled
        .filter((p) => p.orientation === "landscape")
        .slice(0, CAROUSEL_COUNT)
        .map((p) => p.slug),
    );

    const gallerySlugs = new Map(
      shuffled
        .filter((p) => !carouselSlugs.has(p.slug))
        .slice(0, GALLERY_COUNT)
        .map((p, index) => [p.slug, index]),
    );

    const carouselOrder = new Map(
      shuffled
        .filter((p) => carouselSlugs.has(p.slug))
        .map((p, index) => [p.slug, index]),
    );

    const insertPhoto = db.prepare(
      `INSERT INTO photos
         (slug, filename, full_path, thumb_path, width, height, orientation,
          caption, in_gallery, in_carousel, sort_order)
       VALUES
         (@slug, @filename, @full_path, @thumb_path, @width, @height, @orientation,
          @caption, @in_gallery, @in_carousel, @sort_order)`,
    );

    for (const photo of manifest) {
      const galleryIndex = gallerySlugs.get(photo.slug);
      const carouselIndex = carouselOrder.get(photo.slug);
      const inGallery = galleryIndex !== undefined;
      const inCarousel = carouselIndex !== undefined;

      let caption = "";
      if (inGallery) caption = galleryCaptions[galleryIndex] ?? "";
      else if (inCarousel) caption = carouselCaptions[carouselIndex] ?? "";

      insertPhoto.run({
        slug: photo.slug,
        filename: photo.filename,
        full_path: photo.full,
        thumb_path: photo.thumb,
        width: photo.width,
        height: photo.height,
        orientation: photo.orientation,
        caption,
        in_gallery: inGallery ? 1 : 0,
        in_carousel: inCarousel ? 1 : 0,
        // Selected photos sort by their position in the set; the rest keep a
        // stable high offset so the admin picker has a predictable order.
        sort_order: inCarousel
          ? carouselIndex
          : inGallery
            ? galleryIndex
            : 100 + manifest.indexOf(photo),
      });
    }

    counts.photos = manifest.length;
    counts.gallery = gallerySlugs.size;
    counts.carousel = carouselSlugs.size;

    // ── Registry ────────────────────────────────────────────────────────────
    const insertItem = db.prepare(
      `INSERT INTO registry_items
         (title, description, price_cents, store, category, external_url,
          purchased, purchased_by, purchased_at, sort_order)
       VALUES
         (@title, @description, @price_cents, @store, @category, @external_url,
          @purchased, @purchased_by, @purchased_at, @sort_order)`,
    );

    // Purchases are spread across the recent past, for the same reason the RSVP
    // timestamps are: the admin views sort newest-first.
    const purchasedAtFor = (index) => {
      const stamp = new Date(Date.now() - (40 - index * 3) * 86_400_000);
      stamp.setHours(14, (index * 11) % 60, 0, 0);
      return stamp.toISOString().slice(0, 19).replace("T", " ");
    };

    let purchasedSeen = 0;
    for (const item of registryItems) {
      const purchased = item.purchased === 1;
      insertItem.run({
        ...item,
        purchased_by: purchased ? PURCHASERS[purchasedSeen % PURCHASERS.length] : "",
        purchased_at: purchased ? purchasedAtFor(purchasedSeen) : null,
      });
      if (purchased) purchasedSeen += 1;
    }

    counts.registry_items = registryItems.length;
    counts.registry_purchased = purchasedSeen;

    // ── Schedule, Q&A, hotels, directions ───────────────────────────────────
    const insertEvent = db.prepare(
      `INSERT INTO schedule_events
         (day_label, day_order, time_label, title, location, description, attire, sort_order)
       VALUES
         (@day_label, @day_order, @time_label, @title, @location, @description, @attire, @sort_order)`,
    );
    for (const event of scheduleEvents) insertEvent.run(event);
    counts.schedule_events = scheduleEvents.length;

    const insertFaq = db.prepare(
      `INSERT INTO faq_items (question, answer, category, sort_order)
       VALUES (@question, @answer, @category, @sort_order)`,
    );
    for (const faq of faqItems) insertFaq.run(faq);
    counts.faq_items = faqItems.length;

    const insertHotel = db.prepare(
      `INSERT INTO hotels
         (name, address, phone, rate, block_code, cutoff, distance, booking_url, notes, sort_order)
       VALUES
         (@name, @address, @phone, @rate, @block_code, @cutoff, @distance, @booking_url, @notes, @sort_order)`,
    );
    for (const hotel of hotels) insertHotel.run(hotel);
    counts.hotels = hotels.length;

    const insertDirection = db.prepare(
      `INSERT INTO directions (heading, summary, body, sort_order)
       VALUES (@heading, @summary, @body, @sort_order)`,
    );
    for (const direction of directions) insertDirection.run(direction);
    counts.directions = directions.length;

    // ── Seating tables ──────────────────────────────────────────────────────
    const insertTable = db.prepare(
      `INSERT INTO seating_tables (name, shape, capacity, sort_order)
       VALUES (@name, @shape, @capacity, @sort_order)`,
    );
    const tableIds = new Map();
    for (const table of seatingTables) {
      const { lastInsertRowid } = insertTable.run(table);
      tableIds.set(table.name, lastInsertRowid);
    }
    counts.seating_tables = seatingTables.length;

    // ── Parties, guests, submissions ────────────────────────────────────────
    const insertParty = db.prepare(
      `INSERT INTO parties (name, invite_code, envelope_name, address, notes, side)
       VALUES (@name, @invite_code, @envelope_name, @address, @notes, @side)`,
    );
    const insertGuest = db.prepare(
      `INSERT INTO guests
         (party_id, first_name, last_name, is_child, rsvp_status, meal_choice,
          dietary_notes, table_id, responded_at)
       VALUES
         (@party_id, @first_name, @last_name, @is_child, @rsvp_status, @meal_choice,
          @dietary_notes, @table_id, @responded_at)`,
    );
    const insertSubmission = db.prepare(
      `INSERT INTO rsvp_submissions (party_id, message, attending, declined, submitted_at)
       VALUES (@party_id, @message, @attending, @declined, @submitted_at)`,
    );

    // Reverse the pre-seating map to full-name -> table id.
    const seatOf = new Map();
    for (const [tableName, names] of Object.entries(initialSeating)) {
      for (const name of names) seatOf.set(name, tableIds.get(tableName));
    }

    let guestCount = 0;
    let submissionCount = 0;

    // Responses trickle in over the weeks *before* today. They must be in the
    // past: the admin dashboard orders submissions newest-first, so seeded
    // future dates would permanently outrank a real RSVP made in the demo.
    //
    // The span is divided by the party count rather than stepping a fixed
    // number of days per party. A fixed step silently walks off the end of the
    // window as parties are added — at three days each, the nineteenth group
    // landed nine days in the *future* — and nothing here would have caught it.
    const now = Date.now();
    const SPAN_DAYS = 45;
    const lastIndex = Math.max(1, parties.length - 1);
    const respondedAtFor = (index) => {
      const daysAgo = SPAN_DAYS - Math.round((index * (SPAN_DAYS - 1)) / lastIndex);
      const stamp = new Date(now - daysAgo * 86_400_000);
      stamp.setHours(9 + (index % 9), (index * 7) % 60, 0, 0);
      return stamp.toISOString().slice(0, 19).replace("T", " ");
    };

    parties.forEach((party, partyIndex) => {
      const { lastInsertRowid: partyId } = insertParty.run({
        name: party.name,
        invite_code: party.invite_code,
        // Left blank for most groups on purpose, so the inherit-from-name
        // fallback is exercised by the seeded data and not just by new entries.
        envelope_name: party.envelope ?? "",
        address: party.address,
        notes: party.notes,
        side: party.side,
      });

      const respondedAt = respondedAtFor(partyIndex);

      let attending = 0;
      let declined = 0;

      for (const guest of party.guests) {
        const responded = guest.status !== "pending";
        if (guest.status === "attending") attending += 1;
        if (guest.status === "declined") declined += 1;

        insertGuest.run({
          party_id: partyId,
          first_name: guest.first,
          last_name: guest.last,
          is_child: guest.child ? 1 : 0,
          rsvp_status: guest.status,
          meal_choice: guest.meal ?? null,
          dietary_notes: guest.dietary ?? "",
          table_id: seatOf.get(`${guest.first} ${guest.last}`) ?? null,
          responded_at: responded ? respondedAt : null,
        });
        guestCount += 1;
      }

      // Only parties that actually responded have a submission on record.
      if (attending + declined > 0) {
        insertSubmission.run({
          party_id: partyId,
          message: party.message ?? "",
          attending,
          declined,
          submitted_at: respondedAt,
        });
        submissionCount += 1;
      }
    });

    counts.parties = parties.length;
    counts.guests = guestCount;
    counts.rsvp_submissions = submissionCount;
  })();

  db.pragma("foreign_keys = ON");

  // Sanity check: every pre-seated name must have matched a real guest.
  const expectedSeated = Object.values(initialSeating).flat().length;
  const actualSeated = db
    .prepare("SELECT COUNT(*) AS n FROM guests WHERE table_id IS NOT NULL")
    .get().n;

  if (actualSeated !== expectedSeated) {
    console.warn(
      `⚠ initialSeating lists ${expectedSeated} guests but only ${actualSeated} matched — check the names in seed-data.mjs.`,
    );
  }

  const statusRows = db
    .prepare("SELECT rsvp_status, COUNT(*) AS n FROM guests GROUP BY rsvp_status")
    .all();

  db.close();

  console.log(`✓ Seeded ${path.relative(ROOT, DB_PATH)}\n`);
  for (const [table, n] of Object.entries(counts)) {
    console.log(`  ${table.padEnd(20)} ${n}`);
  }
  console.log("");
  for (const row of statusRows) {
    console.log(`  guests ${row.rsvp_status.padEnd(13)} ${row.n}`);
  }
  console.log(`\n  Seated on arrival    ${actualSeated}`);
}

await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
main();
