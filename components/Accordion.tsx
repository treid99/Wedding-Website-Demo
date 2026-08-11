"use client";

import { useState } from "react";

export type AccordionEntry = {
  id: string | number;
  heading: string;
  subheading?: string;
  /** Rendered as-is; pass paragraphs or a step list. */
  content: React.ReactNode;
};

/**
 * Collapsible list used by the Q&A page and the Travel directions panels.
 * `initialOpen` opens one entry on load so the pattern is discoverable.
 */
export default function Accordion({
  entries,
  initialOpen,
}: {
  entries: AccordionEntry[];
  initialOpen?: string | number;
}) {
  const [open, setOpen] = useState<string | number | null>(initialOpen ?? null);

  return (
    <div className="divide-y divide-line border-y border-line">
      {entries.map((entry) => {
        const isOpen = open === entry.id;
        return (
          <div key={entry.id}>
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : entry.id)}
                aria-expanded={isOpen}
                className="flex w-full items-start justify-between gap-6 py-5 text-left"
              >
                <span>
                  <span className="display block text-xl text-ink sm:text-2xl">
                    {entry.heading}
                  </span>
                  {entry.subheading ? (
                    <span className="mt-1 block text-xs tracking-[0.1em] text-muted uppercase">
                      {entry.subheading}
                    </span>
                  ) : null}
                </span>
                <span
                  className={`mt-1.5 shrink-0 text-gold transition-transform duration-300 ${
                    isOpen ? "rotate-45" : ""
                  }`}
                  aria-hidden
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </button>
            </h3>

            {/* Grid-rows trick animates height without measuring the content. */}
            <div
              className="grid transition-all duration-300 ease-out"
              style={{
                gridTemplateRows: isOpen ? "1fr" : "0fr",
                opacity: isOpen ? 1 : 0,
              }}
            >
              <div className="overflow-hidden">
                <div className="pb-6 pr-8 text-[0.95rem] leading-[1.85] text-ink/80">
                  {entry.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
