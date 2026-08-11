"use client";

import { useActionState, useCallback, useEffect, useId, useState } from "react";
import { updateGuestBasics, type ActionResult } from "@/lib/admin-actions";
import type { Guest } from "@/lib/types";
import { MEAL_CHOICES, RSVP_STATUSES } from "@/lib/wedding";
import Modal, { ModalActions, ModalError } from "./Modal";
import { IconButton, PencilIcon } from "./icons";

type Field =
  | "first_name"
  | "last_name"
  | "is_child"
  | "rsvp_status"
  | "meal_choice"
  | "party_id";

const FIELDS: Field[] = [
  "first_name",
  "last_name",
  "is_child",
  "rsvp_status",
  "meal_choice",
  "party_id",
];

/**
 * Per-guest editor in the group view: name, RSVP status, meal, and which
 * invitation they belong to — replacing the old move-to dropdown, which could
 * only do the last of those.
 */
export default function EditGuestButton({
  guest,
  parties,
}: {
  guest: Guest;
  parties: { id: number; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const who = `${guest.first_name} ${guest.last_name}`.trim();

  return (
    <>
      <IconButton label={`Edit ${who}`} onClick={() => setOpen(true)}>
        <PencilIcon />
      </IconButton>

      <Modal open={open} onClose={close} title="Edit guest" subtitle={who}>
        <GuestForm guest={guest} parties={parties} onDone={close} />
      </Modal>
    </>
  );
}

function GuestForm({
  guest,
  parties,
  onDone,
}: {
  guest: Guest;
  parties: { id: number; name: string }[];
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    updateGuestBasics,
    null,
  );
  const id = useId();

  const initial: Record<Field, string> = {
    first_name: guest.first_name,
    last_name: guest.last_name,
    is_child: guest.is_child === 1 ? "1" : "0",
    rsvp_status: guest.rsvp_status,
    meal_choice: guest.meal_choice ?? "",
    party_id: String(guest.party_id),
  };
  const [values, setValues] = useState(initial);

  const set = (field: Field, value: string) =>
    setValues((current) => ({ ...current, [field]: value }));

  const dirty = FIELDS.some((field) => values[field] !== initial[field]);
  const moving = values.party_id !== initial.party_id;

  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="space-y-5 px-6 py-6">
      <input type="hidden" name="id" value={guest.id} />
      {/* Explicit 0/1 rather than a checkbox's on/absent: an unchecked box sends
          nothing at all, which the server can't tell from "field not in form". */}
      <input type="hidden" name="is_child" value={values.is_child} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor={`${id}-first`}>
            First name
          </label>
          <input
            id={`${id}-first`}
            name="first_name"
            value={values.first_name}
            onChange={(event) => set("first_name", event.target.value)}
            autoFocus
            className="field"
          />
        </div>
        <div>
          <label className="label" htmlFor={`${id}-last`}>
            Last name
          </label>
          <input
            id={`${id}-last`}
            name="last_name"
            value={values.last_name}
            onChange={(event) => set("last_name", event.target.value)}
            className="field"
          />
        </div>
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-ink/80">
        <input
          type="checkbox"
          checked={values.is_child === "1"}
          onChange={(event) => set("is_child", event.target.checked ? "1" : "0")}
          className="accent-sage"
        />
        This guest is a child
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor={`${id}-status`}>
            RSVP status
          </label>
          <select
            id={`${id}-status`}
            name="rsvp_status"
            value={values.rsvp_status}
            onChange={(event) => set("rsvp_status", event.target.value)}
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
          <label className="label" htmlFor={`${id}-meal`}>
            Meal choice
          </label>
          <select
            id={`${id}-meal`}
            name="meal_choice"
            value={values.meal_choice}
            onChange={(event) => set("meal_choice", event.target.value)}
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

      <div className="border-t border-line pt-5">
        <label className="label" htmlFor={`${id}-party`}>
          Invitation group
        </label>
        <select
          id={`${id}-party`}
          name="party_id"
          value={values.party_id}
          onChange={(event) => set("party_id", event.target.value)}
          className="field"
        >
          {parties.map((party) => (
            <option key={party.id} value={party.id}>
              {party.name}
            </option>
          ))}
        </select>
        {moving ? (
          <p className="mt-1.5 text-xs text-gold">
            Saving will move this guest to another invitation.
          </p>
        ) : (
          <p className="mt-1.5 text-xs text-muted">
            Everyone on the same invitation RSVPs together.
          </p>
        )}
      </div>

      {state && !state.ok ? <ModalError message={state.error} /> : null}

      <ModalActions dirty={dirty} pending={pending} onCancel={onDone} />
    </form>
  );
}
