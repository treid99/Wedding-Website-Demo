import type { Metadata } from "next";
import Accordion, { type AccordionEntry } from "@/components/Accordion";
import { PageHeader, Prose, SectionHeading } from "@/components/Section";
import { getBlock, getDirections, getHotels } from "@/lib/queries";
import {
  MAP_DIRECTIONS_URL,
  MAP_EMBED_URL,
  VENUE_ADDRESS,
  WEDDING,
} from "@/lib/wedding";

export const metadata: Metadata = { title: "Travel" };

export default function TravelPage() {
  const intro = getBlock("travel_intro");
  const outro = getBlock("travel_outro");
  const directions = getDirections();
  const hotels = getHotels();

  const directionEntries: AccordionEntry[] = directions.map((direction) => ({
    id: direction.id,
    heading: direction.heading,
    subheading: direction.summary,
    content: (
      <ol className="space-y-2.5">
        {direction.body
          .split("\n")
          .map((step) => step.trim())
          .filter(Boolean)
          .map((step, index) => (
            <li key={index} className="flex gap-3.5">
              <span className="mt-0.5 shrink-0 font-mono text-xs text-gold">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{step}</span>
            </li>
          ))}
      </ol>
    ),
  }));

  return (
    <>
      <PageHeader
        eyebrow={intro?.eyebrow}
        title={intro?.title}
        body={intro?.body}
      />

      {/* ── Venue + map ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 sm:py-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-14">
          <div className="lg:col-span-2">
            <p className="eyebrow">The Venue</p>
            <h2 className="display mt-3 text-4xl text-ink">{WEDDING.venue}</h2>
            <div className="hairline mt-6 w-20" />

            <address className="mt-7 text-[0.975rem] leading-relaxed text-ink/80 not-italic">
              {WEDDING.venueStreet}
              <br />
              {WEDDING.venueCity}, {WEDDING.venueState} {WEDDING.venueZip}
            </address>

            <p className="mt-6 text-[0.95rem] leading-[1.85] text-ink/80">
              A stone-and-timber inn built in 1848, set back from Main Street
              behind an acre of garden. The ceremony is on the terrace, dinner is
              in the ballroom, and the shuttle from the hotel sets you down at the
              front door.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={MAP_DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Open in Google Maps
              </a>
              <a href={`tel:${WEDDING.contactPhone.replace(/\D/g, "")}`} className="btn btn-outline">
                Call us
              </a>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="aspect-[4/3] w-full overflow-hidden border border-line bg-cream lg:aspect-[16/11]">
              <iframe
                src={MAP_EMBED_URL}
                title={`Map showing ${VENUE_ADDRESS}`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Written directions ──────────────────────────────────────── */}
      <section className="border-y border-line bg-cream py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-5 lg:px-8">
          <SectionHeading
            eyebrow="Driving Directions"
            title="However you're coming in"
          />
          <p className="mx-auto mt-7 max-w-xl text-center text-sm text-muted">
            Written directions from each direction. GPS will also get you there,
            but cell service thins out west of Netcong — worth a screenshot.
          </p>

          <div className="mt-10">
            <Accordion
              entries={directionEntries}
              initialOpen={directions[0]?.id}
            />
          </div>
        </div>
      </section>

      {/* ── Hotels ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-16 lg:px-8 sm:py-20">
        <SectionHeading
          eyebrow="Where to Stay"
          title="One hotel, holding a block of rooms"
        />
        <p className="mx-auto mt-7 max-w-xl text-center text-sm text-muted">
          The block includes the shuttle to and from the venue. The rate below is
          the negotiated rate — you must book through the block to get it.
        </p>

        <div className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-6">
          {hotels.map((hotel) => (
            <div
              key={hotel.id}
              className="flex flex-col border border-line bg-white p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Where Everyone's Staying</p>
                  <h3 className="display mt-2.5 text-2xl text-ink sm:text-3xl">
                    {hotel.name}
                  </h3>
                </div>
                <p className="shrink-0 text-right">
                  <span className="display text-2xl text-sage">{hotel.rate}</span>
                </p>
              </div>

              <div className="hairline mt-6 w-full" />

              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-xs tracking-[0.1em] text-muted uppercase">
                    Address
                  </dt>
                  <dd className="text-ink/80">{hotel.address}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-xs tracking-[0.1em] text-muted uppercase">
                    Distance
                  </dt>
                  <dd className="text-ink/80">{hotel.distance}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-xs tracking-[0.1em] text-muted uppercase">
                    Block Code
                  </dt>
                  <dd>
                    <code className="bg-cream px-2 py-0.5 font-mono text-[0.8rem] tracking-wider text-gold">
                      {hotel.block_code}
                    </code>
                  </dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-xs tracking-[0.1em] text-muted uppercase">
                    Deadline
                  </dt>
                  <dd className="text-ink/80">{hotel.cutoff}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-xs tracking-[0.1em] text-muted uppercase">
                    Phone
                  </dt>
                  <dd>
                    <a
                      href={`tel:${hotel.phone.replace(/\D/g, "")}`}
                      className="text-sage hover:text-gold"
                    >
                      {hotel.phone}
                    </a>
                  </dd>
                </div>
              </dl>

              <p className="mt-6 flex-1 text-[0.925rem] leading-[1.8] text-ink/75">
                {hotel.notes}
              </p>

              <a
                href={hotel.booking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary mt-8 w-full"
              >
                Book in our block
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── Airports, trains, parking ───────────────────────────────── */}
      {outro ? (
        <section className="border-t border-line bg-cream py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-5 lg:px-8">
            <SectionHeading eyebrow={outro.eyebrow} title={outro.title} />
            <Prose body={outro.body} className="mt-9" />
          </div>
        </section>
      ) : null}
    </>
  );
}
