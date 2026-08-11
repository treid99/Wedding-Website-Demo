"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "./db";
import { requireAdmin } from "./auth";
import { MEAL_CHOICES, RSVP_STATUSES } from "./wedding";
import { parsePriceToCents } from "./format";

/**
 * Every admin mutation. All of them call requireAdmin() first, and all of them
 * revalidate the affected public pages so an edit here shows up on the guest-
 * facing site immediately.
 */

const PUBLIC_PATHS = [
  "/",
  "/story",
  "/gallery",
  "/travel",
  "/schedule",
  "/faq",
  "/registry",
  "/rsvp",
];

const ADMIN_PATHS = [
  "/admin",
  "/admin/guests",
  "/admin/seating",
  "/admin/registry",
  "/admin/content",
];

function revalidateAdmin() {
  for (const path of ADMIN_PATHS) revalidatePath(path);
}

function revalidatePublic() {
  for (const path of PUBLIC_PATHS) revalidatePath(path);
}

// ── FormData helpers ────────────────────────────────────────────────────────

function str(form: FormData, key: string, max = 2000): string {
  return String(form.get(key) ?? "").trim().slice(0, max);
}

function num(form: FormData, key: string): number | null {
  const value = Number.parseInt(String(form.get(key) ?? ""), 10);
  return Number.isFinite(value) ? value : null;
}

function bool(form: FormData, key: string): boolean {
  const value = form.get(key);
  return value === "on" || value === "true" || value === "1";
}

const VALID_MEALS = new Set<string>(MEAL_CHOICES.map((m) => m.value));
const VALID_STATUSES = new Set<string>(RSVP_STATUSES);

// ── Guests ──────────────────────────────────────────────────────────────────

export async function updateGuest(form: FormData): Promise<void> {
  await requireAdmin();

  const id = num(form, "id");
  if (id == null) return;

  const status = str(form, "rsvp_status");
  const meal = str(form, "meal_choice");
  const partyId = num(form, "party_id");

  getDb()
    .prepare(
      `UPDATE guests
       SET first_name = ?, last_name = ?, is_child = ?, rsvp_status = ?,
           meal_choice = ?, dietary_notes = ?, party_id = COALESCE(?, party_id),
           responded_at = CASE WHEN ? = 'pending' THEN NULL
                               ELSE COALESCE(responded_at, datetime('now')) END
       WHERE id = ?`,
    )
    .run(
      str(form, "first_name", 80) || "Guest",
      str(form, "last_name", 80),
      bool(form, "is_child") ? 1 : 0,
      VALID_STATUSES.has(status) ? status : "pending",
      VALID_MEALS.has(meal) ? meal : null,
      str(form, "dietary_notes", 500),
      partyId,
      VALID_STATUSES.has(status) ? status : "pending",
      id,
    );

  revalidateAdmin();
}

export async function createGuest(form: FormData): Promise<void> {
  await requireAdmin();

  const partyId = num(form, "party_id");
  const firstName = str(form, "first_name", 80);
  if (partyId == null || !firstName) return;

  getDb()
    .prepare(
      `INSERT INTO guests (party_id, first_name, last_name, is_child, rsvp_status)
       VALUES (?, ?, ?, ?, 'pending')`,
    )
    .run(partyId, firstName, str(form, "last_name", 80), bool(form, "is_child") ? 1 : 0);

  revalidateAdmin();
}

export async function deleteGuest(form: FormData): Promise<void> {
  await requireAdmin();
  const id = num(form, "id");
  if (id == null) return;

  getDb().prepare("DELETE FROM guests WHERE id = ?").run(id);
  revalidateAdmin();
}

/** Moves a guest to a different invitation group. */
export async function moveGuest(form: FormData): Promise<void> {
  await requireAdmin();

  const id = num(form, "id");
  const partyId = num(form, "party_id");
  if (id == null || partyId == null) return;

  getDb().prepare("UPDATE guests SET party_id = ? WHERE id = ?").run(partyId, id);
  revalidateAdmin();
}

// ── Parties (RSVP groups) ───────────────────────────────────────────────────

/** Derives a unique invite code from the party name. */
function inviteCodeFor(name: string): string {
  const base =
    name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6) || "PARTY";

  const db = getDb();
  let candidate = base;
  let suffix = 1;

  while (
    db.prepare("SELECT 1 FROM parties WHERE invite_code = ?").get(candidate)
  ) {
    candidate = `${base}${suffix++}`;
  }

  return candidate;
}

// ── Adding people (the "Add" dialog) ────────────────────────────────────────
//
// createGroupWithMembers supersedes the old create-an-empty-group action: a
// group and its people are always saved together.

