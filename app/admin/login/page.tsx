"use client";

import { useActionState } from "react";
import { loginAction } from "../auth-actions";

export default function AdminLoginPage() {
  const [error, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">
            FANZONSTORE
          </p>
          <h1 className="mt-2 text-2xl font-bold text-white">Admin Sign In</h1>
        </div>

        <form
          action={formAction}
          className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-neutral-300"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-white outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-neutral-300"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1 w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-white outline-none focus:border-emerald-400"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-neutral-950 transition hover:bg-emerald-400 disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
