import type { Metadata } from "next";
import AddPeopleDialog from "@/components/admin/AddPeopleDialog";
import GuestFilters from "@/components/admin/GuestFilters";
import GuestRow from "@/components/admin/GuestRow";
import Pagination from "@/components/admin/Pagination";
import PartyCard from "@/components/admin/PartyCard";
import ViewToggle from "@/components/admin/ViewToggle";
import { AdminHeader, StatTile } from "@/components/admin/ui";
import { pluralize } from "@/lib/format";
import {
  PER_PAGE_OPTIONS,
  buildGuestHref,
  hasActiveFilters,
  parseGuestQuery,
} from "@/lib/guest-params";
import { paginate } from "@/lib/paginate";
import {
  getGuests,
  getPartiesWithGuests,
  getPartyOptions,
  getRsvpStats,
} from "@/lib/queries";

export const metadata: Metadata = { title: "Guests & RSVPs" };

type Search = Record<string, string | string[] | undefined>;

export default async function GuestsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const query = parseGuestQuery(await searchParams);
  const { view, page, per } = query;

  const stats = getRsvpStats();
  const parties = getPartyOptions();

  const filters = { q: query.q, statuses: query.statuses, seated: query.seated };

  // Filter across the whole guest list, then slice — the page you're on must
  // never limit what a search can find.
  const guests = paginate(getGuests(filters), page, per);
  const groups = paginate(
    view === "groups" ? getPartiesWithGuests(filters) : [],
    page,
    per,
  );

  const filtered = hasActiveFilters(query);

  const summary =
    view === "groups"
      ? filtered
        ? `${groups.total} of ${stats.parties} ${pluralize(stats.parties, "group")} match`
        : `${groups.total} ${pluralize(groups.total, "group")}`
      : filtered
        ? `${guests.total} of ${stats.total} guests match`
        : `${guests.total} guests`;

  const paged = view === "groups" ? groups : guests;

  const hrefWith = (overrides: Partial<typeof query>) =>
    buildGuestHref({ ...query, ...overrides });

  const perOptions = PER_PAGE_OPTIONS[view].map((value) => ({
    value,
    // Changing the page size invalidates the offset, so start over at page 1.
    href: hrefWith({ per: value, page: 1 }),
  }));

  const pagination = (hint?: string) => (
    <Pagination
      page={paged.page}
      pageCount={paged.pageCount}
      from={paged.from}
      to={paged.to}
      total={paged.total}
      noun={view === "groups" ? "groups" : "guests"}
      perPage={per}
      perOptions={perOptions}
      prevHref={paged.page > 1 ? hrefWith({ page: paged.page - 1 }) : null}
      nextHref={paged.page < paged.pageCount ? hrefWith({ page: paged.page + 1 }) : null}
      hint={hint}
    />
  );

  return (
    <>
      <AdminHeader
        title="Guests & RSVPs"
        subtitle={`${stats.total} invited across ${stats.parties} ${pluralize(stats.parties, "invitation")}`}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <ViewToggle
              view={view}
              // Switching view keeps the filters but resets paging: the two
              // views count different things, so page 3 doesn't carry over.
              listHref={buildGuestHref({ ...query, view: "list", page: 1, per: PER_PAGE_OPTIONS.list[0] })}
              groupsHref={buildGuestHref({ ...query, view: "groups", page: 1, per: PER_PAGE_OPTIONS.groups[0] })}
            />
            <AddPeopleDialog
              parties={parties}
              defaultTab={view === "groups" ? "group" : "guest"}
            />
          </div>
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
      <GuestFilters query={query} summary={summary} />

      {/* ── Group view ──────────────────────────────────────────────── */}
      {view === "groups" ? (
        <div className="mt-6">
          {groups.total === 0 ? (
            <p className="border border-line bg-white px-4 py-16 text-center text-sm text-muted">
              No invitation groups match those filters.
            </p>
          ) : (
            <>
              <div className="space-y-6">
                {groups.items.map((party) => (
                  <PartyCard key={party.id} party={party} allParties={parties} />
                ))}
              </div>
              <div className="mt-6 border border-line bg-white">
                {pagination()}
              </div>
            </>
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

          {guests.total === 0 ? (
            <p className="px-4 py-16 text-center text-sm text-muted">
              No guests match those filters.
            </p>
          ) : (
            <>
              {guests.items.map((guest) => (
                <GuestRow key={guest.id} guest={guest} parties={parties} />
              ))}
              {pagination("click any row to edit")}
            </>
          )}
        </div>
      )}
    </>
  );
}
