import Link from "next/link";
import type { Metadata } from "next";
import Accordion, { type AccordionEntry } from "@/components/Accordion";
import { PageHeader } from "@/components/Section";
import { getBlock, getFaqByCategory } from "@/lib/queries";
import { WEDDING } from "@/lib/wedding";

export const metadata: Metadata = { title: "Q&A" };

export default function FaqPage() {
  const intro = getBlock("faq_intro");
  const groups = getFaqByCategory();

  return (
    <>
      <PageHeader
        eyebrow={intro?.eyebrow}
        title={intro?.title}
        body={intro?.body}
      />

      <div className="mx-auto max-w-4xl px-5 py-16 lg:px-8 sm:py-20">
        {groups.map((group, groupIndex) => {
          const entries: AccordionEntry[] = group.items.map((item) => ({
            id: item.id,
            heading: item.question,
            content: <p>{item.answer}</p>,
          }));

          return (
            <section key={group.category} className={groupIndex > 0 ? "mt-16" : ""}>
              <div className="flex items-center gap-5">
                <h2 className="eyebrow shrink-0">{group.category}</h2>
                <span className="h-px flex-1 bg-line" />
              </div>
              <div className="mt-6">
                <Accordion
                  entries={entries}
                  // Open the very first question so the pattern is obvious.
                  initialOpen={groupIndex === 0 ? entries[0]?.id : undefined}
                />
              </div>
            </section>
          );
        })}

        {groups.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted">
            No questions posted yet.
          </p>
        ) : null}

        {/* ── Still stuck ──────────────────────────────────────────── */}
        <div className="mt-20 border border-line bg-cream px-8 py-12 text-center">
          <p className="eyebrow">Didn&apos;t find it?</p>
          <h2 className="display mt-3 text-3xl text-ink">Just ask us</h2>
          <p className="mx-auto mt-5 max-w-md text-[0.95rem] leading-[1.8] text-ink/75">
            One of us always answers, usually within a day. There is no question
            too small — we promise we have already asked it ourselves.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href={`mailto:${WEDDING.contactEmail}`} className="btn btn-primary">
              Email us
            </a>
            <Link href="/rsvp" className="btn btn-outline">
              Go to RSVP
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
