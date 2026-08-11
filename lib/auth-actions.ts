"use server";

import { redirect } from "next/navigation";
import { endSession, startSession } from "./auth";

export type LoginState = { error?: string };

/**
 * Demo login. Accepts any non-empty credentials — see lib/auth.ts.
 * The only validation is that both fields were filled in, so the form has
 * something to respond to.
 */
export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter an email and password — anything at all works here." };
  }

  await startSession(email);
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await endSession();
  redirect("/admin/login");
}
