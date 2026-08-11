"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import {
  createGroupWithMembers,
  createGuestInGroup,
  type AddResult,
} from "@/lib/admin-actions";

type Tab = "guest" | "group";

type Member = { key: number; first: string; last: string; child: boolean };

const SIDES = [
  { value: "bride", label: "Bride's side" },
  { value: "groom", label: "Groom's side" },
  { value: "both", label: "Both / shared" },
];

let nextKey = 1;
const blankMember = (): Member => ({ key: nextKey++, first: "", last: "", child: false });

/**
 * The single entry point for adding people.
 *
 * Both paths complete in one submission: a guest can be dropped into an existing
 * group or into a new one named right here, and a new group is saved together
 * with its members. Neither requires creating an empty group first and then
 * going to find it — which was the confusing part of the old flow.
 */
export default function AddPeopleDialog({
  parties,
  defaultTab = "guest",
}: {
  parties: { id: number; name: string }[];
  defaultTab?: Tab;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [toast, setToast] = useState<string | null>(null);

  const show = () => {
    setTab(defaultTab);
    setOpen(true);
    dialogRef.current?.showModal();
  };

  const close = () => {
    setOpen(false);
    dialogRef.current?.close();
  };

  // Esc and backdrop dismissal come from <dialog>; keep React state in step.
  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    const onClose = () => setOpen(false);
    node.addEventListener("close", onClose);
    return () => node.removeEventListener("close", onClose);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  const onSuccess = (message: string) => {
    setToast(message);
    close();
  };

  return (
    <>
      <button type="button" onClick={show} className="btn btn-primary !px-5 !py-2.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add
      </button>

      {toast ? (
        <p
          role="status"
          className="fixed right-5 bottom-5 z-100 border border-sage/40 bg-white px-4 py-3 text-sm text-ink shadow-lg"
        >
          {toast}
        </p>
      ) : null}

      <dialog
        ref={dialogRef}
        // m-auto is load-bearing: a modal <dialog> is centred by the UA's
        // `margin: auto`, which Tailwind's preflight resets to 0.
        className="m-auto max-h-[calc(100vh-3rem)] w-[min(46rem,calc(100vw-2rem))] overflow-y-auto border border-line bg-ivory p-0 text-ink backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
        onClick={(event) => {
          // Clicking the backdrop (the dialog element itself) closes it.
          if (event.target === dialogRef.current) close();
        }}
      >
        {open ? (
          <div>
            <header className="flex items-start justify-between gap-4 border-b border-line bg-cream px-6 py-5">
              <div>
                <h2 className="display text-2xl text-ink">Add to the guest list</h2>
                <p className="mt-1 text-xs text-muted">
                  Everyone belongs to an invitation group — that&apos;s how RSVPs
                  are collected.
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="p-1 text-muted hover:text-ink"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </header>

            <div className="flex gap-2 border-b border-line px-6 pt-4">
              {(
                [
                  { key: "guest" as const, label: "One guest" },
                  { key: "group" as const, label: "A new group" },
                ]
              ).map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setTab(option.key)}
                  aria-current={tab === option.key ? "true" : undefined}
                  className={`border border-b-0 px-4 py-2.5 text-xs font-medium tracking-[0.12em] uppercase transition-colors ${
                    tab === option.key
                      ? "border-line bg-ivory text-ink"
                      : "border-transparent text-muted hover:text-ink"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {tab === "guest" ? (
              <GuestForm parties={parties} onSuccess={onSuccess} onCancel={close} />
            ) : (
              <GroupForm onSuccess={onSuccess} onCancel={close} />
            )}
          </div>
        ) : null}
      </dialog>
    </>
  );
}

// ── One guest ───────────────────────────────────────────────────────────────

function GuestForm({
  parties,
  onSuccess,
  onCancel,
}: {
  parties: { id: number; name: string }[];
  onSuccess: (message: string) => void;
  onCancel: () => void;
}) {
  const [state, formAction, pending] = useActionState<AddResult, FormData>(
    createGuestInGroup,
    null,
  );
  const [mode, setMode] = useState<"existing" | "new">(
    parties.length > 0 ? "existing" : "new",
  );
  const id = useId();

  useEffect(() => {
    if (state?.ok) onSuccess(state.message);
    // onSuccess is stable enough for this dialog's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="space-y-5 px-6 py-6">
      <input type="hidden" name="group_mode" value={mode} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor={`${id}-first`}>
            First name
          </label>
          <input
            id={`${id}-first`}
            name="first_name"
            required
            autoFocus
            placeholder="Sarah"
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
            placeholder="Mitchell"
            className="field"
          />
        </div>
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-ink/80">
        <input type="checkbox" name="is_child" className="accent-sage" />
        This guest is a child
      </label>

      <fieldset className="border-t border-line pt-5">
        <legend className="label mb-1">Invitation group</legend>

        <div className="space-y-3">
          {parties.length > 0 ? (
            <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ink/80">
              <input
                type="radio"
                name="mode_choice"
                checked={mode === "existing"}
                onChange={() => setMode("existing")}
                className="mt-1 accent-sage"
              />
              <span className="flex-1">
                <span className="block">Add to an existing group</span>
                <select
                  name="party_id"
                  disabled={mode !== "existing"}
                  onFocus={() => setMode("existing")}
                  className="field mt-2 disabled:opacity-50"
                  defaultValue={parties[0]?.id}
                >
                  {parties.map((party) => (
                    <option key={party.id} value={party.id}>
                      {party.name}
                    </option>
                  ))}
                </select>
              </span>
            </label>
          ) : null}

          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ink/80">
            <input
              type="radio"
              name="mode_choice"
              checked={mode === "new"}
              onChange={() => setMode("new")}
              className="mt-1 accent-sage"
            />
            <span className="flex-1">
              <span className="block">Create a new group for them</span>
              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr]">
                <input
                  name="new_group_name"
                  disabled={mode !== "new"}
                  onFocus={() => setMode("new")}
                  placeholder="The Mitchell Family"
                  className="field disabled:opacity-50"
                />
                <select
                  name="new_group_side"
                  disabled={mode !== "new"}
                  defaultValue="both"
                  className="field disabled:opacity-50"
                >
                  {SIDES.map((side) => (
                    <option key={side.value} value={side.value}>
                      {side.label}
                    </option>
                  ))}
                </select>
              </div>
            </span>
          </label>
        </div>
      </fieldset>

      {state && !state.ok ? (
        <p role="alert" className="border-l-2 border-gold bg-cream px-4 py-3 text-sm">
          {state.error}
        </p>
      ) : null}

      <Actions pending={pending} onCancel={onCancel} label="Add guest" />
    </form>
  );
}

// ── A new group, with its people ────────────────────────────────────────────

function GroupForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: (message: string) => void;
  onCancel: () => void;
}) {
  const [state, formAction, pending] = useActionState<AddResult, FormData>(
    createGroupWithMembers,
    null,
  );
  const [members, setMembers] = useState<Member[]>([blankMember(), blankMember()]);
  const id = useId();

  useEffect(() => {
    if (state?.ok) onSuccess(state.message);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const update = (key: number, patch: Partial<Member>) =>
    setMembers((current) =>
      current.map((member) => (member.key === key ? { ...member, ...patch } : member)),
    );

  const named = members.filter((member) => member.first.trim() || member.last.trim());

  return (
    <form action={formAction} className="space-y-5 px-6 py-6">
      {/* The rows travel as one JSON field so names and the child flag can't
          drift out of alignment (unchecked boxes don't submit at all). */}
      <input
        type="hidden"
        name="members"
        value={JSON.stringify(
          named.map((member) => ({
            first: member.first.trim(),
            last: member.last.trim(),
            child: member.child,
          })),
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr]">
        <div>
          <label className="label" htmlFor={`${id}-name`}>
            Group name
          </label>
          <input
            id={`${id}-name`}
            name="name"
            required
            autoFocus
            placeholder="The Mitchell Family"
            className="field"
          />
        </div>
        <div>
          <label className="label" htmlFor={`${id}-side`}>
            Side
          </label>
          <select id={`${id}-side`} name="side" defaultValue="both" className="field">
            {SIDES.map((side) => (
              <option key={side.value} value={side.value}>
                {side.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label" htmlFor={`${id}-address`}>
          Mailing address (optional)
        </label>
        <input
          id={`${id}-address`}
          name="address"
          placeholder="18 Ridgeview Terrace, Morristown, NJ"
          className="field"
        />
      </div>

      <fieldset className="border-t border-line pt-5">
        <legend className="label mb-2">Who&apos;s on this invitation?</legend>

        <div className="space-y-2">
          {members.map((member, index) => (
            <div key={member.key} className="flex flex-wrap items-center gap-2">
              <input
                value={member.first}
                onChange={(event) => update(member.key, { first: event.target.value })}
                placeholder="First name"
                aria-label={`Guest ${index + 1} first name`}
                className="field min-w-32 flex-1"
              />
              <input
                value={member.last}
                onChange={(event) => update(member.key, { last: event.target.value })}
                placeholder="Last name"
                aria-label={`Guest ${index + 1} last name`}
                className="field min-w-32 flex-1"
              />
              <label className="flex items-center gap-1.5 text-xs text-ink/70">
                <input
                  type="checkbox"
                  checked={member.child}
                  onChange={(event) => update(member.key, { child: event.target.checked })}
                  className="accent-sage"
                />
                Child
              </label>
              <button
                type="button"
                onClick={() =>
                  setMembers((current) =>
                    current.length === 1
                      ? [blankMember()]
                      : current.filter((m) => m.key !== member.key),
                  )
                }
                aria-label={`Remove guest ${index + 1}`}
                className="px-2 py-2 text-muted hover:text-ink"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setMembers((current) => [...current, blankMember()])}
          className="mt-3 text-xs tracking-[0.1em] text-sage uppercase underline underline-offset-4 hover:text-gold"
        >
          + Add another person
        </button>

        <p className="mt-3 text-xs text-muted">
          {named.length === 0
            ? "You can save the group empty and add people later."
            : `${named.length} ${named.length === 1 ? "person" : "people"} will be added.`}
        </p>
      </fieldset>

      {state && !state.ok ? (
        <p role="alert" className="border-l-2 border-gold bg-cream px-4 py-3 text-sm">
          {state.error}
        </p>
      ) : null}

      <Actions
        pending={pending}
        onCancel={onCancel}
        label={named.length ? `Create group with ${named.length}` : "Create group"}
      />
    </form>
  );
}

function Actions({
  pending,
  onCancel,
  label,
}: {
  pending: boolean;
  onCancel: () => void;
  label: string;
}) {
  return (
    <div className="flex justify-end gap-3 border-t border-line pt-5">
      <button type="button" onClick={onCancel} className="btn btn-outline">
        Cancel
      </button>
      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? "Saving…" : label}
      </button>
    </div>
  );
}
