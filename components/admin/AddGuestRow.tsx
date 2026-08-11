"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { createGuest, type ActionResult } from "@/lib/admin-actions";
import { PlusIcon } from "./icons";

/**
 * The per-group "Add guest" affordance.
 *
 * Collapsed to a single slim row by default. A permanently open name form in
 * every group card cost more vertical space than the guest list itself, which
 * made a page of groups hard to scan.
 */
export default function AddGuestRow({
  partyId,
  partyName,
}: {
  partyId: number;
  partyName: string;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <div className="border-t border-line bg-cream/40">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-2 px-5 py-2.5 text-xs font-medium tracking-[0.1em] text-sage uppercase transition-colors hover:bg-cream hover:text-gold"
        >
          <PlusIcon size={14} />
          Add guest
        </button>
      </div>
    );
  }

  // Remounting on each open is what resets the fields and any prior error.
  return (
    <GuestFields
      partyId={partyId}
      partyName={partyName}
      onDone={() => setOpen(false)}
    />
  );
}

function GuestFields({
  partyId,
  partyName,
  onDone,
}: {
  partyId: number;
  partyName: string;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    createGuest,
    null,
  );
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [child, setChild] = useState(false);
  const id = useId();

  // A name is the one thing the row can't be saved without, so it stands in for
  // "something has changed" here.
  const named = Boolean(first.trim() || last.trim());

  useEffect(() => {
    if (state?.ok) onDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form
      action={formAction}
      className="border-t border-line bg-cream/40 px-5 py-4"
    >
      <input type="hidden" name="party_id" value={partyId} />
      <input type="hidden" name="is_child" value={child ? "1" : "0"} />

      <p className="label mb-2">Add a guest to {partyName}</p>

      <div className="flex flex-wrap items-center gap-2">
        <input
          id={`${id}-first`}
          name="first_name"
          value={first}
          onChange={(event) => setFirst(event.target.value)}
          placeholder="First name"
          aria-label="First name"
          autoFocus
          className="field min-w-32 flex-1"
        />
        <input
          id={`${id}-last`}
          name="last_name"
          value={last}
          onChange={(event) => setLast(event.target.value)}
          placeholder="Last name"
          aria-label="Last name"
          className="field min-w-32 flex-1"
        />
        <label className="flex items-center gap-1.5 text-xs text-ink/70">
          <input
            type="checkbox"
            checked={child}
            onChange={(event) => setChild(event.target.checked)}
            className="accent-sage"
          />
          Child
        </label>
      </div>

      {state && !state.ok ? (
        <p role="alert" className="mt-3 border-l-2 border-clay bg-white px-3 py-2 text-sm">
          {state.error}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={!named || pending}
          title={named ? undefined : "Enter a name first"}
          className="btn btn-primary !px-5 !py-2"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={onDone}
          disabled={pending}
          className="btn btn-outline !px-5 !py-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