/** Result shape shared by the two dialog actions, for useActionState. */
export type AddResult =
  | { ok: true; message: string }
  | { ok: false; error: string }
  | null;

const SIDES = ["bride", "groom", "both"];

function normalizeSide(value: string): string {
  return SIDES.includes(value) ? value : "both";
}

type MemberInput = { first: string; last: string; child: boolean };

/** Parses the JSON member list the dialog submits as one hidden field. */
function parseMembers(raw: string): MemberInput[] {
  if (!raw.trim()) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((entry) => {
        const row = entry as Record<string, unknown>;
        return {
          first: String(row?.first ?? "").trim().slice(0, 80),
          last: String(row?.last ?? "").trim().slice(0, 80),
          child: row?.child === true,
        };
      })
      .filter((member) => member.first || member.last)
      .slice(0, 30);
  } catch {
    return [];
  }
}

/**
 * Creates an invitation group and its members in one transaction.
 *
 * The group and its people are saved together so the couple never has to create
 * an empty group, go find it, and then fill it in.
 */
export async function createGroupWithMembers(
  _prev: AddResult,
  form: FormData,
): Promise<AddResult> {
  await requireAdmin();

  const name = str(form, "name", 120);
  if (!name) return { ok: false, error: "Give the group a name." };

  const members = parseMembers(str(form, "members", 8000));
  const db = getDb();

  const insertParty = db.prepare(
    `INSERT INTO parties (name, invite_code, address, notes, side)
     VALUES (?, ?, ?, ?, ?)`,
  );
  const insertGuest = db.prepare(
    `INSERT INTO guests (party_id, first_name, last_name, is_child, rsvp_status)
     VALUES (?, ?, ?, ?, 'pending')`,
  );

  db.transaction(() => {
    const { lastInsertRowid } = insertParty.run(
      name,
      inviteCodeFor(name),
      str(form, "address", 300),
      str(form, "notes", 1000),
      normalizeSide(str(form, "side")),
    );

    for (const member of members) {
      insertGuest.run(
        lastInsertRowid,
        member.first || "Guest",
        member.last,
        member.child ? 1 : 0,
      );
    }
  })();

  revalidateAdmin();

  return {
    ok: true,
    message: members.length
      ? `Added ${name} with ${members.length} ${members.length === 1 ? "guest" : "guests"}.`
      : `Added ${name}. You can add guests to it any time.`,
  };
}

/**
 * Adds one guest, either to an existing group or to a brand new one created in
 * the same submission.
 */
export async function createGuestInGroup(
  _prev: AddResult,
  form: FormData,
): Promise<AddResult> {
  await requireAdmin();

  const firstName = str(form, "first_name", 80);
  const lastName = str(form, "last_name", 80);
  if (!firstName && !lastName) {
    return { ok: false, error: "Enter at least a first or last name." };
  }

  const mode = str(form, "group_mode");
  const db = getDb();

  let partyId: number | bigint | null = null;
  let groupName = "";

  if (mode === "new") {
    groupName = str(form, "new_group_name", 120);
    if (!groupName) {
      return { ok: false, error: "Name the new group, or pick an existing one." };
    }
  } else {
    partyId = num(form, "party_id");
    if (partyId == null) {
      return { ok: false, error: "Choose which group this guest belongs to." };
    }

    const party = db
      .prepare("SELECT name FROM parties WHERE id = ?")
      .get(partyId) as { name: string } | undefined;

    if (!party) return { ok: false, error: "That group no longer exists." };
    groupName = party.name;
  }

  const insertParty = db.prepare(
    `INSERT INTO parties (name, invite_code, address, notes, side)
     VALUES (?, ?, '', '', ?)`,
  );
  const insertGuest = db.prepare(
    `INSERT INTO guests (party_id, first_name, last_name, is_child, rsvp_status)
     VALUES (?, ?, ?, ?, 'pending')`,
  );

  db.transaction(() => {
    if (mode === "new") {
      const { lastInsertRowid } = insertParty.run(
        groupName,
        inviteCodeFor(groupName),
        normalizeSide(str(form, "new_group_side")),
      );
      partyId = lastInsertRowid;
    }

    insertGuest.run(
      partyId,
      firstName || "Guest",
      lastName,
      bool(form, "is_child") ? 1 : 0,
    );
  })();

  revalidateAdmin();

  const who = [firstName, lastName].filter(Boolean).join(" ");
  return { ok: true, message: `Added ${who} to ${groupName}.` };
}

