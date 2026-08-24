import { discardBaseline, restoreBaseline } from "./db";

/**
 * One last restore, then the baseline file goes.
 *
 * The per-test fixture has already done this after every test that ran. This is
 * the net for the cases it could not cover: a worker killed mid-test, a run
 * stopped with Ctrl-C, an interrupted shard. It costs milliseconds and it is
 * the difference between "the suite is safe to run on your data" being true and
 * being true most of the time.
 */
export default function globalTeardown(): void {
  try {
    restoreBaseline();
  } finally {
    discardBaseline();
  }
}
