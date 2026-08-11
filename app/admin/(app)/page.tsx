import Link from "next/link";
import type { Metadata } from "next";
import {
  AdminHeader,
  BarRow,
  Card,
  StatTile,
  StatusPill,
} from "@/components/admin/ui";
import { formatPrice, formatTimestamp, pluralize } from "@/lib/format";
import {
  getDietaryNotes,
  getMealCounts,
  getRecentSubmissions,
  getRegistryStats,
  getRsvpStats,
  getSeatingBoard,
} from "@/lib/queries";
import { WEDDING, mealLabel } from "@/lib/wedding";

export const metadata: Metadata = { title: "Dashboard" };

export default function AdminDashboard() {
  const rsvp = getRsvpStats();
  const meals = getMealCounts();
  const registry = getRegistryStats();
  const dietary = getDietaryNotes();
  const submissions = getRecentSubmissions(5);
  const board = getSeatingBoard();

  const seated = board.tables.reduce((sum, table) => sum + table.guests.length, 0);
  const needSeats = board.unseated.filter(
    (guest) => guest.rsvp_status === "attending",
  ).length;

  const daysAway = Math.ceil(
    (WEDDING.date.getTime() - Date.now()) / 86_400_000,
  );

  return (
    <>
      <AdminHeader
        title="Dashboard"
        subtitle={`${WEDDING.dateLong} · ${daysAway.toLocaleString()} days away`}
      />

      {/* ── Headline numbers ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          value={rsvp.attending}
          label="Attending"
          hint={`incl. ${rsvp.children} ${pluralize(rsvp.children, "child", "children")}`}
          tone="good"
          href="/admin/guests?status=attending"
        />
        <StatTile
          value={rsvp.declined}
          label="Declined"
          tone="muted"
          href="/admin/guests?status=declined"
        />
        <StatTile
          value={rsvp.pending}
          label="Awaiting reply"
          hint={`of ${rsvp.total} invited`}
          tone="warn"
          href="/admin/guests?status=pending"
        />
        <StatTile
          value={`${rsvp.respondedParties}/${rsvp.parties}`}
          label="Parties responded"
          href="/admin/guests"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Meal breakdown ───────────────────────────────────────── */}
        <Card
          title="Meal choices"
          description={`Across ${rsvp.attending} attending ${pluralize(rsvp.attending, "guest")}`}
        >
          {meals.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              No meal choices recorded yet.
            </p>
          ) : (
            <div className="space-y-4">
              {meals.map((meal) => (
                <BarRow
                  key={meal.meal_choice}
                  label={mealLabel(meal.meal_choice)}
                  value={meal.n}
                  total={rsvp.attending}
                />
              ))}
            </div>
          )}
        </Card>

        {/* ── Seating ──────────────────────────────────────────────── */}
        <Card
          title="Seating"
          description={`${board.tables.length} ${pluralize(board.tables.length, "table")} configured`}
          actions={
            <Link
              href="/admin/seating"
              className="text-xs tracking-[0.1em] text-sage uppercase underline underline-offset-4 hover:text-gold"
            >
              Open board
            </Link>
          }
        >
          <div className="space-y-4">
            <BarRow
              label="Seated"
              value={seated}
              total={Math.max(1, seated + needSeats)}
              suffix="guests"
            />
            <div className="border-t border-line pt-4 text-sm">
              <p className="flex justify-between">
                <span className="text-ink/80">Still need a seat</span>
                <span className={needSeats > 0 ? "text-gold" : "text-sage"}>
                  {needSeats}
                </span>
              </p>
              <p className="mt-2 flex justify-between">
                <span className="text-ink/80">Total capacity</span>
                <span className="text-muted">
                  {board.tables.reduce((sum, t) => sum + t.capacity, 0)}
                </span>
              </p>
            </div>
          </div>
        </Card>

        {/* ── Registry ─────────────────────────────────────────────── */}
        <Card
          title="Registry"
          description={`${registry.total} items listed`}
          actions={
            <Link
              href="/admin/registry"
              className="text-xs tracking-[0.1em] text-sage uppercase underline underline-offset-4 hover:text-gold"
            >
              Manage
            </Link>
          }
        >
          <div className="space-y-4">
            <BarRow
              label="Claimed"
              value={registry.purchased}
              total={registry.total}
              suffix="items"
            />
            <div className="border-t border-line pt-4 text-sm">
              <p className="flex justify-between">
                <span className="text-ink/80">Still available</span>
                <span className="text-sage">{registry.available}</span>
              </p>
              <p className="mt-2 flex justify-between">
                <span className="text-ink/80">Value claimed</span>
                <span className="text-muted">
                  {formatPrice(registry.purchasedValueCents)}
                </span>
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ── Recent notes from guests ─────────────────────────────── */}
        <Card
          title="Recent RSVP notes"
          description="Messages left with the response"
          actions={
            <Link
              href="/admin/guests"
              className="text-xs tracking-[0.1em] text-sage uppercase underline underline-offset-4 hover:text-gold"
            >
              All guests
            </Link>
          }
        >
          {submissions.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              No responses yet.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {submissions.map((submission) => (
                <li key={submission.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-ink">
                      {submission.party_name}
                    </p>
                    <p className="text-xs text-muted">
                      {formatTimestamp(submission.submitted_at)}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {submission.attending} attending
                    {submission.declined > 0
                      ? ` · ${submission.declined} declined`
                      : ""}
                  </p>
                  {submission.message ? (
                    <p className="mt-2 border-l-2 border-gold-light pl-3 text-[0.85rem] leading-relaxed text-ink/75 italic">
                      “{submission.message}”
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* ── Dietary restrictions ─────────────────────────────────── */}
        <Card
          title="Dietary restrictions"
          description={`${dietary.length} ${pluralize(dietary.length, "guest")} with notes for the kitchen`}
        >
          {dietary.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              No dietary notes recorded.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {dietary.map((guest) => (
                <li key={guest.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-ink">
                      {guest.first_name} {guest.last_name}
                    </p>
                    <StatusPill status={guest.rsvp_status} />
                    {guest.meal_choice ? (
                      <span className="text-xs text-muted">
                        {mealLabel(guest.meal_choice)}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-[0.85rem] leading-relaxed text-gold">
                    {guest.dietary_notes}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">{guest.party_name}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
