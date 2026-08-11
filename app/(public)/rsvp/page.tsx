import Link from "next/link";
import type { Metadata } from "next";
import RsvpForm from "@/components/RsvpForm";
import { PageHeader } from "@/components/Section";
import { getBlock } from "@/lib/queries";
import { WEDDING } from "@/lib/wedding";

export const metadata: Metadata = { title: "RSVP" };

export default function RsvpPage() {
  const intro = getBlock("rsvp_intro");

  return (
    <>
      <PageHeader
        eyebrow={intro?.eyebrow}
        title={intro?.title}
        body={intro?.body}
      />

      <div className="mx-auto max-w-3xl px-5 py-14 lg:px-8 sm:py-20">
        <RsvpForm deadline={WEDDING.rsvpDeadline} />

        <div className="mt-12 text-center">
          <p className="text-sm text-muted">
            Trouble finding your name, or need to change something after the
            deadline?
          </p>
          <p className="mt-2 text-sm">
            <a
              href={`mailto:${WEDDING.contactEmail}`}
              className="text-sage underline decoration-gold-light underline-offset-4 hover:text-gold"
            >
              {WEDDING.contactEmail}
            </a>
            <span className="mx-2 text-line">|</span>
            <a
              href={`tel:${WEDDING.contactPhone.replace(/\D/g, "")}`}
              className="text-sage underline decoration-gold-light underline-offset-4 hover:text-gold"
            >
              {WEDDING.contactPhone}
            </a>
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/travel" className="btn btn-outline">
              Book a room
            </Link>
            <Link href="/schedule" className="btn btn-outline">
              See the schedule
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
