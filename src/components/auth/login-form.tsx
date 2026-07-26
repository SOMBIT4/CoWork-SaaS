"use client";

import { useActionState } from "react";

import {
  loginAction,
  type AuthActionState,
} from "@/server/actions/auth.actions";

interface LoginFormProps {
  callbackUrl: string;
}

const initialState: AuthActionState = {
  status: "idle",
};

export function LoginForm({
  callbackUrl,
}: LoginFormProps) {
  const [state, formAction, pending] =
    useActionState(
      loginAction,
      initialState,
    );

  return (
    <form
      action={formAction}
      className="space-y-5"
    >
      <input
        type="hidden"
        name="callbackUrl"
        value={callbackUrl}
      />

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
          placeholder="owner@example.com"
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
          autoComplete="current-password"
          required
          maxLength={128}
          aria-invalid={
            Boolean(
              state.fieldErrors?.password,
            )
          }
          className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
          placeholder="Your password"
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
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-black px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending
          ? "Signing in..."
          : "Sign in"}
      </button>
    </form>
  );
}