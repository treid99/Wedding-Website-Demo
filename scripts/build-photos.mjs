/**
 * Derives web-sized photo assets from the committed source photos in ./images.
 *
 *   ./images/<name>.webp  ->  public/photos/full/<slug>.webp   (max 1600px, q80)
 *                             public/photos/thumb/<slug>.webp  (max 600px,  q75)
 *
 * Those sources are *not* the full-resolution originals: `npm run photos:shrink`
 * already replaced them in place with 2048px q85 WebP so the set was small
 * enough to commit. The full-resolution set does not live in this repo. 2048px
 * is deliberate headroom over the 1600px tier below — see shrink-originals.mjs
 * for why deriving from it is visually free.
 *
 * So ./images is the only photo source a fresh clone gets, and deleting it
 * breaks `npm run setup`: this script exits on an empty source directory, and
 * seed.mjs then has no data/photos.json to read.
 *
 * Also writes data/photos.json — a manifest carrying each photo's intrinsic
 * dimensions, which the gallery collage and hero carousel need in order to
 * reserve space and avoid layout shift.
 *
 * Sources are never modified. Safe to re-run; unchanged photos are skipped.
 *
 *   npm run photos:build          # incremental
 *   npm run photos:build -- --force
 */

import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_DIR = path.join(ROOT, "images");
const FULL_DIR = path.join(ROOT, "public", "photos", "full");
const THUMB_DIR = path.join(ROOT, "public", "photos", "thumb");
const MANIFEST = path.join(ROOT, "data", "photos.json");

const FULL_WIDTH = 1600;
const THUMB_WIDTH = 600;
const CONCURRENCY = 4;
const FORCE = process.argv.includes("--force");

/** "Chelseywilliamsphotography-2017-2.webp" -> "chelseywilliamsphotography-2017-2" */
function toSlug(filename) {
  return path
    .basename(filename, path.extname(filename))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function renderOne(filename) {
  const slug = toSlug(filename);
  const source = path.join(SOURCE_DIR, filename);
  const fullOut = path.join(FULL_DIR, `${slug}.webp`);
  const thumbOut = path.join(THUMB_DIR, `${slug}.webp`);

  const needsWork = FORCE || !existsSync(fullOut) || !existsSync(thumbOut);

  if (needsWork) {
    // .rotate() with no argument applies the EXIF orientation, so portrait
    // photos come out portrait rather than sideways.
    const base = sharp(source, { failOn: "none" }).rotate();

    await Promise.all([
      base
        .clone()
        .resize({ width: FULL_WIDTH, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(fullOut),
      base
        .clone()
        .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
        .webp({ quality: 75 })
        .toFile(thumbOut),
    ]);
  }

  // Read dimensions back off the derivative so they always match what the
  // browser will actually load, orientation included.
  const { width, height } = await sharp(fullOut).metadata();
  const { size } = await fs.stat(fullOut);

  return {
    slug,
    filename,
    full: `/photos/full/${slug}.webp`,
    thumb: `/photos/thumb/${slug}.webp`,
    width,
    height,
    orientation: width >= height ? "landscape" : "portrait",
    bytes: size,
    skipped: !needsWork,
  };
}

/** Runs `worker` over `items` with a bounded number of concurrent tasks. */
async function mapWithLimit(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;

  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  });

  await Promise.all(runners);
  return results;
}

async function main() {
  if (!existsSync(SOURCE_DIR)) {
    console.error(`✗ No source directory at ${SOURCE_DIR}`);
    process.exit(1);
  }

  const filenames = (await fs.readdir(SOURCE_DIR))
    .filter((f) => /\.(jpe?g|png|webp|tiff?)$/i.test(f))
    .sort();

  if (filenames.length === 0) {
    console.error(`✗ No images found in ${SOURCE_DIR}`);
    process.exit(1);
  }

  await Promise.all([
    fs.mkdir(FULL_DIR, { recursive: true }),
    fs.mkdir(THUMB_DIR, { recursive: true }),
    fs.mkdir(path.dirname(MANIFEST), { recursive: true }),
  ]);

  console.log(
    `Processing ${filenames.length} photos${FORCE ? " (forced rebuild)" : ""}…`,
  );
  const started = Date.now();
  let done = 0;

  const photos = await mapWithLimit(filenames, CONCURRENCY, async (filename) => {
    const photo = await renderOne(filename);
    done += 1;
    process.stdout.write(
      `\r  ${String(done).padStart(3)}/${filenames.length}  ${photo.slug.slice(0, 44).padEnd(44)}`,
    );
    return photo;
  });

  process.stdout.write("\n");

  // Slug collisions would silently overwrite one photo with another.
  const seen = new Set();
  for (const photo of photos) {
    if (seen.has(photo.slug)) {
      console.error(`✗ Duplicate slug "${photo.slug}" — rename ${photo.filename}`);
      process.exit(1);
    }
    seen.add(photo.slug);
  }

  const manifest = photos.map(({ skipped, ...photo }) => photo);
  await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");

  const totalMb = photos.reduce((sum, p) => sum + p.bytes, 0) / 1024 / 1024;
  const reused = photos.filter((p) => p.skipped).length;
  const landscape = photos.filter((p) => p.orientation === "landscape").length;

  console.log(
    `\n✓ ${photos.length} photos ready in ${((Date.now() - started) / 1000).toFixed(1)}s` +
      (reused ? ` (${reused} already up to date)` : ""),
  );
  console.log(`  ${landscape} landscape · ${photos.length - landscape} portrait`);
  console.log(`  full/ totals ${totalMb.toFixed(1)}MB`);
  console.log(`  manifest -> data/photos.json`);
}

main().catch((error) => {
  console.error("\n✗ Photo build failed:", error);
  process.exit(1);
});
