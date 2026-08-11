import Link from "next/link";
import type { Metadata } from "next";
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
  type GuestFilters,
} from "@/lib/queries";

export const metadata: Metadata = { title: "Guests & RSVPs" };

type Search = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "attending", label: "Attending" },
  { value: "pending", label: "Pending" },
  { value: "declined", label: "Declined" },
] as const;

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

  const status: NonNullable<GuestFilters["status"]> = (
    ["attending", "pending", "declined"] as const
  ).includes(statusRaw as never)
    ? (statusRaw as NonNullable<GuestFilters["status"]>)
    : "all";

  const seated: NonNullable<GuestFilters["seated"]> = (
    ["seated", "unseated"] as const
  ).includes(seatedRaw as never)
    ? (seatedRaw as NonNullable<GuestFilters["seated"]>)
    : "all";

  const stats = getRsvpStats();
  const parties = getPartyOptions();
  const guests = getGuests({ q, status, seated });
  const partyDetails = view === "groups" ? getPartiesWithGuests() : [];

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
      <form
        action="/admin/guests"
        method="get"
        className="mt-6 flex flex-wrap items-end gap-3 border border-line bg-white px-4 py-4"
      >
        {view === "groups" ? (
          <input type="hidden" name="view" value="groups" />
        ) : null}

        <div className="min-w-48 flex-1">
          <label className="label" htmlFor="guest-search">
            Search name or group
          </label>
          <input
            id="guest-search"
            name="q"
            defaultValue={q}
            placeholder="Mitchell, Sarah, Okonkwo…"
            className="field"
          />
        </div>

        <div>
          <label className="label" htmlFor="guest-status">
            Status
          </label>
          <select
            id="guest-status"
            name="status"
            defaultValue={status}
            className="field w-auto"
          >
            {STATUS_TABS.map((tab) => (
              <option key={tab.value} value={tab.value}>
                {tab.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="guest-seated">
            Seating
          </label>
          <select
            id="guest-seated"
            name="seated"
            defaultValue={seated}
            className="field w-auto"
          >
            <option value="all">Everyone</option>
            <option value="seated">Seated</option>
            <option value="unseated">Not seated</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary !px-5 !py-2.5">
          Filter
        </button>

        {q || status !== "all" || seated !== "all" ? (
          <Link
            href={view === "groups" ? "/admin/guests?view=groups" : "/admin/guests"}
            className="pb-3 text-xs tracking-[0.1em] text-muted uppercase underline underline-offset-4 hover:text-ink"
          >
            Clear
          </Link>
        ) : null}
      </form>

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

          {partyDetails.map((party) => (
            <PartyCard key={party.id} party={party} allParties={parties} />
          ))}
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
            Showing {guests.length} of {stats.total} guests · click any row to
            edit
          </p>
        </div>
      )}
    </>
  );
}
