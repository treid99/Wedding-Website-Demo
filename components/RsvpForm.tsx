"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  lookupParty,
  submitRsvp,
  type GuestResponse,
  type LookupParty,
} from "@/lib/actions";
import { MEAL_CHOICES } from "@/lib/wedding";

type Step = "lookup" | "respond" | "done";

/** Local editable state for one guest's answer. */
type Draft = {
  guestId: number;
  name: string;
  isChild: boolean;
  attending: boolean | null;
  mealChoice: string;
  dietaryNotes: string;
};

function toDrafts(party: LookupParty): Draft[] {
  return party.guests.map((guest) => ({
    guestId: guest.id,
    name: `${guest.first_name} ${guest.last_name}`,
    isChild: guest.is_child === 1,
    // Pre-fill from a previous response so editing an RSVP shows prior answers.
    attending:
      guest.rsvp_status === "attending"
        ? true
        : guest.rsvp_status === "declined"
          ? false
          : null,
    mealChoice: guest.meal_choice ?? (guest.is_child === 1 ? "kids" : ""),
    dietaryNotes: guest.dietary_notes ?? "",
  }));
}

export default function RsvpForm({ deadline }: { deadline: string }) {
  const [step, setStep] = useState<Step>("lookup");
  const [pending, startTransition] = useTransition();

  const [search, setSearch] = useState("");
  const [matches, setMatches] = useState<LookupParty[]>([]);
  const [party, setParty] = useState<LookupParty | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{ attending: number; declined: number } | null>(
    null,
  );

  const choose = (chosen: LookupParty) => {
    setParty(chosen);
    setDrafts(toDrafts(chosen));
    setMatches([]);
    setError(null);
    setStep("respond");
  };

  const onLookup = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await lookupParty(search);

      if (!result.ok) {
        setError(result.error);
        setMatches([]);
        return;
      }

      // A single match skips the chooser entirely.
      if (result.parties.length === 1) choose(result.parties[0]);
      else setMatches(result.parties);
    });
  };

  const update = (guestId: number, patch: Partial<Draft>) =>
    setDrafts((current) =>
      current.map((draft) =>
        draft.guestId === guestId ? { ...draft, ...patch } : draft,
      ),
    );

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!party) return;
    setError(null);

    const unanswered = drafts.find((draft) => draft.attending === null);
    if (unanswered) {
      setError(`Please choose yes or no for ${unanswered.name}.`);
      return;
    }

    const missingMeal = drafts.find(
      (draft) => draft.attending === true && !draft.mealChoice,
    );
    if (missingMeal) {
      setError(`Please choose a meal for ${missingMeal.name}.`);
      return;
    }

    const responses: GuestResponse[] = drafts.map((draft) => ({
      guestId: draft.guestId,
      attending: draft.attending === true,
      mealChoice: draft.attending ? draft.mealChoice : null,
      dietaryNotes: draft.dietaryNotes,
    }));

    startTransition(async () => {
      const result = await submitRsvp({
        partyId: party.id,
        message,
        responses,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setSummary({ attending: result.attending, declined: result.declined });
      setStep("done");
    });
  };

  const restart = () => {
    setStep("lookup");
    setSearch("");
    setMatches([]);
    setParty(null);
    setDrafts([]);
    setMessage("");
    setError(null);
    setSummary(null);
  };

  // ── Step 3: confirmation ──────────────────────────────────────────────
  if (step === "done" && summary && party) {
    return (
      <div className="border border-line bg-white px-6 py-14 text-center sm:px-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold-light">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="1.25">
            <path d="m4 12.5 5 5L20 6.5" />
          </svg>
        </div>

        <h2 className="display mt-7 text-3xl text-ink sm:text-4xl">Thank you</h2>
        <p className="mx-auto mt-4 max-w-md text-[0.95rem] leading-relaxed text-ink/75">
          We&apos;ve recorded the response for {party.name}.
        </p>

        <div className="mx-auto mt-9 max-w-sm divide-y divide-line border-y border-line text-left">
          {drafts.map((draft) => (
            <div key={draft.guestId} className="flex items-start justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-medium text-ink">{draft.name}</p>
                {draft.attending && draft.mealChoice ? (
                  <p className="mt-0.5 text-xs text-muted">
                    {MEAL_CHOICES.find((m) => m.value === draft.mealChoice)?.label}
                  </p>
                ) : null}
                {draft.attending && draft.dietaryNotes.trim() ? (
                  <p className="mt-0.5 text-xs text-gold">
                    {draft.dietaryNotes.trim()}
                  </p>
                ) : null}
              </div>
              <span
                className={`shrink-0 text-xs tracking-[0.1em] uppercase ${
                  draft.attending ? "text-sage" : "text-muted"
                }`}
              >
                {draft.attending ? "Attending" : "Regrets"}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-6 text-sm text-muted">
          {summary.attending} attending
          {summary.declined > 0 ? ` · ${summary.declined} unable to make it` : ""}
        </p>

        {summary.attending > 0 ? (
          <p className="mx-auto mt-8 max-w-md text-[0.95rem] leading-relaxed text-ink/75">
            We cannot wait to see you. Have a look at the{" "}
            <Link href="/travel" className="text-sage underline decoration-gold-light underline-offset-2">
              travel page
            </Link>{" "}
            to book your room, and the{" "}
            <Link href="/schedule" className="text-sage underline decoration-gold-light underline-offset-2">
              schedule
            </Link>{" "}
            for the full weekend.
          </p>
        ) : (
          <p className="mx-auto mt-8 max-w-md text-[0.95rem] leading-relaxed text-ink/75">
            We&apos;ll miss you — thank you for letting us know. We&apos;ll raise a
            glass to you.
          </p>
        )}

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <button type="button" onClick={restart} className="btn btn-outline">
            Edit our response
          </button>
          <Link href="/registry" className="btn btn-primary">
            Visit the registry
          </Link>
        </div>
      </div>
    );
  }

  // ── Step 2: the party's answers ───────────────────────────────────────
  if (step === "respond" && party) {
    return (
      <form onSubmit={onSubmit} className="border border-line bg-white">
        <div className="border-b border-line bg-cream px-6 py-6 sm:px-8">
          <p className="eyebrow">Your invitation</p>
          <h2 className="display mt-2 text-2xl text-ink sm:text-3xl">
            {party.name}
          </h2>
          {party.address ? (
            <p className="mt-1.5 text-xs text-muted">{party.address}</p>
          ) : null}
          <button
            type="button"
            onClick={restart}
            className="mt-3 text-xs tracking-[0.12em] text-sage uppercase underline underline-offset-4 hover:text-gold"
          >
            Not you? Search again
          </button>
        </div>

        <div className="divide-y divide-line">
          {drafts.map((draft) => (
            <fieldset key={draft.guestId} className="px-6 py-7 sm:px-8">
              <legend className="display text-xl text-ink">
                {draft.name}
                {draft.isChild ? (
                  <span className="ml-2 align-middle text-[0.6rem] tracking-[0.14em] text-gold uppercase">
                    child
                  </span>
                ) : null}
              </legend>

              {/* Attending toggle */}
              <div className="mt-4 flex gap-3">
                {[
                  { value: true, label: "Joyfully accepts" },
                  { value: false, label: "Regretfully declines" },
                ].map((option) => (
                  <label
                    key={String(option.value)}
                    className={`flex-1 cursor-pointer border px-4 py-3 text-center text-xs tracking-[0.1em] uppercase transition-colors ${
                      draft.attending === option.value
                        ? "border-sage bg-sage text-ivory"
                        : "border-line bg-white text-ink/60 hover:border-gold"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`attending-${draft.guestId}`}
                      className="sr-only"
                      checked={draft.attending === option.value}
                      onChange={() =>
                        update(draft.guestId, { attending: option.value })
                      }
                    />
                    {option.label}
                  </label>
                ))}
              </div>

              {/* Meal + dietary, only relevant when attending */}
              {draft.attending === true ? (
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor={`meal-${draft.guestId}`}>
                      Meal choice
                    </label>
                    <select
                      id={`meal-${draft.guestId}`}
                      className="field"
                      value={draft.mealChoice}
                      onChange={(event) =>
                        update(draft.guestId, { mealChoice: event.target.value })
                      }
                      // Deliberately not `required`: native validation shows a
                      // transient browser bubble that's easy to miss on a long
                      // multi-guest form. onSubmit validates instead and renders
                      // a persistent message naming the guest.
                    >
                      <option value="">Please choose…</option>
                      {MEAL_CHOICES.map((meal) => (
                        <option key={meal.value} value={meal.value}>
                          {meal.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label" htmlFor={`diet-${draft.guestId}`}>
                      Allergies or dietary needs
                    </label>
                    <input
                      id={`diet-${draft.guestId}`}
                      type="text"
                      className="field"
                      placeholder="Optional — but please over-explain"
                      value={draft.dietaryNotes}
                      maxLength={500}
                      onChange={(event) =>
                        update(draft.guestId, { dietaryNotes: event.target.value })
                      }
                    />
                  </div>
                </div>
              ) : null}
            </fieldset>
          ))}
        </div>

        {/* Shared note */}
        <div className="border-t border-line px-6 py-7 sm:px-8">
          <label className="label" htmlFor="rsvp-message">
            A note for {`Jenna & Tom`} (optional)
          </label>
          <textarea
            id="rsvp-message"
            className="field min-h-28 resize-y"
            placeholder="Song requests, travel plans, anything you want us to know…"
            value={message}
            maxLength={2000}
            onChange={(event) => setMessage(event.target.value)}
          />
        </div>

        {error ? (
          <p
            role="alert"
            className="mx-6 mb-2 border-l-2 border-gold bg-cream px-4 py-3 text-sm text-ink sm:mx-8"
          >
            {error}
          </p>
        ) : null}

        <div className="flex flex-col items-center gap-3 border-t border-line px-6 py-7 sm:px-8">
          <button type="submit" disabled={pending} className="btn btn-primary w-full sm:w-auto">
            {pending ? "Sending…" : "Send our response"}
          </button>
          <p className="text-xs text-muted">
            You can come back and change this any time before {deadline}.
          </p>
        </div>
      </form>
    );
  }

  // ── Step 1: find the invitation ───────────────────────────────────────
  return (
    <div className="border border-line bg-white px-6 py-12 sm:px-12 sm:py-14">
      <form onSubmit={onLookup} className="mx-auto max-w-md">
        <label className="label text-center" htmlFor="rsvp-lookup">
          Find your invitation
        </label>
        <div className="mt-1 flex flex-col gap-3 sm:flex-row">
          <input
            id="rsvp-lookup"
            type="text"
            className="field"
            placeholder="Your first or last name"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            autoComplete="name"
            autoFocus
          />
          <button
            type="submit"
            disabled={pending || search.trim().length < 2}
            className="btn btn-primary shrink-0"
          >
            {pending ? "Searching…" : "Search"}
          </button>
        </div>

        <p className="mt-4 text-center text-xs leading-relaxed text-muted">
          Search any name on your invitation and we&apos;ll bring up everyone in
          your party.
        </p>

        {error ? (
          <p
            role="alert"
            className="mt-6 border-l-2 border-gold bg-cream px-4 py-3 text-sm text-ink"
          >
            {error}
          </p>
        ) : null}

        {/* Ambiguous name — let them pick */}
        {matches.length > 1 ? (
          <div className="mt-8">
            <p className="text-center text-sm text-muted">
              We found {matches.length} invitations. Which one is yours?
            </p>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {matches.map((match) => (
                <li key={match.id}>
                  <button
                    type="button"
                    onClick={() => choose(match)}
                    className="flex w-full items-center justify-between gap-4 py-4 text-left transition-colors hover:text-gold"
                  >
                    <span>
                      <span className="display block text-lg text-ink">
                        {match.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {match.guests
                          .map((guest) => `${guest.first_name} ${guest.last_name}`)
                          .join(" · ")}
                      </span>
                    </span>
                    <span aria-hidden className="shrink-0 text-gold">
                      →
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </form>
    </div>
  );
}
