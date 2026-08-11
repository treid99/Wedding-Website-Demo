# Jenna & Tom — Wedding Website Demo

A working proof-of-concept wedding website with two halves: a public guest-facing
site and a private dashboard for the couple. Everything is backed by a local
SQLite file, so an RSVP submitted on the public site appears in the dashboard
immediately, and content edited in the dashboard appears on the public pages.

**Jenna & Tom · Friday, September 17, 2027 · David's Country Inn, Hackettstown, NJ**

> This is a demo. Every guest, hotel, room-block code, shuttle time and price is
> fabricated. The login validates nothing. There is no payment, email, or cart.

---

## Setup

Requires Node 20.19+ (tested on 20.19.1).

```bash
npm install
npm run setup            # photos:build + db:reset  (~10s)
npm run dev              # http://localhost:3000
```

That's everything — the repo is self-contained. `npm run setup` is just
`photos:build` (derives web-sized photos from `./images`) followed by
`db:reset` (creates and seeds `data/wedding.db`). Both outputs are git-ignored
because both are generated; the source photos are committed.

### Signing in to the dashboard

Go to **/admin** (or the "Couple's dashboard" link in the site footer). The form
is pre-filled and **any** email and password will sign you in — credentials are
deliberately not checked. See the warning at the top of `lib/auth.ts`.

---

## What's here

### Public site

| Page | Notes |
|---|---|
| `/` | Crossfading hero carousel, live countdown, welcome note, quick links |
| `/story` | Four-chapter narrative, alternating photo/text (placeholder text riffs on *Pride and Prejudice*) |
| `/gallery` | 16-photo masonry collage; click for a lightbox with ←/→/Esc |
| `/travel` | Keyless Google Maps embed, written directions from N/S/E/W, two room-block hotels, airports & parking |
| `/schedule` | Three-day timeline: Thursday welcome drinks & rehearsal dinner, Friday wedding, Saturday brunch |
| `/faq` | 16 questions grouped by category, as accordions |
| `/registry` | 40 items, 3 stores. Search, price range, availability and store filters, sort, pagination |
| `/rsvp` | Name lookup → per-guest attendance, meal choice, dietary notes, and a note to the couple |

**Registry details.** Filter state lives entirely in the URL, so any view is
shareable and survives a reload or the back button. Filtering, sorting and
pagination all happen in SQL. Purchased items are dimmed, carry a ribbon, lose
their outbound link, and always sort after available items regardless of the
chosen sort — the `purchased ASC` leading term in `queryRegistry` is not
overridable.

Registry items use category artwork (`components/RegistryItemArt.tsx`) rather
than the couple's photos, since an engagement photo standing in for a Dutch oven
reads as a bug. Any item can be pointed at a real photo from the dashboard.

### Dashboard (`/admin`)

- **Dashboard** — headcounts, meal breakdown, seating and registry progress,
  recent RSVP messages, and every dietary restriction in one list for the kitchen.
- **Guests & RSVPs** — flat guest list with inline editing, or a group view for
  managing invitations. Search and filter by status or seating. Full CRUD on
  guests and invitation groups, including moving a guest between groups.
- **Seating Chart** — drag guests from the unseated pool onto tables. Capacity is
  enforced server-side; over-capacity drops are rejected with a reason. Each table
  shows occupancy and a meal tally. Every chip also has a "move to…" menu, which
  is the keyboard and touch path to the same operation. Add, rename, resize,
  empty, and delete tables.
- **Registry** — add, edit, delete; mark purchased/available with a buyer name.
- **Content & Photos** — edit page copy, schedule events, Q&A, hotels and
  directions; choose which photos appear in the gallery and hero carousel.

Every dashboard write calls `revalidatePath` for the pages it affects.

---

## Stack

- **Next.js 15** (App Router) + React 19 + TypeScript
- **Tailwind CSS v4** — design tokens as CSS custom properties in `app/globals.css`
- **better-sqlite3** → `data/wedding.db`
- **sharp** — build-time only, for the photo pipeline
- Server Actions for all mutations; no REST layer
- Native HTML5 drag events for seating — no DnD dependency

