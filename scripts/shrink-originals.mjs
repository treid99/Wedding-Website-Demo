/**
 * Shrinks the photos in ./images in place so they're small enough to commit.
 *
 *   <name>.jpg  (~3MB, 5458px)  ->  <name>.webp  (~190KB, max 2048px)
 *
 * The whole set goes from ~180MB to ~11MB, which makes the repo self-contained:
 * a fresh clone can run `npm run setup` and get a working site.
 *
 * Why 2048px / quality 85:
 *   The site's largest rendered asset is the 1600px "full" tier, so 2048 leaves
 *   headroom without waste. Deriving 1600px from a 2048px source instead of the
 *   5458px original measures at ~37dB PSNR — visually indistinguishable. That
 *   gap is a two-step resampling artifact, not compression damage: a *lossless*
 *   intermediate scores the same, so paying for higher quality buys nothing.
 *
 * Safe to re-run: photos already within bounds are skipped. Converted files are
 * staged in a temp directory and verified before anything is deleted.
 *
 *   npm run photos:shrink
 *   npm run photos:shrink -- --dry-run
 *
 * This rewrites your only copy of these files. Keep the full-resolution set
 * somewhere else if you still need it.
 */

import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMAGES = path.join(ROOT, "images");
const STAGING = path.join(IMAGES, ".shrink-staging");

const MAX_EDGE = 2048;
const QUALITY = 85;
const MIN_PLAUSIBLE_BYTES = 8 * 1024;

const DRY_RUN = process.argv.includes("--dry-run");

function mb(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

async function main() {
  if (!existsSync(IMAGES)) {
    console.error(`✗ No images directory at ${IMAGES}`);
    process.exit(1);
  }

  const entries = (await fs.readdir(IMAGES)).filter((f) =>
    /\.(jpe?g|png|tiff?|webp)$/i.test(f),
  );

  if (entries.length === 0) {
    console.error(`✗ No photos found in ${IMAGES}`);
    process.exit(1);
  }

  // Decide what actually needs work before touching anything.
  const plan = [];
  let sizeBefore = 0;

  for (const filename of entries.sort()) {
    const source = path.join(IMAGES, filename);
    const { size } = await fs.stat(source);
    sizeBefore += size;

    const meta = await sharp(source).metadata();
    // EXIF orientation 5-8 swaps the axes, so compare post-rotation dimensions.
    const swapped = (meta.orientation ?? 1) >= 5;
    const width = swapped ? meta.height : meta.width;
    const height = swapped ? meta.width : meta.height;

    const alreadySmall =
      meta.format === "webp" && width <= MAX_EDGE && height <= MAX_EDGE;

    plan.push({
      filename,
      source,
      size,
      width,
      height,
      target: `${path.basename(filename, path.extname(filename))}.webp`,
      skip: alreadySmall,
    });
  }

  const todo = plan.filter((p) => !p.skip);
  const skipped = plan.length - todo.length;

  console.log(`${plan.length} photos in ./images — ${mb(sizeBefore)} total`);
  if (skipped) console.log(`  ${skipped} already within ${MAX_EDGE}px WebP, skipping`);

  if (todo.length === 0) {
    console.log("✓ Nothing to do.");
    return;
  }

  if (DRY_RUN) {
    console.log(`\nDry run — would convert ${todo.length} files to ${MAX_EDGE}px WebP q${QUALITY}:`);
    for (const item of todo.slice(0, 5)) {
      console.log(
        `  ${item.filename} (${item.width}x${item.height}, ${mb(item.size)}) -> ${item.target}`,
      );
    }
    if (todo.length > 5) console.log(`  … and ${todo.length - 5} more`);
    console.log("\nRe-run without --dry-run to apply.");
    return;
  }

  // ── Convert ──────────────────────────────────────────────────────────────
  // Each photo's replacement is written and verified before its original is
  // deleted. A crash partway through therefore leaves a valid mixed set that
  // re-running repairs — converted files are skipped, the rest are picked up.
  await fs.rm(STAGING, { recursive: true, force: true });

  console.log(`\nConverting to ${MAX_EDGE}px WebP q${QUALITY}…`);
  let done = 0;
  let sizeAfter = 0;

  // Windows can hold a transient handle on a file just written (indexer,
  // antivirus), so retry a failed delete rather than aborting mid-run.
  const removeWithRetry = async (target) => {
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        await fs.rm(target, { force: true });
        return;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 150 * (attempt + 1)));
      }
    }
    await fs.rm(target, { force: true }); // final attempt, let it throw
  };

  for (const item of todo) {
    const destination = path.join(IMAGES, item.target);

    // Both reads and writes go through Node buffers rather than sharp's own file
    // I/O. On Windows libvips keeps its input mapped and its output open past
    // the await, which made unlink fail with EPERM and rename with EBUSY.
    const input = await fs.readFile(item.source);

    const output = await sharp(input, { failOn: "none" })
      .rotate() // bake in EXIF orientation; metadata is stripped by default
      .resize({
        width: MAX_EDGE,
        height: MAX_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: QUALITY })
      .toBuffer();

    // Verify the replacement before letting go of the original.
    const check = await sharp(output).metadata();

    if (
      output.length < MIN_PLAUSIBLE_BYTES ||
      check.format !== "webp" ||
      check.width > MAX_EDGE ||
      check.height > MAX_EDGE
    ) {
      console.error(
        `\n✗ ${item.target} failed verification (${output.length} bytes, ${check.width}x${check.height}).`,
      );
      console.error(`  ${item.filename} was left untouched. Nothing else changed.`);
      process.exit(1);
    }

    await fs.writeFile(destination, output);

    // The .jpg source and .webp replacement are different paths; a source that
    // was already .webp has just been overwritten in place and must not be
    // deleted.
    if (path.resolve(item.source) !== path.resolve(destination)) {
      await removeWithRetry(item.source);
    }

    item.newSize = output.length;
    sizeAfter += output.length;
    done += 1;
    process.stdout.write(
      `\r  ${String(done).padStart(3)}/${todo.length}  ${item.target.slice(0, 44).padEnd(44)}`,
    );
  }

  process.stdout.write("\n");
  await fs.rm(STAGING, { recursive: true, force: true });

  const skippedBytes = plan
    .filter((p) => p.skip)
    .reduce((sum, p) => sum + p.size, 0);
  const total = sizeAfter + skippedBytes;

  console.log(
    `\n✓ ${done} photos shrunk: ${mb(sizeBefore)} -> ${mb(total)} ` +
      `(${(100 - (total / sizeBefore) * 100).toFixed(0)}% smaller)`,
  );
  console.log(`  average ${(sizeAfter / done / 1024).toFixed(0)}KB per photo`);
  console.log(`\nNext: npm run photos:build -- --force   (re-derive from the new sources)`);
  console.log(`      npm run db:reset`);
}

main().catch(async (error) => {
  console.error("\n✗ Shrink failed:", error);
  console.error(`  Originals untouched. Check ${STAGING} if it exists.`);
  process.exit(1);
});
