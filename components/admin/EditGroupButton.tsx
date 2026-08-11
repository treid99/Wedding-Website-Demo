"use client";

import { useActionState, useCallback, useEffect, useId, useState } from "react";
import { updateParty, type ActionResult } from "@/lib/admin-actions";
import type { Party } from "@/lib/types";
import Modal, { ModalActions, ModalError } from "./Modal";
import { IconButton, PencilIcon } from "./icons";

const SIDES = [
  { value: "bride", label: "Bride's side" },
  { value: "groom", label: "Groom's side" },
  { value: "both", label: "Both / shared" },
];

/** The editable columns, as strings — one list drives both state and dirtiness. */
type Field = "name" | "envelope_name" | "side" | "address" | "notes";

const FIELDS: Field[] = ["name", "envelope_name", "side", "address", "notes"];

export default function EditGroupButton({ party }: { party: Party }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <IconButton label={`Edit ${party.name}`} onClick={() => setOpen(true)}>
        <PencilIcon />
      </IconButton>

      <Modal
        open={open}
        onClose={close}
        title="Edit group"
        subtitle={`Invitation ${party.invite_code}`}
      >
        <GroupForm party={party} onDone={close} />
      </Modal>
    </>
  );
}

function GroupForm({ party, onDone }: { party: Party; onDone: () => void }) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    updateParty,
    null,
  );
  const id = useId();

  // Seeded from props exactly once. The modal unmounts this form on close, so
  // reopening it re-seeds from whatever the server most recently rendered.
  const initial: Record<Field, string> = {
    name: party.name,
    envelope_name: party.envelope_name,
    side: party.side,
    address: party.address,
    notes: party.notes,
  };
  const [values, setValues] = useState(initial);

  const set = (field: Field, value: string) =>
    setValues((current) => ({ ...current, [field]: value }));

  const dirty = FIELDS.some((field) => values[field] !== initial[field]);

  useEffect(() => {
    if (state?.ok) onDone();
    // onDone is stable (useCallback in the parent).
  }, [state, onDone]);

  return (
    <form action={formAction} className="space-y-5 px-6 py-6">
      <input type="hidden" name="id" value={party.id} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr]">
        <div>
          <label className="label" htmlFor={`${id}-name`}>
            Group name
          </label>
          <input
            id={`${id}-name`}
            name="name"
            value={values.name}
            onChange={(event) => set("name", event.target.value)}
            autoFocus
            className="field"
          />
        </div>
        <div>
          <label className="label" htmlFor={`${id}-side`}>
            Side
          </label>
          <select
            id={`${id}-side`}
            name="side"
            value={values.side}
            onChange={(event) => set("side", event.target.value)}
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
        <label className="label" htmlFor={`${id}-envelope`}>
          Envelope addressee (optional)
        </label>
        <input
          id={`${id}-envelope`}
          name="envelope_name"
          value={values.envelope_name}
          onChange={(event) => set("envelope_name", event.target.value)}
          placeholder={party.name}
          className="field"
        />
        <p className="mt-1.5 text-xs text-muted">
          How the names should read on the invitation envelope. Leave it blank
          and it follows the group name — currently{" "}
          <span className="text-ink/70">
            {values.envelope_name.trim() || values.name || party.name}
          </span>
          .
        </p>
      </div>

      <div>
        <label className="label" htmlFor={`${id}-address`}>
          Mailing address
        </label>
        <input
          id={`${id}-address`}
          name="address"
          value={values.address}
          onChange={(event) => set("address", event.target.value)}
          placeholder="18 Ridgeview Terrace, Morristown, NJ 07960"
          className="field"
        />
      </div>

      <div>
        <label className="label" htmlFor={`${id}-notes`}>
          Private note (never shown to guests)
        </label>
        <textarea
          id={`${id}-notes`}
          name="notes"
          value={values.notes}
          onChange={(event) => set("notes", event.target.value)}
          rows={3}
          placeholder="Dietary quirks, who to seat them near, what they'll ask about"
          className="field resize-y"
        />
      </div>

      {state && !state.ok ? <ModalError message={state.error} /> : null}

      <ModalActions dirty={dirty} pending={pending} onCancel={onDone} />
    </form>
  );
}
