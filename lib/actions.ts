"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "./db";
import { findPartiesByName, getPartyWithGuests } from "./queries";
import { MEAL_CHOICES } from "./wedding";
import type { Guest, Party } from "./types";

/** A party as returned to the RSVP form, with its members' current answers. */
export type LookupParty = Party & { guests: Guest[] };

export type LookupResult =
  | { ok: true; parties: LookupParty[] }
  | { ok: false; error: string };

/** Step 1 of the RSVP flow: resolve a typed name to candidate invitations. */
export async function lookupParty(search: string): Promise<LookupResult> {
  const term = search.trim();

  if (term.length < 2) {
    return { ok: false, error: "Please enter at least two characters." };
  }

  const parties = findPartiesByName(term);

  if (parties.length === 0) {
    return {
      ok: false,
      error: `We couldn't find "${term}" on the guest list. Try a last name, or the name of anyone else on your invitation.`,
    };
  }

  return { ok: true, parties };
}

export type GuestResponse = {
  guestId: number;
  attending: boolean;
  mealChoice: string | null;
  dietaryNotes: string;
};

export type SubmitResult =
  | { ok: true; attending: number; declined: number }
  | { ok: false; error: string };

const VALID_MEALS = new Set<string>(MEAL_CHOICES.map((m) => m.value));

/**
 * Step 2: record the party's answers.
 *
 * Writes every guest row and one submission row in a single transaction, so a
 * partially applied RSVP is impossible.
 */
export async function submitRsvp(input: {
  partyId: number;
  message: string;
  responses: GuestResponse[];
}): Promise<SubmitResult> {
  const party = getPartyWithGuests(input.partyId);

  if (!party) {
    return { ok: false, error: "That invitation no longer exists." };
  }

  // Only accept responses for guests who actually belong to this party — the
  // guest ids come from the client and can't be trusted.
  const validIds = new Set(party.guests.map((guest) => guest.id));
  const responses = input.responses.filter((r) => validIds.has(r.guestId));

  if (responses.length !== party.guests.length) {
    return { ok: false, error: "Please answer for everyone on your invitation." };
  }

  for (const response of responses) {
    if (!response.attending) continue;

    if (!response.mealChoice || !VALID_MEALS.has(response.mealChoice)) {
      const guest = party.guests.find((g) => g.id === response.guestId);
      const who = guest ? `${guest.first_name} ${guest.last_name}` : "each guest";
      return { ok: false, error: `Please choose a meal for ${who}.` };
    }
  }

  const attending = responses.filter((r) => r.attending).length;
  const declined = responses.length - attending;

  const db = getDb();
  const updateGuest = db.prepare(
    `UPDATE guests
     SET rsvp_status = ?, meal_choice = ?, dietary_notes = ?, responded_at = datetime('now')
     WHERE id = ? AND party_id = ?`,
  );
  const insertSubmission = db.prepare(
    `INSERT INTO rsvp_submissions (party_id, message, attending, declined)
     VALUES (?, ?, ?, ?)`,
  );

  db.transaction(() => {
    for (const response of responses) {
      updateGuest.run(
        response.attending ? "attending" : "declined",
        response.attending ? response.mealChoice : null,
        response.dietaryNotes.trim().slice(0, 500),
        response.guestId,
        input.partyId,
      );
    }

    insertSubmission.run(
      input.partyId,
      input.message.trim().slice(0, 2000),
      attending,
      declined,
    );
  })();

  // The admin dashboard, guest list, and seating board all read these rows.
  revalidatePath("/admin");
  revalidatePath("/admin/guests");
  revalidatePath("/admin/seating");

  return { ok: true, attending, declined };
}
