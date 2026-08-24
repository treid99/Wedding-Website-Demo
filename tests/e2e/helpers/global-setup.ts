import { writeBaseline } from "./db";

/**
 * Photographs the database before the first test.
 *
 * Everything the suite does to the data is measured against this snapshot, and
 * every test is followed by a replay of it. Taking it here rather than in a
 * worker means it is taken exactly once even if a worker is replaced mid-run,
 * so a crash cannot promote a half-finished test's leftovers into the baseline.
 */
export default function globalSetup(): void {
  writeBaseline();
}
