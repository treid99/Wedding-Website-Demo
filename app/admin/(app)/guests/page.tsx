import Link from "next/link";
import type { Metadata } from "next";
import GuestFilters from "@/components/admin/GuestFilters";
import GuestRow from "@/components/admin/GuestRow";
import PartyCard from "@/components/admin/PartyCard";
import { AdminHeader, Card, StatTile } from "@/components/admin/ui";
import { createParty } from "@/lib/admin-actions";
import { pluralize } from "@/lib/format";
import {
  getGuests,
  getPartiesWithGuests,
  getPartyOptions,
  getRsvpStats,
  // Aliased: the filter-bar component above is also called GuestFilters.
  type GuestFilters as GuestFilterState,
} from "@/lib/queries";

export const metadata: Metadata = { title: "Guests & RSVPs" };

type Search = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function GuestsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const raw = await searchParams;

  const view = first(raw.view) === "groups" ? "groups" : "list";
  const q = first(raw.q);
  const statusRaw = first(raw.status);
  const seatedRaw = first(raw.seated);

  const status: NonNullable<GuestFilterState["status"]> = (
    ["attending", "pending", "declined"] as const
  ).includes(statusRaw as never)
    ? (statusRaw as NonNullable<GuestFilterState["status"]>)
    : "all";

  const seated: NonNullable<GuestFilterState["seated"]> = (
    ["seated", "unseated"] as const
  ).includes(seatedRaw as never)
    ? (seatedRaw as NonNullable<GuestFilterState["seated"]>)
    : "all";

  const stats = getRsvpStats();
  const parties = getPartyOptions();
  const filters = { q, status, seated };

  const guests = getGuests(filters);
  const partyDetails = view === "groups" ? getPartiesWithGuests(filters) : [];

  const filtered = Boolean(q.trim() || status !== "all" || seated !== "all");

  const summary =
    view === "groups"
      ? filtered
        ? `${partyDetails.length} of ${stats.parties} ${pluralize(stats.parties, "group")} match`
        : `${partyDetails.length} ${pluralize(partyDetails.length, "group")}`
      : filtered
        ? `${guests.length} of ${stats.total} guests match`
        : `${guests.length} guests`;

  // Preserve the current view when the filter form submits.
  const filterHref = (overrides: Record<string, string>) => {
    const search = new URLSearchParams();
    if (view === "groups") search.set("view", "groups");
    if (q) search.set("q", q);
    if (status !== "all") search.set("status", status);
    if (seated !== "all") search.set("seated", seated);
    for (const [key, value] of Object.entries(overrides)) {
      if (value) search.set(key, value);
      else search.delete(key);
    }
    const query = search.toString();
    return `/admin/guests${query ? `?${query}` : ""}`;
  };

  return (
    <>
      <AdminHeader
        title="Guests & RSVPs"
        subtitle={`${stats.total} invited across ${stats.parties} ${pluralize(stats.parties, "invitation")}`}
        actions={
          <>
            <Link
              href={filterHref({ view: view === "groups" ? "" : "groups" })}
              className="btn btn-outline !px-4 !py-2.5"
            >
              {view === "groups" ? "Guest list view" : "Group view"}
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile value={stats.attending} label="Attending" tone="good" />
        <StatTile value={stats.pending} label="Awaiting reply" tone="warn" />
        <StatTile value={stats.declined} label="Declined" tone="muted" />
        <StatTile
          value={`${stats.respondedParties}/${stats.parties}`}
          label="Groups responded"
        />
      </div>

      {/* ── Filters ─────────────────────────────────────────────────── */}
      <GuestFilters
        view={view}
        q={q}
        status={status}
        seated={seated}
        summary={summary}
      />

      {/* ── Group view ──────────────────────────────────────────────── */}
      {view === "groups" ? (
        <div className="mt-6 space-y-6">
          <Card
            title="New invitation group"
            description="Guests are invited and RSVP as a group — one household, one invitation."
          >
            <form
              action={createParty}
              className="grid grid-cols-1 gap-4 sm:grid-cols-[1.4fr_1fr_auto]"
            >
              <div>
                <label className="label" htmlFor="new-party-name">
                  Group name
                </label>
                <input
                  id="new-party-name"
                  name="name"
                  placeholder="The Sanchez Family"
                  required
                  className="field"
                />
              </div>
              <div>
                <label className="label" htmlFor="new-party-side">
                  Side
                </label>
                <select
                  id="new-party-side"
                  name="side"
                  defaultValue="both"
                  className="field"
                >
                  <option value="bride">Bride&apos;s side</option>
                  <option value="groom">Groom&apos;s side</option>
                  <option value="both">Both / shared</option>
                </select>
              </div>
              <div className="flex items-end">
                <button type="submit" className="btn btn-primary w-full">
                  Create group
                </button>
              </div>
            </form>
          </Card>

          {partyDetails.length === 0 ? (
            <p className="border border-line bg-white px-4 py-16 text-center text-sm text-muted">
              No invitation groups match those filters.
            </p>
          ) : (
            partyDetails.map((party) => (
              <PartyCard key={party.id} party={party} allParties={parties} />
            ))
          )}
        </div>
      ) : (
        /* ── Flat guest list ──────────────────────────────────────── */
        <div className="mt-6 border border-line bg-white">
          <div className="hidden grid-cols-[1.4fr_1.4fr_auto_1.2fr_1.6fr_auto] gap-3 border-b border-line bg-cream/60 px-4 py-2.5 text-[0.65rem] font-medium tracking-[0.12em] text-muted uppercase lg:grid">
            <span>Guest</span>
            <span>Group</span>
            <span>Status</span>
            <span>Meal</span>
            <span>Dietary notes</span>
            <span />
          </div>

          {guests.length === 0 ? (
            <p className="px-4 py-16 text-center text-sm text-muted">
              No guests match those filters.
            </p>
          ) : (
            guests.map((guest) => (
              <GuestRow key={guest.id} guest={guest} parties={parties} />
            ))
          )}

          <p className="border-t border-line bg-cream/40 px-4 py-3 text-xs text-muted">
            Click any row to edit
          </p>
        </div>
      )}
    </>
  );
}
