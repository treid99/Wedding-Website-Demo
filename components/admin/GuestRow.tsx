import { deleteGuest, updateGuest } from "@/lib/admin-actions";
import { MEAL_CHOICES, RSVP_STATUSES, mealLabel } from "@/lib/wedding";
import type { GuestWithContext } from "@/lib/types";
import { StatusPill } from "./ui";

/**
 * One guest in the flat list, with an inline editor that expands on click.
 *
 * Built from <details>/<summary> and plain server-action forms rather than
 * client state — it stays interactive with no JavaScript and there's no
 * client/server sync to get wrong.
 */
export default function GuestRow({
  guest,
  parties,
}: {
  guest: GuestWithContext;
  parties: { id: number; name: string }[];
}) {
  return (
    <details className="group border-b border-line last:border-0">
      <summary className="grid cursor-pointer list-none grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-cream/60 lg:grid-cols-[1.4fr_1.4fr_auto_1.2fr_1.6fr_auto]">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">
            {guest.first_name} {guest.last_name}
            {guest.is_child === 1 ? (
              <span className="ml-1.5 text-[0.6rem] tracking-[0.12em] text-gold uppercase">
                child
              </span>
            ) : null}
          </p>
          <p className="truncate text-xs text-muted lg:hidden">
            {guest.party_name}
          </p>
        </div>

        <p className="hidden min-w-0 truncate text-xs text-muted lg:block">
          {guest.party_name}
        </p>

        <div className="justify-self-end lg:justify-self-start">
          <StatusPill status={guest.rsvp_status} />
        </div>

        <p className="hidden truncate text-xs text-ink/70 lg:block">
          {mealLabel(guest.meal_choice)}
        </p>

        <p
          className="hidden truncate text-xs lg:block"
          title={guest.dietary_notes}
        >
          {guest.dietary_notes ? (
            <span className="text-gold">{guest.dietary_notes}</span>
          ) : (
            <span className="text-muted/60">—</span>
          )}
        </p>

        <span className="hidden text-xs tracking-[0.1em] text-sage uppercase group-open:hidden lg:inline">
          Edit
        </span>
      </summary>

      {/* ── Inline editor ──────────────────────────────────────────── */}
      <div className="border-t border-line bg-cream/50 px-4 py-5">
        <form action={updateGuest} className="space-y-4">
          <input type="hidden" name="id" value={guest.id} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="label" htmlFor={`first-${guest.id}`}>
                First name
              </label>
              <input
                id={`first-${guest.id}`}
                name="first_name"
                defaultValue={guest.first_name}
                required
                className="field"
              />
            </div>

            <div>
              <label className="label" htmlFor={`last-${guest.id}`}>
                Last name
              </label>
              <input
                id={`last-${guest.id}`}
                name="last_name"
                defaultValue={guest.last_name}
                className="field"
              />
            </div>

            <div>
              <label className="label" htmlFor={`status-${guest.id}`}>
                RSVP status
              </label>
              <select
                id={`status-${guest.id}`}
                name="rsvp_status"
                defaultValue={guest.rsvp_status}
                className="field"
              >
                {RSVP_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor={`meal-${guest.id}`}>
                Meal choice
              </label>
              <select
                id={`meal-${guest.id}`}
                name="meal_choice"
                defaultValue={guest.meal_choice ?? ""}
                className="field"
              >
                <option value="">— none —</option>
                {MEAL_CHOICES.map((meal) => (
                  <option key={meal.value} value={meal.value}>
                    {meal.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr]">
            <div>
              <label className="label" htmlFor={`diet-${guest.id}`}>
                Dietary notes
              </label>
              <input
                id={`diet-${guest.id}`}
                name="dietary_notes"
                defaultValue={guest.dietary_notes}
                placeholder="Allergies, restrictions, preferences"
                className="field"
              />
            </div>

            <div>
              <label className="label" htmlFor={`party-${guest.id}`}>
                Invitation group
              </label>
              <select
                id={`party-${guest.id}`}
                name="party_id"
                defaultValue={guest.party_id}
                className="field"
              >
                {parties.map((party) => (
                  <option key={party.id} value={party.id}>
                    {party.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-ink/80">
              <input
                type="checkbox"
                name="is_child"
                defaultChecked={guest.is_child === 1}
                className="accent-sage"
              />
              Child
            </label>

            <div className="flex items-center gap-2">
              {guest.table_name ? (
                <span className="text-xs text-muted">
                  Seated at {guest.table_name}
                </span>
              ) : null}
              <button type="submit" className="btn btn-primary !px-5 !py-2">
                Save
              </button>
            </div>
          </div>
        </form>

        <form action={deleteGuest} className="mt-3 border-t border-line pt-3">
          <input type="hidden" name="id" value={guest.id} />
          <button
            type="submit"
            className="text-xs tracking-[0.1em] text-muted uppercase underline underline-offset-4 hover:text-ink"
          >
            Remove {guest.first_name} from the guest list
          </button>
        </form>
      </div>
    </details>
  );
}
