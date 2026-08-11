"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/lib/auth-actions";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    {},
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label className="label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          defaultValue="jenna.and.tom@example.com"
          required
          className="field"
        />
      </div>

      <div>
        <label className="label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          defaultValue="demo"
          required
          className="field"
        />
      </div>

      {state.error ? (
        <p role="alert" className="border-l-2 border-gold bg-cream px-3 py-2 text-sm text-ink">
          {state.error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <p className="border-t border-line pt-4 text-center text-xs leading-relaxed text-muted">
        <strong className="font-medium text-ink/70">Demo:</strong> credentials
        aren&apos;t checked. Any email and password will sign you in — the fields
        are pre-filled, just press the button.
      </p>
    </form>
  );
}