export async function updateParty(form: FormData): Promise<void> {
  await requireAdmin();

  const id = num(form, "id");
  const name = str(form, "name", 120);
  if (id == null || !name) return;

  const side = str(form, "side");

  getDb()
    .prepare(
      `UPDATE parties SET name = ?, address = ?, notes = ?, side = ? WHERE id = ?`,
    )
    .run(
      name,
      str(form, "address", 300),
      str(form, "notes", 1000),
      ["bride", "groom", "both"].includes(side) ? side : "both",
      id,
    );

  revalidateAdmin();
}

/** Deleting a party cascades to its guests (see schema.sql). */
export async function deleteParty(form: FormData): Promise<void> {
  await requireAdmin();
  const id = num(form, "id");
  if (id == null) return;

  getDb().prepare("DELETE FROM parties WHERE id = ?").run(id);
  revalidateAdmin();
}

// ── Seating ─────────────────────────────────────────────────────────────────

export type SeatResult = { ok: true } | { ok: false; error: string };

/**
 * Seats a guest at a table, or unseats them when `tableId` is null.
 *
 * Called from the drag-and-drop board with typed arguments rather than FormData.
 * Capacity is enforced here, on the server — the client's optimistic check is
 * only there to avoid a pointless round trip.
 */
export async function assignSeat(
  guestId: number,
  tableId: number | null,
): Promise<SeatResult> {
  await requireAdmin();
  const db = getDb();

  const guest = db
    .prepare("SELECT id, rsvp_status FROM guests WHERE id = ?")
    .get(guestId) as { id: number; rsvp_status: string } | undefined;

  if (!guest) return { ok: false, error: "That guest no longer exists." };

  if (tableId != null) {
    const table = db
      .prepare("SELECT name, capacity FROM seating_tables WHERE id = ?")
      .get(tableId) as { name: string; capacity: number } | undefined;

    if (!table) return { ok: false, error: "That table no longer exists." };

    const seated = (
      db
        .prepare(
          "SELECT COUNT(*) AS n FROM guests WHERE table_id = ? AND id <> ?",
        )
        .get(tableId, guestId) as { n: number }
    ).n;

    if (seated >= table.capacity) {
      return {
        ok: false,
        error: `${table.name} is full (${table.capacity} seats). Raise its capacity or move someone else first.`,
      };
    }
  }

  db.prepare("UPDATE guests SET table_id = ? WHERE id = ?").run(tableId, guestId);

  revalidatePath("/admin/seating");
  revalidatePath("/admin");
  return { ok: true };
}

export async function createTable(form: FormData): Promise<void> {
  await requireAdmin();

  const name = str(form, "name", 60);
  if (!name) return;

  const shape = str(form, "shape");
  const capacity = num(form, "capacity") ?? 10;

  const nextOrder =
    (
      getDb()
        .prepare("SELECT COALESCE(MAX(sort_order), 0) AS n FROM seating_tables")
        .get() as { n: number }
    ).n + 1;

  getDb()
    .prepare(
      `INSERT INTO seating_tables (name, shape, capacity, sort_order)
       VALUES (?, ?, ?, ?)`,
    )
    .run(
      name,
      shape === "rect" ? "rect" : "round",
      Math.min(Math.max(capacity, 1), 30),
      nextOrder,
    );

  revalidateAdmin();
}

export async function updateTable(form: FormData): Promise<void> {
  await requireAdmin();

  const id = num(form, "id");
  const name = str(form, "name", 60);
  if (id == null || !name) return;

  const shape = str(form, "shape");
  const capacity = num(form, "capacity") ?? 10;

  getDb()
    .prepare(
      "UPDATE seating_tables SET name = ?, shape = ?, capacity = ? WHERE id = ?",
    )
    .run(
      name,
      shape === "rect" ? "rect" : "round",
      Math.min(Math.max(capacity, 1), 30),
      id,
    );

  revalidateAdmin();
}

/** Deleting a table unseats its guests rather than deleting them. */
export async function deleteTable(form: FormData): Promise<void> {
  await requireAdmin();
  const id = num(form, "id");
  if (id == null) return;

  getDb().prepare("DELETE FROM seating_tables WHERE id = ?").run(id);
  revalidateAdmin();
}

export async function clearTable(form: FormData): Promise<void> {
  await requireAdmin();
  const id = num(form, "id");
  if (id == null) return;

  getDb().prepare("UPDATE guests SET table_id = NULL WHERE table_id = ?").run(id);
  revalidateAdmin();
}

// ── Registry ────────────────────────────────────────────────────────────────

