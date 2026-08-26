"use client";

import { AlertCircle, Info } from "lucide-react";
import { useActionState } from "react";

import {
    signupAction,
    type AuthActionState,
} from "@/server/actions/auth.actions";

const initialState: AuthActionState = {
  status: "idle",
};

export function SignupForm() {
  const [state, formAction, pending] =
    useActionState(
      signupAction,
      initialState,
    );

  return (
    <form
      action={formAction}
      className="space-y-6"
    >
      {state.message ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-400"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p>{state.message}</p>
        </div>
      ) : null}

      <div className="space-y-2">
        <label
          htmlFor="name"
          className="text-sm font-medium text-white"
        >
          Full name
        </label>

        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          minLength={2}
          maxLength={100}
          aria-invalid={
            Boolean(state.fieldErrors?.name)
          }
          className="w-full rounded-xl border border-[#27272A] bg-[#111113] px-4 py-3 text-white placeholder:text-[#71717A] outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          placeholder="Demo Owner"
        />

        {state.fieldErrors?.name?.map(
          (error) => (
            <p
              key={error}
              className="text-sm text-rose-400"
            >
              {error}
            </p>
          ),
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm font-medium text-white"
        >
          Email
        </label>

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={320}
          aria-invalid={
            Boolean(state.fieldErrors?.email)
          }
          className="w-full rounded-xl border border-[#27272A] bg-[#111113] px-4 py-3 text-white placeholder:text-[#71717A] outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          placeholder="you@example.com"
        />

        {state.fieldErrors?.email?.map(
          (error) => (
            <p
              key={error}
              className="text-sm text-rose-400"
            >
              {error}
            </p>
          ),
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-white"
        >
          Password
        </label>

        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={10}
          maxLength={128}
          aria-invalid={
            Boolean(
              state.fieldErrors?.password,
            )
          }
          className="w-full rounded-xl border border-[#27272A] bg-[#111113] px-4 py-3 text-white placeholder:text-[#71717A] outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          placeholder="At least 10 characters"
        />

        {state.fieldErrors?.password?.map(
          (error) => (
            <p
              key={error}
              className="text-sm text-rose-400"
            >
              {error}
            </p>
          ),
        )}

        <div className="flex items-start gap-2 rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
          <Info className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#A1A1AA]">
            Must include uppercase, lowercase, and a number.
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-lg"
      >
        {pending
          ? "Creating account..."
          : "Create account"}
      </button>
    </form>
  );
}