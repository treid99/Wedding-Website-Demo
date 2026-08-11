-- Wedding website demo — SQLite schema.
-- Applied by scripts/seed.mjs (npm run db:reset), which drops and recreates
-- everything, so ordering here is drop-safe from the leaves inward.

PRAGMA foreign_keys = OFF;

DROP TABLE IF EXISTS rsvp_submissions;
DROP TABLE IF EXISTS guests;
DROP TABLE IF EXISTS parties;
DROP TABLE IF EXISTS seating_tables;
DROP TABLE IF EXISTS registry_items;
DROP TABLE IF EXISTS schedule_events;
DROP TABLE IF EXISTS faq_items;
DROP TABLE IF EXISTS hotels;
DROP TABLE IF EXISTS directions;
DROP TABLE IF EXISTS photos;
DROP TABLE IF EXISTS content_blocks;

-- ── Editable page copy ──────────────────────────────────────────────────────
-- Freeform prose keyed by a stable slug. Seeded with defaults; the couple
-- overwrites these from /admin/content and the public pages read them back.
CREATE TABLE content_blocks (
  key        TEXT PRIMARY KEY,
  label      TEXT NOT NULL,              -- human name shown in the admin editor
  title      TEXT NOT NULL DEFAULT '',
  body       TEXT NOT NULL DEFAULT '',
  eyebrow    TEXT NOT NULL DEFAULT '',   -- small-caps kicker above the title
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Photo library ───────────────────────────────────────────────────────────
-- One row per derivative pair produced by scripts/build-photos.mjs.
CREATE TABLE photos (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL UNIQUE,
  filename    TEXT NOT NULL,
  full_path   TEXT NOT NULL,
  thumb_path  TEXT NOT NULL,
  width       INTEGER NOT NULL,
  height      INTEGER NOT NULL,
  orientation TEXT NOT NULL CHECK (orientation IN ('landscape', 'portrait')),
  caption     TEXT NOT NULL DEFAULT '',
  in_gallery  INTEGER NOT NULL DEFAULT 0 CHECK (in_gallery IN (0, 1)),
  in_carousel INTEGER NOT NULL DEFAULT 0 CHECK (in_carousel IN (0, 1)),
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_photos_gallery ON photos (in_gallery, sort_order);
CREATE INDEX idx_photos_carousel ON photos (in_carousel, sort_order);

-- ── Registry ────────────────────────────────────────────────────────────────
-- Prices are integer cents. Every item links out to an external store; there
-- is deliberately no cart or checkout.
CREATE TABLE registry_items (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  title        TEXT NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  price_cents  INTEGER NOT NULL CHECK (price_cents >= 0),
  store        TEXT NOT NULL,
  category     TEXT NOT NULL DEFAULT 'home',
  external_url TEXT NOT NULL,
  image_slug   TEXT,                     -- optional photos.slug override
  purchased    INTEGER NOT NULL DEFAULT 0 CHECK (purchased IN (0, 1)),
  purchased_by TEXT NOT NULL DEFAULT '',
  purchased_at TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_registry_purchased ON registry_items (purchased, price_cents);
CREATE INDEX idx_registry_store ON registry_items (store);

-- ── Guest list ──────────────────────────────────────────────────────────────
-- A "party" is one invitation / household. RSVP lookup resolves a searched
-- name to a party, then collects a response for every member.
CREATE TABLE parties (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  invite_code   TEXT NOT NULL UNIQUE,
  -- Addressee line as it should appear on the invitation envelope, e.g.
  -- "Mr. & Mrs. David Mitchell". Optional: blank means "use `name`", so the
  -- couple only fills it in where the formal wording differs.
  envelope_name TEXT NOT NULL DEFAULT '',
  address       TEXT NOT NULL DEFAULT '',
  notes         TEXT NOT NULL DEFAULT '',  -- private note from the couple
  side          TEXT NOT NULL DEFAULT 'both' CHECK (side IN ('bride', 'groom', 'both')),
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE seating_tables (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  shape      TEXT NOT NULL DEFAULT 'round' CHECK (shape IN ('round', 'rect')),
  capacity   INTEGER NOT NULL DEFAULT 10 CHECK (capacity > 0),
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE guests (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  party_id       INTEGER NOT NULL REFERENCES parties (id) ON DELETE CASCADE,
  first_name     TEXT NOT NULL,
  last_name      TEXT NOT NULL,
  is_child       INTEGER NOT NULL DEFAULT 0 CHECK (is_child IN (0, 1)),
  rsvp_status    TEXT NOT NULL DEFAULT 'pending'
                   CHECK (rsvp_status IN ('pending', 'attending', 'declined')),
  meal_choice    TEXT,
  dietary_notes  TEXT NOT NULL DEFAULT '',
  table_id       INTEGER REFERENCES seating_tables (id) ON DELETE SET NULL,
  responded_at   TEXT
);

CREATE INDEX idx_guests_party ON guests (party_id);
CREATE INDEX idx_guests_status ON guests (rsvp_status);
CREATE INDEX idx_guests_table ON guests (table_id);

-- One row per time the party submits the RSVP form; carries their message.
CREATE TABLE rsvp_submissions (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  party_id     INTEGER NOT NULL REFERENCES parties (id) ON DELETE CASCADE,
  message      TEXT NOT NULL DEFAULT '',
  attending    INTEGER NOT NULL DEFAULT 0,   -- headcount snapshot at submit time
  declined     INTEGER NOT NULL DEFAULT 0,
  submitted_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_submissions_party ON rsvp_submissions (party_id, submitted_at DESC);

-- ── Schedule / Q&A / Travel ─────────────────────────────────────────────────
CREATE TABLE schedule_events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  day_label   TEXT NOT NULL,     -- groups entries into timeline sections
  day_order   INTEGER NOT NULL DEFAULT 0,
  time_label  TEXT NOT NULL,
  title       TEXT NOT NULL,
  location    TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  attire      TEXT NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE faq_items (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  question   TEXT NOT NULL,
  answer     TEXT NOT NULL,
  category   TEXT NOT NULL DEFAULT 'General',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE hotels (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  address     TEXT NOT NULL DEFAULT '',
  phone       TEXT NOT NULL DEFAULT '',
  rate        TEXT NOT NULL DEFAULT '',
  block_code  TEXT NOT NULL DEFAULT '',
  cutoff      TEXT NOT NULL DEFAULT '',
  distance    TEXT NOT NULL DEFAULT '',
  booking_url TEXT NOT NULL DEFAULT '',
  notes       TEXT NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE directions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  heading    TEXT NOT NULL,     -- "From the North"
  summary    TEXT NOT NULL DEFAULT '',
  body       TEXT NOT NULL,     -- newline-separated turn-by-turn steps
  sort_order INTEGER NOT NULL DEFAULT 0
);
