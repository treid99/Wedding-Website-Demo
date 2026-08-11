import { envelopeName, formatTimestamp } from "@/lib/format";
import { mealLabel } from "@/lib/wedding";
import type { PartyWithDetail } from "@/lib/queries";
import AddGuestRow from "./AddGuestRow";
import DeleteGroupButton from "./DeleteGroupButton";
import EditGroupButton from "./EditGroupButton";
import EditGuestButton from "./EditGuestButton";
import { StatusPill } from "./ui";

const SIDE_LABELS: Record<string, string> = {
  bride: "Bride's side",
  groom: "Groom's side",
  both: "Both / shared",
};

/**
 * One invitation group: its members, the couple's private notes, the message the
 * party left with their RSVP, and the controls for editing all of it.
 *
 * A server component — every interactive control here is a small client island
 * (the two header icons, the per-guest pencil, the add-guest row) so the card
 * itself ships no JavaScript.
 */
export default function PartyCard({
  party,
  allParties,
}: {
  party: PartyWithDetail;
  allParties: { id: number; name: string }[];
}) {
  const envelope = envelopeName(party);

  return (
    <section className="border border-line bg-white">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 border-b border-line bg-cream/60 px-5 py-4">
        <div className="min-w-0 flex-1">
          <h3 className="display text-xl text-ink">{party.name}</h3>

          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
            <code className="bg-white px-1.5 py-0.5 font-mono text-[0.7rem] tracking-wider text-gold">
              {party.invite_code}
            </code>
            <span aria-hidden>·</span>
            <span>{SIDE_LABELS[party.side] ?? party.side}</span>
            {party.address ? (
              <>
                <span aria-hidden>·</span>
                <span>{party.address}</span>
              </>
            ) : null}
          </p>

          {/* Only worth a line when it differs from the group name it defaults to. */}
          {envelope !== party.name ? (
            <p className="mt-1 text-xs text-muted">
              <span className="tracking-[0.1em] text-ink/50 uppercase">
                Envelope:
              </span>{" "}
              {envelope}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="flex items-center gap-3 text-xs">
            <span className="text-sage">{party.attending} yes</span>
            <span className="text-muted">{party.declined} no</span>
            {party.pending > 0 ? (
              <span className="text-gold">{party.pending} pending</span>
            ) : null}
          </span>

          <span className="flex items-center gap-1.5">
            <EditGroupButton party={party} />
            <DeleteGroupButton
              partyId={party.id}
              partyName={party.name}
              guestCount={party.guests.length}
            />
          </span>
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
            className="flex items-center justify-between gap-3 px-5 py-3"
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

            <div className="shrink-0">
              <EditGuestButton guest={guest} parties={allParties} />
            </div>
          </li>
        ))}

        {party.guests.length === 0 ? (
          <li className="px-5 py-6 text-center text-sm text-muted">
            No guests in this group yet.
          </li>
        ) : null}
      </ul>

      <AddGuestRow partyId={party.id} partyName={party.name} />
    </section>
  );
}
