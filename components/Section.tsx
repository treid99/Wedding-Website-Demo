import { toParagraphs } from "@/lib/format";
import type { ContentBlock } from "@/lib/types";

/** Standard centered section heading: gold eyebrow, serif title, hairline. */
export function SectionHeading({
  eyebrow,
  title,
  align = "center",
  className = "",
}: {
  eyebrow?: string;
  title?: string;
  align?: "center" | "left";
  className?: string;
}) {
  const centered = align === "center";
  return (
    <div className={`${centered ? "text-center" : ""} ${className}`}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      {title ? (
        <h2 className="display mt-3 text-4xl text-ink sm:text-5xl">{title}</h2>
      ) : null}
      <div className={`hairline mt-6 w-24 ${centered ? "mx-auto" : ""}`} />
    </div>
  );
}

/** Renders a stored text block as paragraphs. */
export function Prose({
  body,
  className = "",
}: {
  body: string;
  className?: string;
}) {
  return (
    <div className={`space-y-5 ${className}`}>
      {toParagraphs(body).map((paragraph, i) => (
        <p key={i} className="text-[0.975rem] leading-[1.85] text-ink/80">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

/** A full content block — heading plus prose — for the simple page intros. */
export function BlockSection({
  block,
  align = "center",
  proseClassName = "mx-auto mt-8 max-w-2xl",
}: {
  block: ContentBlock | undefined;
  align?: "center" | "left";
  proseClassName?: string;
}) {
  if (!block) return null;
  return (
    <div>
      <SectionHeading eyebrow={block.eyebrow} title={block.title} align={align} />
      {block.body ? <Prose body={block.body} className={proseClassName} /> : null}
    </div>
  );
}

/** Page-top banner used by every interior page. */
export function PageHeader({
  eyebrow,
  title,
  body,
}: {
  eyebrow?: string;
  title?: string;
  body?: string;
}) {
  return (
    <div className="border-b border-line bg-cream">
      <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:py-20 lg:px-8">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        {title ? (
          <h1 className="display mt-3 text-4xl text-ink sm:text-6xl">{title}</h1>
        ) : null}
        <div className="hairline mx-auto mt-7 w-24" />
        {body ? (
          <Prose body={body} className="mt-7 text-left sm:text-center" />
        ) : null}
      </div>
    </div>
  );
}