function registryFieldsFrom(form: FormData) {
  return {
    title: str(form, "title", 160),
    description: str(form, "description", 600),
    price_cents: parsePriceToCents(str(form, "price", 20)) ?? 0,
    store: str(form, "store", 80) || "Other",
    category: str(form, "category", 40) || "home",
    external_url: str(form, "external_url", 500),
    image_slug: str(form, "image_slug", 120) || null,
  };
}

export async function createRegistryItem(form: FormData): Promise<void> {
  await requireAdmin();

  const fields = registryFieldsFrom(form);
  if (!fields.title || !fields.external_url) return;

  const nextOrder =
    (
      getDb()
        .prepare("SELECT COALESCE(MAX(sort_order), 0) AS n FROM registry_items")
        .get() as { n: number }
    ).n + 1;

  getDb()
    .prepare(
      `INSERT INTO registry_items
         (title, description, price_cents, store, category, external_url,
          image_slug, purchased, sort_order)
       VALUES (@title, @description, @price_cents, @store, @category,
               @external_url, @image_slug, 0, @sort_order)`,
    )
    .run({ ...fields, sort_order: nextOrder });

  revalidateAdmin();
  revalidatePath("/registry");
}

export async function updateRegistryItem(form: FormData): Promise<void> {
  await requireAdmin();

  const id = num(form, "id");
  const fields = registryFieldsFrom(form);
  if (id == null || !fields.title) return;

  getDb()
    .prepare(
      `UPDATE registry_items
       SET title = @title, description = @description, price_cents = @price_cents,
           store = @store, category = @category, external_url = @external_url,
           image_slug = @image_slug
       WHERE id = @id`,
    )
    .run({ ...fields, id });

  revalidateAdmin();
  revalidatePath("/registry");
}

export async function deleteRegistryItem(form: FormData): Promise<void> {
  await requireAdmin();
  const id = num(form, "id");
  if (id == null) return;

  getDb().prepare("DELETE FROM registry_items WHERE id = ?").run(id);
  revalidateAdmin();
  revalidatePath("/registry");
}

/** Marks an item bought (or puts it back on the list). */
export async function setRegistryPurchased(form: FormData): Promise<void> {
  await requireAdmin();

  const id = num(form, "id");
  if (id == null) return;

  const purchased = bool(form, "purchased");

  getDb()
    .prepare(
      `UPDATE registry_items
       SET purchased = ?, purchased_by = ?, purchased_at = ?
       WHERE id = ?`,
    )
    .run(
      purchased ? 1 : 0,
      purchased ? str(form, "purchased_by", 120) : "",
      purchased ? new Date().toISOString().slice(0, 19).replace("T", " ") : null,
      id,
    );

  revalidateAdmin();
  revalidatePath("/registry");
}

// ── Content blocks ──────────────────────────────────────────────────────────

export async function updateContentBlock(form: FormData): Promise<void> {
  await requireAdmin();

  const key = str(form, "key", 80);
  if (!key) return;

  getDb()
    .prepare(
      `UPDATE content_blocks
       SET eyebrow = ?, title = ?, body = ?, updated_at = datetime('now')
       WHERE key = ?`,
    )
    .run(
      str(form, "eyebrow", 80),
      str(form, "title", 200),
      str(form, "body", 20000),
      key,
    );

  revalidateAdmin();
  revalidatePublic();
}

// ── Schedule ────────────────────────────────────────────────────────────────

export async function upsertScheduleEvent(form: FormData): Promise<void> {
  await requireAdmin();

  const id = num(form, "id");
  const title = str(form, "title", 160);
  const dayLabel = str(form, "day_label", 120);
  if (!title || !dayLabel) return;

  const fields = {
    day_label: dayLabel,
    day_order: num(form, "day_order") ?? 1,
    time_label: str(form, "time_label", 60),
    title,
    location: str(form, "location", 200),
    description: str(form, "description", 1000),
    attire: str(form, "attire", 120),
    sort_order: num(form, "sort_order") ?? 99,
  };

  if (id == null) {
    getDb()
      .prepare(
        `INSERT INTO schedule_events
           (day_label, day_order, time_label, title, location, description, attire, sort_order)
         VALUES (@day_label, @day_order, @time_label, @title, @location,
                 @description, @attire, @sort_order)`,
      )
      .run(fields);
  } else {
    getDb()
      .prepare(
        `UPDATE schedule_events
         SET day_label = @day_label, day_order = @day_order, time_label = @time_label,
             title = @title, location = @location, description = @description,
             attire = @attire, sort_order = @sort_order
         WHERE id = @id`,
      )
      .run({ ...fields, id });
  }

  revalidateAdmin();
  revalidatePath("/schedule");
}

