import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Demo authentication.
 *
 * This deliberately validates nothing — any non-empty email and password get in.
 * It exists so the admin side has a realistic shape (a login screen, a session
 * cookie, a gated layout, a logout) without pretending to be secure. Do not
 * model a real auth system on this file: there is no password hashing, no
 * signing, and no expiry beyond the cookie's own lifetime.
 */

export const ADMIN_COOKIE = "wedding_admin_demo";
const MAX_AGE_SECONDS = 60 * 60 * 8;

export type AdminSession = { email: string };

function encode(session: AdminSession): string {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

function decode(raw: string): AdminSession | null {
  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
    return typeof parsed?.email === "string" ? { email: parsed.email } : null;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<AdminSession | null> {
  const store = await cookies();
  const raw = store.get(ADMIN_COOKIE)?.value;
  return raw ? decode(raw) : null;
}

export async function startSession(email: string): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_COOKIE, encode({ email }), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

/** Redirects to the login screen when there's no session. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}
