"use client";

import { useEffect, useState } from "react";

type Remaining = { days: number; hours: number; minutes: number; seconds: number };

function remainingUntil(target: number): Remaining {
  const ms = Math.max(0, target - Date.now());
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms / 3_600_000) % 24),
    minutes: Math.floor((ms / 60_000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
  };
}

/**
 * Live countdown to the ceremony.
 *
 * Renders nothing until mounted: the value depends on the current clock, so
 * computing it on the server would guarantee a hydration mismatch.
 */
export default function Countdown({ targetIso }: { targetIso: string }) {
  const target = new Date(targetIso).getTime();
  const [remaining, setRemaining] = useState<Remaining | null>(null);

  useEffect(() => {
    setRemaining(remainingUntil(target));
    const id = setInterval(() => setRemaining(remainingUntil(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const units: { label: string; value: number | null }[] = [
    { label: "Days", value: remaining?.days ?? null },
    { label: "Hours", value: remaining?.hours ?? null },
    { label: "Minutes", value: remaining?.minutes ?? null },
    { label: "Seconds", value: remaining?.seconds ?? null },
  ];

  const past = remaining !== null && target <= Date.now();

  if (past) {
    return (
      <p className="display text-3xl text-sage">
        Married. Thank you for being there.
      </p>
    );
  }

  return (
    <div className="flex items-start justify-center gap-8 sm:gap-14">
      {units.map((unit) => (
        <div key={unit.label} className="flex flex-col items-center">
          <span
            className="display text-5xl text-ink tabular-nums sm:text-6xl"
            suppressHydrationWarning
          >
            {unit.value === null ? "—" : String(unit.value).padStart(2, "0")}
          </span>
          <span className="mt-2 text-[0.65rem] tracking-[0.2em] text-muted uppercase">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
}
