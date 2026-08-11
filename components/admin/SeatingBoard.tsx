"use client";

import { useMemo, useState, useTransition } from "react";
import { assignSeat } from "@/lib/admin-actions";
import { mealShortLabel } from "@/lib/wedding";
import type { GuestWithContext, SeatingTable } from "@/lib/types";

type BoardTable = SeatingTable & { guests: GuestWithContext[] };

export type BoardProps = {
  tables: BoardTable[];
  unseated: GuestWithContext[];
};

const UNSEATED = "unseated";

/** Stable fingerprint of who is sitting where, used to resync after a server refresh. */
function signatureOf(props: BoardProps): string {
  return (
    props.tables
      .map((table) => `${table.id}:${table.guests.map((g) => g.id).join(",")}`)
      .join("|") + `#${props.unseated.map((g) => g.id).join(",")}`
  );
}

/**
 * Drag-and-drop seating chart.
 *
 * Uses native HTML5 drag events rather than a DnD library — the interaction is
 * simple enough (a chip onto a table) that a dependency isn't warranted. Because
 * HTML5 drag is mouse-only, every chip also carries a "move to…" select, which is
 * the keyboard and touch path to the same operation.
 *
 * Moves apply optimistically and are confirmed by the server, which enforces
 * capacity. A rejected move rolls back and surfaces the reason.
 */
