"use client";

import { useEffect, useRef } from "react";
import { CloseIcon } from "./icons";

/**
 * Shared overlay modal, built on the native <dialog> element.
 *
 * Using <dialog> rather than a hand-rolled overlay means the browser handles
 * the top layer, the backdrop, focus trapping, and Esc for free.
 *
 * Children are only rendered while open, which is load-bearing: every editor
 * inside seeds its state from props with useState, so unmounting on close is
 * what makes the next open show current values instead of a stale draft.
 */
export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  size = "md",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  size?: "sm" | "md";
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  // Drive the element from the `open` prop rather than calling showModal() at
  // the click site, so the DOM can't drift out of step with React's state.
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (open && !node.open) node.showModal();
    if (!open && node.open) node.close();
  }, [open]);

  // Esc and the UA's own dismissal both fire `close`; mirror it back into state.
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.addEventListener("close", onClose);
    return () => node.removeEventListener("close", onClose);
  }, [onClose]);

  const width =
    size === "sm"
      ? "w-[min(32rem,calc(100vw-2rem))]"
      : "w-[min(44rem,calc(100vw-2rem))]";

  return (
    <dialog
      ref={ref}
      // m-auto is load-bearing: a modal <dialog> is centred by the UA's
      // `margin: auto`, which Tailwind's preflight resets to 0.
      className={`m-auto max-h-[calc(100vh-3rem)] overflow-y-auto border border-line bg-ivory p-0 text-ink backdrop:bg-ink/40 backdrop:backdrop-blur-sm ${width}`}
      onClick={(event) => {
        // The dialog element itself is the backdrop; its contents are children.
        if (event.target === ref.current) onClose();
      }}
    >
      {open ? (
        <div>
          <header className="flex items-start justify-between gap-4 border-b border-line bg-cream px-6 py-5">
            <div className="min-w-0">
              <h2 className="display text-2xl text-ink">{title}</h2>
              {subtitle ? (
                <p className="mt-1 text-xs text-muted">{subtitle}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="shrink-0 p-1 text-muted hover:text-ink"
            >
              <CloseIcon size={20} />
            </button>
          </header>
          {children}
        </div>
      ) : null}
    </dialog>
  );
}

/**
 * Cancel / Save footer.
 *
 * Save stays disabled until `dirty` — an illuminated Save button should mean
 * "there is something to save", so an untouched form offers nothing to press.
 */
export function ModalActions({
  dirty,
  pending,
  onCancel,
  label = "Save",
  tone = "primary",
}: {
  dirty: boolean;
  pending: boolean;
  onCancel: () => void;
  label?: string;
  tone?: "primary" | "danger";
}) {
  return (
    <div className="flex flex-wrap justify-end gap-3 border-t border-line pt-5">
      <button
        type="button"
        onClick={onCancel}
        disabled={pending}
        className="btn btn-outline"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={!dirty || pending}
        title={dirty ? undefined : "Nothing to save yet"}
        className={`btn ${tone === "danger" ? "btn-danger" : "btn-primary"}`}
      >
        {pending ? "Saving…" : label}
      </button>
    </div>
  );
}

/** Inline error banner used by every dialog's failed-action state. */
export function ModalError({ message }: { message: string }) {
  return (
    <p role="alert" className="border-l-2 border-clay bg-cream px-4 py-3 text-sm">
      {message}
    </p>
  );
}
