import {
  createGuest,
  deleteParty,
  moveGuest,
  updateParty,
} from "@/lib/admin-actions";
import { formatTimestamp } from "@/lib/format";
import { mealLabel } from "@/lib/wedding";
import type { PartyWithDetail } from "@/lib/queries";
import { StatusPill } from "./ui";

const SIDES = [
  { value: "bride", label: "Bride's side" },
  { value: "groom", label: "Groom's side" },
  { value: "both", label: "Both / shared" },
];

/**
 * One invitation group: its members, the couple's private notes, the message the
 * party left with their RSVP, and the controls for regrouping guests.
 */
export default function PartyCard({
  party,
  allParties,
}: {
  party: PartyWithDetail;
  allParties: { id: number; name: string }[];
}) {
  const otherParties = allParties.filter((other) => other.id !== party.id);

  return (
    <section className="border border-line bg-white">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line bg-cream/60 px-5 py-4">
        <div className="min-w-0">
          <h3 className="display text-xl text-ink">{party.name}</h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            <code className="bg-white px-1.5 py-0.5 font-mono text-[0.7rem] tracking-wider text-gold">
              {party.invite_code}
            </code>
            <span>
              {SIDES.find((s) => s.value === party.side)?.label ?? party.side}
            </span>
            {party.address ? <span>{party.address}</span> : null}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3 text-xs">
          <span className="text-sage">{party.attending} yes</span>
          <span className="text-muted">{party.declined} no</span>
          {party.pending > 0 ? (
            <span className="text-gold">{party.pending} pending</span>
          ) : null}
        </div>
      </header>

      {/* ── Private note from the couple ───────────────────────────── */}
      {party.notes ? (
        <p className="border-b border-line px-5 py-3 text-xs leading-relaxed text-muted">
          <span className="font-medium tracking-[0.1em] text-ink/60 uppercase">
            Our note:
          </span>{" "}
          {party.notes}
        </p>
      ) : null}

      {/* ── Message the guests left ────────────────────────────────── */}
      {party.latestSubmission?.message ? (
        <div className="border-b border-line bg-white px-5 py-4">
          <p className="text-[0.65rem] font-medium tracking-[0.14em] text-gold uppercase">
            Their message · {formatTimestamp(party.latestSubmission.submitted_at)}
          </p>
          <p className="mt-2 border-l-2 border-gold-light pl-3 text-[0.875rem] leading-relaxed text-ink/80 italic">
            “{party.latestSubmission.message}”
          </p>
        </div>
      ) : null}

      {/* ── Members ────────────────────────────────────────────────── */}
      <ul className="divide-y divide-line">
        {party.guests.map((guest) => (
          <li
            key={guest.id}
            className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
          >
            <div className="min-w-0">
              <p className="text-sm text-ink">
                {guest.first_name} {guest.last_name}
                {guest.is_child === 1 ? (
                  <span className="ml-1.5 text-[0.6rem] tracking-[0.12em] text-gold uppercase">
                    child
                  </span>
                ) : null}
              </p>
              <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted">
                <StatusPill status={guest.rsvp_status} />
                {guest.meal_choice ? (
                  <span>{mealLabel(guest.meal_choice)}</span>
                ) : null}
                {guest.dietary_notes ? (
                  <span className="text-gold">{guest.dietary_notes}</span>
                ) : null}
              </p>
            </div>

            {/* Move this guest to a different invitation */}
            {otherParties.length > 0 ? (
              <form action={moveGuest} className="flex items-center gap-2">
                <input type="hidden" name="id" value={guest.id} />
                <label className="sr-only" htmlFor={`move-${guest.id}`}>
                  Move {guest.first_name} to another group
                </label>
                <select
                  id={`move-${guest.id}`}
                  name="party_id"
                  defaultValue=""
                  className="field w-auto py-1 text-xs"
                >
                  <option value="" disabled>
                    Move to…
                  </option>
                  {otherParties.map((other) => (
                    <option key={other.id} value={other.id}>
                      {other.name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="border border-line bg-white px-2.5 py-1 text-[0.7rem] tracking-[0.1em] text-ink/70 uppercase transition-colors hover:border-gold hover:text-ink"
                >
                  Move
                </button>
              </form>
            ) : null}
          </li>
        ))}

        {party.guests.length === 0 ? (
          <li className="px-5 py-6 text-center text-sm text-muted">
            No guests in this group yet.
          </li>
        ) : null}
      </ul>

      {/* ── Add a guest ────────────────────────────────────────────── */}
      <form
        action={createGuest}
        className="flex flex-wrap items-end gap-3 border-t border-line bg-cream/40 px-5 py-4"
      >
        <input type="hidden" name="party_id" value={party.id} />
        <div className="min-w-32 flex-1">
          <label className="label" htmlFor={`new-first-${party.id}`}>
            Add a guest
          </label>
          <input
            id={`new-first-${party.id}`}
            name="first_name"
            placeholder="First name"
            required
            className="field"
          />
        </div>
        <div className="min-w-32 flex-1">
          <label className="label sr-only" htmlFor={`new-last-${party.id}`}>
            Last name
          </label>
          <input
            id={`new-last-${party.id}`}
            name="last_name"
            placeholder="Last name"
            className="field"
          />
        </div>
        <label className="flex items-center gap-2 pb-2.5 text-xs text-ink/70">
          <input type="checkbox" name="is_child" className="accent-sage" />
          Child
        </label>
        <button type="submit" className="btn btn-outline !px-4 !py-2.5">
          Add
        </button>
      </form>

      {/* ── Edit / delete the group ────────────────────────────────── */}
      <details className="border-t border-line">
        <summary className="cursor-pointer list-none px-5 py-3 text-xs tracking-[0.1em] text-sage uppercase hover:text-gold">
          Edit this group
        </summary>

        <div className="border-t border-line bg-cream/50 px-5 py-5">
          <form action={updateParty} className="space-y-4">
            <input type="hidden" name="id" value={party.id} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor={`pname-${party.id}`}>
                  Group name
                </label>
                <input
                  id={`pname-${party.id}`}
                  name="name"
                  defaultValue={party.name}
                  required
                  className="field"
                />
              </div>
              <div>
                <label className="label" htmlFor={`pside-${party.id}`}>
                  Side
                </label>
                <select
                  id={`pside-${party.id}`}
                  name="side"
                  defaultValue={party.side}
                  className="field"
                >
                  {SIDES.map((side) => (
                    <option key={side.value} value={side.value}>
                      {side.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label" htmlFor={`paddr-${party.id}`}>
                Mailing address
              </label>
              <input
                id={`paddr-${party.id}`}
                name="address"
                defaultValue={party.address}
                className="field"
              />
            </div>

            <div>
              <label className="label" htmlFor={`pnotes-${party.id}`}>
                Private note (never shown to guests)
              </label>
              <textarea
                id={`pnotes-${party.id}`}
                name="notes"
                defaultValue={party.notes}
                rows={2}
                className="field resize-y"
              />
            </div>

            <button type="submit" className="btn btn-primary !px-5 !py-2">
              Save group
            </button>
          </form>

          <form action={deleteParty} className="mt-4 border-t border-line pt-4">
            <input type="hidden" name="id" value={party.id} />
            <button
              type="submit"
              className="text-xs tracking-[0.1em] text-muted uppercase underline underline-offset-4 hover:text-ink"
            >
              Delete this group and its {party.guests.length} guest
              {party.guests.length === 1 ? "" : "s"}
            </button>
          </form>
        </div>
      </details>
    </section>
  );
}