### Design

Classic elegant: ivory ground, sage and antique gold accents, Cormorant Garamond
display type over Inter. Defined once as tokens:

```
--ivory #FBF8F3   --cream #F3EDE3   --sage #6B7A63
--gold  #B08D57   --ink   #2F2C28   --muted #7C766D
```

---

## Layout

```
app/
  (public)/        the eight guest-facing pages
  admin/
    login/         ungated, outside the (app) route group
    (app)/         gated by requireAdmin() in its layout
components/
  admin/           dashboard-only components
lib/
  db.ts            SQLite singleton — imports "server-only" as a guard
  queries.ts       every read
  actions.ts       public RSVP mutations
  admin-actions.ts every dashboard mutation
  auth.ts          demo session (read the warning)
  registry-params.ts  URL <-> filter state; client-safe
  wedding.ts       the wedding's fixed facts
scripts/
  shrink-originals.mjs  one-time: makes ./images committable
  build-photos.mjs      derives the two served tiers
  schema.sql            drops and recreates everything
  seed.mjs              all seeding logic
  seed-data.mjs         all demo content in one file
```

`lib/db.ts` imports `server-only`. If a client component ever reaches the
database through an import chain, the build fails with a clear message instead of
a confusing "can't resolve 'fs'" from inside better-sqlite3.

---

## Photos

`./images` holds 59 committed source photos (~10MB) at 2048px WebP. They started
as a 180MB full-resolution set and were shrunk once by `npm run photos:shrink`
so the repo could carry them. `photos:build` then derives the two tiers the site
actually serves:

```
./images/<name>.webp   2048px, q85   committed    ~10MB
        |
        +-> public/photos/full/<name>.webp    1600px, q80   generated  ~6MB
        +-> public/photos/thumb/<name>.webp    600px, q75   generated  ~3MB
```

2048px leaves headroom over the 1600px render tier without waste. Deriving 1600
from 2048 rather than from the 5458px original measures ~37dB PSNR — visually
indistinguishable — and that gap is a two-step resampling artifact, not
compression damage: a *lossless* intermediate scores the same, so paying for
higher quality buys nothing.

Dropping new full-resolution photos into `./images`? Run `photos:shrink` (it
skips anything already in bounds), then `photos:build -- --force`, then
`db:reset`. **`photos:shrink` rewrites files in place** — keep the
full-resolution set elsewhere if you still want it.

One caveat: a single photo (`…-2681`) is 1600px rather than 2048px. Its original
was lost during the one-time shrink and it was recovered from the
already-generated 1600px derivative. It renders identically at every size the
site uses; re-drop the original over it if you want the headroom back.

## Notes & known limits

- **Photos are the couple's engagement session** — a beach proposal. The gallery
  and carousel selections are drawn by a *seeded* shuffle, so "random" is stable
  across reseeds and the captions keep matching their photos. Override the
  selection any time in **Content & Photos**.
- **Only landscape photos can go in the hero carousel** — it's a full-bleed wide
  crop and portraits get badly cut. The picker disables them and the server
  rejects them.
- **`npm audit` reports 3 high-severity advisories** in Next.js's own dependency
  tree (`next/node_modules/postcss` and `next/node_modules/sharp`). Both are
  build-time only and clearing them requires upgrading to Next 16. Our direct
  `sharp` is already on the patched 0.35.x.
- **Seeded timestamps are relative to when you run `db:reset`**, spread over the
  preceding weeks, so RSVPs you submit in the demo sort to the top of the
  dashboard as the newest.
- **`db:reset` is destructive** — it drops every table and reseeds. Any RSVPs or
  edits made in the demo are lost.
- **`photos:shrink` is destructive** — it rewrites `./images` in place. It's a
  one-time step that has already been run; you only need it again if you add new
  full-resolution photos.
