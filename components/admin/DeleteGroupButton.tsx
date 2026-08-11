"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { deleteParty, type ActionResult } from "@/lib/admin-actions";
import { pluralize } from "@/lib/format";
import Modal, { ModalError } from "./Modal";
import { IconButton, TrashIcon, WarningIcon } from "./icons";

/**
 * Deleting a group, behind a deliberate second click.
 *
 * The cascade takes the guests, their RSVPs, their table assignments and their
 * notes with it and there's no undo, so the confirmation names everything that
 * goes rather than asking a vague "are you sure?".
 */
export default function DeleteGroupButton({
  partyId,
  partyName,
  guestCount,
}: {
  partyId: number;
  partyName: string;
  guestCount: number;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    deleteParty,
    null,
  );

  // A successful delete revalidates the page, which unmounts this whole card.
  // Closing anyway keeps the modal from being left up if that ever lags.
  useEffect(() => {
    if (state?.ok) close();
  }, [state, close]);

  return (
    <>
      <IconButton
        label={`Delete ${partyName}`}
        onClick={() => setOpen(true)}
        tone="danger"
      >
        <TrashIcon />
      </IconButton>

      <Modal
        open={open}
        onClose={close}
        size="sm"
        title="Delete this group?"
        subtitle={partyName}
      >
        <div className="px-6 py-6">
          <div className="flex gap-3">
            <span className="mt-0.5 shrink-0 text-clay">
              <WarningIcon size={20} />
            </span>
            <p className="text-sm leading-relaxed text-ink/80">
              Are you sure you want to delete this group? Deleting a group will
              also delete all guests within the group, RSVP status, table
              assignments, and any notes.
            </p>
          </div>

          {guestCount > 0 ? (
            <p className="mt-4 border-l-2 border-clay bg-cream px-4 py-3 text-sm text-ink/80">
              {guestCount} {pluralize(guestCount, "guest")} will be removed from
              the guest list.
            </p>
          ) : (
            <p className="mt-4 text-sm text-muted">
              This group has no guests in it.
            </p>
          )}

          {state && !state.ok ? (
            <div className="mt-4">
              <ModalError message={state.error} />
            </div>
          ) : null}

          {/* Cancel is a plain button so Esc, the backdrop and Cancel all agree. */}
          <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-line pt-5">
            <button
              type="button"
              onClick={close}
              disabled={pending}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <form action={formAction}>
              <input type="hidden" name="id" value={partyId} />
              <button type="submit" disabled={pending} className="btn btn-danger">
                {pending ? "Deleting…" : "Delete group"}
              </button>
            </form>
          </div>
        </div>
      </Modal>
    </>
  );
}
