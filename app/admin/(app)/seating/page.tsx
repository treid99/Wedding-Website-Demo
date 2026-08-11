import type { Metadata } from "next";
import SeatingBoard from "@/components/admin/SeatingBoard";
import { AdminHeader, Card, StatTile } from "@/components/admin/ui";
import { clearTable, createTable, deleteTable, updateTable } from "@/lib/admin-actions";
import { pluralize } from "@/lib/format";
import { getSeatingBoard } from "@/lib/queries";
import { mealShortLabel } from "@/lib/wedding";

export const metadata: Metadata = { title: "Seating Chart" };

export default function SeatingPage() {
  const board = getSeatingBoard();

  const seated = board.tables.reduce((sum, table) => sum + table.guests.length, 0);
  const capacity = board.tables.reduce((sum, table) => sum + table.capacity, 0);
  const needSeats = board.unseated.filter(
    (guest) => guest.rsvp_status === "attending",
  ).length;

  // Meal totals across everyone who has a seat — what the caterer actually needs.
  const mealTotals = new Map<string, number>();
  for (const table of board.tables) {
    for (const guest of table.guests) {
      if (!guest.meal_choice) continue;
      mealTotals.set(
        guest.meal_choice,
        (mealTotals.get(guest.meal_choice) ?? 0) + 1,
      );
    }
  }

  return (
    <>
      <AdminHeader
        title="Seating Chart"
        subtitle="Drag guests onto tables. Capacity is enforced; declined guests are hidden."
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile value={seated} label="Seated" tone="good" />
        <StatTile
          value={needSeats}
          label="Still need a seat"
          tone={needSeats > 0 ? "warn" : "good"}
        />
        <StatTile
          value={`${seated}/${capacity}`}
          label="Capacity used"
          hint={`${board.tables.length} ${pluralize(board.tables.length, "table")}`}
        />
        <StatTile
          value={capacity - seated}
          label="Empty seats"
          tone="muted"
        />
      </div>

      <SeatingBoard tables={board.tables} unseated={board.unseated} />

      {/* ── Table management ────────────────────────────────────────── */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card
          title="Add a table"
          description="New tables appear at the end of the board."
        >
          <form action={createTable} className="space-y-4">
            <div>
              <label className="label" htmlFor="table-name">
                Name
              </label>
              <input
                id="table-name"
                name="name"
                placeholder="Table 8"
                required
                className="field"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="table-shape">
                  Shape
                </label>
                <select id="table-shape" name="shape" defaultValue="round" className="field">
                  <option value="round">Round</option>
                  <option value="rect">Rectangular</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="table-capacity">
                  Seats
                </label>
                <input
                  id="table-capacity"
                  name="capacity"
                  type="number"
                  min={1}
                  max={30}
                  defaultValue={10}
                  className="field"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full">
              Add table
            </button>
          </form>
        </Card>

        <Card
          title="Edit tables"
          description="Rename, reshape, resize, empty, or remove."
          className="lg:col-span-2"
        >
          {board.tables.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              No tables configured yet.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {board.tables.map((table) => (
                <li key={table.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-end gap-3">
                    <form
                      action={updateTable}
                      className="flex flex-1 flex-wrap items-end gap-3"
                    >
                      <input type="hidden" name="id" value={table.id} />

                      <div className="min-w-32 flex-1">
                        <label className="sr-only" htmlFor={`tname-${table.id}`}>
                          Table name
                        </label>
                        <input
                          id={`tname-${table.id}`}
                          name="name"
                          defaultValue={table.name}
                          required
                          className="field"
                        />
                      </div>

                      <div>
                        <label className="sr-only" htmlFor={`tshape-${table.id}`}>
                          Shape
                        </label>
                        <select
                          id={`tshape-${table.id}`}
                          name="shape"
                          defaultValue={table.shape}
                          className="field w-auto"
                        >
                          <option value="round">Round</option>
                          <option value="rect">Rect</option>
                        </select>
                      </div>

                      <div className="w-20">
                        <label className="sr-only" htmlFor={`tcap-${table.id}`}>
                          Seats
                        </label>
                        <input
                          id={`tcap-${table.id}`}
                          name="capacity"
                          type="number"
                          min={1}
                          max={30}
                          defaultValue={table.capacity}
                          className="field"
                        />
                      </div>

                      <button type="submit" className="btn btn-outline !px-4 !py-2.5">
                        Save
                      </button>
                    </form>

                    <form action={clearTable}>
                      <input type="hidden" name="id" value={table.id} />
                      <button
                        type="submit"
                        disabled={table.guests.length === 0}
                        className="px-2 py-2.5 text-xs tracking-[0.1em] text-muted uppercase underline underline-offset-4 hover:text-ink disabled:no-underline disabled:opacity-40"
                      >
                        Empty
                      </button>
                    </form>

                    <form action={deleteTable}>
                      <input type="hidden" name="id" value={table.id} />
                      <button
                        type="submit"
                        className="px-2 py-2.5 text-xs tracking-[0.1em] text-muted uppercase underline underline-offset-4 hover:text-ink"
                      >
                        Delete
                      </button>
                    </form>
                  </div>

                  <p className="mt-1.5 text-xs text-muted">
                    {table.guests.length}/{table.capacity} seated
                    {table.guests.length > 0
                      ? ` · ${table.guests.map((g) => g.first_name).join(", ")}`
                      : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* ── Catering totals ─────────────────────────────────────────── */}
      {mealTotals.size > 0 ? (
        <div className="mt-6">
          <Card
            title="Meal totals for seated guests"
            description="What the kitchen needs, based on who currently has a seat."
          >
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              {[...mealTotals.entries()].map(([meal, count]) => (
                <div key={meal}>
                  <p className="display text-2xl text-ink">{count}</p>
                  <p className="text-[0.65rem] tracking-[0.14em] text-muted uppercase">
                    {mealShortLabel(meal)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : null}
    </>
  );
}
