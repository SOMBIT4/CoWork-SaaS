"use client";

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
      className="space-y-5"
    >
      {state.message ? (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {state.message}
        </div>
      ) : null}

      <div className="space-y-2">
        <label
          htmlFor="name"
          className="text-sm font-medium"
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
          className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
          placeholder="Demo Owner"
        />

        {state.fieldErrors?.name?.map(
          (error) => (
            <p
              key={error}
              className="text-sm text-red-600"
            >
              {error}
            </p>
          ),
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm font-medium"
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
          className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
          placeholder="you@example.com"
        />

        {state.fieldErrors?.email?.map(
          (error) => (
            <p
              key={error}
              className="text-sm text-red-600"
            >
              {error}
            </p>
          ),
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium"
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
          className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
          placeholder="At least 10 characters"
        />

        {state.fieldErrors?.password?.map(
          (error) => (
            <p
              key={error}
              className="text-sm text-red-600"
            >
              {error}
            </p>
          ),
        )}

        <p className="text-xs text-neutral-500">
          Include uppercase, lowercase, and a
          number.
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-black px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending
          ? "Creating account..."
          : "Create account"}
      </button>
    </form>
  );
}