export default function SeatingBoard(props: BoardProps) {
  const signature = signatureOf(props);

  const [state, setState] = useState({
    signature,
    tables: props.tables,
    unseated: props.unseated,
  });
  const [dragging, setDragging] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<number | typeof UNSEATED | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Server data changed (revalidation landed) — adopt it.
  if (state.signature !== signature) {
    setState({ signature, tables: props.tables, unseated: props.unseated });
  }

  const guestsById = useMemo(() => {
    const map = new Map<number, GuestWithContext>();
    for (const guest of state.unseated) map.set(guest.id, guest);
    for (const table of state.tables) {
      for (const guest of table.guests) map.set(guest.id, guest);
    }
    return map;
  }, [state]);

  const currentTableOf = (guestId: number): number | null => {
    for (const table of state.tables) {
      if (table.guests.some((guest) => guest.id === guestId)) return table.id;
    }
    return null;
  };

  /** Applies a move to local state only. */
  const applyLocally = (guestId: number, tableId: number | null) => {
    setState((current) => {
      const guest = guestsById.get(guestId);
      if (!guest) return current;

      const stripped = {
        tables: current.tables.map((table) => ({
          ...table,
          guests: table.guests.filter((g) => g.id !== guestId),
        })),
        unseated: current.unseated.filter((g) => g.id !== guestId),
      };

      if (tableId === null) {
        return {
          ...current,
          tables: stripped.tables,
          unseated: [...stripped.unseated, { ...guest, table_id: null }],
        };
      }

      return {
        ...current,
        unseated: stripped.unseated,
        tables: stripped.tables.map((table) =>
          table.id === tableId
            ? { ...table, guests: [...table.guests, { ...guest, table_id: tableId }] }
            : table,
        ),
      };
    });
  };

  const move = (guestId: number, tableId: number | null) => {
    setError(null);

    const from = currentTableOf(guestId);
    if (from === tableId) return;

    // Optimistic capacity check so an obviously-full table fails instantly.
    if (tableId !== null) {
      const target = state.tables.find((table) => table.id === tableId);
      if (target && target.guests.length >= target.capacity) {
        setError(
          `${target.name} is full (${target.capacity} seats). Raise its capacity or move someone out first.`,
        );
        return;
      }
    }

    applyLocally(guestId, tableId);

    startTransition(async () => {
      const result = await assignSeat(guestId, tableId);
      if (!result.ok) {
        setError(result.error);
        applyLocally(guestId, from); // roll back
      }
    });
  };

  // ── Drag handlers ────────────────────────────────────────────────────
  const onDragStart = (event: React.DragEvent, guestId: number) => {
    event.dataTransfer.setData("text/plain", String(guestId));
    event.dataTransfer.effectAllowed = "move";
    setDragging(guestId);
  };

  const onDragEnd = () => {
    setDragging(null);
    setDropTarget(null);
  };

  const onDragOver = (event: React.DragEvent, target: number | typeof UNSEATED) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropTarget(target);
  };

  const onDrop = (event: React.DragEvent, target: number | typeof UNSEATED) => {
    event.preventDefault();
    const guestId = Number.parseInt(event.dataTransfer.getData("text/plain"), 10);
    setDropTarget(null);
    setDragging(null);
    if (Number.isFinite(guestId)) {
      move(guestId, target === UNSEATED ? null : target);
    }
  };

  const tableOptions = state.tables.map((table) => ({
    id: table.id,
    name: table.name,
    full: table.guests.length >= table.capacity,
  }));

  const attendingUnseated = state.unseated.filter(
    (guest) => guest.rsvp_status === "attending",
  ).length;

  return (
    <div className="space-y-4">
      {error ? (
        <p
          role="alert"
          className="flex items-start justify-between gap-4 border-l-2 border-gold bg-cream px-4 py-3 text-sm text-ink"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="shrink-0 text-muted hover:text-ink"
            aria-label="Dismiss"
          >
            ×
          </button>
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[19rem_1fr]">
        {/* ── Unseated pool ──────────────────────────────────────── */}
        <aside
          onDragOver={(event) => onDragOver(event, UNSEATED)}
          onDragLeave={() => setDropTarget(null)}
          onDrop={(event) => onDrop(event, UNSEATED)}
          className={`self-start border bg-white transition-colors ${
            dropTarget === UNSEATED
              ? "border-gold bg-gold/5"
              : "border-line"
          }`}
        >
          <header className="border-b border-line bg-cream/60 px-4 py-3">
            <h2 className="text-sm font-medium tracking-[0.08em] text-ink uppercase">
              Not seated
            </h2>
            <p className="mt-1 text-xs text-muted">
              {state.unseated.length} total · {attendingUnseated} attending
            </p>
          </header>

          <div className="max-h-[34rem] space-y-2 overflow-y-auto p-3">
            {state.unseated.length === 0 ? (
              <p className="py-10 text-center text-xs text-muted">
                Everyone has a seat.
              </p>
            ) : (
              state.unseated.map((guest) => (
                <GuestChip
                  key={guest.id}
                  guest={guest}
                  dragging={dragging === guest.id}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  tableOptions={tableOptions}
                  currentTableId={null}
                  onMove={move}
                />
              ))
            )}
          </div>

          <p className="border-t border-line bg-cream/40 px-4 py-2.5 text-[0.7rem] leading-relaxed text-muted">
            Drag a guest onto a table, or use the ⋯ menu on any chip. Guests who
            declined are hidden.
          </p>
        </aside>

        {/* ── Tables ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {state.tables.map((table) => {
            const occupancy = table.guests.length;
            const full = occupancy >= table.capacity;
            const isTarget = dropTarget === table.id;

            const meals = new Map<string, number>();
            for (const guest of table.guests) {
              if (!guest.meal_choice) continue;
              meals.set(guest.meal_choice, (meals.get(guest.meal_choice) ?? 0) + 1);
            }

            return (
              <div
                key={table.id}
                onDragOver={(event) => onDragOver(event, table.id)}
                onDragLeave={() => setDropTarget(null)}
                onDrop={(event) => onDrop(event, table.id)}
                className={`flex flex-col border bg-white transition-colors ${
                  isTarget
                    ? full
                      ? "border-gold bg-gold/10"
                      : "border-sage bg-sage/5"
                    : "border-line"
                }`}
              >
                <header className="flex items-start justify-between gap-2 border-b border-line bg-cream/60 px-4 py-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-medium text-ink">
                      {table.name}
                    </h3>
                    <p className="mt-0.5 text-[0.7rem] text-muted">
                      {table.shape === "rect" ? "Rectangular" : "Round"}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 border px-2 py-0.5 text-[0.7rem] font-medium ${
                      full
                        ? "border-gold/50 bg-gold/10 text-gold"
                        : "border-line bg-white text-muted"
                    }`}
                  >
                    {occupancy}/{table.capacity}
                  </span>
                </header>

                <div className="min-h-32 flex-1 space-y-2 p-3">
                  {table.guests.length === 0 ? (
                    <p className="py-9 text-center text-xs text-muted/70">
                      Drop guests here
                    </p>
                  ) : (
                    table.guests.map((guest) => (
                      <GuestChip
                        key={guest.id}
                        guest={guest}
                        dragging={dragging === guest.id}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                        tableOptions={tableOptions}
                        currentTableId={table.id}
                        onMove={move}
                      />
                    ))
                  )}
                </div>

                {meals.size > 0 ? (
                  <p className="border-t border-line bg-cream/40 px-3 py-2 text-[0.7rem] text-muted">
                    {[...meals.entries()]
                      .map(([meal, count]) => `${count} ${mealShortLabel(meal)}`)
                      .join(" · ")}
                  </p>
                ) : null}
              </div>
            );
          })}

          {state.tables.length === 0 ? (
            <p className="col-span-full border border-line bg-white px-6 py-16 text-center text-sm text-muted">
              No tables yet — add one below to start building the chart.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** A draggable guest, with a select as the accessible alternative to dragging. */
function GuestChip({
  guest,
  dragging,
  onDragStart,
  onDragEnd,
  tableOptions,
  currentTableId,
  onMove,
}: {
  guest: GuestWithContext;
  dragging: boolean;
  onDragStart: (event: React.DragEvent, guestId: number) => void;
  onDragEnd: () => void;
  tableOptions: { id: number; name: string; full: boolean }[];
  currentTableId: number | null;
  onMove: (guestId: number, tableId: number | null) => void;
}) {
  const pending = guest.rsvp_status === "pending";

  return (
    <div
      draggable
      onDragStart={(event) => onDragStart(event, guest.id)}
      onDragEnd={onDragEnd}
      className={`group flex cursor-grab items-center justify-between gap-2 border px-2.5 py-2 transition-opacity active:cursor-grabbing ${
        pending ? "border-gold/40 bg-gold/5" : "border-line bg-cream/70"
      } ${dragging ? "opacity-40" : ""}`}
    >
      <div className="min-w-0">
        <p className="truncate text-[0.8rem] leading-tight text-ink">
          {guest.first_name} {guest.last_name}
          {guest.is_child === 1 ? (
            <span className="ml-1 text-[0.55rem] tracking-[0.1em] text-gold uppercase">
              kid
            </span>
          ) : null}
        </p>
        <p className="truncate text-[0.65rem] text-muted" title={guest.party_name}>
          {pending ? "awaiting reply · " : ""}
          {guest.party_name}
        </p>
      </div>

      <label className="shrink-0">
        <span className="sr-only">
          Move {guest.first_name} {guest.last_name} to a table
        </span>
        <select
          value=""
          onChange={(event) => {
            const value = event.target.value;
            if (!value) return;
            onMove(guest.id, value === UNSEATED ? null : Number(value));
          }}
          className="w-6 cursor-pointer appearance-none border-0 bg-transparent text-center text-xs text-muted hover:text-ink focus:w-auto focus:appearance-auto"
          title="Move to…"
        >
          <option value="">⋯</option>
          {currentTableId !== null ? (
            <option value={UNSEATED}>Unseat</option>
          ) : null}
          {tableOptions
            .filter((option) => option.id !== currentTableId)
            .map((option) => (
              <option key={option.id} value={option.id} disabled={option.full}>
                {option.name}
                {option.full ? " (full)" : ""}
              </option>
            ))}
        </select>
      </label>
    </div>
  );
}