export async function deleteScheduleEvent(form: FormData): Promise<void> {
  await requireAdmin();
  const id = num(form, "id");
  if (id == null) return;

  getDb().prepare("DELETE FROM schedule_events WHERE id = ?").run(id);
  revalidateAdmin();
  revalidatePath("/schedule");
}

// ── Q&A ─────────────────────────────────────────────────────────────────────

export async function upsertFaqItem(form: FormData): Promise<void> {
  await requireAdmin();

  const id = num(form, "id");
  const question = str(form, "question", 300);
  const answer = str(form, "answer", 4000);
  if (!question || !answer) return;

  const fields = {
    question,
    answer,
    category: str(form, "category", 60) || "General",
    sort_order: num(form, "sort_order") ?? 99,
  };

  if (id == null) {
    getDb()
      .prepare(
        `INSERT INTO faq_items (question, answer, category, sort_order)
         VALUES (@question, @answer, @category, @sort_order)`,
      )
      .run(fields);
  } else {
    getDb()
      .prepare(
        `UPDATE faq_items
         SET question = @question, answer = @answer, category = @category,
             sort_order = @sort_order
         WHERE id = @id`,
      )
      .run({ ...fields, id });
  }

  revalidateAdmin();
  revalidatePath("/faq");
}

export async function deleteFaqItem(form: FormData): Promise<void> {
  await requireAdmin();
  const id = num(form, "id");
  if (id == null) return;

  getDb().prepare("DELETE FROM faq_items WHERE id = ?").run(id);
  revalidateAdmin();
  revalidatePath("/faq");
}

// ── Travel ──────────────────────────────────────────────────────────────────

export async function updateHotel(form: FormData): Promise<void> {
  await requireAdmin();

  const id = num(form, "id");
  const name = str(form, "name", 160);
  if (id == null || !name) return;

  getDb()
    .prepare(
      `UPDATE hotels
       SET name = ?, address = ?, phone = ?, rate = ?, block_code = ?,
           cutoff = ?, distance = ?, booking_url = ?, notes = ?
       WHERE id = ?`,
    )
    .run(
      name,
      str(form, "address", 300),
      str(form, "phone", 40),
      str(form, "rate", 60),
      str(form, "block_code", 40),
      str(form, "cutoff", 80),
      str(form, "distance", 120),
      str(form, "booking_url", 500),
      str(form, "notes", 1500),
      id,
    );

  revalidateAdmin();
  revalidatePath("/travel");
}

export async function updateDirection(form: FormData): Promise<void> {
  await requireAdmin();

  const id = num(form, "id");
  const heading = str(form, "heading", 80);
  if (id == null || !heading) return;

  getDb()
    .prepare("UPDATE directions SET heading = ?, summary = ?, body = ? WHERE id = ?")
    .run(heading, str(form, "summary", 200), str(form, "body", 4000), id);

  revalidateAdmin();
  revalidatePath("/travel");
}

// ── Photos ──────────────────────────────────────────────────────────────────

/** Toggles a photo's gallery / carousel membership and edits its caption. */
export async function updatePhoto(
  photoId: number,
  patch: { in_gallery?: boolean; in_carousel?: boolean; caption?: string },
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const db = getDb();

  const photo = db
    .prepare("SELECT id, orientation FROM photos WHERE id = ?")
    .get(photoId) as { id: number; orientation: string } | undefined;

  if (!photo) return { ok: false, error: "That photo no longer exists." };

  // The hero is a wide crop — a portrait would be badly cut off.
  if (patch.in_carousel === true && photo.orientation !== "landscape") {
    return {
      ok: false,
      error: "Only landscape photos work in the hero carousel.",
    };
  }

  const sets: string[] = [];
  const params: unknown[] = [];

  if (patch.in_gallery !== undefined) {
    sets.push("in_gallery = ?");
    params.push(patch.in_gallery ? 1 : 0);
  }
  if (patch.in_carousel !== undefined) {
    sets.push("in_carousel = ?");
    params.push(patch.in_carousel ? 1 : 0);
  }
  if (patch.caption !== undefined) {
    sets.push("caption = ?");
    params.push(patch.caption.trim().slice(0, 300));
  }

  if (sets.length === 0) return { ok: true };

  db.prepare(`UPDATE photos SET ${sets.join(", ")} WHERE id = ?`).run(
    ...params,
    photoId,
  );

  revalidatePath("/admin/content");
  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/story");

  return { ok: true };
}
