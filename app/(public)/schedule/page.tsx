import Link from "next/link";
import type { Metadata } from "next";
import { PageHeader } from "@/components/Section";
import { getBlock, getScheduleByDay } from "@/lib/queries";
import { WEDDING } from "@/lib/wedding";

export const metadata: Metadata = { title: "Schedule" };

export default function SchedulePage() {
  const intro = getBlock("schedule_intro");
  const days = getScheduleByDay();

  return (
    <>
      <PageHeader
        eyebrow={intro?.eyebrow}
        title={intro?.title}
        body={intro?.body}
      />

      <div className="mx-auto max-w-4xl px-5 py-16 lg:px-8 sm:py-20">
        {days.map((day, dayIndex) => (
          <section key={day.day} className={dayIndex > 0 ? "mt-20" : ""}>
            {/* The heading must be allowed to wrap — "Friday, September 17 —
                Wedding Day" is wider than a 375px viewport on one line. */}
            <div className="flex items-center gap-5">
              <h2 className="display min-w-0 text-2xl text-gold sm:shrink-0 sm:text-3xl">
                {day.day}
              </h2>
              <span className="hidden h-px flex-1 bg-gold-light sm:block" />
            </div>

            {/* Timeline: a single vertical rule with a node per event */}
            <ol className="mt-10 space-y-0">
              {day.events.map((event, index) => (
                <li key={event.id} className="relative flex gap-4 sm:gap-8">
                  {/* Rail + node. The time column is narrow on phones so a long
                      label like "11:00 PM & 11:45 PM" wraps instead of pushing
                      the row wider than the viewport. */}
                  <div className="relative flex w-16 shrink-0 justify-end sm:w-36">
                    <time className="pt-0.5 text-right text-[0.7rem] font-medium tracking-[0.06em] text-ink/70 uppercase sm:text-xs sm:tracking-[0.1em]">
                      {event.time_label}
                    </time>
                  </div>

                  <div className="relative flex flex-col items-center">
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        index === 0 ? "bg-gold" : "bg-sage-light"
                      }`}
                    />
                    {index < day.events.length - 1 ? (
                      <span className="w-px flex-1 bg-line" />
                    ) : null}
                  </div>

                  <div className="flex-1 pb-10">
                    <h3 className="display text-xl text-ink sm:text-2xl">
                      {event.title}
                    </h3>
                    {event.location ? (
                      <p className="mt-1.5 text-xs tracking-[0.08em] text-sage uppercase">
                        {event.location}
                      </p>
                    ) : null}
                    {event.description ? (
                      <p className="mt-3 text-[0.95rem] leading-[1.8] text-ink/75">
                        {event.description}
                      </p>
                    ) : null}
                    {event.attire ? (
                      <p className="mt-3 inline-block border border-line bg-cream px-3 py-1 text-[0.7rem] tracking-[0.1em] text-muted uppercase">
                        {event.attire}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}

        {days.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted">
            The schedule is still being finalized — check back soon.
          </p>
        ) : null}

        {/* ── Footnote ─────────────────────────────────────────────── */}
        <div className="mt-16 border-t border-line pt-12 text-center">
          <p className="mx-auto max-w-xl text-[0.95rem] leading-[1.8] text-ink/75">
            Shuttle times are firm — the coaches leave when they leave. If
            anything shifts we&apos;ll update this page and text everyone who
            gave us a number.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/travel" className="btn btn-outline">
              Hotels &amp; directions
            </Link>
            <Link href="/faq" className="btn btn-outline">
              What to wear
            </Link>
          </div>
          <p className="mt-10 text-xs tracking-[0.18em] text-muted uppercase">
            RSVP by {WEDDING.rsvpDeadline}
          </p>
        </div>
      </div>
    </>
  );
}
