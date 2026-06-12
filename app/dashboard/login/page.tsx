"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    login,
    null
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl font-semibold text-warm-dark">
            Admin Access
          </h1>
          <p className="mt-1.5 text-sm text-warm-muted">
            Wedding RSVP Dashboard
          </p>
        </div>

        <form
          action={formAction}
          className="flex flex-col gap-5 rounded-2xl border border-cream-dark bg-card px-8 py-10 shadow-sm"
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="username"
              className="text-xs font-medium tracking-wide text-warm-muted uppercase"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className="rounded-xl border border-cream-dark bg-cream px-4 py-3 text-sm text-warm-dark outline-none transition focus:border-rose focus:ring-2 focus:ring-rose/30"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-xs font-medium tracking-wide text-warm-muted uppercase"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="rounded-xl border border-cream-dark bg-cream px-4 py-3 text-sm text-warm-dark outline-none transition focus:border-rose focus:ring-2 focus:ring-rose/30"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-rose-dark">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="mt-1 w-full rounded-xl bg-warm-dark py-3.5 text-sm font-medium text-cream transition hover:bg-warm-dark/80 disabled:opacity-50"
          >
            {isPending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
