// Fails the build with a clear message if a client component ever imports this
// module (directly or through lib/queries), instead of a cryptic "can't resolve
// 'fs'" from inside better-sqlite3.
import "server-only";

import Database from "better-sqlite3";
import path from "node:path";
import { existsSync } from "node:fs";

/**
 * Singleton SQLite connection.
 *
 * Cached on globalThis because Next's dev server re-evaluates modules on every
 * hot reload — without this, each reload would open another file handle.
 */

const DB_PATH = path.join(process.cwd(), "data", "wedding.db");

declare global {
  // eslint-disable-next-line no-var
  var __weddingDb: Database.Database | undefined;
}

function open(): Database.Database {
  if (!existsSync(DB_PATH)) {
    throw new Error(
      `No database at ${DB_PATH}.\n` +
        `Run \`npm run photos:build\` then \`npm run db:reset\` to create and seed it.`,
    );
  }

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  return db;
}

/**
 * Additive column migrations, so a database seeded by an older schema.sql keeps
 * working without `npm run db:reset` throwing away real RSVP responses.
 *
 * Only ever add nullable/defaulted columns here — anything that needs to
 * rewrite existing rows belongs in a reseed instead.
 */
function migrate(db: Database.Database): void {
  const columns = new Set(
    (db.prepare("PRAGMA table_info(parties)").all() as { name: string }[]).map(
      (column) => column.name,
    ),
  );

  if (!columns.has("envelope_name")) {
    db.exec("ALTER TABLE parties ADD COLUMN envelope_name TEXT NOT NULL DEFAULT ''");
  }
}

export function getDb(): Database.Database {
  if (!globalThis.__weddingDb) {
    globalThis.__weddingDb = open();
  }
  return globalThis.__weddingDb;
}

/** Convenience wrapper for read queries returning many rows. */
export function all<T>(sql: string, params: unknown[] = []): T[] {
  return getDb().prepare(sql).all(...(params as never[])) as T[];
}

/** Convenience wrapper for read queries returning a single row. */
export function one<T>(sql: string, params: unknown[] = []): T | undefined {
  return getDb().prepare(sql).get(...(params as never[])) as T | undefined;
}

/** Convenience wrapper for writes. */
export function run(sql: string, params: unknown[] = []) {
  return getDb()
    .prepare(sql)
    .run(...(params as never[]));
}
